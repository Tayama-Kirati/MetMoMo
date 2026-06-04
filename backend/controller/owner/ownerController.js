const Restaurant = require('../../models/restaurantModel')
const Product    = require('../../models/productModel')
const Order      = require('../../models/orderSchema')
const Review     = require('../../models/reviewModel')
const catchAsync = require('../../services/catchAsync')
const path       = require('path')
const fs         = require('fs')

// GET /api/owner/restaurant  — get the logged-in owner's restaurant
exports.getMyRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(200).json({ message: 'No restaurant yet', data: null })
  res.status(200).json({ message: 'Restaurant fetched', data: restaurant })
})

// POST /api/owner/restaurant  — create a restaurant linked to this owner
exports.createMyRestaurant = catchAsync(async (req, res) => {
  const existing = await Restaurant.findOne({ owner: req.user._id })
  if (existing) return res.status(400).json({ message: 'You already have a restaurant. Use PATCH to update it.' })

  const {
    name, description, address, phone, email,
    cuisine, deliveryTime, deliveryFee, minimumOrder,
    isOpen, emoji, openingHours,
  } = req.body

  if (!name || !description || !address) {
    return res.status(400).json({ message: 'Please provide name, description and address' })
  }

  let coverImage = ''
  if (req.files?.coverImage?.[0]) {
    coverImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.coverImage[0].filename}`
  }

  const restaurant = await Restaurant.create({
    name, description, address,
    phone:        phone  || '',
    email:        email  || '',
    coverImage,
    cuisine:      cuisine ? cuisine.split(',').map(s => s.trim()).filter(Boolean) : [],
    deliveryTime: deliveryTime  || '30-45',
    deliveryFee:  Number(deliveryFee)  || 0,
    minimumOrder: Number(minimumOrder) || 0,
    isOpen:       isOpen !== 'false',
    emoji:        emoji  || '🍜',
    openingHours: openingHours || '8:00 AM – 10:00 PM',
    owner:        req.user._id,
  })

  res.status(201).json({ message: 'Restaurant created!', data: restaurant })
})

// PATCH /api/owner/restaurant  — update owner's own restaurant
exports.updateMyRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'You do not have a restaurant yet' })

  const allowed = [
    'name','description','address','phone','email','cuisine',
    'deliveryTime','deliveryFee','minimumOrder','isOpen','emoji','openingHours',
  ]
  allowed.forEach(key => {
    if (req.body[key] !== undefined) restaurant[key] = req.body[key]
  })

  if (req.files?.coverImage?.[0]) {
    restaurant.coverImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.coverImage[0].filename}`
  }

  await restaurant.save()
  res.status(200).json({ message: 'Restaurant updated!', data: restaurant })
})

// ── Products ──────────────────────────────────────────────────────────

// GET /api/owner/products
exports.getMyProducts = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(200).json({ message: 'No restaurant yet', data: [] })

  const products = await Product.find({ restaurant: restaurant._id }).sort({ createdAt: -1 })
  res.status(200).json({ message: 'Products fetched', data: products })
})

