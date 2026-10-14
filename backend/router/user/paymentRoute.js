const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const validate = require("../../middleware/validate");
const {
  initiateKhaltiPayment, verifyPidx, initiateEsewaPayment, verifyEsewa, esewaFailure,
} = require("../../controller/user/payment/paymentController");

const orderBody = validate({ items: { type: "array", min: 1 }, shippingAddress: { type: "string", max: 300 } });

router.post("/",              isAuthenticated, orderBody, catchAsync(initiateKhaltiPayment));
router.get("/success",        catchAsync(verifyPidx));          // Khalti redirect
router.post("/esewa",         isAuthenticated, orderBody, catchAsync(initiateEsewaPayment));
router.get("/esewa/success",  catchAsync(verifyEsewa));         // eSewa redirect
router.get("/esewa/failure",  catchAsync(esewaFailure));

module.exports = router;
