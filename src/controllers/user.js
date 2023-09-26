const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const pool = require("../connections/db");
const bcrypt = require("bcrypt");
const { getUser, insertUserQuery } = require("../util/queries");

function generateSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

const register = async (req, res) => {
  const {
    username,
    password,
    dob,
    occupation,
    ghcard,
    phone,
    address,
    role,
    pin,
  } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const userExistsQuery = getUser;
    const userExistsResult = await pool.query(userExistsQuery, [username]);

    if (userExistsResult.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, result: "User already exists" });
    }

    const accountNumber = generateSixDigitNumber().toString();

    // const insertUserQuery = insertUserResult;
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserResult = await pool.query(insertUserQuery, [
      username,
      hashedPassword,
      role,
      dob,
      occupation,
      ghcard,
      phone,
      address,
      accountNumber,
      pin,
    ]);

    const userId = insertUserResult.rows[0].id;

    const token = jwt.sign({ userId, role }, process.env.SECRET_KEY);

    return res
      .status(201)
      .json({ success: true, result: "User registered successfully", token });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const findUserQuery = getUser;
    const findUserResult = await pool.query(findUserQuery, [username]);

    if (findUserResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = findUserResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user.id, username: username, role: user.role },
      process.env.SECRET_KEY
    );

    return res.status(200).json({ success: true, data: user, token });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: `Internal server error ${err}` });
  }
};

const getUsers = async (req, res) => {
  try {
    const query = "SELECT * FROM users";
    const result = await pool.query(query);
    const users = result.rows;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const updatePin = async (req, res) => {
  const { userId, oldPin, newPin } = req.body;
  try {
    // Query the user's current PIN from the database
    const getUserPinQuery = "SELECT pin FROM users WHERE id = $1";
    const userPinResult = await pool.query(getUserPinQuery, [userId]);

    if (userPinResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const currentPin = userPinResult.rows[0].pin;

    // Compare the provided oldPin with the user's current PIN
    if (oldPin !== currentPin) {
      return res.status(401).json({ success: false, error: "Old PIN is invalid" });
    }

    // Update the user's PIN in the database
    const updatePinQuery = "UPDATE users SET pin = $1 WHERE id = $2";
    await pool.query(updatePinQuery, [newPin, userId]);

    res.status(200).json({ success: true, message: "PIN updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const updatePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Query the user's hashed password from the database
    const getUserPasswordQuery = "SELECT password FROM users WHERE id = $1";
    const userPasswordResult = await pool.query(getUserPasswordQuery, [userId]);

    if (userPasswordResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const currentPasswordHash = userPasswordResult.rows[0].password;

    // Compare the provided oldPassword with the user's current hashed password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);

    if (!isOldPasswordValid) {
      return res.status(401).json({ success: false, error: "Old password is invalid" });
    }

    // Hash the new password before updating it in the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updatePasswordQuery = "UPDATE users SET password = $1 WHERE id = $2";
    await pool.query(updatePasswordQuery, [hashedNewPassword, userId]);

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


module.exports = { register, login, getUsers, updatePin, updatePassword };
