const router = require("express").Router();
const { createTransaction, allTransaction, getTransactionByName } = require("../controllers/transaction.js");
const { auth } = require("../util/middleware.js");

router.get("/", auth, allTransaction);

router.get("/:username", auth, getTransactionByName);

router.post("/create", auth, createTransaction);

module.exports = router;
