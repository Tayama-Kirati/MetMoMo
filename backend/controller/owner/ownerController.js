const Restaurant = require('../../models/restaurantModel')
const Product    = require('../../models/productModel')
const Order      = require('../../models/orderSchema')
const Review     = require('../../models/reviewModel')
const catchAsync = require('../../services/catchAsync')
const { saveUpload, removeUpload } = require('../../services/storage')
const { setStatus } = require('../../services/orders')
const ai         = require('../../services/ai')

// Orders still waiting on an online payment are hidden from restaurants
const VISIBLE_PAYMENT = {
  $or: [{ 'paymentDetails.method': 'COD' }, { 'paymentDetails.status': { $in: ['paid', 'refund_pending', 'refunded'] } }],
}

// Orders for this restaurant (new orders carry `restaurant`; older ones only reference products)
async function restaurantOrderFilter(restaurant) {
  const productIds = (await Product.find({ restaurant: restaurant._id }).select('_id')).map(p => p._id)
  return {
    $and: [
      { $or: [{ restaurant: restaurant._id }, { restaurant: { $exists: false }, 'items.product': { $in: productIds } }] },
      VISIBLE_PAYMENT,
    ],
  }
}

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

  const coverImage = await saveUpload(req.files?.coverImage?.[0])

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
    isApproved:   false,
  })

  res.status(201).json({ message: 'Restaurant created! It will be visible to customers once an admin approves it.', data: restaurant })
})

// PATCH /api/owner/restaurant  — update owner's own restaurant
exports.updateMyRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'You do not have a restaurant yet' })

  const allowed = [
    'name','description','address','phone','email','cuisine',
    'deliveryTime','deliveryFee','minimumOrder','isOpen','emoji','openingHours',
    'weeklyHours','pausedUntil',
  ]
  allowed.forEach(key => {
    if (req.body[key] === undefined) return
    let value = req.body[key]
    // multipart forms send arrays/objects as JSON strings
    if (['weeklyHours'].includes(key) && typeof value === 'string') value = JSON.parse(value)
    if (key === 'cuisine' && typeof value === 'string') value = value.split(',').map(s => s.trim()).filter(Boolean)
    if (key === 'pausedUntil' && !value) value = null
    restaurant[key] = value
  })

  if (req.files?.coverImage?.[0]) {
    await removeUpload(restaurant.coverImage)
    restaurant.coverImage = await saveUpload(req.files.coverImage[0])
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

  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity, isVeg, spiceLevel } = req.body
  if (!productName || !productDescription || !productPrice || !productCategory || !productQuantity) {
    return res.status(400).json({ message: 'Please provide all required fields' })
  }

  const productImage = await saveUpload(req.file)

  const product = await Product.create({
    productName, productDescription,
    productPrice:    Number(productPrice),
    productCategory,
    productStatus:   productStatus || 'available',
    productQuantity: Number(productQuantity),
    productImage,
    isVeg:      isVeg === true || isVeg === 'true',
    spiceLevel: spiceLevel || 'medium',
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

  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity, isVeg, spiceLevel } = req.body

  let productImage = product.productImage
  if (req.file) {
    await removeUpload(product.productImage)
    productImage = await saveUpload(req.file)
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { productName, productDescription, productPrice: Number(productPrice),
      productCategory, productStatus, productQuantity: Number(productQuantity), productImage,
      ...(isVeg !== undefined && { isVeg: isVeg === true || isVeg === 'true' }),
      ...(spiceLevel && { spiceLevel }) },
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

// PATCH /api/owner/reviews/:id/reply  — public reply to a customer review
exports.replyToReview = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const review = await Review.findById(req.params.id).populate('productId', 'restaurant')
  if (!review || String(review.productId?.restaurant) !== String(restaurant._id)) {
    return res.status(404).json({ message: 'Review not found' })
  }

  const text = String(req.body.text || '').trim().slice(0, 1000)
  review.ownerReply = text ? { text, at: new Date() } : undefined
  await review.save()
  res.status(200).json({ message: text ? 'Reply posted' : 'Reply removed', data: review })
})

