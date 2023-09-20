const db = require("../connections/db");
const { allTrans } = require("../util/queries");

const createTransaction = async (req, res) => {
  const { account_number, username, amount, status, pin } = req.body;

  try {
    const getUserPinQuery = "SELECT pin FROM users WHERE username = $1";
    const userPinResult = await db.query(getUserPinQuery, [username]);

    if (userPinResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const yourPin = userPinResult.rows[0].pin;

    if (pin !== yourPin) {
      return res.status(401).json({ error: "Invalid pin" });
    }

    const createTransQuery =
      "INSERT INTO transactions (account_number, amount, status) " +
      "VALUES ($1, $2, $3) RETURNING transaction_id";

    const values = [account_number, amount, status];

    const result = await db.query(createTransQuery, values);

    const newTransaction = result.rows[0];
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const allTransaction = async (req, res) => {
  try {
    const query = allTrans;
    const result = await db.query(query);
    const transactions = result.rows;
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTransaction,
  allTransaction,
};
