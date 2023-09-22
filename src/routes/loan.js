const router = require("express").Router();
const { auth } = require("../util/middleware");
const { requestLoan, getRequestedLoans, acceptLoan, rejectLoan, getAllLoans } = require("../controllers/loan");

router.post("/create", auth, requestLoan);

router.put("/accept", auth, acceptLoan);

router.put("/reject", auth, rejectLoan);

router.get("/pending", auth, getRequestedLoans);

router.get("/accepted", auth, getAllLoans);

module.exports = router;
