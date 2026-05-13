const router = require("express").Router();
const { createProduct, deleteProduct, editProduct } = require("../../controller/admin/product/productController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const restrictTo = require("../../middleware/restrictTo");
const { multer, storage } = require("../../middleware/multerConfig");
const catchAsync = require("../../services/catchAsync");
const { getProducts, getProduct } = require("../../controller/global/globalController");

const upload = multer({ storage: storage });

router.route("/")
  .get(catchAsync(getProducts))
  .post(isAuthenticated, restrictTo("admin"), upload.single("productImage"), catchAsync(createProduct));

// Single product — GET/DELETE/PATCH /api/products/product/:id
// FIX: also handle /api/products/:id directly (frontend calls /api/products/:id)
 

router.route("/:id")
  .get(catchAsync(getProduct))
  .delete(isAuthenticated, restrictTo("admin"), catchAsync(deleteProduct))
  .patch(isAuthenticated, restrictTo("admin"), upload.single("productImage"), catchAsync(editProduct));

module.exports = router;