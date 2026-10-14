const router = require("express").Router();
const { createProduct, deleteProduct, editProduct, toggleProductStatus } = require("../../controller/admin/product/productController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const optionalAuth = require("../../middleware/optionalAuth");
const restrictTo = require("../../middleware/restrictTo");
const { upload } = require("../../services/storage");
const catchAsync = require("../../services/catchAsync");
const { getProducts, getProduct, getTopPicks, getForYou } = require("../../controller/global/globalController");

router.route("/")
  .get(optionalAuth, catchAsync(getProducts))
  .post(isAuthenticated, restrictTo("admin"), upload.single("productImage"), catchAsync(createProduct));

router.route("/top-picks").get(catchAsync(getTopPicks));
router.route("/for-you").get(isAuthenticated, catchAsync(getForYou));

router.route("/:id")
  .get(catchAsync(getProduct))
  .delete(isAuthenticated, restrictTo("admin"), catchAsync(deleteProduct))
  .patch(isAuthenticated, restrictTo("admin"), upload.single("productImage"), catchAsync(editProduct));

router.route("/:id/status")
  .patch(isAuthenticated, restrictTo("admin"), catchAsync(toggleProductStatus));

module.exports = router;
