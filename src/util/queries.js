const createTransactionQuery =   "INSERT INTO transactions (account_number, username, amount, status) VALUES ($1, $2, $3, $4) RETURNING transaction_id";
const getUser = "SELECT * FROM users WHERE username = $1";
const insertUserQuery =
  "INSERT INTO users (username, password, role, dob, occupation, ghcard, phone, address, account_number, pin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
const allTrans = "SELECT * FROM transactions";

module.exports = {
  createTransactionQuery,
  getUser,
  insertUserQuery,
  allTrans,
}