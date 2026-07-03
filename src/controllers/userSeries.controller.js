const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["watchlist", "watching", "completed"];

// POST /api/users/me/series/:seriesId
const addSeries = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { seriesId } = req.params;
  const { status = "watchlist" } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  const result = await pool.query(
    `INSERT INTO user_series (user_id, series_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, series_id) DO UPDATE
         SET status = EXCLUDED.status
       RETURNING *`,
    [userId, seriesId, status],
  );
  res.status(201).json(result.rows[0]);
});

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

  const result = await pool.query(
    `DELETE FROM user_series WHERE user_id = $1 AND series_id = $2 RETURNING *`,
    [userId, seriesId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not tracking this series" });
  }
  res.status(204).send();
});

module.exports = { addSeries, updateStatus, listSeries, removeSeries };
