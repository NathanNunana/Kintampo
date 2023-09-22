const db = require("../connections/db");

const requestLoan = async (req, res) => {
  const { username, amount, duration, purpose, pin } = req.body;
  try {
    const userCheckQuery = "SELECT * FROM users WHERE username=$1";

    const check = await db.query(userCheckQuery, [username]);

    if(pin !== check.rows[0].pin){
      return res.status(404).json({error: "Invalid pin"});
    }

    const insertLoanQuery = `
      INSERT INTO loans (username, amount, duration, purpose, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id;
    `;

    const values = [username, amount, duration, purpose];
    const result = await db.query(insertLoanQuery, values);

    const newLoanId = result.rows[0].loan_id;

    res.status(201).json({ success: true, message: "Loan request submitted", loanId: newLoanId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getRequestedLoans = async (req, res) => {
  try {
    const getLoansQuery = "SELECT * FROM loans WHERE status = 'pending'";
    const result = await db.query(getLoansQuery);

    const loans = result.rows;

    res.status(200).json({ success: true, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getAllLoans = async (req, res) => {
  try {
    const getLoansQuery = "SELECT * FROM loans WHERE status = 'accepted'";
    const result = await db.query(getLoansQuery);

    const loans = result.rows;

    res.status(200).json({ success: true, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const acceptLoan = async (req, res) => {
  const { loanId, userId, amount } = req.body;

  try {
    const checkLoanQuery = "SELECT * FROM loans WHERE id = $1 AND status = 'pending';";
    const checkLoanResult = await db.query(checkLoanQuery, [loanId]);

    if (checkLoanResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Loan not found or not pending" });
    }

    // Update the loan status to 'accepted'
    const updateLoanQuery = "UPDATE loans SET status = 'accepted' WHERE id = $1;";
    await db.query(updateLoanQuery, [loanId]);

    // Fetch the user's current balance
    const getUserBalanceQuery = "SELECT current_balance FROM users WHERE id = $1;";
    const getUserBalanceResult = await db.query(getUserBalanceQuery, [userId]);
    

    if (getUserBalanceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const currentBalance = getUserBalanceResult.rows[0].current_balance;

    // Calculate the new balance after accepting the loan
    const newBalance = currentBalance + amount;

    // Update the user's balance with the new amount
    const updateUserBalanceQuery = "UPDATE users SET current_balance = $1 WHERE id = $2;";
    await db.query(updateUserBalanceQuery, [newBalance, userId]);

    res.status(200).json({ success: true, message: "Loan accepted and user balance updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const rejectLoan = async (req, res) => {
  const { loanId } = req.body;

  try {
    // Check if the loan exists and is pending
    const checkLoanQuery = "SELECT * FROM loans WHERE id = $1 AND status = 'pending';";
    const checkLoanResult = await db.query(checkLoanQuery, [loanId]);

    if (checkLoanResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Loan not found or not pending" });
    }

    const updateLoanQuery = "UPDATE loans SET status = 'rejected' WHERE id = $1;";
    await db.query(updateLoanQuery, [loanId]);

    res.status(200).json({ success: true, message: "Loan rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};



module.exports = {
  requestLoan,
  getRequestedLoans,
  acceptLoan,
  rejectLoan,
  getAllLoans
};
