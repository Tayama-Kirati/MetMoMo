const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
 

const {initiateKhaltiPayment, verifyPidx} = require("../../controller/user/payment/paymentController")

router.route("/").post( catchAsync(initiateKhaltiPayment))
router.route("/success").post(isAuthenticated, catchAsync(verifyPidx))

module.exports = router;