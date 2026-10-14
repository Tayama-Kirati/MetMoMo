const router        = require('express').Router()
const catchAsync    = require('../../services/catchAsync')
const isAuthenticated = require('../../middleware/isAuthenticated')
const restrictTo    = require('../../middleware/restrictTo')
const {
  getAvailableOrders, getDeliveryOrders, acceptOrder, declineOrder,
  pickupOrder, confirmDelivery, getEarnings,
} = require('../../controller/driver/driverController')

router.use(isAuthenticated, restrictTo('delivery_rider'))

router.get('/orders',                  catchAsync(getDeliveryOrders))
router.get('/orders/available',        catchAsync(getAvailableOrders))
router.patch('/orders/:id/accept',     catchAsync(acceptOrder))
router.patch('/orders/:id/decline',    catchAsync(declineOrder))
router.patch('/orders/:id/pickup',     catchAsync(pickupOrder))
router.patch('/orders/:id/delivered',  catchAsync(confirmDelivery))
router.get('/earnings',                catchAsync(getEarnings))

module.exports = router
