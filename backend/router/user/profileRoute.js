const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  updateMyPassword,   // FIX: original exported as "updatemyPassword" (lowercase p) — fixed in controller
} = require("../../controller/user/profile/profileController");

// GET /api/profile        → get my profile
// PATCH /api/profile      → update profile   FIX: was .delete() by mistake
// DELETE /api/profile     → delete account
router.route("/")
  .get(isAuthenticated, catchAsync(getMyProfile))
  .patch(isAuthenticated, catchAsync(updateMyProfile))   // ← was DELETE, now PATCH
  .delete(isAuthenticated, catchAsync(deleteMyProfile));

// PATCH /api/profile/changePassword
router.route("/changePassword")
  .patch(isAuthenticated, catchAsync(updateMyPassword));

module.exports = router;