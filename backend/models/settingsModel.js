const mongoose = require('mongoose')

// Single-document platform settings
const settingsSchema = new mongoose.Schema({
  key:               { type: String, default: 'platform', unique: true },
  commissionPercent: { type: Number, default: 10, min: 0, max: 100 },
  riderSharePercent: { type: Number, default: 80, min: 0, max: 100 }, // share of delivery fee paid to riders
  loyaltyPointsPerHundred: { type: Number, default: 1 },              // points earned per NPR 100 spent
}, { timestamps: true })

settingsSchema.statics.get = async function () {
  return (await this.findOne({ key: 'platform' })) || this.create({ key: 'platform' })
}

module.exports = mongoose.model('Settings', settingsSchema)
