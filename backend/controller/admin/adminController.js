const User       = require('../../models/userModel')
const Order      = require('../../models/orderSchema')
const Restaurant = require('../../models/restaurantModel')
const Review     = require('../../models/reviewModel')
const Coupon     = require('../../models/couponModel')
const Settings   = require('../../models/settingsModel')
const { setStatus } = require('../../services/orders')
const { paginate, escapeRegex } = require('../../services/paginate')
const { ORDER_STATUSES } = require('../../models/orderSchema')

// ── Users ──────────────────────────────────────────────────────────────

// GET /api/admin/users?role=&search=&pendingApproval=true
exports.getUsers = async (req, res) => {
  const { role, search, pendingApproval } = req.query
  const filter = { _id: { $ne: req.user._id } }
  if (role) filter.userRole = role
  if (pendingApproval === 'true') filter.isApproved = false
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i')
    filter.$or = [{ userName: re }, { userEmail: re }, { userPhoneNumber: re }]
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(1000)
  res.status(200).json({ message: 'Users retrieved successfully', data: users })
}

// PATCH /api/admin/users/:id  — { isBlocked?, isApproved? }
exports.updateUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot change your own admin account here' })
  }
  const update = {}
  if (typeof req.body.isBlocked  === 'boolean') update.isBlocked  = req.body.isBlocked
  if (typeof req.body.isApproved === 'boolean') update.isApproved = req.body.isApproved
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.status(200).json({ message: 'User updated', data: user })
}

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot delete your own account' })
  }
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found with the userid' })
  res.status(200).json({ message: 'User deleted successfully' })
}

// ── Orders ─────────────────────────────────────────────────────────────

function orderFilter(q) {
  const filter = {}
  if (q.status)     filter.orderStatus = q.status
  if (q.restaurant) filter.restaurant  = q.restaurant
  if (q.payment)    filter['paymentDetails.status'] = q.payment
  if (q.from || q.to) {
    filter.createdAt = {}
    if (q.from) filter.createdAt.$gte = new Date(q.from)
    if (q.to)   filter.createdAt.$lte = new Date(q.to)
  }
  return filter
}

// GET /api/admin/orders?page=&limit=&status=&restaurant=&payment=&from=&to=
exports.getAllOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 50, 200)
  const filter = orderFilter(req.query)
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: 'items.product', model: 'Product' })
      .populate({ path: 'user', select: 'userName userEmail' })
      .populate({ path: 'restaurant', select: 'name' })
      .populate({ path: 'driver', select: 'userName' })
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ])
  res.status(200).json({ message: 'Orders fetched successfully', orders, page, total, pages: Math.ceil(total / limit) })
}

// PATCH /api/admin/orders/:id/status  — admin can set any status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' })
  const order = await Order.findById(req.params.id).populate('restaurant', 'name')
  if (!order) return res.status(404).json({ message: 'Order not found' })
  await setStatus(order, status, req.user._id, order.restaurant?.name)
  res.status(200).json({ message: 'Status updated', data: order })
}

// PATCH /api/admin/orders/:id/refund  — mark a refund as completed (done in Khalti/eSewa dashboard)
exports.markRefunded = async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.paymentDetails.status !== 'refund_pending') {
    return res.status(400).json({ message: 'This order has no pending refund' })
  }
  order.paymentDetails.status = 'refunded'
  await order.save()
  res.status(200).json({ message: 'Marked as refunded', data: order })
}

