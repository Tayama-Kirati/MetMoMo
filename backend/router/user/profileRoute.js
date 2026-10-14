const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  updateMyPassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../../controller/user/profile/profileController");

router.use(isAuthenticated);

router.route("/")
  .get(catchAsync(getMyProfile))
  .patch(catchAsync(updateMyProfile))
  .delete(catchAsync(deleteMyProfile));

router.patch("/changePassword", catchAsync(updateMyPassword));

router.route("/addresses")
  .get(catchAsync(getAddresses))
  .post(catchAsync(addAddress));
router.route("/addresses/:addressId")
  .patch(catchAsync(updateAddress))
  .delete(catchAsync(deleteAddress));

module.exports = router;
