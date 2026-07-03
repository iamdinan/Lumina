const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const validate = require("../middleware/validate.middleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/users.validator");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { requireAuth } = require("../middleware/auth.middleware");

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validate,
  usersController.register,
);
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  usersController.login,
);
router.get("/me", requireAuth, usersController.getMe);

module.exports = router;
