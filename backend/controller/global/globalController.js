const Product    = require('../../models/productModel')
const Order      = require('../../models/orderSchema')
const Review     = require('../../models/reviewModel')
const Restaurant = require('../../models/restaurantModel')
const catchAsync = require('../../services/catchAsync')
const ai         = require('../../services/ai')
const { paginate, escapeRegex } = require('../../services/paginate')

// Simple in-process cache: regenerate AI labels at most once per hour
let topPicksCache = null
let topPicksCacheTime = 0

const TOP_PICKS_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          desc: { type: 'string' },
          tag:  { type: 'string', enum: ['Bestseller', 'Trending', 'Fan Favourite', 'Hot Pick', 'Must Try'] },
        },
        required: ['name', 'desc', 'tag'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
}

async function enrichWithAI(products) {
  const plain = products.map(p => ({ ...p.toObject(), aiDesc: p.productDescription, aiTag: 'Popular' }))
  if (!ai.isEnabled() || !products.length) return plain
  try {
    const { items } = await ai.ask({
      system: 'You are a food delivery app assistant writing short menu blurbs.',
      messages: [{
        role: 'user',
        content: `For each of these popular menu items, write a one-sentence description (max 10 words) and pick one tag.\n\nItems: ${products.map(p => `${p.productName} (${p.productCategory})`).join(', ')}`,
      }],
      schema: TOP_PICKS_SCHEMA,
    })
    return plain.map(p => {
      const match = items.find(x => x.name.toLowerCase().includes(p.productName.toLowerCase())) || {}
      return { ...p, aiDesc: match.desc || p.aiDesc, aiTag: match.tag || p.aiTag }
    })
  } catch (err) {
    console.warn('Top picks AI fallback:', err.message)
    return plain
  }
}

// Ids of restaurants customers may see
const visibleRestaurantIds = async () =>
  (await Restaurant.find({ isApproved: { $ne: false } }).select('_id')).map(r => r._id)

const isAdmin = (req) => req.user?.userRole === 'admin'

/**
 * GET /api/products
 * ?search=&category=&restaurant=&status=&minPrice=&maxPrice=&veg=true&spice=hot
 * &sort=price_asc|price_desc|newest|rating&page=&limit=
 */
exports.getProducts = catchAsync(async (req, res) => {
  const { restaurant, category, status, search, minPrice, maxPrice, veg, spice, sort } = req.query
  const filter = {}
  if (restaurant) filter.restaurant      = restaurant
  if (category)   filter.productCategory = new RegExp(`^${escapeRegex(category)}$`, 'i')
  if (status)     filter.productStatus   = status
  if (veg === 'true')  filter.isVeg = true
  if (veg === 'false') filter.isVeg = false
  if (spice)      filter.spiceLevel = spice
  if (minPrice || maxPrice) {
    filter.productPrice = {}
    if (minPrice) filter.productPrice.$gte = Number(minPrice)
    if (maxPrice) filter.productPrice.$lte = Number(maxPrice)
  }
  if (search) {
    const re = new RegExp(escapeRegex(String(search).slice(0, 100)), 'i')
    filter.$or = [{ productName: re }, { productCategory: re }, { productDescription: re }]
  }
  if (!isAdmin(req) && !restaurant) {
    filter.$and = [{ $or: [{ restaurant: null }, { restaurant: { $in: await visibleRestaurantIds() } }] }]
  }

  const sorts = {
    price_asc:  { productPrice: 1 },
    price_desc: { productPrice: -1 },
    newest:     { createdAt: -1 },
  }

  // Paginate only when asked, so existing callers still get the full list
  let query = Product.find(filter)
    .populate('restaurant', 'name emoji address deliveryTime deliveryFee rating isOpen')
    .sort(sorts[sort] || { createdAt: -1 })
  let meta = {}
  if (req.query.page || req.query.limit) {
    const { page, limit, skip } = paginate(req.query, 24)
    const total = await Product.countDocuments(filter)
    query = query.skip(skip).limit(limit)
    meta = { page, total, pages: Math.ceil(total / limit) }
  }
  let products = await query

  if (sort === 'rating') {
    products = products.sort((a, b) => (b.restaurant?.rating || 0) - (a.restaurant?.rating || 0))
  }

  return res.status(200).json({
    message: products.length ? 'Products retrieved successfully' : 'No products found',
    data: products,
    ...meta,
  })
})

