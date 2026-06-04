const Anthropic = require('@anthropic-ai/sdk')
const Restaurant = require('../../models/restaurantModel')
const catchAsync = require('../../services/catchAsync')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function feeFromKm(km) {
  if (km <= 2)  return 40
  if (km <= 5)  return 70
  if (km <= 8)  return 100
  if (km <= 12) return 150
  return 200
}

// POST /api/delivery/estimate
exports.estimateDeliveryFee = catchAsync(async (req, res) => {
  const { restaurantId, customerAddress } = req.body
  if (!restaurantId || !customerAddress?.trim()) {
    return res.status(400).json({ message: 'Provide restaurantId and customerAddress' })
  }

  const restaurant = await Restaurant.findById(restaurantId).select('name address')
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  let distanceKm = 5
  let explanation = ''

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are a Kathmandu Valley geography expert. Estimate the road distance in kilometres between these two locations.

Restaurant: ${restaurant.name} at "${restaurant.address}"
Customer: "${customerAddress}"

Reply with ONLY a JSON object like this, no extra text:
{"distanceKm": 4.5, "explanation": "One short sentence about the route"}`,
      }],
    })

    const parsed = JSON.parse(msg.content[0].text.trim())
    distanceKm  = Math.max(0.5, Number(parsed.distanceKm) || 5)
    explanation = parsed.explanation || ''
  } catch {
    // fallback: flat estimate
    distanceKm  = 5
    explanation = 'Estimated distance (AI unavailable)'
  }

  const deliveryFee = feeFromKm(distanceKm)

  return res.status(200).json({
    distanceKm: Math.round(distanceKm * 10) / 10,
    deliveryFee,
    explanation,
    restaurantName: restaurant.name,
  })
})
