const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const validate = require("../middleware/validate.middleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/users.validator");

router.post("/register", registerValidator, validate, usersController.register);
router.post("/login", loginValidator, validate, usersController.login);

module.exports = router;
