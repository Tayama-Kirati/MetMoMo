// Distance estimate between a restaurant and a customer address (Kathmandu Valley).
// Uses Claude when configured; results are cached so checkout doesn't pay twice.
const { ask, isEnabled } = require('./ai')

const DEFAULT_KM = 5
const CACHE_TTL  = 6 * 60 * 60 * 1000
const cache = new Map()   // key -> { value, at }

function feeFromKm(km) {
  if (km <= 2)  return 40
  if (km <= 5)  return 70
  if (km <= 8)  return 100
  if (km <= 12) return 150
  return 200
}

const SCHEMA = {
  type: 'object',
  properties: {
    distanceKm:  { type: 'number' },
    explanation: { type: 'string' },
  },
  required: ['distanceKm', 'explanation'],
  additionalProperties: false,
}

async function estimateDistanceKm(restaurant, customerAddress) {
  const address = String(customerAddress).trim().slice(0, 300)
  const key = `${restaurant._id}|${address.toLowerCase()}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value

  let value = { distanceKm: DEFAULT_KM, explanation: 'Estimated distance (AI unavailable)' }
  if (isEnabled()) {
    try {
      const parsed = await ask({
        system: 'You are a Kathmandu Valley geography expert who estimates road distances for a food delivery app.',
        messages: [{
          role: 'user',
          content: `Estimate the road distance in kilometres between these two locations.\n\nRestaurant: ${restaurant.name} at "${restaurant.address}"\nCustomer: "${address}"\n\nGive the distance and one short sentence about the route.`,
        }],
        schema: SCHEMA,
        maxTokens: 1024,
      })
      const km = Number(parsed.distanceKm)
      value = {
        distanceKm:  Math.min(50, Math.max(0.5, Number.isFinite(km) ? km : DEFAULT_KM)),
        explanation: parsed.explanation || '',
      }
    } catch (err) {
      console.warn('Delivery estimate fallback:', err.message)
    }
  }

  value.distanceKm = Math.round(value.distanceKm * 10) / 10
  cache.set(key, { value, at: Date.now() })
  if (cache.size > 5000) cache.delete(cache.keys().next().value)
  return value
}

module.exports = { estimateDistanceKm, feeFromKm }
