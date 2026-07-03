const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const userSeriesController = require("../controllers/userSeries.controller");
const userEpisodesController = require("../controllers/userEpisodes.controller");

router.use(requireAuth); // everything below requires a valid token

router.post("/:seriesId", userSeriesController.addSeries);
router.patch("/:seriesId", userSeriesController.updateStatus);
router.get("/", userSeriesController.listSeries);
router.delete("/:seriesId", userSeriesController.removeSeries);

//series progress tracker endpoint
router.get("/:seriesId/progress", userEpisodesController.getSeriesProgress);

module.exports = router;
