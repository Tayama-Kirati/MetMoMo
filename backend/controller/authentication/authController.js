const crypto = require("crypto");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../services/sendEmail");
const { signToken } = require("../../services/tokens");

const OTP_TTL_MS       = 15 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const publicUser = (u) => ({
  _id: u._id,
  userName: u.userName,
  userEmail: u.userEmail,
  userRole: u.userRole,
  isApproved: u.isApproved,
});

const normaliseEmail = (email) => String(email || "").trim().toLowerCase();

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { userName, phoneNumber, password, firstName, lastName, userRole } = req.body;
  const email = normaliseEmail(req.body.email);

  if (await User.exists({ userEmail: email })) {
    return res.status(400).json({ message: "User with that email is already registered" });
  }

  // Public sign-up: customers, restaurant owners and riders (riders need admin approval)
  const allowedRoles = ["customer", "restaurant_owner", "delivery_rider"];
  const role = allowedRoles.includes(userRole) ? userRole : "customer";

  const newUser = await User.create({
    userName,
    firstName: firstName || "",
    lastName:  lastName  || "",
    userPhoneNumber: String(phoneNumber),
    userEmail: email,
    userPassword: bcrypt.hashSync(password, 10),
    userRole: role,
    isApproved: role !== "delivery_rider",
  });

  return res.status(201).json({
    message: role === "delivery_rider"
      ? "Registered! An admin will approve your rider account shortly."
      : "User registered successfully",
    token: signToken(newUser),
    user: publicUser(newUser),
  });
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { password } = req.body;

  const user = await User.findOne({ userEmail: email }).select("+userPassword");
  // Same message for unknown email and wrong password, so emails can't be probed
  if (!user || !bcrypt.compareSync(password, user.userPassword)) {
    return res.status(400).json({ message: "Incorrect email or password" });
  }
  if (user.isBlocked) {
    return res.status(403).json({ message: "Your account has been blocked. Contact support." });
  }

  user.lastLogin = new Date();
  await user.save();

  return res.status(200).json({
    message: "User logged in successfully",
    token: signToken(user),
    user: publicUser(user),
  });
};

// POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const generic = { message: "If that email is registered, an OTP has been sent." };

  const user = await User.findOne({ userEmail: email });
  if (!user) return res.json(generic);

  const otp = crypto.randomInt(100000, 1000000);   // 6 digits
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  user.otpIsVerified = false;
  await user.save();

  try {
    await sendEmail({
      email: user.userEmail,
      subject: "MetMoMo – Password Reset OTP",
      message: `Your OTP is ${otp}. Valid for 15 minutes. Don't share it with anyone.`,
    });
  } catch (err) {
    // Never return the OTP in the response — log it for local development only
    console.error("Could not send OTP email:", err.message);
    if (process.env.NODE_ENV !== "production") console.log(`[dev] OTP for ${email}: ${otp}`);
  }
  res.json(generic);
};

// POST /api/auth/verifyotp
exports.verifyOtp = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { otp } = req.body;

  const user = await User.findOne({ userEmail: email }).select("+otp +otpExpires +otpAttempts +otpIsVerified");
  if (!user || !user.otp) return res.status(400).json({ message: "Invalid or expired OTP" });

  if (!user.otpExpires || user.otpExpires < new Date() || user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    user.otp = undefined;
    await user.save();
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (Number(user.otp) !== Number(otp)) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.otp = undefined;
  user.otpIsVerified = true;
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);   // window to set the new password
  await user.save();

  res.status(200).json({ message: "OTP verified. You can now reset your password." });
};

// POST /api/auth/resetpassword — only after a successful OTP verification
exports.resetPassword = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const user = await User.findOne({ userEmail: email }).select("+otpIsVerified +otpExpires");
  if (!user || !user.otpIsVerified || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(403).json({ message: "Please verify the OTP sent to your email first" });
  }

  user.userPassword = bcrypt.hashSync(newPassword, 10);
  user.passwordChangedAt = new Date();
  user.otpIsVerified = false;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};
