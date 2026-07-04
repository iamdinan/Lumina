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

const updateProfileValidator = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("must be under 100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("must be a valid email"),
  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("must be under 100 characters"),
  body("birthday")
    .optional()
    .isISO8601()
    .withMessage("must be a valid date (YYYY-MM-DD)"),
];

module.exports = { registerValidator, loginValidator, updateProfileValidator };
