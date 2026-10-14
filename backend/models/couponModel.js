const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const couponSchema = new Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value:       { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0 },     // 0 = no cap (percent coupons)
  minOrder:    { type: Number, default: 0 },
  firstOrderOnly: { type: Boolean, default: false },
  usageLimit:  { type: Number, default: 0 },     // 0 = unlimited
  perUserLimit:{ type: Number, default: 1 },
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },
  isActive:    { type: Boolean, default: true },
  restaurant:  { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null }, // null = platform-wide
}, { timestamps: true })

module.exports = mongoose.model('Coupon', couponSchema)
