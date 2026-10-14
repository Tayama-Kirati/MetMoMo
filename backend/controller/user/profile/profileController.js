const User = require("../../../models/userModel");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../../services/tokens");

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
      ...(userEmail       !== undefined && { userEmail: String(userEmail).trim().toLowerCase() }),
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

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const userData = await User.findById(userId).select("+userPassword");
  const isCorrect = bcrypt.compareSync(oldPassword, userData.userPassword);
  if (!isCorrect) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  userData.userPassword = bcrypt.hashSync(newPassword, 12);
  userData.passwordChangedAt = new Date();
  await userData.save();
  // Older sessions are now invalid; hand this one a fresh token
  res.status(200).json({ message: "Password changed successfully", token: signToken(userData) });
};

// ── Saved addresses ─────────────────────────────────────────────────

const ADDRESS_FIELDS = ["label", "street", "landmark", "city", "lat", "lng", "isDefault"];
const pickAddress = (body) => Object.fromEntries(
  ADDRESS_FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k]])
);

// GET /api/profile/addresses
exports.getAddresses = async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  res.status(200).json({ data: user.addresses });
};

// POST /api/profile/addresses
exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.addresses.length >= 10) return res.status(400).json({ message: "You can save up to 10 addresses" });
  const address = pickAddress(req.body);
  if (!String(address.street || "").trim()) return res.status(400).json({ message: "Street is required" });
  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach(a => { a.isDefault = false; });
    address.isDefault = true;
  }
  user.addresses.push(address);
  await user.save();
  res.status(201).json({ message: "Address saved", data: user.addresses });
};

// PATCH /api/profile/addresses/:addressId
exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ message: "Address not found" });
  const changes = pickAddress(req.body);
  if (changes.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
  address.set(changes);
  await user.save();
  res.status(200).json({ message: "Address updated", data: user.addresses });
};

// DELETE /api/profile/addresses/:addressId
exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ message: "Address not found" });
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses[0]) user.addresses[0].isDefault = true;
  await user.save();
  res.status(200).json({ message: "Address removed", data: user.addresses });
};