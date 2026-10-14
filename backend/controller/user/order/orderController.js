const Order = require("../../../models/orderSchema");
const Product = require("../../../models/productModel");
const { createOrder, setStatus } = require("../../../services/orders");
const { priceOrder } = require("../../../services/pricing");
const { paginate } = require("../../../services/paginate");

// POST /api/orders/quote  — price preview (subtotal, delivery, promo) before checkout
exports.quoteOrder = async (req, res) => {
  const { items, promoCode, shippingAddress } = req.body;
  const q = await priceOrder({ items, promoCode, shippingAddress, userId: req.user._id });
  res.status(200).json({
    data: {
      subtotal: q.subtotal,
      deliveryFee: q.deliveryFee,
      distanceKm: q.distanceKm,
      discount: q.discount,
      promoCode: q.coupon?.code || "",
      totalAmount: q.totalAmount,
      restaurantOpen: q.restaurant ? q.restaurant.isAcceptingOrders() : false,
    },
  });
};

// POST /api/orders/create  — cash on delivery
exports.createOrder = async (req, res) => {
  const order = await createOrder(req.user, req.body, { method: "COD", status: "unpaid" });
  const withCode = await Order.findById(order._id).select("+deliveryCode");
  res.status(201).json({ message: "Order created successfully", data: withCode });
};

// GET /api/orders  — my orders (newest first, paginated)
exports.getMyOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 20);
  const filter = { user: req.user._id };
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: "items.product", model: "Product", populate: { path: "restaurant", select: "_id name emoji" } })
      .populate("restaurant", "_id name emoji")
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.status(200).json({ message: "Orders fetched successfully", orders, page, total, pages: Math.ceil(total / limit) });
};

// GET /api/orders/:id  — one of my orders, for the live tracking page
exports.getMyOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .select("+deliveryCode")
    .populate("restaurant", "name emoji address phone")
    .populate("driver", "userName userPhoneNumber")
    .populate("items.product", "productName productImage");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.status(200).json({ data: order });
};

// POST /api/orders/:id/reorder  — returns the still-available items to put back in the cart
exports.reorder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const products = await Product.find({
    _id: { $in: order.items.map(i => i.product) },
    productStatus: "available",
  }).populate("restaurant", "name address emoji");

  const items = order.items
    .filter(i => products.some(p => p._id.equals(i.product)))
    .map(i => ({ product: i.product, quantity: i.quantity }));

  res.status(200).json({
    data: { items, products, missing: order.items.length - items.length },
  });
};

// DELETE /api/orders/:id/cancel  — customer cancels their own pending/confirmed order
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate("restaurant", "name");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
  }
  await setStatus(order, "cancelled", req.user._id, order.restaurant?.name);
  const refund = order.paymentDetails?.status === "refund_pending";
  res.status(200).json({
    message: refund ? "Order cancelled. Your refund is being processed." : "Order cancelled",
    data: order,
  });
};

// PATCH /api/orders/:id/delivered  — customer confirms they received the order
exports.markDelivered = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate("restaurant", "name");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.orderStatus !== "ontheway") {
    return res.status(400).json({ message: "Order must be on the way before marking delivered" });
  }
  if (order.paymentDetails.method === "COD") order.paymentDetails.status = "paid";
  await setStatus(order, "delivered", req.user._id, order.restaurant?.name);
  res.status(200).json({ message: "Order marked as delivered", data: order });
};
