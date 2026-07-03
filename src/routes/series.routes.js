const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");

router.get("/search", seriesController.search);
router.post('/:tmdbId/import', seriesController.importSeries);

module.exports = router;
