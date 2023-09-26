const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUsers,
  updatePin,
  updatePassword,
} = require("../controllers/user");
const { auth } = require("../util/middleware");

const { body } = require("express-validator");

const validationRules = [
  // body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validationRules, register);

router.post("/login", validationRules, login);

router.get("/users", auth, getUsers);

router.put("/pin", auth, updatePin);

router.put("/password", auth, updatePassword);

module.exports = router;
