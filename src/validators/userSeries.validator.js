const { param, body, query } = require("express-validator");

const VALID_STATUSES = ["watchlist", "watching", "completed"];

const seriesIdParam = [
  param("seriesId").isInt().withMessage("must be an integer"),
];

const statusBody = [
  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`must be one of ${VALID_STATUSES.join(", ")}`),
];

const statusBodyRequired = [
  body("status")
    .isIn(VALID_STATUSES)
    .withMessage(`is required and must be one of ${VALID_STATUSES.join(", ")}`),
];

const statusQuery = [
  query("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`must be one of ${VALID_STATUSES.join(", ")}`),
];

module.exports = { seriesIdParam, statusBody, statusBodyRequired, statusQuery };
