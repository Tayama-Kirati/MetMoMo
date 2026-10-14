import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, KeyRound, MapPin, Clock, XCircle, Bell } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useSocketEvent } from '../../context/SocketContext'
import { usePrefs } from '../../context/PreferencesContext'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'pending',     label: 'Order placed',      icon: '📋' },
  { key: 'confirmed',   label: 'Restaurant confirmed', icon: '✅' },
  { key: 'preparation', label: 'Being prepared',    icon: '👩‍🍳' },
  { key: 'ontheway',    label: 'On the way',        icon: '🛵' },
  { key: 'delivered',   label: 'Delivered',         icon: '🏠' },
]

const time = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

// OpenStreetMap embed centred on a point — no API key or extra library needed
function MiniMap({ lat, lng, label }) {
  const d = 0.008
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`
  return (
    <div className="rounded-2xl overflow-hidden border border-faint">
      <iframe title={label} src={src} className="w-full h-56 border-0" loading="lazy" />
      <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noreferrer"
        className="block text-center text-xs text-pink font-semibold py-2 bg-pink-50">Open larger map</a>
    </div>
  )
}

export default function OrderTracking() {
  const { id } = useParams()
  const { t } = usePrefs()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { ok, data } = await api.get(ROUTES.order(id))
    if (ok) setOrder(data.data)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useSocketEvent('order:status', useCallback(({ orderId }) => { if (String(orderId) === id) load() }, [id, load]))
  useSocketEvent('order:location', useCallback(({ orderId, lat, lng }) => {
    if (String(orderId) === id) setOrder(o => o && { ...o, driverLocation: { lat, lng, updatedAt: new Date().toISOString() } })
  }, [id]))

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return
    setBusy(true)
    const { ok, data } = await api.delete(ROUTES.cancelOrder(id))
    if (ok) { toast.success(data.message); load() } else toast.error(data?.message || 'Cannot cancel now')
    setBusy(false)
  }

  const confirmReceived = async () => {
    setBusy(true)
    const { ok, data } = await api.patch(ROUTES.confirmReceived(id))
    if (ok) { toast.success('Enjoy your meal! 🥟'); load() } else toast.error(data?.message || 'Could not update')
    setBusy(false)
  }

  if (loading) return <div className="page-wrap max-w-2xl mx-auto"><div className="skeleton h-96 rounded-3xl" /></div>
  if (!order) return (
    <div className="page-wrap text-center py-20">
      <p className="text-muted mb-4">Order not found.</p>
      <Link to="/orders" className="btn-pink">Back to My Orders</Link>
    </div>
  )

  const canAskNotify = typeof Notification !== 'undefined' && Notification.permission === 'default'
    && !['delivered', 'cancelled'].includes(order.orderStatus)
  const askNotify = async () => {
    const result = await Notification.requestPermission()
    if (result === 'granted') toast.success("We'll notify you when your order status changes")
  }

  const cancelled = order.orderStatus === 'cancelled'
  const currentIdx = STEPS.findIndex(s => s.key === order.orderStatus)
  const when = Object.fromEntries((order.statusHistory || []).map(h => [h.status, h.at]))
  const live = order.orderStatus === 'ontheway' && order.driverLocation?.lat != null

  return (
    <div className="page-wrap max-w-2xl mx-auto">
      <title>{`Order #${order._id.slice(-5).toUpperCase()} · MetMoMo`}</title>
      <div className="flex items-center justify-between mb-5">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-pink"><ArrowLeft size={15}/> My Orders</Link>
        {canAskNotify && (
          <button onClick={askNotify} className="btn-soft text-xs py-1.5"><Bell size={13}/> Notify me</button>
        )}
      </div>

      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-muted">Order #{order._id.slice(-5).toUpperCase()}</p>
            <h1 className="font-display font-black text-2xl text-ink">{order.restaurant?.emoji} {order.restaurant?.name || 'Your order'}</h1>
            {order.scheduledFor && (
              <p className="text-sm text-muted flex items-center gap-1 mt-1"><Clock size={13}/> Scheduled for {new Date(order.scheduledFor).toLocaleString()}</p>
            )}
          </div>
          <span className="font-display font-extrabold text-pink text-lg shrink-0">NPR {order.totalAmount?.toLocaleString()}</span>
        </div>

        {cancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600">
            <XCircle size={20}/>
            <div>
              <p className="font-bold">This order was cancelled</p>
              {order.paymentDetails?.status === 'refund_pending' && <p className="text-sm">Your refund is being processed.</p>}
              {order.paymentDetails?.status === 'refunded' && <p className="text-sm">Your payment has been refunded.</p>}
            </div>
          </div>
        ) : (
          <ol className="relative space-y-5" aria-label="Order progress">
            {STEPS.map((s, i) => {
              const done = i < currentIdx || order.orderStatus === 'delivered'
              const active = i === currentIdx && order.orderStatus !== 'delivered'
              return (
                <li key={s.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    done ? 'bg-pink border-pink text-white' : active ? 'border-pink bg-pink-50 animate-pulse' : 'border-faint bg-white text-muted'}`}>
                    {done ? '✓' : s.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-display font-bold text-sm ${done || active ? 'text-ink' : 'text-muted'}`}>{s.label}</p>
                    {when[s.key] && <p className="text-xs text-muted">{time(when[s.key])}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {!cancelled && order.orderStatus !== 'delivered' && order.deliveryCode && (
        <div className="card p-5 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink"><KeyRound size={22}/></div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('deliveryCode')}</p>
            <p className="text-xs text-muted">{t('deliveryCodeHint')}</p>
          </div>
          <span className="font-display font-black text-3xl tracking-[0.2em] text-ink">{order.deliveryCode}</span>
        </div>
      )}

      {order.driver && !cancelled && order.orderStatus !== 'delivered' && (
        <div className="card p-5 mb-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛵</span>
            <div className="flex-1">
              <p className="font-display font-bold text-ink">{order.driver.userName}</p>
              <p className="text-xs text-muted">
                {live ? `Live location · updated ${time(order.driverLocation.updatedAt)}` : 'Your rider'}
              </p>
            </div>
            {order.driver.userPhoneNumber && (
              <a href={`tel:${order.driver.userPhoneNumber}`} aria-label="Call rider"
                className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600"><Phone size={16}/></a>
            )}
          </div>
          {live && <MiniMap lat={order.driverLocation.lat} lng={order.driverLocation.lng} label="Rider location" />}
        </div>
      )}

      <div className="card p-5 mb-5 space-y-3 text-sm">
        <p className="flex items-start gap-2 text-ink"><MapPin size={15} className="text-pink mt-0.5 shrink-0"/> {order.shippingAddress}</p>
        <div className="border-t border-faint pt-3 space-y-1.5">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-ink">{it.quantity} × {it.name || it.product?.productName}</span>
              <span className="text-muted">NPR {((it.price ?? 0) * it.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-faint pt-3 space-y-1">
          <div className="flex justify-between text-muted"><span>{t('subtotal')}</span><span>NPR {order.subtotal?.toLocaleString()}</span></div>
          <div className="flex justify-between text-muted"><span>{t('delivery')}</span><span>NPR {order.deliveryFee}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>{t('discount')} ({order.promoCode})</span><span>– NPR {order.discount}</span></div>}
          <div className="flex justify-between font-bold text-ink"><span>{t('total')}</span><span>NPR {order.totalAmount?.toLocaleString()}</span></div>
          <p className="text-xs text-muted pt-1">Paid by {order.paymentDetails?.method} · {order.paymentDetails?.status}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['pending', 'confirmed'].includes(order.orderStatus) && (
          <button onClick={cancel} disabled={busy} className="btn-outline text-red-500 border-red-200 hover:bg-red-50">Cancel order</button>
        )}
        {order.orderStatus === 'ontheway' && (
          <button onClick={confirmReceived} disabled={busy} className="btn-pink">I received my order</button>
        )}
      </div>
    </div>
  )
}
