const router      = require('express').Router()
const catchAsync  = require('../../services/catchAsync')
const { estimateDeliveryFee } = require('../../controller/delivery/deliveryController')

router.post('/estimate', catchAsync(estimateDeliveryFee))

module.exports = router