const csvCell = (v) => {
  const s = v === undefined || v === null ? '' : String(v)
  // Neutralise spreadsheet formulas and quote everything
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

// GET /api/admin/orders/export.csv
exports.exportOrdersCsv = async (req, res) => {
  const orders = await Order.find(orderFilter(req.query))
    .populate('user', 'userName userEmail')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .limit(20000)
    .lean()

  const header = ['Order ID', 'Date', 'Customer', 'Email', 'Restaurant', 'Items', 'Subtotal', 'Delivery fee',
    'Discount', 'Promo', 'Total', 'Status', 'Payment method', 'Payment status', 'Address']
  const rows = orders.map(o => [
    o._id, new Date(o.createdAt).toISOString(), o.user?.userName, o.user?.userEmail, o.restaurant?.name,
    (o.items || []).map(i => `${i.quantity}x ${i.name || i.product}`).join('; '),
    o.subtotal, o.deliveryFee, o.discount, o.promoCode, o.totalAmount, o.orderStatus,
    o.paymentDetails?.method, o.paymentDetails?.status, o.shippingAddress,
  ])
  const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="metmomo-orders-${Date.now()}.csv"`)
  res.send('﻿' + csv)
}

// ── Analytics & payouts ───────────────────────────────────────────────

// GET /api/admin/stats  — platform overview
exports.getStats = async (req, res) => {
  const since = new Date(); since.setDate(since.getDate() - 29); since.setHours(0, 0, 0, 0)
  const { commissionPercent } = await Settings.get()

  const [usersByRole, ordersByStatus, revenue, daily, topRestaurants, pending] = await Promise.all([
    User.aggregate([{ $group: { _id: '$userRole', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, gmv: { $sum: '$totalAmount' }, food: { $sum: '$subtotal' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, orderStatus: { $ne: 'cancelled' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' },
      } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: 'delivered', restaurant: { $ne: null } } },
      { $group: { _id: '$restaurant', orders: { $sum: 1 }, revenue: { $sum: '$subtotal' } } },
      { $sort: { revenue: -1 } }, { $limit: 5 },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'r' } },
      { $project: { orders: 1, revenue: 1, name: { $arrayElemAt: ['$r.name', 0] } } },
    ]),
    Promise.all([
      Restaurant.countDocuments({ isApproved: false }),
      User.countDocuments({ userRole: 'delivery_rider', isApproved: false }),
      Review.countDocuments({ 'reports.0': { $exists: true }, isHidden: false }),
      Order.countDocuments({ 'paymentDetails.status': 'refund_pending' }),
    ]),
  ])

  const r = revenue[0] || { gmv: 0, food: 0, orders: 0 }
  res.status(200).json({
    data: {
      users:  Object.fromEntries(usersByRole.map(u => [u._id, u.count])),
      orders: Object.fromEntries(ordersByStatus.map(o => [o._id, o.count])),
      revenue: { gmv: r.gmv, foodSales: r.food, delivered: r.orders, commission: Math.round(r.food * commissionPercent / 100) },
      daily: daily.map(d => ({ date: d._id, orders: d.orders, revenue: d.revenue })),
      topRestaurants,
      pending: { restaurants: pending[0], riders: pending[1], reportedReviews: pending[2], refunds: pending[3] },
    },
  })
}

// GET /api/admin/payouts?from=&to=  — what each restaurant is owed after commission
exports.getPayouts = async (req, res) => {
  const { commissionPercent } = await Settings.get()
  const match = { orderStatus: 'delivered', restaurant: { $ne: null } }
  if (req.query.from || req.query.to) {
    match.createdAt = {}
    if (req.query.from) match.createdAt.$gte = new Date(req.query.from)
    if (req.query.to)   match.createdAt.$lte = new Date(req.query.to)
  }
  const rows = await Order.aggregate([
    { $match: match },
    { $group: { _id: '$restaurant', orders: { $sum: 1 }, foodSales: { $sum: '$subtotal' } } },
    { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'r' } },
    { $project: { orders: 1, foodSales: 1, name: { $arrayElemAt: ['$r.name', 0] } } },
    { $sort: { foodSales: -1 } },
  ])
  res.status(200).json({
    data: {
      commissionPercent,
      rows: rows.map(r => {
        const commission = Math.round(r.foodSales * commissionPercent / 100)
        return { restaurantId: r._id, name: r.name, orders: r.orders, foodSales: r.foodSales, commission, payout: r.foodSales - commission }
      }),
    },
  })
}

// GET/PATCH /api/admin/settings
exports.getSettings = async (req, res) => res.status(200).json({ data: await Settings.get() })
exports.updateSettings = async (req, res) => {
  const settings = await Settings.get()
  for (const key of ['commissionPercent', 'riderSharePercent', 'loyaltyPointsPerHundred']) {
    if (req.body[key] !== undefined) settings[key] = Number(req.body[key])
  }
  await settings.save()
  res.status(200).json({ message: 'Settings saved', data: settings })
}

// ── Restaurant approval ───────────────────────────────────────────────

// PATCH /api/admin/restaurants/:id/approval  — { isApproved }
exports.setRestaurantApproval = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id, { isApproved: Boolean(req.body.isApproved) }, { new: true }
  )
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  res.status(200).json({ message: restaurant.isApproved ? 'Restaurant approved' : 'Restaurant hidden', data: restaurant })
}

// ── Coupons ───────────────────────────────────────────────────────────

const COUPON_FIELDS = ['code', 'description', 'type', 'value', 'maxDiscount', 'minOrder', 'firstOrderOnly',
  'usageLimit', 'perUserLimit', 'expiresAt', 'isActive', 'restaurant']
const pick = (body) => Object.fromEntries(COUPON_FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k] === '' ? null : body[k]]))

exports.listCoupons  = async (req, res) => res.status(200).json({ data: await Coupon.find().sort({ createdAt: -1 }).populate('restaurant', 'name') })
exports.createCoupon = async (req, res) => res.status(201).json({ message: 'Coupon created', data: await Coupon.create(pick(req.body)) })
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
  res.status(200).json({ message: 'Coupon updated', data: coupon })
}
exports.deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id)
  res.status(200).json({ message: 'Coupon deleted' })
}

// ── Review moderation ─────────────────────────────────────────────────

// GET /api/admin/reviews/reported
exports.getReportedReviews = async (req, res) => {
  const reviews = await Review.find({ 'reports.0': { $exists: true } })
    .populate('userId', 'userName userEmail')
    .populate('productId', 'productName')
    .populate('reports.user', 'userName')
    .sort({ updatedAt: -1 })
  res.status(200).json({ data: reviews })
}

// PATCH /api/admin/reviews/:id  — { action: 'hide' | 'restore' | 'dismiss' }
exports.moderateReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ message: 'Review not found' })
  const { action } = req.body
  if (action === 'hide')    review.isHidden = true
  if (action === 'restore') review.isHidden = false
  if (action === 'dismiss') { review.reports = []; review.isHidden = false }
  await review.save()
  res.status(200).json({ message: 'Review updated', data: review })
}

// DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id)
  res.status(200).json({ message: 'Review deleted' })
}
