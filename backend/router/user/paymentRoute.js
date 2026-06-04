const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
 

const {initiateKhaltiPayment, verifyPidx} = require("../../controller/user/payment/paymentController")

router.route("/").post(isAuthenticated, catchAsync(initiateKhaltiPayment))
router.route("/success").get(catchAsync(verifyPidx))   // Khalti GET redirect

module.exports = router;