const tmdbService = require("../services/tmdb.service");
const pool = require("../../config/db");

async function search(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query param "q" is required' });
  }

  try {
    const results = await tmdbService.searchSeries(q);
    res.json(results);
  } catch (err) {
    console.error("TMDB search failed:", err.message);
    res.status(502).json({ error: "Failed to fetch from TMDB" });
  }
}

async function importSeries(req, res) {
  const { tmdbId } = req.params;
  const client = await pool.connect();

  try {
    const seriesData = await tmdbService.getSeriesDetails(tmdbId);

    await client.query("BEGIN");

    // 1. Insert series (or get existing)
    const seriesResult = await client.query(
      `INSERT INTO series (tmdb_id, series_name, poster_path, status, last_synced_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (tmdb_id) DO UPDATE
         SET series_name = EXCLUDED.series_name,
             poster_path = EXCLUDED.poster_path,
             status = EXCLUDED.status,
             last_synced_at = NOW()
       RETURNING series_id`,
      [
        seriesData.id,
        seriesData.name,
        seriesData.poster_path,
        seriesData.status,
      ],
    );
    const seriesId = seriesResult.rows[0].series_id;

    // 2. Loop through seasons
    for (const season of seriesData.seasons) {
      // Skip "specials" (season_number 0) if you don't want them
      const seasonResult = await client.query(
        `INSERT INTO seasons (series_id, tmdb_season_id, season_no)
         VALUES ($1, $2, $3)
         ON CONFLICT (tmdb_season_id) DO UPDATE
           SET season_no = EXCLUDED.season_no
         RETURNING season_id`,
        [seriesId, season.id, season.season_number],
      );
      const seasonId = seasonResult.rows[0].season_id;

      // 3. Fetch and insert episodes for this season
      const seasonDetails = await tmdbService.getSeasonDetails(
        tmdbId,
        season.season_number,
      );

      for (const ep of seasonDetails.episodes) {
        await client.query(
          `INSERT INTO episodes (season_id, tmdb_episode_id, episode_no, episode_name, air_date)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (tmdb_episode_id) DO UPDATE
             SET episode_name = EXCLUDED.episode_name,
                 air_date = EXCLUDED.air_date`,
          [seasonId, ep.id, ep.episode_number, ep.name, ep.air_date || null],
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Series imported", series_id: seriesId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import failed:", err.message);
    res.status(500).json({ error: "Failed to import series" });
  } finally {
    client.release();
  }
}

module.exports = { search, importSeries };
