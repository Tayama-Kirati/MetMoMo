const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  // ── BASIC ──────────────────────────────────────────────
  userName:        { type: String, required: [true, 'Name must be provided'] },
  firstName:       { type: String, default: '' },
  lastName:        { type: String, default: '' },
  dateOfBirth:     { type: Date },
  userEmail:       { type: String, required: [true, 'Email must be provided'] },
  userPhoneNumber: { type: String, default: '' },
  userPassword:    { type: String, required: [true, 'Password must be provided'] },
  profileImage:    { type: String, default: '' },

  // ── ACCOUNT ────────────────────────────────────────────
  userRole: {
    type: String,
    enum: ['customer', 'admin', 'restaurant_owner', 'delivery_rider'],
    default: 'customer',
  },
  isVerified: { type: Boolean, default: false },
  isBlocked:  { type: Boolean, default: false },
  lastLogin:  { type: Date },

  // ── ADDRESS ────────────────────────────────────────────
  address:              { type: String, default: '' },
  city:                 { type: String, default: '' },
  state:                { type: String, default: '' },
  country:              { type: String, default: 'Nepal' },
  postalCode:           { type: String, default: '' },
  landmark:             { type: String, default: '' },
  deliveryInstructions: { type: String, default: '' },

  // ── PREFERENCES ────────────────────────────────────────
  preferences: {
    darkMode:          { type: Boolean, default: false },
    preferredLanguage: { type: String,  default: 'en' },
    favoriteFoods:     [{ type: String }],
    dietaryPreference: {
      type: String,
      enum: ['none', 'vegetarian', 'vegan', 'non-vegetarian', 'halal'],
      default: 'none',
    },
    spicePreference: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'medium',
    },
  },

  // ── AUTH HELPERS ───────────────────────────────────────
  otp:           { type: Number,  select: false },
  otpIsVerified: { type: Boolean, default: false, select: false },

  // ── RELATIONS ──────────────────────────────────────────
  cart: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
