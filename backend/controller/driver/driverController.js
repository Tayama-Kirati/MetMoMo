const Order      = require('../../models/orderSchema')
const Settings   = require('../../models/settingsModel')
const { setStatus } = require('../../services/orders')

const ORDER_FIELDS = [
  { path: 'items.product', select: 'productName productPrice productImage productCategory' },
  { path: 'user',          select: 'userName userPhoneNumber' },
  { path: 'restaurant',    select: 'name address phone emoji' },
]

const PAID_OR_COD = {
  $or: [{ 'paymentDetails.method': 'COD' }, { 'paymentDetails.status': 'paid' }],
}

function requireApproved(req, res) {
  if (req.user.isApproved) return true
  res.status(403).json({ message: 'Your rider account is waiting for admin approval' })
  return false
}

// GET /api/driver/orders/available  — confirmed orders with no rider yet
exports.getAvailableOrders = async (req, res) => {
  if (!requireApproved(req, res)) return
  const orders = await Order.find({
    driver: null,
    orderStatus: { $in: ['confirmed', 'preparation'] },
    declinedBy: { $ne: req.user._id },
    ...PAID_OR_COD,
  }).populate(ORDER_FIELDS).sort({ createdAt: 1 }).limit(50)
  res.status(200).json({ message: 'Available orders', data: orders })
}

// GET /api/driver/orders  — my active deliveries
exports.getDeliveryOrders = async (req, res) => {
  const orders = await Order.find({
    driver: req.user._id,
    orderStatus: { $in: ['confirmed', 'preparation', 'ontheway'] },
  }).populate(ORDER_FIELDS).sort({ createdAt: -1 })
  res.status(200).json({ message: 'Delivery orders fetched', data: orders })
}

// PATCH /api/driver/orders/:id/accept
exports.acceptOrder = async (req, res) => {
  if (!requireApproved(req, res)) return
  // Atomic: only one rider can claim an order
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, driver: null, orderStatus: { $in: ['confirmed', 'preparation'] } },
    { driver: req.user._id },
    { new: true }
  ).populate(ORDER_FIELDS)
  if (!order) return res.status(409).json({ message: 'This order was already taken or is no longer available' })
  res.status(200).json({ message: 'Order accepted', data: order })
}

// PATCH /api/driver/orders/:id/decline  — hide it from my available list
exports.declineOrder = async (req, res) => {
  await Order.updateOne({ _id: req.params.id, driver: null }, { $addToSet: { declinedBy: req.user._id } })
  res.status(200).json({ message: 'Order declined' })
}

// PATCH /api/driver/orders/:id/pickup  — rider collected the food
exports.pickupOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, driver: req.user._id }).populate('restaurant', 'name')
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (!['confirmed', 'preparation'].includes(order.orderStatus)) {
    return res.status(400).json({ message: 'Order is not ready for pickup' })
  }
  await setStatus(order, 'ontheway', req.user._id, order.restaurant?.name)
  res.status(200).json({ message: 'Picked up — on the way', data: order })
}

// PATCH /api/driver/orders/:id/delivered  — requires the customer's 4-digit code
exports.confirmDelivery = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, driver: req.user._id })
    .select('+deliveryCode').populate('restaurant', 'name')
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.orderStatus !== 'ontheway') {
    return res.status(400).json({ message: 'Order is not out for delivery' })
  }
  if (order.deliveryCode && String(req.body.code || '').trim() !== order.deliveryCode) {
    return res.status(400).json({ message: 'Wrong delivery code. Ask the customer for the code shown in their app.' })
  }
  if (order.paymentDetails.method === 'COD') order.paymentDetails.status = 'paid'
  await setStatus(order, 'delivered', req.user._id, order.restaurant?.name)
  res.status(200).json({ message: 'Delivery confirmed', data: order })
}

// GET /api/driver/earnings  — delivered orders and rider share of delivery fees
exports.getEarnings = async (req, res) => {
  const { riderSharePercent } = await Settings.get()
  const delivered = await Order.find({ driver: req.user._id, orderStatus: 'delivered' })
    .select('deliveryFee totalAmount updatedAt shippingAddress restaurant')
    .populate('restaurant', 'name')
    .sort({ updatedAt: -1 })
    .lean()

  const share = (o) => Math.round((o.deliveryFee || 0) * riderSharePercent / 100)
  const startOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
  const today = startOf(new Date())
  const week  = new Date(today); week.setDate(week.getDate() - 6)

  const sum = (list) => list.reduce((s, o) => s + share(o), 0)
  res.status(200).json({
    data: {
      riderSharePercent,
      totals: {
        today:      sum(delivered.filter(o => o.updatedAt >= today)),
        week:       sum(delivered.filter(o => o.updatedAt >= week)),
        allTime:    sum(delivered),
        deliveries: delivered.length,
      },
      history: delivered.slice(0, 100).map(o => ({
        orderId: o._id, restaurant: o.restaurant?.name, address: o.shippingAddress,
        deliveredAt: o.updatedAt, earning: share(o),
      })),
    },
  })
}
