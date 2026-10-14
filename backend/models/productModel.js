const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const productSchema = new Schema({
  productName: {
    type: String,
    required: [true, 'Product Name must be provided'],
  },
  productDescription: {
    type: String,
    required: [true, 'Product Description must be provided'],
  },
  productPrice: {
    type: Number,
    required: [true, 'Product Price must be provided'],
  },
  productCategory: {
    type: String,
    required: [true, 'Product Category must be provided'],
  },
  productStatus: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  productQuantity: {
    type: Number,
    required: [true, 'Product Quantity must be provided'],
  },
  productImage: String,
  isVeg: {
    type: Boolean,
    default: false,
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'medium',
  },

   
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
}, { timestamps: true })

productSchema.index({ restaurant: 1, productStatus: 1 })
productSchema.index({ productCategory: 1 })
productSchema.index({ productName: 'text', productDescription: 'text', productCategory: 'text' })

const Products = mongoose.model('Product', productSchema)
module.exports = Products
