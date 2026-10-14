// Server-side order pricing. The client only sends product ids + quantities;
// every amount that ends up on an order is computed here.
const mongoose   = require('mongoose')
const Product    = require('../models/productModel')
const Restaurant = require('../models/restaurantModel')
const Coupon     = require('../models/couponModel')
const Order      = require('../models/orderSchema')
const { estimateDistanceKm, feeFromKm } = require('./deliveryEstimate')

class PricingError extends Error {
  constructor(message, status = 400) { super(message); this.status = status }
}

// Collapse [{product, quantity}] (or repeated ids) into one line per product
function normaliseItems(items) {
  const qty = new Map()
  for (const it of items || []) {
    const id = String(it?.product ?? it ?? '')
    if (!mongoose.isValidObjectId(id)) throw new PricingError('Invalid product in order')
    const q = Math.floor(Number(it?.quantity ?? 1))
    if (!Number.isFinite(q) || q < 1 || q > 50) throw new PricingError('Invalid quantity')
    qty.set(id, (qty.get(id) || 0) + q)
  }
  if (!qty.size) throw new PricingError('Please provide order items')
  return qty
}

async function validateCoupon(code, { userId, subtotal, restaurantId }) {
  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase(), isActive: true })
  if (!coupon) throw new PricingError('Invalid promo code')
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new PricingError('This promo code has expired')
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new PricingError('This promo code has been fully used')
  if (coupon.restaurant && String(coupon.restaurant) !== String(restaurantId)) {
    throw new PricingError('This promo code is not valid for this restaurant')
  }
  if (subtotal < coupon.minOrder) throw new PricingError(`Minimum order for this code is NPR ${coupon.minOrder}`)

  if (userId) {
    const live = { user: userId, orderStatus: { $ne: 'cancelled' } }
    if (coupon.firstOrderOnly && await Order.exists(live)) {
      throw new PricingError('This code is only for your first order')
    }
    if (coupon.perUserLimit) {
      const used = await Order.countDocuments({ ...live, promoCode: coupon.code })
      if (used >= coupon.perUserLimit) throw new PricingError('You have already used this code')
    }
  }

  let discount = coupon.type === 'percent'
    ? Math.floor(subtotal * coupon.value / 100)
    : coupon.value
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  discount = Math.min(discount, subtotal)
  return { coupon, discount }
}

/**
 * Price an order. Returns everything needed to create it.
 * @param {{items, promoCode?, shippingAddress?, userId?, skipDeliveryEstimate?}} input
 */
async function priceOrder({ items, promoCode, shippingAddress, userId, skipDeliveryEstimate = false }) {
  const qty = normaliseItems(items)
  const products = await Product.find({ _id: { $in: [...qty.keys()] } })
  if (products.length !== qty.size) throw new PricingError('Some items are no longer on the menu')

  const restaurantIds = [...new Set(products.map(p => String(p.restaurant || '')))]
  if (restaurantIds.length > 1) throw new PricingError('Please order from one restaurant at a time')

  const unavailable = products.find(p => p.productStatus !== 'available')
  if (unavailable) throw new PricingError(`${unavailable.productName} is sold out`)

  const restaurant = restaurantIds[0] ? await Restaurant.findById(restaurantIds[0]) : null

  const lines = products.map(p => ({
    product:  p._id,
    quantity: qty.get(String(p._id)),
    name:     p.productName,
    price:    p.productPrice,
  }))
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)

  if (restaurant?.minimumOrder && subtotal < restaurant.minimumOrder) {
    throw new PricingError(`Minimum order for ${restaurant.name} is NPR ${restaurant.minimumOrder}`)
  }

  // Delivery fee: distance-based when we have an address, else restaurant default
  let deliveryFee = restaurant?.deliveryFee || 0
  let distanceKm  = null
  if (!skipDeliveryEstimate && restaurant && shippingAddress?.trim()) {
    const est = await estimateDistanceKm(restaurant, shippingAddress)
    distanceKm  = est.distanceKm
    deliveryFee = feeFromKm(distanceKm)
  }

  let discount = 0
  let coupon   = null
  if (promoCode?.trim()) {
    ({ coupon, discount } = await validateCoupon(promoCode, { userId, subtotal, restaurantId: restaurant?._id }))
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee - discount)
  return { lines, subtotal, deliveryFee, distanceKm, discount, coupon, totalAmount, restaurant }
}

module.exports = { priceOrder, validateCoupon, PricingError }
