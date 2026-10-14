import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useSocket, useSocketEvent, showSystemNotification } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import { RefreshCw, MapPin, Phone, CheckCircle, Package, Store, Navigation, Wallet, X, Radio } from 'lucide-react'

const STATUS_LABEL = {
  confirmed:   { text: 'Waiting at restaurant', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  preparation: { text: 'Being prepared',        cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ontheway:    { text: '🛵 Out for delivery',     cls: 'bg-orange-100 text-orange-700 border-orange-200' },
}

const when = (d) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const mapsLink = (order) => order.location?.lat != null
  ? `https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress)}`

function Items({ order }) {
  return (
    <div className="space-y-1 text-sm">
      {order.items?.map((it, i) => (
        <div key={i} className="flex justify-between">
          <span className="text-ink">{it.quantity} × {it.name || it.product?.productName}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-faint pt-1.5 font-bold">
        <span className="text-ink">{order.paymentDetails?.method === 'COD' && order.paymentDetails?.status !== 'paid' ? 'Collect cash' : 'Prepaid'}</span>
        <span className="text-pink">NPR {order.totalAmount?.toLocaleString()}</span>
      </div>
    </div>
  )
}

function AvailableCard({ order, onAccepted, onDeclined }) {
  const [busy, setBusy] = useState(false)
  const accept = async () => {
    setBusy(true)
    const { ok, data } = await api.patch(`/driver/orders/${order._id}/accept`)
    if (ok) { toast.success('Order accepted — head to the restaurant'); onAccepted(data.data) }
    else { toast.error(data?.message || 'Could not accept'); onDeclined(order._id) }
    setBusy(false)
  }
  const decline = async () => {
    await api.patch(`/driver/orders/${order._id}/decline`)
    onDeclined(order._id)
  }
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-bold text-ink">{order.restaurant?.emoji} {order.restaurant?.name}</p>
          <p className="text-xs text-muted">{order.restaurant?.address}</p>
        </div>
        <span className="text-sm font-bold text-green-600 shrink-0">+ NPR {order.deliveryFee}</span>
      </div>
      <p className="text-sm text-ink flex items-start gap-1.5"><MapPin size={14} className="text-pink mt-0.5 shrink-0"/> {order.shippingAddress}</p>
      <Items order={order} />
      <div className="flex gap-2">
        <button onClick={decline} disabled={busy} className="btn-outline flex-1 justify-center py-2.5 rounded-xl"><X size={14}/> Skip</button>
        <button onClick={accept} disabled={busy} className="btn-pink flex-1 justify-center py-2.5 rounded-xl">
          {busy ? <span className="spinner"/> : <CheckCircle size={14}/>} Accept
        </button>
      </div>
    </div>
  )
}

function ActiveCard({ order, onChanged, sharing }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const st = STATUS_LABEL[order.orderStatus] || STATUS_LABEL.confirmed
  const customer = order.user

  const pickup = async () => {
    setBusy(true)
    const { ok, data } = await api.patch(`/driver/orders/${order._id}/pickup`)
    if (ok) { toast.success('Picked up — customer notified'); onChanged() } else toast.error(data?.message || 'Could not update')
    setBusy(false)
  }
  const deliver = async (e) => {
    e.preventDefault()
    setBusy(true)
    const { ok, data } = await api.patch(`/driver/orders/${order._id}/delivered`, { code })
    if (ok) { toast.success('Delivered! 🎉'); onChanged() } else toast.error(data?.message || 'Could not confirm')
    setBusy(false)
  }

  return (
    <div className="card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-display font-bold text-ink">Order #{order._id?.slice(-6).toUpperCase()}</p>
            <p className="text-muted text-xs">{when(order.createdAt)}</p>
          </div>
          <span className={`border text-xs font-bold px-3 py-1 rounded-full ${st.cls}`}>{st.text}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Store size={11}/> Pick up</p>
            <p className="text-sm font-semibold text-ink">{order.restaurant?.name}</p>
            <p className="text-xs text-muted">{order.restaurant?.address}</p>
            {order.restaurant?.phone && <a href={`tel:${order.restaurant.phone}`} className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1"><Phone size={11}/> {order.restaurant.phone}</a>}
          </div>
          <div className="bg-pink-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={11}/> Deliver to</p>
            <p className="text-sm font-semibold text-ink">{customer?.userName}</p>
            <p className="text-xs text-muted">{order.shippingAddress}</p>
            {customer?.userPhoneNumber && <a href={`tel:${customer.userPhoneNumber}`} className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1"><Phone size={11}/> {customer.userPhoneNumber}</a>}
          </div>
        </div>

        <Items order={order} />

        <a href={mapsLink(order)} target="_blank" rel="noreferrer" className="btn-soft w-full justify-center py-2.5 rounded-xl">
          <Navigation size={14}/> Open directions
        </a>

        {order.orderStatus !== 'ontheway' ? (
          <button onClick={pickup} disabled={busy} className="btn-pink w-full justify-center py-3 rounded-xl">
            {busy ? <span className="spinner"/> : <Package size={15}/>} I've picked up the order
          </button>
        ) : (
          <form onSubmit={deliver} className="space-y-2">
            {sharing && <p className="text-xs text-green-600 flex items-center gap-1"><Radio size={12}/> Sharing your live location with the customer</p>}
            <label className="block text-xs font-bold text-muted uppercase tracking-wider" htmlFor={`code-${order._id}`}>Customer's delivery code</label>
            <div className="flex gap-2">
              <input id={`code-${order._id}`} inputMode="numeric" maxLength={4} pattern="\d{4}" required
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="input-field text-center text-xl tracking-[0.5em] font-bold w-36" />
              <button type="submit" disabled={busy || code.length !== 4} className="btn-pink flex-1 justify-center rounded-xl">
                {busy ? <span className="spinner"/> : <CheckCircle size={15}/>} Confirm delivery
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Earnings() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/driver/earnings').then(({ ok, data }) => { if (ok) setData(data.data) }) }, [])
  if (!data) return <div className="skeleton h-48 rounded-3xl" />
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Today', data.totals.today], ['Last 7 days', data.totals.week], ['All time', data.totals.allTime]].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-xs text-muted">{l}</p>
            <p className="font-display font-black text-xl text-ink">NPR {v.toLocaleString()}</p>
          </div>
        ))}
        <div className="card p-4">
          <p className="text-xs text-muted">Deliveries</p>
          <p className="font-display font-black text-xl text-ink">{data.totals.deliveries}</p>
        </div>
      </div>
      <p className="text-xs text-muted">You earn {data.riderSharePercent}% of each delivery fee.</p>
      <div className="card divide-y divide-gray-100">
        {data.history.length === 0 && <p className="p-5 text-sm text-muted text-center">No deliveries yet.</p>}
        {data.history.map(h => (
          <div key={h.orderId} className="p-4 flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{h.restaurant} → {h.address}</p>
              <p className="text-xs text-muted">{when(h.deliveredAt)}</p>
            </div>
            <span className="font-bold text-green-600 shrink-0">+ NPR {h.earning}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DriverOrders() {
  const { user } = useAuth()
  const socket = useSocket()
  const [tab, setTab] = useState('active')
  const [active, setActive] = useState([])
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const watchRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [a, b] = await Promise.all([api.get('/driver/orders'), user?.isApproved ? api.get('/driver/orders/available') : Promise.resolve({ ok: false })])
    if (a.ok) setActive(a.data.data || [])
    if (b.ok) setAvailable(b.data.data || [])
    setLoading(false)
  }, [user?.isApproved])

  useEffect(() => { load() }, [load])

  useSocketEvent('order:available', useCallback(({ restaurant }) => {
    toast(`🛵 New delivery from ${restaurant}`)
    showSystemNotification('New delivery available', `Pick up from ${restaurant}`)
    load()
  }, [load]))

  // Share GPS position for orders that are out for delivery
  const onTheWay = active.filter(o => o.orderStatus === 'ontheway').map(o => o._id).join(',')
  useEffect(() => {
    if (!socket || !onTheWay || !navigator.geolocation) { setSharing(false); return }
    let last = 0
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (Date.now() - last < 10000) return    // at most every 10s
        last = Date.now()
        onTheWay.split(',').forEach(orderId =>
          socket.emit('driver:location', { orderId, lat: pos.coords.latitude, lng: pos.coords.longitude }))
        setSharing(true)
      },
      () => setSharing(false),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(watchRef.current)
  }, [socket, onTheWay])

  if (user && !user.isApproved) return (
    <div className="page-wrap max-w-lg mx-auto text-center py-20">
      <title>Rider · MetMoMo</title>
      <div className="text-6xl mb-4">⏳</div>
      <h1 className="font-display font-bold text-2xl text-ink mb-2">Waiting for approval</h1>
      <p className="text-muted">An admin needs to approve your rider account before you can take deliveries. We'll be quick!</p>
    </div>
  )

  return (
    <div className="page-wrap max-w-3xl mx-auto">
      <title>Rider deliveries · MetMoMo</title>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-2xl text-ink">Hi {user?.userName?.split(' ')[0]} 🛵</h1>
          <p className="text-muted text-sm">{active.length} active · {available.length} available</p>
        </div>
        <button onClick={load} className="btn-ghost-pink gap-1.5 text-sm"><RefreshCw size={14}/> Refresh</button>
      </div>

      <div className="flex gap-2 mb-6" role="tablist">
        {[['active', `My deliveries (${active.length})`], ['available', `Available (${available.length})`], ['earnings', 'Earnings']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={tab === k ? 'chip-active' : 'chip-idle'}>
            {k === 'earnings' && <Wallet size={13} className="mr-1"/>}{l}
          </button>
        ))}
      </div>

      {tab === 'earnings' ? <Earnings /> : loading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="skeleton h-56 rounded-3xl" />)}</div>
      ) : tab === 'active' ? (
        active.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-muted">No active deliveries. Check the Available tab.</p>
          </div>
        ) : (
          <div className="space-y-4">{active.map(o => <ActiveCard key={o._id} order={o} onChanged={load} sharing={sharing} />)}</div>
        )
      ) : (
        available.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🍜</div>
            <p className="text-muted">No orders waiting for a rider right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {available.map(o => (
              <AvailableCard key={o._id} order={o}
                onAccepted={(order) => { setAvailable(a => a.filter(x => x._id !== order._id)); setActive(a => [order, ...a]); setTab('active') }}
                onDeclined={(id) => setAvailable(a => a.filter(x => x._id !== id))} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
