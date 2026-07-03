const pool = require("../../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// POST /api/users/me/episodes/:episodeId
const markWatched = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { episodeId } = req.params;

  const result = await pool.query(
    `INSERT INTO user_episodes (user_id, episode_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, episode_id) DO UPDATE
         SET watched_at = NOW()
       RETURNING *`,
    [userId, episodeId],
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/users/me/episodes/:episodeId
const unmarkWatched = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { episodeId } = req.params;

  const result = await pool.query(
    `DELETE FROM user_episodes WHERE user_id = $1 AND episode_id = $2 RETURNING *`,
    [userId, episodeId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Episode was not marked watched" });
  }
  res.status(204).send();
});

// GET /api/users/me/series/:seriesId/progress
const getSeriesProgress = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { seriesId } = req.params;

  const result = await pool.query(
    `SELECT
         se.season_no,
         e.episode_id,
         e.episode_no,
         e.episode_name,
         e.air_date,
         (ue.episode_id IS NOT NULL) AS watched
       FROM episodes e
       JOIN seasons se ON se.season_id = e.season_id
       LEFT JOIN user_episodes ue
         ON ue.episode_id = e.episode_id AND ue.user_id = $1
       WHERE se.series_id = $2
       ORDER BY se.season_no, e.episode_no`,
    [userId, seriesId],
  );

  const totalEpisodes = result.rows.length;
  const watchedEpisodes = result.rows.filter((r) => r.watched).length;

  // Group by season for easier frontend rendering
  const seasonsMap = {};
  for (const row of result.rows) {
    if (!seasonsMap[row.season_no]) {
      seasonsMap[row.season_no] = { season_no: row.season_no, episodes: [] };
    }
    seasonsMap[row.season_no].episodes.push({
      episode_id: row.episode_id,
      episode_no: row.episode_no,
      episode_name: row.episode_name,
      air_date: row.air_date,
      watched: row.watched,
    });
  }

  res.json({
    series_id: Number(seriesId),
    total_episodes: totalEpisodes,
    watched_episodes: watchedEpisodes,
    seasons: Object.values(seasonsMap),
  });
});

module.exports = { markWatched, unmarkWatched, getSeriesProgress };
