const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;

const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING user_id, username, created_at`,
    [username, passwordHash],
  );

  res.status(201).json(result.rows[0]);
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required" });
  }

  const result = await pool.query(
    `SELECT user_id, username, password_hash FROM users WHERE username = $1`,
    [username],
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { userId: user.user_id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: { user_id: user.user_id, username: user.username },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT user_id, username, created_at FROM users WHERE user_id = $1`,
    [req.user.userId],
  );
  res.json(result.rows[0]);
});

module.exports = { register, login, getMe };
