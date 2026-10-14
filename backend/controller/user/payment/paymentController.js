const crypto = require('crypto')
const Order  = require('../../../models/orderSchema')
const { createOrder, announceNewOrder } = require('../../../services/orders')

const BACKEND_URL  = () => process.env.BACKEND_URL  || 'http://localhost:4000'
const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173'

// ── Khalti ────────────────────────────────────────────────────────────
// Secret must come from the environment — never hard-code it.
const KHALTI_BASE = () => process.env.KHALTI_BASE_URL || 'https://a.khalti.com/api/v2'

async function khalti(path, body) {
  const res = await fetch(`${KHALTI_BASE()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

// POST /api/payment  — create order (server-priced) then initiate Khalti
exports.initiateKhaltiPayment = async (req, res) => {
  if (!process.env.KHALTI_SECRET_KEY) {
    return res.status(503).json({ message: 'Khalti is not configured on this server' })
  }

  const order = await createOrder(req.user, req.body, { method: 'khalti', status: 'pending' })

  const { ok, data } = await khalti('/epayment/initiate/', {
    return_url:          `${BACKEND_URL()}/api/payment/success?orderId=${order._id}`,
    website_url:         FRONTEND_URL(),
    amount:              Math.round(order.totalAmount * 100),   // paisa
    purchase_order_id:   order._id.toString(),
    purchase_order_name: `MetMomo Order #${order._id.toString().slice(-5).toUpperCase()}`,
  })

  if (!ok || !data.payment_url) {
    await Order.findByIdAndDelete(order._id)
    return res.status(502).json({ message: data?.detail || 'Khalti payment initiation failed' })
  }

  order.paymentDetails.pidx = data.pidx
  await order.save()

  return res.status(200).json({
    message: 'Khalti payment initiated',
    paymentUrl: data.payment_url,
    pidx: data.pidx,
    orderId: order._id,
  })
}

async function failOrder(order, reason) {
  if (!order || order.paymentDetails.status === 'paid') return
  order.paymentDetails.status = 'failed'
  order.orderStatus = 'cancelled'
  await order.save()
  console.warn(`Payment failed for order ${order._id}: ${reason}`)
}

// GET /api/payment/success  — Khalti redirects here after payment
exports.verifyPidx = async (req, res) => {
  const { pidx, orderId } = req.query
  const fail = (reason) => res.redirect(`${FRONTEND_URL()}/payment-failed?reason=${encodeURIComponent(reason)}`)

  if (!pidx || !orderId) return fail('missing_pidx')
  const order = await Order.findById(orderId).catch(() => null)
  if (!order || order.paymentDetails.pidx !== pidx) return fail('order_mismatch')
  if (order.paymentDetails.status === 'paid') {
    return res.redirect(`${FRONTEND_URL()}/payment-success?orderId=${order._id}`)
  }

  const { data } = await khalti('/epayment/lookup/', { pidx })
  const expectedPaisa = Math.round(order.totalAmount * 100)

  if (data.status === 'Completed' && Number(data.total_amount) === expectedPaisa) {
    order.paymentDetails.status = 'paid'
    order.paymentDetails.transactionId = data.transaction_id
    await order.save()
    announceNewOrder(order)
    return res.redirect(`${FRONTEND_URL()}/payment-success?orderId=${order._id}`)
  }

  if (['User canceled', 'Expired', 'Failed'].includes(data.status)) await failOrder(order, data.status)
  return fail(data.status || 'unknown')
}

// ── eSewa (ePay v2) ───────────────────────────────────────────────────
// Defaults are eSewa's public sandbox; set ESEWA_* env vars for production.
const ESEWA = {
  productCode: () => process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  secret:      () => process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q',
  formUrl:     () => process.env.ESEWA_FORM_URL     || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  statusUrl:   () => process.env.ESEWA_STATUS_URL   || 'https://rc.esewa.com.np/api/epay/transaction/status/',
}

const esewaSign = (fields, names) => crypto
  .createHmac('sha256', ESEWA.secret())
  .update(names.split(',').map(n => `${n}=${fields[n]}`).join(','))
  .digest('base64')

// POST /api/payment/esewa  — create order then return the signed form to post to eSewa
exports.initiateEsewaPayment = async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !process.env.ESEWA_SECRET_KEY) {
    return res.status(503).json({ message: 'eSewa is not configured on this server' })
  }

  const order = await createOrder(req.user, req.body, { method: 'esewa', status: 'pending' })
  const uuid  = `${order._id}-${Date.now()}`
  order.paymentDetails.pidx = uuid
  await order.save()

  const fields = {
    amount:                  String(order.totalAmount),
    tax_amount:              '0',
    total_amount:            String(order.totalAmount),
    transaction_uuid:        uuid,
    product_code:            ESEWA.productCode(),
    product_service_charge:  '0',
    product_delivery_charge: '0',
    success_url:             `${BACKEND_URL()}/api/payment/esewa/success`,
    failure_url:             `${BACKEND_URL()}/api/payment/esewa/failure?orderId=${order._id}`,
    signed_field_names:      'total_amount,transaction_uuid,product_code',
  }
  fields.signature = esewaSign(fields, fields.signed_field_names)

  res.status(200).json({ message: 'eSewa payment initiated', formUrl: ESEWA.formUrl(), fields, orderId: order._id })
}

// GET /api/payment/esewa/success?data=<base64 json>
exports.verifyEsewa = async (req, res) => {
  const fail = (reason) => res.redirect(`${FRONTEND_URL()}/payment-failed?reason=${encodeURIComponent(reason)}`)

  let payload
  try {
    payload = JSON.parse(Buffer.from(String(req.query.data || ''), 'base64').toString('utf8'))
  } catch {
    return fail('bad_response')
  }

  if (!payload.signed_field_names || esewaSign(payload, payload.signed_field_names) !== payload.signature) {
    return fail('bad_signature')
  }

  const order = await Order.findOne({ 'paymentDetails.pidx': payload.transaction_uuid })
  if (!order) return fail('order_mismatch')
  if (order.paymentDetails.status === 'paid') {
    return res.redirect(`${FRONTEND_URL()}/payment-success?orderId=${order._id}`)
  }

  // Double-check with eSewa's status API rather than trusting the redirect alone
  const url = `${ESEWA.statusUrl()}?product_code=${ESEWA.productCode()}&total_amount=${order.totalAmount}&transaction_uuid=${encodeURIComponent(payload.transaction_uuid)}`
  const status = await fetch(url).then(r => r.json()).catch(() => ({}))

  if (status.status === 'COMPLETE' && Number(status.total_amount) === Number(order.totalAmount)) {
    order.paymentDetails.status = 'paid'
    order.paymentDetails.transactionId = status.ref_id || payload.transaction_code
    await order.save()
    announceNewOrder(order)
    return res.redirect(`${FRONTEND_URL()}/payment-success?orderId=${order._id}`)
  }
  return fail(status.status || 'unknown')
}

// GET /api/payment/esewa/failure?orderId=
exports.esewaFailure = async (req, res) => {
  const order = await Order.findById(req.query.orderId).catch(() => null)
  if (order?.paymentDetails?.method === 'esewa') await failOrder(order, 'esewa_failure')
  res.redirect(`${FRONTEND_URL()}/payment-failed?reason=cancelled`)
}
