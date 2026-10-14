// Test harness: in-memory MongoDB + the Express app, with no AI or email calls.
process.env.NODE_ENV = 'test'
process.env.SECRET_KEY = 'test-secret'
process.env.ANTHROPIC_API_KEY = ''
process.env.EMAIL_USER = ''
process.env.KHALTI_SECRET_KEY = ''

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const request  = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')

const app        = require('../app')
const User       = require('../models/userModel')
const Restaurant = require('../models/restaurantModel')
const Product    = require('../models/productModel')
const { signToken } = require('../services/tokens')

let mongo

async function start() {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
  await Promise.all(Object.values(mongoose.models).map(m => m.syncIndexes()))
}

async function stop() {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}

async function reset() {
  await Promise.all(Object.values(mongoose.connection.collections).map(c => c.deleteMany({})))
}

let n = 0
async function makeUser(role = 'customer', extra = {}) {
  n += 1
  const user = await User.create({
    userName: `${role}${n}`,
    userEmail: `${role}${n}@test.com`,
    userPhoneNumber: '9800000000',
    userPassword: bcrypt.hashSync('password123', 4),
    userRole: role,
    ...extra,
  })
  return { user, token: signToken(user) }
}

async function makeRestaurant(owner, extra = {}) {
  return Restaurant.create({
    name: 'Test Momo House', description: 'Momos', address: 'Thamel, Kathmandu',
    deliveryFee: 50, owner: owner?._id || null, ...extra,
  })
}

async function makeProduct(restaurant, extra = {}) {
  return Product.create({
    productName: 'Buff Momo', productDescription: 'Steamed', productPrice: 200,
    productCategory: 'Steamed Momo', productQuantity: 10, restaurant: restaurant._id, ...extra,
  })
}

const api = () => request(app)

module.exports = { start, stop, reset, makeUser, makeRestaurant, makeProduct, api }
