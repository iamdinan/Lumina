require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const seriesRoutes = require("./routes/series.routes");
const usersRoutes = require("./routes/users.routes");
const userSeriesRoutes = require("./routes/userSeries.routes");
const userEpisodesRoutes = require("./routes/userEpisodes.routes");
const errorHandler = require("./middleware/error.middleware");
const helmet = require("helmet");
const allowedOrigins = process.env.FRONTEND_URL;

const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(helmet());

// Health check — confirms server is up AND db connection works
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      server: "running",
      db: "connected",
      db_time: result.rows[0].now,
    });
  } catch (err) {
    console.error("DB health check failed:", err.message);
    res.status(500).json({
      status: "error",
      server: "running",
      db: "disconnected",
      error: err.message,
    });
  }
});

app.use("/api/series", seriesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/users/me/series", userSeriesRoutes);
app.use("/api/users/me/episodes", userEpisodesRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Lumina server running on http://localhost:${PORT}`);
});
