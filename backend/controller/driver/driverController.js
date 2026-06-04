const Order = require('../../models/orderSchema')
const catchAsync = require('../../services/catchAsync')

// GET /api/driver/orders  — all orders that are 'ontheway' (ready for delivery)
exports.getDeliveryOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ orderStatus: 'ontheway' })
    .populate({ path: 'items.product', select: 'productName productPrice productImage productCategory' })
    .populate({ path: 'user', select: 'userName userPhoneNumber userEmail' })
    .sort({ createdAt: -1 })

  res.status(200).json({ message: 'Delivery orders fetched', data: orders })
})

// PATCH /api/driver/orders/:id/delivered  — driver confirms delivery
exports.confirmDelivery = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.orderStatus !== 'ontheway') {
    return res.status(400).json({ message: 'Order is not out for delivery' })
  }

  order.orderStatus = 'delivered'
  await order.save()

  // Notify the customer via socket
  if (global._io) {
    global._io.to(order.user.toString()).emit('order:status', {
      orderId: order._id,
      status:  'delivered',
      title:   'Order Delivered! 🏠',
      body:    'Your order has been delivered. Enjoy your meal!',
    })
  }

  res.status(200).json({ message: 'Delivery confirmed', data: order })
})
