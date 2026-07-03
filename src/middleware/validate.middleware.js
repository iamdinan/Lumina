const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join(", ");
    throw new AppError(400, message);
  }
  next();
}

module.exports = validate;
