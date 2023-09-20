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

// Other controllers and routes...

module.exports = { register, login };
