const pool = require("../../config/db");

const VALID_STATUSES = ["watchlist", "watching", "completed"];

// POST /api/users/me/series/:seriesId
async function addSeries(req, res) {
  const userId = req.user.userId;
  const { seriesId } = req.params;
  const { status = "watchlist" } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_series (user_id, series_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, series_id) DO UPDATE
         SET status = EXCLUDED.status
       RETURNING *`,
      [userId, seriesId, status],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      // foreign_key_violation
      return res
        .status(404)
        .json({ error: "Series not found — import it first" });
    }
    console.error("Add series failed:", err.message);
    res.status(500).json({ error: "Failed to add series" });
  }
}

// PATCH /api/users/me/series/:seriesId
async function updateStatus(req, res) {
  const userId = req.user.userId;
  const { seriesId } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  try {
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
  } catch (err) {
    console.error("Update status failed:", err.message);
    res.status(500).json({ error: "Failed to update status" });
  }
}

// GET /api/users/me/series?status=watching
async function listSeries(req, res) {
  const userId = req.user.userId;
  const { status } = req.query;

  try {
    let query = `
      SELECT us.status, us.added_at, s.series_id, s.series_name, s.poster_path
      FROM user_series us
      JOIN series s ON s.series_id = us.series_id
      WHERE us.user_id = $1
    `;
    const params = [userId];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `status must be one of ${VALID_STATUSES.join(", ")}`,
        });
      }
      query += ` AND us.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY us.added_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("List series failed:", err.message);
    res.status(500).json({ error: "Failed to list series" });
  }
}

// DELETE /api/users/me/series/:seriesId
async function removeSeries(req, res) {
  const userId = req.user.userId;
  const { seriesId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM user_series WHERE user_id = $1 AND series_id = $2 RETURNING *`,
      [userId, seriesId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not tracking this series" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Remove series failed:", err.message);
    res.status(500).json({ error: "Failed to remove series" });
  }
}

module.exports = { addSeries, updateStatus, listSeries, removeSeries };
