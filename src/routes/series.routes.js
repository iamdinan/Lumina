const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");
const validate = require("../middleware/validate.middleware");
const {
  searchValidator,
  tmdbIdParam,
} = require("../validators/series.validator");

router.get("/search", searchValidator, validate, seriesController.search);
router.post(
  "/:tmdbId/import",
  tmdbIdParam,
  validate,
  seriesController.importSeries,
);

module.exports = router;
