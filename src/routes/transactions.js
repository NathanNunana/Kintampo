const router = require("express").Router();
const { createTransaction, allTransaction } = require("../controllers/transaction.js");
const { auth } = require("../util/middleware.js");

router.get("/", auth, allTransaction);

router.post("/create", auth, createTransaction);

module.exports = router;
