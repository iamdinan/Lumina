const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const userEpisodesController = require("../controllers/userEpisodes.controller");

router.use(requireAuth);

router.post("/:episodeId", userEpisodesController.markWatched);
router.delete("/:episodeId", userEpisodesController.unmarkWatched);

module.exports = router;
