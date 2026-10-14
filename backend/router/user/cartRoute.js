const { addToCart, getMyCartItems, deleteItemFromCart, setCartQuantity } = require("../../controller/user/cart/cartController")
const isAuthenticated = require("../../middleware/isAuthenticated")
const catchAsync = require("../../services/catchAsync")

const router = require("express").Router()

router.use(isAuthenticated)
router.route("/").get(catchAsync(getMyCartItems))
router.route("/:productId")
  .post(catchAsync(addToCart))
  .patch(catchAsync(setCartQuantity))
  .delete(catchAsync(deleteItemFromCart))

module.exports = router;
