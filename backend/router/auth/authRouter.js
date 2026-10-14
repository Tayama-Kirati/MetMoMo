const router = require('express').Router();
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword } = require('../../controller/authentication/authController');
const catchAsync = require('../../services/catchAsync');
const validate = require('../../middleware/validate');
const { loginLimiter, otpLimiter } = require('../../middleware/rateLimits');

const password = { type: 'string', min: 6, max: 128 };

router.route("/register").post(loginLimiter, validate({
  email: 'email', userName: { type: 'string', max: 60 }, phoneNumber: { type: 'string', min: 7, max: 15 }, password,
}), catchAsync(registerUser));
router.route("/login").post(loginLimiter, validate({ email: 'email', password: 'string' }), catchAsync(loginUser));
router.route("/forgotpassword").post(otpLimiter, validate({ email: 'email' }), catchAsync(forgotPassword));
router.route("/verifyotp").post(otpLimiter, validate({ email: 'email', otp: 'number' }), catchAsync(verifyOtp));
router.route("/resetpassword").post(otpLimiter, validate({
  email: 'email', newPassword: password, confirmPassword: 'string',
}), catchAsync(resetPassword));

module.exports = router;