// POST /api/owner/products
exports.createMyProduct = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(400).json({ message: 'Create your restaurant first' })

  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity } = req.body
  if (!productName || !productDescription || !productPrice || !productCategory || !productQuantity) {
    return res.status(400).json({ message: 'Please provide all required fields' })
  }

  let productImage = ''
  if (req.file) {
    productImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`
  }

  const product = await Product.create({
    productName, productDescription,
    productPrice:    Number(productPrice),
    productCategory,
    productStatus:   productStatus || 'available',
    productQuantity: Number(productQuantity),
    productImage,
    restaurant: restaurant._id,
  })

  res.status(201).json({ message: 'Product added!', data: product })
})

// PATCH /api/owner/products/:id
exports.updateMyProduct = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const product = await Product.findOne({ _id: req.params.id, restaurant: restaurant._id })
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity } = req.body

  let productImage = product.productImage
  if (req.file) {
    if (product.productImage) {
      const oldPath = path.join(__dirname, '../../uploads', path.basename(product.productImage))
      fs.unlink(oldPath, () => {})
    }
    productImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { productName, productDescription, productPrice: Number(productPrice),
      productCategory, productStatus, productQuantity: Number(productQuantity), productImage },
    { new: true, runValidators: true }
  )

  res.status(200).json({ message: 'Product updated!', data: updated })
})

// PATCH /api/owner/products/:id/status  — quick availability toggle
exports.toggleMyProductStatus = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const product = await Product.findOne({ _id: req.params.id, restaurant: restaurant._id })
  if (!product) return res.status(404).json({ message: 'Product not found' })

  product.productStatus = product.productStatus === 'available' ? 'unavailable' : 'available'
  await product.save()
  res.status(200).json({ message: 'Status updated', data: product })
})

// DELETE /api/owner/products/:id
exports.deleteMyProduct = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const product = await Product.findOneAndDelete({ _id: req.params.id, restaurant: restaurant._id })
  if (!product) return res.status(404).json({ message: 'Product not found' })

  res.status(200).json({ message: 'Product deleted' })
})

// ── Reviews ───────────────────────────────────────────────────────────

// GET /api/owner/reviews  — all reviews on this owner's products
exports.getMyRestaurantReviews = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(200).json({ message: 'No restaurant yet', data: [] })

  const products = await Product.find({ restaurant: restaurant._id }).select('_id')
  const productIds = products.map(p => p._id)

  const reviews = await Review.find({ productId: { $in: productIds } })
    .populate('userId',    'userName userEmail')
    .populate('productId', 'productName productImage')
    .sort({ createdAt: -1 })

  res.status(200).json({ message: 'Reviews fetched', data: reviews })
})

// GET /api/owner/orders  — all orders that contain this owner's products
exports.getMyOrders = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const myProducts = await Product.find({ restaurant: restaurant._id }).select('_id')
  const productIds = myProducts.map(p => p._id)

  const orders = await Order.find({ 'items.product': { $in: productIds } })
    .populate({ path: 'items.product', select: 'productName productPrice productImage productCategory' })
    .populate({ path: 'user', select: 'userName userEmail userPhoneNumber' })
    .sort({ createdAt: -1 })

  res.status(200).json({ message: 'Orders fetched', data: orders })
})

// PATCH /api/owner/orders/:id/status  — update order status
const ALLOWED_STATUSES = ['pending', 'confirmed', 'preparation', 'ontheway', 'delivered', 'cancelled']

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const myProducts = await Product.find({ restaurant: restaurant._id }).select('_id')
  const productIds = myProducts.map(p => p._id.toString())

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  const belongsToOwner = order.items.some(item => productIds.includes(item.product?.toString()))
  if (!belongsToOwner) return res.status(403).json({ message: 'Not your order' })

  order.orderStatus = status
  await order.save()

  // Notify the customer via Socket.io
  const NOTIFY = {
    confirmed: { title: 'Order Confirmed! ✅', body: `${restaurant.name} has confirmed your order.` },
    ontheway:  { title: 'Order On the Way! 🛵', body: `Your order from ${restaurant.name} is on its way to you!` },
    delivered: { title: 'Order Delivered! 🏠', body: `Your order from ${restaurant.name} has been delivered.` },
    cancelled: { title: 'Order Cancelled', body: `Your order from ${restaurant.name} was cancelled.` },
  }
  if (NOTIFY[status] && global._io) {
    global._io.to(order.user.toString()).emit('order:status', {
      orderId: order._id,
      status,
      ...NOTIFY[status],
    })
  }

  res.status(200).json({ message: 'Status updated', data: order })
})

// GET /api/owner/finance  — revenue analytics
exports.getFinance = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const myProducts = await Product.find({ restaurant: restaurant._id }).select('_id productName productPrice')
  const productIds = myProducts.map(p => p._id)

  // All delivered orders containing this restaurant's products
  const orders = await Order.find({
    'items.product': { $in: productIds },
    orderStatus: { $in: ['delivered', 'pending', 'confirmed', 'preparation', 'ontheway'] },
  }).select('totalAmount orderStatus createdAt items').lean()

  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered')
  const activeOrders    = orders.filter(o => o.orderStatus !== 'delivered')

  const now   = new Date()
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart   = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6)
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1)

  const sum = (arr) => arr.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const inRange = (arr, from, to) => arr.filter(o => new Date(o.createdAt) >= from && new Date(o.createdAt) <= to)

  // Daily: last 7 days
  const daily = []
  for (let i = 6; i >= 0; i--) {
    const day   = new Date(todayStart); day.setDate(day.getDate() - i)
    const dayEnd = new Date(day); dayEnd.setDate(dayEnd.getDate() + 1)
    const label = day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
    daily.push({ label, revenue: sum(inRange(deliveredOrders, day, dayEnd)), orders: inRange(deliveredOrders, day, dayEnd).length })
  }

  // Weekly: last 8 weeks
  const weekly = []
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(todayStart); wStart.setDate(wStart.getDate() - i * 7)
    const wEnd   = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7)
    const label  = `Wk ${wStart.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}`
    weekly.push({ label, revenue: sum(inRange(deliveredOrders, wStart, wEnd)), orders: inRange(deliveredOrders, wStart, wEnd).length })
  }

  // Monthly: last 6 months
  const monthly = []
  for (let i = 5; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label  = mStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    monthly.push({ label, revenue: sum(inRange(deliveredOrders, mStart, mEnd)), orders: inRange(deliveredOrders, mStart, mEnd).length })
  }

  res.status(200).json({
    message: 'Finance data',
    data: {
      summary: {
        totalRevenue:   sum(deliveredOrders),
        totalOrders:    deliveredOrders.length,
        activeOrders:   activeOrders.length,
        todayRevenue:   sum(inRange(deliveredOrders, todayStart, now)),
        weekRevenue:    sum(inRange(deliveredOrders, weekStart, now)),
        monthRevenue:   sum(inRange(deliveredOrders, monthStart, now)),
        todayOrders:    inRange(deliveredOrders, todayStart, now).length,
        weekOrders:     inRange(deliveredOrders, weekStart, now).length,
        monthOrders:    inRange(deliveredOrders, monthStart, now).length,
      },
      daily,
      weekly,
      monthly,
    },
  })
})
