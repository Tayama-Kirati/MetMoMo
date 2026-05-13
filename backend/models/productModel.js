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

   
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
}, { timestamps: true })

const Products = mongoose.model('Product', productSchema)
module.exports = Products
