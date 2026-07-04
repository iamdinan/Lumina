const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const userSeriesController = require("../controllers/userSeries.controller");
const userEpisodesController = require("../controllers/userEpisodes.controller");
const validate = require("../middleware/validate.middleware");
const {
  seriesIdParam,
  statusBody,
  statusBodyRequired,
  statusQuery,
} = require("../validators/userSeries.validator");
const { episodeIdParam } = require("../validators/userEpisodes.validator"); // for progress route if reused

router.use(requireAuth); // everything below requires a valid token

router.post(
  "/:seriesId",
  [...seriesIdParam, ...statusBody],
  validate,
  userSeriesController.addSeries,
);
router.patch(
  "/:seriesId",
  [...seriesIdParam, ...statusBodyRequired],
  validate,
  userSeriesController.updateStatus,
);
router.get("/", statusQuery, validate, userSeriesController.listSeries);
router.delete(
  "/:seriesId",
  seriesIdParam,
  validate,
  userSeriesController.removeSeries,
);

//progress tracker route
router.get(
  "/:seriesId/progress",
  seriesIdParam,
  validate,
  userEpisodesController.getSeriesProgress,
);

//series progress tracker endpoint
router.get("/:seriesId/progress", userEpisodesController.getSeriesProgress);
router.get(
  "/:seriesId/status",
  seriesIdParam,
  validate,
  userSeriesController.getSeriesStatus,
);

router.post(
  "/:seriesId/mark-completed",
  seriesIdParam,
  validate,
  userEpisodesController.markSeriesCompleted,
);

module.exports = router;
