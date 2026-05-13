const User = require("../../../models/userModel");
const bcrypt = require("bcryptjs");

// GET /api/profile
exports.getMyProfile = async (req, res) => {
  const userId = req.user.id;
  const myProfile = await User.findById(userId).select("-userPassword -otp -otpIsVerified");
  res.status(200).json({ data: myProfile, message: "Profile fetched" });
};

// PATCH /api/profile
exports.updateMyProfile = async (req, res) => {
  const {
    userName, firstName, lastName, dateOfBirth,
    userEmail, userPhoneNumber, profileImage,
    address, city, state, country, postalCode, landmark, deliveryInstructions,
    preferences,
  } = req.body;
  const userId = req.user.id;
  const updatedData = await User.findByIdAndUpdate(
    userId,
    {
      ...(userName        !== undefined && { userName }),
      ...(firstName       !== undefined && { firstName }),
      ...(lastName        !== undefined && { lastName }),
      ...(dateOfBirth     !== undefined && { dateOfBirth }),
      ...(userEmail       !== undefined && { userEmail }),
      ...(userPhoneNumber !== undefined && { userPhoneNumber }),
      ...(profileImage    !== undefined && { profileImage }),
      ...(address         !== undefined && { address }),
      ...(city            !== undefined && { city }),
      ...(state           !== undefined && { state }),
      ...(country         !== undefined && { country }),
      ...(postalCode      !== undefined && { postalCode }),
      ...(landmark        !== undefined && { landmark }),
      ...(deliveryInstructions !== undefined && { deliveryInstructions }),
      ...(preferences     !== undefined && { preferences }),
    },
    { new: true, runValidators: true }
  ).select("-userPassword -otp -otpIsVerified");
  res.status(200).json({ message: "Profile updated successfully", data: updatedData });
};

// DELETE /api/profile
exports.deleteMyProfile = async (req, res) => {
  const userId = req.user.id;
  await User.findByIdAndDelete(userId);
  res.status(200).json({ message: "Profile deleted successfully", data: null });
};

// PATCH /api/profile/changePassword
// FIX: was exported as "updatemyPassword" (lowercase p) so profileRoute import failed silently
exports.updateMyPassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Please provide oldPassword, newPassword and confirmPassword" });
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    return res.status(400).json({ message: "newPassword and confirmPassword do not match" });
  }

  const userData = await User.findById(userId);
  const isCorrect = bcrypt.compareSync(oldPassword, userData.userPassword);
  if (!isCorrect) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  userData.userPassword = bcrypt.hashSync(newPassword, 12);
  await userData.save();
  res.status(200).json({ message: "Password changed successfully" });
};