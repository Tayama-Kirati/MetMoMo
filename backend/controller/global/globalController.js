const Product    = require('../../models/productModel')
const Review     = require('../../models/reviewModel')
const catchAsync = require('../../services/catchAsync')

 
exports.getProducts = catchAsync(async (req, res) => {
  const { restaurant, category, status } = req.query
  const filter = {}
  if (restaurant) filter.restaurant      = restaurant
  if (category)   filter.productCategory = category
  if (status)     filter.productStatus   = status

  const products = await Product.find(filter)
    .populate('restaurant', 'name emoji address deliveryTime deliveryFee')
    .sort({ createdAt: -1 })

  if (!products.length) {
    return res.status(200).json({ message: 'No products found', data: [] })
  }
  return res.status(200).json({ message: 'Products retrieved successfully', data: products })
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
