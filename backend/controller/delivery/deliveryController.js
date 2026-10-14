const Restaurant = require('../../models/restaurantModel')
const catchAsync = require('../../services/catchAsync')
const { estimateDistanceKm, feeFromKm } = require('../../services/deliveryEstimate')

// POST /api/delivery/estimate
exports.estimateDeliveryFee = catchAsync(async (req, res) => {
  const { restaurantId, customerAddress } = req.body
  if (!restaurantId || !customerAddress?.trim()) {
    return res.status(400).json({ message: 'Provide restaurantId and customerAddress' })
  }

  const restaurant = await Restaurant.findById(restaurantId).select('name address')
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  const { distanceKm, explanation } = await estimateDistanceKm(restaurant, customerAddress)

  return res.status(200).json({
    distanceKm,
    deliveryFee: feeFromKm(distanceKm),
    explanation,
    restaurantName: restaurant.name,
  })
})
