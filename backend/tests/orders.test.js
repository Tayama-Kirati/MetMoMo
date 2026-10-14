const h = require('./helpers')
const Order  = require('../models/orderSchema')
const Coupon = require('../models/couponModel')

beforeAll(h.start)
afterAll(h.stop)
beforeEach(h.reset)

async function setup() {
  const owner = await h.makeUser('restaurant_owner')
  const restaurant = await h.makeRestaurant(owner.user)
  const momo = await h.makeProduct(restaurant)
  const tea  = await h.makeProduct(restaurant, { productName: 'Tea', productPrice: 60 })
  const customer = await h.makeUser('customer')
  return { owner, restaurant, momo, tea, customer }
}

describe('ordering', () => {
  test('server computes the total and ignores client amounts', async () => {
    const { momo, tea, customer } = await setup()
    const res = await h.api().post('/api/orders/create').set('Authorization', customer.token).send({
      items: [{ product: momo._id, quantity: 2 }, { product: tea._id, quantity: 1 }],
      shippingAddress: 'Lazimpat, Kathmandu',
      totalAmount: 1,                       // attacker-supplied, must be ignored
    })
    expect(res.status).toBe(201)
    expect(res.body.data.subtotal).toBe(460)
    expect(res.body.data.deliveryFee).toBe(70)   // AI off → default 5 km → NPR 70
    expect(res.body.data.totalAmount).toBe(530)
    expect(res.body.data.items[0].price).toBe(200)
    expect(res.body.data.deliveryCode).toMatch(/^\d{4}$/)
    expect(res.body.data.statusHistory[0].status).toBe('pending')
  })

  test('coupons are validated server-side', async () => {
    const { momo, customer } = await setup()
    await Coupon.create({ code: 'FIRST20', type: 'percent', value: 20, firstOrderOnly: true })

    const bad = await h.api().post('/api/orders/quote').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], promoCode: 'FAKE99' })
    expect(bad.status).toBe(400)

    const good = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], promoCode: 'first20', shippingAddress: 'Thamel' })
    expect(good.status).toBe(201)
    expect(good.body.data.discount).toBe(40)

    const again = await h.api().post('/api/orders/quote').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], promoCode: 'FIRST20' })
    expect(again.status).toBe(400)
    expect((await Coupon.findOne({ code: 'FIRST20' })).usedCount).toBe(1)
  })

  test('rejects mixed restaurants, sold-out items and closed restaurants', async () => {
    const { momo, customer, restaurant } = await setup()
    const other = await h.makeRestaurant(null, { name: 'Other' })
    const otherItem = await h.makeProduct(other)
    const mixed = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }, { product: otherItem._id }], shippingAddress: 'Thamel' })
    expect(mixed.status).toBe(400)

    momo.productStatus = 'unavailable'; await momo.save()
    const soldOut = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], shippingAddress: 'Thamel' })
    expect(soldOut.status).toBe(400)

    momo.productStatus = 'available'; await momo.save()
    restaurant.pausedUntil = new Date(Date.now() + 60 * 60 * 1000); await restaurant.save()
    const paused = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], shippingAddress: 'Thamel' })
    expect(paused.status).toBe(400)
  })

  test('customers only see their own orders', async () => {
    const { momo, customer } = await setup()
    const created = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], shippingAddress: 'Thamel' })
    const stranger = await h.makeUser('customer')
    const res = await h.api().get(`/api/orders/${created.body.data._id}`).set('Authorization', stranger.token)
    expect(res.status).toBe(404)
  })
})

describe('restaurant → rider → customer flow', () => {
  test('full delivery with code check', async () => {
    const { owner, momo, customer } = await setup()
    const rider = await h.makeUser('delivery_rider')

    const { body } = await h.api().post('/api/orders/create').set('Authorization', customer.token)
      .send({ items: [{ product: momo._id }], shippingAddress: 'Thamel' })
    const id = body.data._id
    const code = body.data.deliveryCode

    // Owner can't skip ahead
    const skip = await h.api().patch(`/api/owner/orders/${id}/status`).set('Authorization', owner.token).send({ status: 'delivered' })
    expect(skip.status).toBe(400)

    await h.api().patch(`/api/owner/orders/${id}/status`).set('Authorization', owner.token).send({ status: 'confirmed' }).expect(200)

    const available = await h.api().get('/api/driver/orders/available').set('Authorization', rider.token)
    expect(available.body.data.map(o => o._id)).toContain(id)

    await h.api().patch(`/api/driver/orders/${id}/accept`).set('Authorization', rider.token).expect(200)
    const rider2 = await h.makeUser('delivery_rider')
    await h.api().patch(`/api/driver/orders/${id}/accept`).set('Authorization', rider2.token).expect(409)

    await h.api().patch(`/api/driver/orders/${id}/pickup`).set('Authorization', rider.token).expect(200)

    const wrong = await h.api().patch(`/api/driver/orders/${id}/delivered`).set('Authorization', rider.token).send({ code: '0000' === code ? '1111' : '0000' })
    expect(wrong.status).toBe(400)
    await h.api().patch(`/api/driver/orders/${id}/delivered`).set('Authorization', rider.token).send({ code }).expect(200)

    const order = await Order.findById(id)
    expect(order.orderStatus).toBe('delivered')
    expect(order.paymentDetails.status).toBe('paid')
    expect(order.statusHistory.map(s => s.status)).toEqual(['pending', 'confirmed', 'ontheway', 'delivered'])

    const earnings = await h.api().get('/api/driver/earnings').set('Authorization', rider.token)
    expect(earnings.body.data.totals.deliveries).toBe(1)
  })

  test('unapproved riders cannot take orders', async () => {
    const rider = await h.makeUser('delivery_rider', { isApproved: false })
    const res = await h.api().get('/api/driver/orders/available').set('Authorization', rider.token)
    expect(res.status).toBe(403)
  })

  test('unapproved restaurants are hidden from customers', async () => {
    const owner = await h.makeUser('restaurant_owner')
    const r = await h.makeRestaurant(owner.user, { isApproved: false })
    const list = await h.api().get('/api/restaurants')
    expect(list.body.data.find(x => x._id === String(r._id))).toBeUndefined()
    await h.api().get(`/api/restaurants/${r._id}`).expect(404)
    await h.api().get(`/api/restaurants/${r._id}`).set('Authorization', owner.token).expect(200)
  })
})

describe('search', () => {
  test('regex special characters are safe', async () => {
    const { restaurant } = await setup()
    await h.api().get('/api/products?search=(((').expect(200)
    const res = await h.api().get('/api/products?search=buff&maxPrice=250')
    expect(res.body.data.length).toBe(1)
    expect(String(res.body.data[0].restaurant._id)).toBe(String(restaurant._id))
  })
})
