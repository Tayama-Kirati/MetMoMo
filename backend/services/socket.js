// Socket.io setup. Every connection must present a valid JWT; the server —
// not the client — decides which rooms a socket joins.
const { Server } = require('socket.io')
const { verifyToken } = require('./tokens')
const Restaurant = require('../models/restaurantModel')
const Order      = require('../models/orderSchema')

let io = null

const rooms = {
  user:       (id) => `user:${id}`,
  restaurant: (id) => `restaurant:${id}`,
  drivers:    'drivers',
}

function init(server, corsOrigins) {
  io = new Server(server, { cors: { origin: corsOrigins, methods: ['GET', 'POST'] } })

  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || ''
      const user = await verifyToken(raw)
      if (!user) return next(new Error('Unauthorized'))
      socket.data.user = user
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', async (socket) => {
    const user = socket.data.user
    socket.join(rooms.user(user._id))

    if (user.userRole === 'restaurant_owner') {
      const restaurant = await Restaurant.findOne({ owner: user._id }).select('_id')
      if (restaurant) socket.join(rooms.restaurant(restaurant._id))
    }
    if (user.userRole === 'delivery_rider' && user.isApproved) socket.join(rooms.drivers)

    // Rider shares live location for an order they are delivering
    socket.on('driver:location', async ({ orderId, lat, lng } = {}) => {
      if (user.userRole !== 'delivery_rider') return
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      const order = await Order.findOneAndUpdate(
        { _id: orderId, driver: user._id, orderStatus: 'ontheway' },
        { driverLocation: { lat, lng, updatedAt: new Date() } },
        { new: true }
      ).catch(() => null)
      if (order) io.to(rooms.user(order.user)).emit('order:location', { orderId: order._id, lat, lng })
    })
  })

  return io
}

const emitTo = (room, event, payload) => { if (io) io.to(room).emit(event, payload) }

module.exports = {
  init,
  rooms,
  notifyUser:       (userId, event, payload) => emitTo(rooms.user(userId), event, payload),
  notifyRestaurant: (restaurantId, event, payload) => emitTo(rooms.restaurant(restaurantId), event, payload),
  notifyDrivers:    (event, payload) => emitTo(rooms.drivers, event, payload),
}
