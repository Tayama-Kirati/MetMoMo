const Product    = require('../../../models/productModel')
const catchAsync = require('../../../services/catchAsync')
const path       = require('path')
const fs         = require('fs')
 
exports.createProduct = catchAsync(async (req, res) => {
  const {
    productName, productDescription, productPrice,
    productCategory, productStatus, productQuantity,
    restaurant,   // NEW optional field
  } = req.body

  if (!productName || !productDescription || !productPrice || !productCategory || !productStatus || !productQuantity) {
    return res.status(400).json({ message: 'Please provide all required fields' })
  }

  let productImage = ''
  if (req.file) {
    productImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`
  }

  const product = await Product.create({
    productName,
    productDescription,
    productPrice:    Number(productPrice),
    productCategory,
    productStatus,
    productQuantity: Number(productQuantity),
    productImage,
    restaurant: restaurant || null,   // link to restaurant if provided
  })

  return res.status(201).json({ message: 'Product created successfully', data: product })
})

// DELETE /api/products/product/:id
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  return res.status(200).json({ message: 'Product deleted successfully' })
})

// PATCH /api/products/:id/status  — quick availability toggle
exports.toggleProductStatus = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  product.productStatus = product.productStatus === 'available' ? 'unavailable' : 'available'
  await product.save()
  res.status(200).json({ message: 'Status updated', data: product })
})

// PATCH /api/products/:id
exports.editProduct = catchAsync(async (req, res) => {
  const { id } = req.params
  const {
    productName, productDescription, productPrice,
    productCategory, productStatus, productQuantity,
    restaurant,
  } = req.body

  const old = await Product.findById(id)
  if (!old) return res.status(404).json({ message: 'Product not found' })

  let productImage = old.productImage
  if (req.file) {
    // Delete old image from disk
    if (old.productImage) {
      const filename = path.basename(old.productImage)
      const oldPath  = path.join(__dirname, '../../../uploads', filename)
      fs.unlink(oldPath, err => { if (err) console.log('Image delete error:', err.message) })
    }
    productImage = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    {
      productName, productDescription,
      productPrice:    Number(productPrice),
      productCategory, productStatus,
      productQuantity: Number(productQuantity),
      productImage,
      restaurant: restaurant !== undefined ? (restaurant || null) : old.restaurant,
    },
    { new: true, runValidators: true }
  )

  res.status(200).json({ message: 'Product updated successfully', data: updated })
})
