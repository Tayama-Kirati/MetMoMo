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
  // Per-day schedule, 24h "HH:MM". Missing day = use openingHours text only.
  weeklyHours: [{
    day:    { type: Number, min: 0, max: 6 },   // 0 = Sunday
    open:   { type: String, default: '08:00' },
    close:  { type: String, default: '22:00' },
    closed: { type: Boolean, default: false },
  }],
  // Owner can pause new orders (e.g. kitchen too busy) until this time
  pausedUntil: {
    type: Date,
    default: null,
  },
  // Owner-created restaurants wait for admin approval before going public
  isApproved: {
    type: Boolean,
    default: true,
  },
  reviewSummary: {
    text:        { type: String, default: '' },
    generatedAt: { type: Date },
  },
  location: {
    district: { type: String, default: '' },
    area:     { type: String, default: '' },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true })

restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text' })

// Is the restaurant taking orders right now?
restaurantSchema.methods.isAcceptingOrders = function (now = new Date()) {
  if (!this.isOpen || !this.isApproved) return false
  if (this.pausedUntil && this.pausedUntil > now) return false
  const today = (this.weeklyHours || []).find(h => h.day === now.getDay())
  if (!today) return true
  if (today.closed) return false
  const hhmm = now.toTimeString().slice(0, 5)
  return hhmm >= today.open && hhmm < today.close
}

const Restaurants = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurants