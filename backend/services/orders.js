// Shared order lifecycle: creation (all payment methods) and status changes.
const crypto   = require('crypto')
const Order    = require('../models/orderSchema')
const Coupon   = require('../models/couponModel')
const User     = require('../models/userModel')
const Settings = require('../models/settingsModel')
const { priceOrder, PricingError } = require('./pricing')
const socket   = require('./socket')

const MESSAGES = {
  confirmed:   (r) => ({ title: 'Order Confirmed! ✅', body: `${r} has confirmed your order.` }),
  preparation: (r) => ({ title: 'Being Prepared 👩‍🍳', body: `${r} is preparing your food.` }),
  ontheway:    (r) => ({ title: 'Order On the Way! 🛵', body: `Your order from ${r} is on its way to you!` }),
  delivered:   (r) => ({ title: 'Order Delivered! 🏠', body: `Your order from ${r} has been delivered. Enjoy!` }),
  cancelled:   (r) => ({ title: 'Order Cancelled', body: `Your order from ${r} was cancelled.` }),
}

/**
 * Validate, price and create an order for `user`.
 * body: { items, shippingAddress, promoCode?, scheduledFor?, location? }
 */
async function createOrder(user, body, payment) {
  const { items, shippingAddress, promoCode, scheduledFor, location } = body
  if (!shippingAddress?.trim()) throw new PricingError('Please provide a delivery address')

  const priced = await priceOrder({ items, promoCode, shippingAddress, userId: user._id })
  const { restaurant } = priced
  if (!restaurant) throw new PricingError('These items are not linked to a restaurant')

  let schedule = null
  if (scheduledFor) {
    schedule = new Date(scheduledFor)
    const min = Date.now() + 30 * 60 * 1000
    const max = Date.now() + 7 * 24 * 60 * 60 * 1000
    if (isNaN(schedule) || schedule < min || schedule > max) {
      throw new PricingError('Scheduled time must be between 30 minutes and 7 days from now')
    }
  } else if (!restaurant.isAcceptingOrders()) {
    throw new PricingError(`${restaurant.name} is not taking orders right now. Try scheduling for later.`)
  }

  const order = new Order({
    user:            user._id,
    restaurant:      restaurant._id,
    items:           priced.lines,
    subtotal:        priced.subtotal,
    deliveryFee:     priced.deliveryFee,
    discount:        priced.discount,
    promoCode:       priced.coupon?.code || '',
    totalAmount:     priced.totalAmount,
    shippingAddress: shippingAddress.trim().slice(0, 300),
    location:        Number.isFinite(location?.lat) && Number.isFinite(location?.lng) ? location : undefined,
    scheduledFor:    schedule,
    deliveryCode:    String(crypto.randomInt(1000, 10000)),
    paymentDetails:  payment,
  })
  order.$locals.changedBy = user._id
  await order.save()

  if (priced.coupon) await Coupon.updateOne({ _id: priced.coupon._id }, { $inc: { usedCount: 1 } })

  // Clear purchased items from the server-side cart
  const bought = new Set(priced.lines.map(l => String(l.product)))
  await User.updateOne({ _id: user._id }, { $pull: { cart: { $in: [...bought] } } })

  // Online payments notify the restaurant only once paid
  if (payment.method === 'COD') announceNewOrder(order)
  return order
}

function announceNewOrder(order) {
  socket.notifyRestaurant(order.restaurant, 'order:new', {
    orderId: order._id,
    total:   order.totalAmount,
    items:   order.items.reduce((n, i) => n + i.quantity, 0),
    scheduledFor: order.scheduledFor,
  })
}

/** Change status, record who did it, and fan out notifications / side effects */
async function setStatus(order, status, actorId, restaurantName) {
  const previous = order.orderStatus
  order.orderStatus = status
  order.$locals.changedBy = actorId

  if (status === 'cancelled' && order.paymentDetails?.status === 'paid') {
    order.paymentDetails.status = 'refund_pending'
  }
  await order.save()

  if (status === 'delivered' && previous !== 'delivered') {
    const { loyaltyPointsPerHundred } = await Settings.get()
    const points = Math.floor(order.totalAmount / 100) * loyaltyPointsPerHundred
    if (points > 0) await User.updateOne({ _id: order.user }, { $inc: { loyaltyPoints: points } })
  }

  const name = restaurantName || 'The restaurant'
  if (MESSAGES[status]) {
    socket.notifyUser(order.user, 'order:status', { orderId: order._id, status, ...MESSAGES[status](name) })
  }
  if (status === 'preparation' && !order.driver) {
    socket.notifyDrivers('order:available', { orderId: order._id, restaurant: name, deliveryFee: order.deliveryFee })
  }
  if (order.restaurant) socket.notifyRestaurant(order.restaurant, 'order:updated', { orderId: order._id, status })
  return order
}

module.exports = { createOrder, setStatus, announceNewOrder, PricingError }
