const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  coverImage: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  cuisine: {
    type: [String],   
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  deliveryTime: {
    type: String,   // e.g. "20-30"
    default: '30-45',
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  minimumOrder: {
    type: Number,
    default: 0,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  emoji: {
    type: String,
    default: '🍜',
  },
  openingHours: {
    type: String,
    default: '8:00 AM – 10:00 PM',
  },
  location: {
    district: { type: String, default: 'Kathmandu' },
    area:     { type: String, default: '' },
  },
}, { timestamps: true })

const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant