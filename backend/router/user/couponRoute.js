const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const Coupon = require("../../models/couponModel");

// GET /api/coupons  — active public coupons to show on the cart page
router.get("/", isAuthenticated, catchAsync(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).select("code description type value maxDiscount minOrder firstOrderOnly restaurant").limit(20);
  res.status(200).json({ data: coupons });
}));

module.exports = router;
