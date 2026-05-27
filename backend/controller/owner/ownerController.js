const Restaurant = require('../../models/restaurantModel')
const Product    = require('../../models/productModel')
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
