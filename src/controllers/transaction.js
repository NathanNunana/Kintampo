const db = require("../connections/db");
const { allTrans } = require("../util/queries");

const createTransaction = async (req, res) => {
  const { account_number, username, amount, status, pin } = req.body;

  try {
    const getUserPinQuery = "SELECT pin FROM users WHERE username = $1";
    const userPinResult = await db.query(getUserPinQuery, [username]);

    const getUserAccountQuery = "SELECT * FROM users WHERE account_number = $1";
    const userAccountResult = await db.query(getUserAccountQuery, [
      account_number,
    ]);

    const getUserMatchAccountQuery =
      "SELECT * FROM users WHERE account_number=$1 AND username=$2";
    const userAccountMatchResult = await db.query(getUserMatchAccountQuery, [
      account_number,
      username,
    ]);

    if (userAccountResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Account does not exist not found" });
    }

    if (userAccountMatchResult.rows.length !== 0) {
      return res
        .status(404)
        .json({ error: "You can't make a transaction to your own account" });
    }

    if (userPinResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const yourPin = userPinResult.rows[0].pin;

    if (pin !== yourPin) {
      return res.status(401).json({ error: "Invalid pin" });
    }

    const createTransQuery =
      "INSERT INTO transactions (username, account_number, amount, status) " +
      "VALUES ($1, $2, $3, $4) RETURNING transaction_id";

    const values = [username, account_number, amount, status];

    const result = await db.query(createTransQuery, values);

    const updateQuery =
      "UPDATE users SET current_balance=current_balance+$1 WHERE account_number=$2";
    await db.query(updateQuery, [parseInt(amount), account_number]);

    // Create a record for the recipient with status "Received"
    const recipientUsernameQuery =
      "SELECT username FROM users WHERE account_number = $1";
    const recipientUsernameResult = await db.query(recipientUsernameQuery, [
      account_number,
    ]);

    if (recipientUsernameResult.rows.length > 0) {
      const recipientUsername = recipientUsernameResult.rows[0].username;
      const createRecipientTransQuery =
        "INSERT INTO transactions (username, account_number, amount, status) " +
        "VALUES ($1, $2, $3, $4)";
      await db.query(createRecipientTransQuery, [
        recipientUsername,
        account_number,
        amount,
        "Received",
      ]);
    }

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

const getTransactionByName = async (req, res) => {
  const { username } = req.params;
  console.log(username);
  try {
    const query = "SELECT * FROM transactions WHERE username=$1";
    const result = await db.query(query, [username]);
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
  getTransactionByName,
};
