const express = require("express");
const userRoutes = require("./routes/user");
const transactionRoute = require("./routes/transactions");
const loanRoutes = require("./routes/loan");
const cors = require("cors");

const app = express();

require("dotenv").config({ path: ".env" });
require("./connections/db");

const corsOptions = {
  origin: ['http://localhost:3000', 'http://example.com'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth/", userRoutes);
app.use("/api/transaction/", transactionRoute);
app.use("/api/loan/", loanRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    msg: "404: Not Found",
  });
});

module.exports = app;
