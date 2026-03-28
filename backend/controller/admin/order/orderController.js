const Order = require("../../../models/orderModel");

 
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
 
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId })
    .populate({ path: "items.product", model: "Product" })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};
 
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate({ path: "items.product", model: "Product" })
    .populate({ path: "user", select: "userName userEmail" })
    .sort({ createdAt: -1 });

  res.status(200).json({ message: "Orders fetched successfully", orders });
};