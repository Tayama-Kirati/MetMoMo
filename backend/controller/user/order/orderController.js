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
    .populate({ path: "items.product", model: "Product" })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};

// GET /api/orders/all  — admin: returns ALL orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate({ path: "items.product", model: "Product" })
    .populate({ path: "user", select: "userName userEmail" })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};