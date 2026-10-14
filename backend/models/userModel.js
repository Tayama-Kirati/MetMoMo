const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  // ── BASIC ──────────────────────────────────────────────
  userName:        { type: String, required: [true, 'Name must be provided'] },
  firstName:       { type: String, default: '' },
  lastName:        { type: String, default: '' },
  dateOfBirth:     { type: Date },
  userEmail:       { type: String, required: [true, 'Email must be provided'], lowercase: true, trim: true, unique: true },
  userPhoneNumber: { type: String, default: '' },
  userPassword:    { type: String, required: [true, 'Password must be provided'], select: false },
  profileImage:    { type: String, default: '' },

  // ── ACCOUNT ────────────────────────────────────────────
  userRole: {
    type: String,
    enum: ['customer', 'admin', 'restaurant_owner', 'delivery_rider'],
    default: 'customer',
  },
  isVerified: { type: Boolean, default: false },
  isBlocked:  { type: Boolean, default: false },
  // Riders need admin approval before they can take deliveries
  isApproved: { type: Boolean, default: true },
  passwordChangedAt: { type: Date },
  lastLogin:  { type: Date },

  // ── ADDRESS ────────────────────────────────────────────
  address:              { type: String, default: '' },
  city:                 { type: String, default: '' },
  state:                { type: String, default: '' },
  country:              { type: String, default: 'Nepal' },
  postalCode:           { type: String, default: '' },
  landmark:             { type: String, default: '' },
  deliveryInstructions: { type: String, default: '' },
  addresses: [{
    label:    { type: String, default: 'Home' },
    street:   { type: String, required: true },
    landmark: { type: String, default: '' },
    city:     { type: String, default: 'Kathmandu' },
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false },
  }],

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
  otpExpires:    { type: Date,    select: false },
  otpAttempts:   { type: Number,  default: 0, select: false },
  otpIsVerified: { type: Boolean, default: false, select: false },

  // ── LOYALTY ────────────────────────────────────────────
  loyaltyPoints: { type: Number, default: 0 },

  // ── RELATIONS ──────────────────────────────────────────
  cart: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
