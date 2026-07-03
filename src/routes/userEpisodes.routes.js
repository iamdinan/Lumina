const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const userEpisodesController = require("../controllers/userEpisodes.controller");
const validate = require("../middleware/validate.middleware");
const { episodeIdParam } = require("../validators/userEpisodes.validator");

router.use(requireAuth);

router.post(
  "/:episodeId",
  episodeIdParam,
  validate,
  userEpisodesController.markWatched,
);
router.delete(
  "/:episodeId",
  episodeIdParam,
  validate,
  userEpisodesController.unmarkWatched,
);

module.exports = router;
