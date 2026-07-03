const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("must be 3–50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("must be alphanumeric or underscore only"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("must be at least 8 characters"),
];

const loginValidator = [
  body("username").trim().notEmpty().withMessage("is required"),
  body("password").notEmpty().withMessage("is required"),
];

module.exports = { registerValidator, loginValidator };
