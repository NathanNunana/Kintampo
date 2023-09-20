const express = require("express");
const userRoutes = require("./routes/user");
const transactionRoute = require("./routes/transactions");
const cors = require("cors");

const app = express();

require("dotenv").config({ path: ".env" });
require("./connections/db");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth/", userRoutes);
app.use("/api/transaction/", transactionRoute);

app.all("*", (req, res) => {
  res.status(404).json({
    msg: "404: Not Found",
  });
});

module.exports = app;