// GET /api/products/top-picks  — most ordered items, AI-described
exports.getTopPicks = catchAsync(async (req, res) => {
  const now = Date.now()
  if (topPicksCache && now - topPicksCacheTime < 60 * 60 * 1000) {
    return res.status(200).json({ message: 'Top picks', data: topPicksCache })
  }

  const ordered = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
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
    products.sort((a, b) => ids.findIndex(id => id.equals(a._id)) - ids.findIndex(id => id.equals(b._id)))
  } else {
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

// GET /api/products/for-you  — personalised picks from preferences + order history
exports.getForYou = catchAsync(async (req, res) => {
  const user = req.user
  const prefs = user.preferences || {}

  const history = await Order.aggregate([
    { $match: { user: user._id, orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'p' } },
    { $unwind: '$p' },
    { $group: { _id: '$p.productCategory', count: { $sum: '$items.quantity' }, restaurants: { $addToSet: '$p.restaurant' } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ])
  const favCategories = history.map(h => h._id)
  const favRestaurants = history.flatMap(h => h.restaurants)
  const liked = (prefs.favoriteFoods || []).map(f => new RegExp(escapeRegex(f), 'i'))

  const filter = {
    productStatus: 'available',
    $and: [{ $or: [{ restaurant: null }, { restaurant: { $in: await visibleRestaurantIds() } }] }],
  }
  if (['vegetarian', 'vegan'].includes(prefs.dietaryPreference)) filter.isVeg = true

  const candidates = await Product.find(filter)
    .populate('restaurant', 'name emoji deliveryTime deliveryFee rating')
    .limit(300)

  const spiceOrder = ['mild', 'medium', 'hot', 'extra-hot']
  const wantSpice  = spiceOrder.indexOf(prefs.spicePreference || 'medium')

  const scored = candidates.map(p => {
    let score = 0
    const reasons = []
    if (favCategories.includes(p.productCategory)) { score += 3; reasons.push(`You often order ${p.productCategory}`) }
    if (favRestaurants.some(r => r && p.restaurant && r.equals(p.restaurant._id))) { score += 2; reasons.push(`From ${p.restaurant.name}, a favourite`) }
    if (liked.some(re => re.test(p.productName) || re.test(p.productCategory))) { score += 3; reasons.push('Matches your favourite foods') }
    const spiceGap = Math.abs(spiceOrder.indexOf(p.spiceLevel || 'medium') - wantSpice)
    score += 1 - spiceGap * 0.5
    if (spiceGap === 0 && prefs.spicePreference) reasons.push(`${p.spiceLevel} like you prefer`)
    score += (p.restaurant?.rating || 0) * 0.2
    return { product: p, score, reason: reasons[0] || 'Popular right now' }
  })

  scored.sort((a, b) => b.score - a.score)
  res.status(200).json({
    data: scored.slice(0, 8).map(s => ({ ...s.product.toObject(), reason: s.reason })),
  })
})

// GET /api/products/:id
exports.getProduct = catchAsync(async (req, res) => {
  const { id } = req.params
  const product = await Product.find({ _id: id })
    .populate('restaurant', 'name emoji address deliveryTime deliveryFee isOpen')

  if (!product.length) {
    return res.status(404).json({ message: 'Product not found', data: [] })
  }

  const productReviews = await Review.find({ productId: id, isHidden: { $ne: true } })
    .populate('userId', 'userName')
    .populate('productId')
    .sort({ createdAt: -1 })

  return res.status(200).json({
    message: 'Product retrieved successfully',
    data: { product, productReviews },
  })
})

// POST /api/ai/chat  — food recommendation assistant
// body: { messages: [{ role: 'user'|'assistant', content: string }] }
exports.chat = catchAsync(async (req, res) => {
  if (!ai.isEnabled()) return res.status(503).json({ message: 'The assistant is not available right now' })

  const incoming = Array.isArray(req.body.messages) ? req.body.messages : []
  const messages = incoming
    .filter(m => ['user', 'assistant'].includes(m?.role) && typeof m.content === 'string' && m.content.trim())
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ message: 'Send a message to the assistant' })
  }

  const restaurants = await Restaurant.find({ isApproved: { $ne: false } })
    .select('name address cuisine deliveryTime deliveryFee rating isOpen').lean()
  const products = await Product.find({
    productStatus: 'available',
    restaurant: { $in: restaurants.map(r => r._id) },
  }).select('productName productPrice productCategory isVeg spiceLevel restaurant').limit(400).lean()

  const byRestaurant = new Map(restaurants.map(r => [String(r._id), r]))
  const menu = products.map(p => {
    const r = byRestaurant.get(String(p.restaurant))
    return `- [${p._id}] ${p.productName} | NPR ${p.productPrice} | ${p.productCategory} | ${p.isVeg ? 'veg' : 'non-veg'} | ${p.spiceLevel || 'medium'} | ${r?.name} (${r?.address}, ${r?.isOpen ? 'open' : 'closed'})`
  }).join('\n')

  const SCHEMA = {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      productIds: { type: 'array', items: { type: 'string' } },
    },
    required: ['reply', 'productIds'],
    additionalProperties: false,
  }

  const result = await ai.ask({
    system: `You are MoMo Buddy, the friendly food assistant for MetMoMo, a food delivery app in the Kathmandu Valley, Nepal.
Help customers decide what to order using ONLY the menu below. Prices are in NPR.
Keep replies short (2-4 sentences), warm and practical. Recommend at most 4 items, and put their ids in productIds.
If nothing on the menu fits, say so honestly and suggest the closest options. Do not invent dishes, prices or restaurants.
Politely decline questions unrelated to food or ordering on MetMoMo.

MENU (id | name | price | category | veg | spice | restaurant):
${menu || '(the menu is empty right now)'}`,
    messages,
    schema: SCHEMA,
    maxTokens: 2048,
  })

  const valid = new Set(products.map(p => String(p._id)))
  const ids = (result.productIds || []).filter(id => valid.has(id)).slice(0, 4)
  const suggestions = ids.length
    ? await Product.find({ _id: { $in: ids } }).populate('restaurant', 'name emoji')
    : []

  res.status(200).json({ data: { reply: result.reply, suggestions } })
})
