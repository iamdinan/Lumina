const { param } = require("express-validator");

const episodeIdParam = [
  param("episodeId").isInt().withMessage("must be an integer"),
];

module.exports = { episodeIdParam };
