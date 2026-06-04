const Order = require("../../../models/orderSchema");

// POST /api/orders/create
// FIX: this function didn't exist — orderRoute imported it but it was never defined
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, totalAmount, shippingAddress, paymentDetails } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: "Please provide order items" });
  }
  if (!totalAmount || !shippingAddress) {
    return res.status(400).json({ message: "Please provide totalAmount and shippingAddress" });
  }

  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    shippingAddress,
    paymentDetails: paymentDetails || { method: "COD", status: "unpaid" },
  });

  res.status(201).json({ message: "Order created successfully", data: order });
};

// GET /api/orders  — returns only MY orders
// FIX: this function didn't exist — orderRoute imported it but it was never defined
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId })
    .populate({ path: "items.product", model: "Product", populate: { path: "restaurant", select: "_id name emoji" } })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};

// DELETE /api/orders/:id/cancel  — customer cancels their own pending/confirmed order
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })
  }
  order.orderStatus = 'cancelled'
  await order.save()
  res.status(200).json({ message: 'Order cancelled', data: order })
}

// PATCH /api/orders/:id/delivered  — customer confirms they received the order
exports.markDelivered = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.orderStatus !== 'ontheway') {
    return res.status(400).json({ message: 'Order must be on the way before marking delivered' })
  }
  order.orderStatus = 'delivered'
  await order.save()
  res.status(200).json({ message: 'Order marked as delivered', data: order })
}

// GET /api/orders/all  — admin: returns ALL orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate({ path: "items.product", model: "Product" })
    .populate({ path: "user", select: "userName userEmail" })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};