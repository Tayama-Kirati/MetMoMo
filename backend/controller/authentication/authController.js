const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../services/sendEmail");
const catchAsync = require("../../services/catchAsync");

// POST /api/auth/register
exports.registerUser = catchAsync(async (req, res) => {
  const { email, userName, phoneNumber, password } = req.body;

  if (!email || !userName || !phoneNumber || !password) {
    return res.status(400).json({ message: "Please provide email, password, name and phoneNumber" });
  }
 
  const existing = await User.find({ userEmail: email });
  if (existing.length > 0) {
    return res.status(400).json({ message: "User with that email is already registered" });
  }

  await User.create({
    userName,
    userPhoneNumber: phoneNumber,
    userEmail: email,
    userPassword: bcrypt.hashSync(password, 10),
  });

  return res.status(201).json({ message: "User registered successfully" });
});

 
exports.loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const userFound = await User.find({ userEmail: email });
  if (!userFound.length) {
    return res.status(404).json({ message: "User with that email is not registered" });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, userFound[0].userPassword);


  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ id: userFound[0]._id }, process.env.SECRET_KEY, { expiresIn: "30d" });

  return res.status(200).json({
    message: "User logged in successfully",
    token,
    user: {
      _id: userFound[0]._id,
      userName: userFound[0].userName,
      userEmail: userFound[0].userEmail,
      userRole: userFound[0].userRole,
    },
  });
});

 
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Please provide email" });

  const userFound = await User.find({ userEmail: email });
  if (!userFound.length) return res.status(404).json({ message: "User with that email is not registered" });

  const otp = Math.floor(1000 + Math.random() * 9000);
  userFound[0].otp = otp;
  await userFound[0].save();

  try {
    await sendEmail({
      email: userFound[0].userEmail,
      subject: "MoMoGo – Password Reset OTP",
      message: `Your OTP is ${otp}. Valid for 15 minutes. Don't share it with anyone.`,
    });
    res.json({ message: "OTP sent to your email" });
  } catch {
    
    res.json({ message: "OTP generated (email not configured)", otp });
  }
});

 
exports.verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Please provide email and otp" });

  const userFound = await User.find({ userEmail: email }).select("+otp +otpIsVerified");
  if (!userFound.length) return res.status(404).json({ message: "User not found" });

  if (Number(userFound[0].otp) !== Number(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  userFound[0].otp = undefined;
  userFound[0].otpIsVerified = true;  
  await userFound[0].save();

  res.status(200).json({ message: "OTP verified. You can now reset your password." });
});
 
exports.resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Please provide email, newPassword and confirmPassword" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const userExists = await User.find({ userEmail: email });
  if (!userExists.length) return res.status(404).json({ message: "User not found" });

  userExists[0].userPassword = bcrypt.hashSync(newPassword, 10);
  await userExists[0].save();

  res.status(200).json({ message: "Password reset successfully" });
});