// POST /api/owner/ai/describe  — AI-written menu description
exports.describeItem = catchAsync(async (req, res) => {
  const { productName, productCategory, notes } = req.body
  if (!productName?.trim()) return res.status(400).json({ message: 'Provide productName' })
  if (!ai.isEnabled()) return res.status(503).json({ message: 'AI is not configured on this server' })

  const description = await ai.ask({
    system: 'You write short, appetising menu descriptions for a Nepali food delivery app. Plain text only: one or two sentences, at most 35 words, no emojis, no quotation marks, no made-up claims about awards or sourcing.',
    messages: [{
      role: 'user',
      content: `Item: ${String(productName).slice(0, 100)}\nCategory: ${String(productCategory || '').slice(0, 50)}\nOwner notes: ${String(notes || '').slice(0, 300)}`,
    }],
    maxTokens: 1024,
  })
  res.status(200).json({ data: { description } })
})

// GET /api/owner/orders  — orders for this owner's restaurant
exports.getMyOrders = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const orders = await Order.find(await restaurantOrderFilter(restaurant))
    .populate({ path: 'items.product', select: 'productName productPrice productImage productCategory' })
    .populate({ path: 'user', select: 'userName userEmail userPhoneNumber' })
    .populate({ path: 'driver', select: 'userName userPhoneNumber' })
    .sort({ createdAt: -1 })
    .limit(500)

  res.status(200).json({ message: 'Orders fetched', data: orders })
})

// What an owner may move an order to, from each status
const OWNER_TRANSITIONS = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['preparation', 'cancelled'],
  preparation: ['ontheway', 'cancelled'],
  ontheway:    [],          // rider confirms delivery with the customer's code
  delivered:   [],
  cancelled:   [],
}

// PATCH /api/owner/orders/:id/status
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const order = await Order.findOne({ _id: req.params.id, ...(await restaurantOrderFilter(restaurant)) })
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (!(OWNER_TRANSITIONS[order.orderStatus] || []).includes(status)) {
    return res.status(400).json({ message: `Cannot change order from ${order.orderStatus} to ${status}` })
  }
  // Without an assigned rider the owner can't hand the order over
  if (status === 'ontheway' && !order.driver) {
    return res.status(400).json({ message: 'Wait for a rider to accept this order first' })
  }
  if (!order.restaurant) order.restaurant = restaurant._id

  await setStatus(order, status, req.user._id, restaurant.name)
  res.status(200).json({ message: 'Status updated', data: order })
})

// GET /api/owner/finance  — revenue analytics
exports.getFinance = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id })
  if (!restaurant) return res.status(404).json({ message: 'No restaurant found' })

  const myProducts = await Product.find({ restaurant: restaurant._id }).select('_id productName productPrice')

  const orders = await Order.find({
    ...(await restaurantOrderFilter(restaurant)),
    orderStatus: { $in: ['delivered', 'pending', 'confirmed', 'preparation', 'ontheway'] },
  }).select('totalAmount subtotal orderStatus createdAt items').lean()

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

  // Best sellers by quantity and revenue (delivered orders)
  const productNames = new Map(myProducts.map(p => [String(p._id), p]))
  const sellers = new Map()
  for (const o of deliveredOrders) {
    for (const it of o.items) {
      const id = String(it.product)
      const p  = productNames.get(id)
      if (!p) continue
      const row = sellers.get(id) || { productId: id, name: it.name || p.productName, quantity: 0, revenue: 0 }
      row.quantity += it.quantity
      row.revenue  += (it.price ?? p.productPrice) * it.quantity
      sellers.set(id, row)
    }
  }
  const bestSellers = [...sellers.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5)

  // Busiest hours of the day (all non-cancelled orders)
  const busiestHours = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }))
  orders.forEach(o => { busiestHours[new Date(o.createdAt).getHours()].orders++ })

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
      bestSellers,
      busiestHours,
    },
  })
})
