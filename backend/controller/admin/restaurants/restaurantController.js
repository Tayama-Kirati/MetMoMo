const Restaurant = require('../../../models/restaurantModel')
const Product    = require('../../../models/productModel')
const catchAsync = require('../../../services/catchAsync')
const Restaurants = require('../../../models/restaurantModel')

// ── PUBLIC ──────────────────────────────────────────────────────────

// GET /api/restaurants
exports.getAllRestaurants = catchAsync(async (req, res) => {
  const { open, popular, featured } = req.query
  const filter = {}
  if (open      === 'true')  filter.isOpen     = true
  if (popular   === 'true')  filter.isPopular   = true
  if (featured  === 'true')  filter.isFeatured  = true

  const restaurants = await Restaurants.find(filter).sort({ isFeatured: -1, isPopular: -1, createdAt: -1 })
  res.status(200).json({ message: 'Restaurants fetched successfully', data: restaurants })
})

// GET /api/restaurants/:id
exports.getRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurants.findById(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  res.status(200).json({ message: 'Restaurant fetched successfully', data: restaurant })
})

// GET /api/restaurants/:id/menu  — all products belonging to this restaurant
exports.getRestaurantMenu = catchAsync(async (req, res) => {
  const { id } = req.params
  const restaurant = await Restaurants.findById(id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  const { category, status } = req.query
  const filter = { restaurant: id }
  if (category) filter.productCategory = category
  if (status)   filter.productStatus   = status

  const products = await Product.find(filter).sort({ createdAt: -1 })
  res.status(200).json({
    message: 'Menu fetched successfully',
    data: { restaurant, products }
  })
})

// ── ADMIN ────────────────────────────────────────────────────────────

// POST /api/restaurants
exports.createRestaurant = catchAsync(async (req, res) => {
  const {
    name, description, address, phone, email,
    cuisine, deliveryTime, deliveryFee, minimumOrder,
    isOpen, isPopular, isFeatured, emoji, openingHours,
    rating, location,
  } = req.body

  if (!name || !description || !address) {
    return res.status(400).json({ message: 'Please provide name, description and address' })
  }

  let coverImage = ''
  let logo       = ''
  if (req.files?.coverImage?.[0]) {
    coverImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.coverImage[0].filename}`
  }
  if (req.files?.logo?.[0]) {
    logo = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.logo[0].filename}`
  }

  const restaurant = await Restaurants.create({
    name, description, address, phone, email,
    coverImage, logo,
    cuisine:      cuisine ? (Array.isArray(cuisine) ? cuisine : cuisine.split(',').map(s => s.trim())) : [],
    deliveryTime: deliveryTime || '30-45',
    deliveryFee:  Number(deliveryFee) || 0,
    minimumOrder: Number(minimumOrder) || 0,
    isOpen:       isOpen !== 'false',
    isPopular:    isPopular === 'true',
    isFeatured:   isFeatured === 'true',
    emoji:        emoji || '🍜',
    openingHours: openingHours || '8:00 AM – 10:00 PM',
    rating:       Number(rating) || 0,
    location:     location || {},
  })

  res.status(201).json({ message: 'Restaurant created successfully', data: restaurant })
})

// PATCH /api/restaurants/:id
exports.updateRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurants.findById(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  const allowed = [
    'name','description','address','phone','email','cuisine',
    'deliveryTime','deliveryFee','minimumOrder','isOpen','isPopular',
    'isFeatured','emoji','openingHours','rating','location',
  ]
  allowed.forEach(key => {
    if (req.body[key] !== undefined) restaurant[key] = req.body[key]
  })

  if (req.files?.coverImage?.[0]) {
    restaurant.coverImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.coverImage[0].filename}`
  }
  if (req.files?.logo?.[0]) {
    restaurant.logo = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.files.logo[0].filename}`
  }

  await restaurant.save()
  res.status(200).json({ message: 'Restaurant updated successfully', data: restaurant })
})

// DELETE /api/restaurants/:id
exports.deleteRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurants.findByIdAndDelete(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  // Unlink products from this restaurant (don't delete them)
  await Product.updateMany({ restaurant: req.params.id }, { restaurant: null })

  res.status(200).json({ message: 'Restaurant deleted successfully' })
})
