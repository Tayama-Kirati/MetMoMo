const router        = require('express').Router()
const catchAsync    = require('../../services/catchAsync')
const isAuthenticated = require('../../middleware/isAuthenticated')
const restrictTo    = require('../../middleware/restrictTo')
const { getDeliveryOrders, confirmDelivery } = require('../../controller/driver/driverController')

router.use(isAuthenticated, restrictTo('delivery_rider'))

router.get('/orders',                   catchAsync(getDeliveryOrders))
router.patch('/orders/:id/delivered',   catchAsync(confirmDelivery))

module.exports = router
