const Product    = require('../../models/productModel')
const Order      = require('../../models/orderSchema')
const Review     = require('../../models/reviewModel')
const catchAsync = require('../../services/catchAsync')
const Anthropic  = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple in-process cache: regenerate AI labels at most once per hour
let topPicksCache = null
let topPicksCacheTime = 0

async function enrichWithAI(products) {
  const names = products.map(p => `${p.productName} (${p.productCategory})`).join(', ')
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are a food delivery app assistant. For each of these popular menu items, write a short one-sentence description (max 10 words) and pick one tag from: Bestseller, Trending, Fan Favourite, Hot Pick, Must Try.

Items: ${names}

Reply ONLY with a JSON array in this exact shape, no extra text:
[{"name":"<exact item name>","desc":"<short description>","tag":"<tag>"}]`,
      }],
    })
    const json = JSON.parse(msg.content[0].text.trim())
    return products.map(p => {
      const ai = json.find(x => x.name.toLowerCase().includes(p.productName.toLowerCase())) || {}
      return { ...p.toObject(), aiDesc: ai.desc || p.productDescription, aiTag: ai.tag || 'Popular' }
    })
  } catch {
    return products.map(p => ({ ...p.toObject(), aiDesc: p.productDescription, aiTag: 'Popular' }))
  }
}

 
exports.getProducts = catchAsync(async (req, res) => {
  const { restaurant, category, status, search } = req.query
  const filter = {}
  if (restaurant) filter.restaurant      = restaurant
  if (category)   filter.productCategory = category
  if (status)     filter.productStatus   = status
  if (search) {
    const re = new RegExp(search, 'i')
    filter.$or = [{ productName: re }, { productCategory: re }]
  }

  const products = await Product.find(filter)
    .populate('restaurant', 'name emoji address deliveryTime deliveryFee')
    .sort({ createdAt: -1 })

  if (!products.length) {
    return res.status(200).json({ message: 'No products found', data: [] })
  }
  return res.status(200).json({ message: 'Products retrieved successfully', data: products })
})

// GET /api/products/top-picks  — most ordered items, AI-described
exports.getTopPicks = catchAsync(async (req, res) => {
  const now = Date.now()
  if (topPicksCache && now - topPicksCacheTime < 60 * 60 * 1000) {
    return res.status(200).json({ message: 'Top picks', data: topPicksCache })
  }

  // Aggregate: count how many times each product was ordered across all orders
  const ordered = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalOrdered: { $sum: '$items.quantity' } } },
    { $sort: { totalOrdered: -1 } },
    { $limit: 8 },
  ])

  let products
  if (ordered.length >= 4) {
    const ids = ordered.map(o => o._id)
    products = await Product.find({ _id: { $in: ids }, productStatus: 'available' })
      .populate('restaurant', 'name emoji deliveryTime deliveryFee')
    // Sort to match aggregate ranking
    products.sort((a, b) => ids.findIndex(id => id.equals(a._id)) - ids.findIndex(id => id.equals(b._id)))
  } else {
    // Fallback: just get newest available products
    products = await Product.find({ productStatus: 'available' })
      .populate('restaurant', 'name emoji deliveryTime deliveryFee')
      .sort({ createdAt: -1 })
      .limit(8)
  }

  const enriched = await enrichWithAI(products.slice(0, 4))

  topPicksCache = enriched
  topPicksCacheTime = now
  return res.status(200).json({ message: 'Top picks', data: enriched })
})

// GET /api/products/:id
exports.getProduct = catchAsync(async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).json({ message: 'Please provide product id' })

  const product = await Product.find({ _id: id })
    .populate('restaurant', 'name emoji address deliveryTime deliveryFee isOpen')

  const productReviews = await Review.find({ productId: id })
    .populate('userId', 'userName userEmail')
    .populate('productId')

  if (!product.length) {
    return res.status(404).json({ message: 'Product not found', data: [] })
  }
  return res.status(200).json({
    message: 'Product retrieved successfully',
    data: { product, productReviews },
  })
})
