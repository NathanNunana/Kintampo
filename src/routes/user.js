const express = require("express");
const router = express.Router();
const {
  register,
  login
} = require("../controllers/user");

const { body } = require("express-validator");

const validationRules = [
  // body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validationRules, register);

router.post("/login", validationRules, login);

module.exports = router;
