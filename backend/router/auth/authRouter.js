const router = require('express').Router();
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword } = require('../../controller/authentication/authController');
const catchAsync = require('../../services/catchAsync');
  

router.route("/register").post(catchAsync(registerUser));
router.route("/login").post(catchAsync(loginUser));
router.route("/forgotpassword").post(catchAsync(forgotPassword));
router.route("/verifyotp").post(catchAsync(verifyOtp));
router.route("/resetpassword").post(catchAsync(resetPassword));

module.exports = router;