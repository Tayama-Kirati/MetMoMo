const Order = require('../../../models/orderSchema')

const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f7b93cce2c9e'
const BACKEND_URL   = process.env.BACKEND_URL || 'http://localhost:4000'
const FRONTEND_URL  = process.env.FRONTEND_URL || 'http://localhost:5173'

// POST /api/payment  — create order then initiate Khalti
exports.initiateKhaltiPayment = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentDetails, promoCode, discountAmount, deliveryFee } = req.body
  const userId = req.user?.id

  if (!items?.length || !totalAmount || !shippingAddress) {
    return res.status(400).json({ message: 'Missing order details' })
  }

  // 1. Create the order (unpaid)
  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    shippingAddress,
    paymentDetails: { method: 'khalti', status: 'Pending' },
  })

  // 2. Initiate Khalti payment
  const payload = {
    return_url:          `${BACKEND_URL}/api/payment/success?orderId=${order._id}`,
    website_url:         FRONTEND_URL,
    amount:              totalAmount * 100,   // Khalti uses paisa (1 NPR = 100 paisa)
    purchase_order_id:   order._id.toString(),
    purchase_order_name: `MetMomo Order #${order._id.toString().slice(-5).toUpperCase()}`,
  }

  const khaltiRes = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${KHALTI_SECRET}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(payload),
  })

  const khaltiData = await khaltiRes.json()

  if (!khaltiRes.ok || !khaltiData.payment_url) {
    // Delete the order if Khalti initiation fails
    await Order.findByIdAndDelete(order._id)
    return res.status(502).json({ message: khaltiData?.detail || 'Khalti payment initiation failed' })
  }

  return res.status(200).json({
    message:     'Khalti payment initiated',
    paymentUrl:  khaltiData.payment_url,
    pidx:        khaltiData.pidx,
    orderId:     order._id,
  })
}

// POST /api/payment/success  — Khalti redirects here after payment
exports.verifyPidx = async (req, res) => {
  const pidx    = req.query.pidx || req.body.pidx
  const orderId = req.query.orderId || req.body.orderId

  if (!pidx) return res.redirect(`${FRONTEND_URL}/payment-failed?reason=missing_pidx`)

  const lookupRes = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${KHALTI_SECRET}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ pidx }),
  })

  const data = await lookupRes.json()

  if (data.status === 'Completed') {
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'paymentDetails.status': 'paid',
        'paymentDetails.pidx':   pidx,
      })
    }
    return res.redirect(`${FRONTEND_URL}/payment-success?orderId=${orderId}`)
  }

  return res.redirect(`${FRONTEND_URL}/payment-failed?reason=${data.status || 'unknown'}`)
}
