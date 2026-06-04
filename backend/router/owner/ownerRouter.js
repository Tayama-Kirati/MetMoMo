const express    = require('express')
const router     = express.Router()
const isAuthenticated = require('../../middleware/isAuthenticated')
const restrictTo      = require('../../middleware/restrictTo')
const { multer, storage } = require('../../middleware/multerConfig')
const catchAsync  = require('../../services/catchAsync')

const upload = multer({ storage })

const {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  getMyProducts,
  createMyProduct,
  updateMyProduct,
  toggleMyProductStatus,
  deleteMyProduct,
  getMyRestaurantReviews,
  getMyOrders,
  updateOrderStatus,
  getFinance,
} = require('../../controller/owner/ownerController')

// All owner routes require login + restaurant_owner role
router.use(isAuthenticated, restrictTo('restaurant_owner'))

router.route('/restaurant')
  .get(catchAsync(getMyRestaurant))
  .post(upload.fields([{ name: 'coverImage', maxCount: 1 }]), catchAsync(createMyRestaurant))
  .patch(upload.fields([{ name: 'coverImage', maxCount: 1 }]), catchAsync(updateMyRestaurant))

router.route('/products')
  .get(catchAsync(getMyProducts))
  .post(upload.single('productImage'), catchAsync(createMyProduct))

router.route('/products/:id')
  .patch(upload.single('productImage'), catchAsync(updateMyProduct))
  .delete(catchAsync(deleteMyProduct))

router.route('/products/:id/status')
  .patch(catchAsync(toggleMyProductStatus))

router.route('/reviews')
  .get(catchAsync(getMyRestaurantReviews))

router.route('/orders')
  .get(catchAsync(getMyOrders))

router.route('/orders/:id/status')
  .patch(catchAsync(updateOrderStatus))

router.route('/finance')
  .get(catchAsync(getFinance))

module.exports = router
