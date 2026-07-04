const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["watchlist", "watching", "completed"];

// POST /api/users/me/series/:seriesId
async function addSeries(req, res) {
  const userId = req.user.userId;
  const { seriesId } = req.params;

  const result = await pool.query(
    `INSERT INTO user_series (user_id, series_id, status)
     VALUES ($1, $2, 'watchlist')
     ON CONFLICT (user_id, series_id) DO NOTHING
     RETURNING *`,
    [userId, seriesId],
  );

  res.status(201).json(result.rows[0] || { message: "Already tracked" });
}

// PATCH /api/users/me/series/:seriesId
const updateStatus = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { seriesId } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  const result = await pool.query(
    `UPDATE user_series SET status = $1
       WHERE user_id = $2 AND series_id = $3
       RETURNING *`,
    [status, userId, seriesId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not tracking this series" });
  }
  res.json(result.rows[0]);
});

// GET /api/users/me/series?status=watching
async function listSeries(req, res) {
  const userId = req.user.userId;
  const { status } = req.query;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  let query = `
    SELECT us.status, us.added_at, s.series_id, s.series_name, s.poster_path
    FROM user_series us
    JOIN series s ON s.series_id = us.series_id
    WHERE us.user_id = $1
  `;
  const params = [userId];

  if (status) {
    query += ` AND us.status = $${params.length + 1}`;
    params.push(status);
  }

  query += ` ORDER BY us.added_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  res.json(result.rows);
}

// DELETE /api/users/me/series/:seriesId
const removeSeries = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { seriesId } = req.params;

  // Delete watch history for this series' episodes for this user
  await pool.query(
    `DELETE FROM user_episodes
     WHERE user_id = $1
       AND episode_id IN (
         SELECT e.episode_id FROM episodes e
         JOIN seasons se ON se.season_id = e.season_id
         WHERE se.series_id = $2
       )`,
    [userId, seriesId],
  );

  const result = await pool.query(
    `DELETE FROM user_series WHERE user_id = $1 AND series_id = $2 RETURNING *`,
    [userId, seriesId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Not tracking this series");
  }
  res.status(204).send();
});

const getSeriesStatus = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { seriesId } = req.params;

  const result = await pool.query(
    `SELECT status FROM user_series WHERE user_id = $1 AND series_id = $2`,
    [userId, seriesId],
  );

  res.json({ status: result.rows[0]?.status || null });
});

module.exports = {
  addSeries,
  updateStatus,
  listSeries,
  removeSeries,
  getSeriesStatus,
};
