const { query, param } = require("express-validator");

const searchValidator = [
  query("q").trim().notEmpty().withMessage("is required"),
];

const tmdbIdParam = [param("tmdbId").isInt().withMessage("must be an integer")];

module.exports = { searchValidator, tmdbIdParam };
