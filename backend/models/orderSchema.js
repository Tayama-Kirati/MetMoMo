const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ORDER_STATUSES   = ["pending", "confirmed", "preparation", "ontheway", "delivered", "cancelled"];
const PAYMENT_METHODS  = ["COD", "khalti", "esewa"];
// One lowercase vocabulary for payment state everywhere
const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "refund_pending", "refunded", "failed"];

const orderSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", index: true },
  driver:     { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  declinedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

  items: [{
    product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    // Snapshot at checkout so history doesn't change when the menu does
    name:     { type: String },
    price:    { type: Number },
  }],

  subtotal:    { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  promoCode:   { type: String, default: "" },
  totalAmount: { type: Number, required: true },

  shippingAddress: { type: String, required: true },
  location: { lat: Number, lng: Number },

  orderStatus: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
  statusHistory: [{
    status: { type: String, enum: ORDER_STATUSES },
    at:     { type: Date, default: Date.now },
    by:     { type: Schema.Types.ObjectId, ref: "User" },
  }],

  scheduledFor: { type: Date, default: null },

  // 4-digit code the customer gives the rider at the door
  deliveryCode:   { type: String, select: false },
  driverLocation: { lat: Number, lng: Number, updatedAt: Date },

  paymentDetails: {
    method: { type: String, enum: PAYMENT_METHODS, default: "COD" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    pidx:   { type: String },
    transactionId: { type: String },
  },
}, {
  timestamps: true,
});

orderSchema.index({ createdAt: -1 });

// Record every status change in the timeline
orderSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("orderStatus")) {
    const last = this.statusHistory[this.statusHistory.length - 1];
    if (!last || last.status !== this.orderStatus) {
      this.statusHistory.push({ status: this.orderStatus, at: new Date(), by: this.$locals.changedBy });
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
module.exports.ORDER_STATUSES   = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
