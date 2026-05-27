import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Edit3, Bell, LogOut, Star, RefreshCw, ChevronDown, ChevronUp, Clock, Package, CheckCircle, XCircle, Truck, ChefHat } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS = {
  pending:     { label: 'Pending',    icon: <Clock size={12}/>,        cls: 'badge-yellow', step: 0 },
  confirmed:   { label: 'Confirmed',  icon: <CheckCircle size={12}/>,  cls: 'badge-green',  step: 1 },
  preparation: { label: 'Preparing',  icon: <ChefHat size={12}/>,      cls: 'badge-pink',   step: 2 },
  ontheway:    { label: 'On the Way', icon: <Truck size={12}/>,        cls: 'badge-gray',   step: 3 },
  delivered:   { label: 'Delivered',  icon: <CheckCircle size={12}/>,  cls: 'badge-green',  step: 4 },
  cancelled:   { label: 'Cancelled',  icon: <XCircle size={12}/>,      cls: 'badge-red',    step: -1 },
}

const TRACK_STEPS = [
  { label: 'Placed',      icon: '📋' },
  { label: 'Confirmed',   icon: '✅' },
  { label: 'Preparing',   icon: '👨‍🍳' },
  { label: 'On the Way',  icon: '🛵' },
  { label: 'Delivered',   icon: '🏠' },
]

// Sidebar matches the screenshot exactly
function Sidebar({ active }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); toast.success('Bye!'); navigate('/') }

  const links = [
    { to: '/orders',  icon: <ShoppingBag size={16}/>, label: 'My Order' },
    { to: '/profile', icon: <Edit3 size={16}/>,       label: 'Edit My Profile' },
    { to: '/profile', icon: <Bell size={16}/>,         label: 'Notifications' },
  ]

  return (
    <aside className="w-56 shrink-0">
      <div className="card p-4 sticky top-24">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4 mb-4 border-b border-faint">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black text-2xl flex items-center justify-center shadow-pink-sm mb-2">
            {user?.userName?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="font-display font-bold text-ink text-sm">{user?.userName}</p>
          <p className="text-muted text-xs truncate w-full text-center">{user?.userEmail}</p>
        </div>

        <nav className="space-y-1">
          {links.map(l => (
            <Link key={l.label} to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold transition-colors
                ${active === l.to ? 'bg-pink-50 text-pink' : 'text-slate hover:bg-pink-50 hover:text-pink'}`}>
              {l.icon} {l.label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16}/> Logout
          </button>
        </nav>
      </div>
    </aside>
  )
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [ratingVal, setRatingVal] = useState(0)
  const [savingRating, setSavingRating] = useState(false)
  const st = STATUS[order.orderStatus] || STATUS.pending
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus)
  const canRate   = order.orderStatus === 'delivered' && !order.rating
  const isActive  = ['pending', 'confirmed', 'preparation', 'ontheway'].includes(order.orderStatus)

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    const { ok, data } = await api.delete(ROUTES.cancelOrder(order._id))
    if (ok) toast.success('Order cancelled')
    else toast.error(data.message || 'Cannot cancel now')
    setCancelling(false)
  }

  const handleRate = async () => {
    if (!ratingVal) { toast.error('Select a star rating'); return }
    setSavingRating(true)
    const { ok } = await api.post(ROUTES.rateOrder(order._id), { rating: ratingVal })
    if (ok) toast.success('Thanks for rating! ⭐')
    setSavingRating(false)
  }

  return (
    <div className={`card overflow-hidden transition-all ${isActive ? 'border-pink/40 shadow-pink-sm' : ''}`}>
      {isActive && <div className="h-1 bg-gradient-to-r from-pink via-rose-dark to-pink bg-[length:200%] animate-shimmer" />}

      {/* Main row — matches screenshot layout */}
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        {/* Restaurant logo / product image */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-pink-50 border border-faint shrink-0">
          {order.items?.[0]?.product?.productImage
            ? <img src={order.items[0].product.productImage} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display font-bold text-ink text-sm truncate">
              {order.restaurant?.name || order.items?.[0]?.product?.productName || 'MoMoGo Order'}
            </p>
            <span className={`badge ${st.cls} text-[9px] flex items-center gap-0.5 shrink-0`}>{st.icon}{st.label}</span>
          </div>
          <p className="text-muted text-xs">
            {order.shippingAddress}<br/>
            Order No. #{order._id?.slice(-5).toUpperCase()} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '—'}
          </p>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          <p className="font-display font-extrabold text-pink">Rs.{order.totalAmount?.toLocaleString()}.0</p>
          {/* ORDER DELIVERED / status chip matching screenshot */}
          <span className={`text-[9px] font-display font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border
            ${order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' :
              order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-500 border-red-200' :
              'bg-pink-50 text-pink border-pink-200'}`}>
            ORDER {order.orderStatus?.toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-faint px-4 pb-4 pt-3 space-y-4 animate-fade-in">

          {/* Live tracker */}
          {!['cancelled'].includes(order.orderStatus) && (
            <div className="bg-pink-50 rounded-2xl p-4">
              <p className="font-display font-bold text-ink text-xs mb-3">Order Tracking</p>
              <div className="flex items-center overflow-x-auto pb-1">
                {TRACK_STEPS.map((s, i) => {
                  const done   = st.step > i
                  const active = st.step === i
                  return (
                    <div key={s.label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all
                          ${done ? 'bg-pink border-pink text-white shadow-pink-sm' :
                            active ? 'bg-white border-pink text-pink animate-pulse' :
                            'bg-white border-faint text-muted'}`}>
                          {done ? '✓' : s.icon}
                        </div>
                        <span className={`text-[9px] font-display font-bold mt-1 text-center ${done || active ? 'text-ink' : 'text-muted'}`}>{s.label}</span>
                      </div>
                      {i < TRACK_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-3 rounded-full ${st.step > i ? 'bg-pink' : 'bg-faint'}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Delivery agent */}
              {['ontheway', 'preparation'].includes(order.orderStatus) && order.tracking?.deliveryAgent?.name && (
                <div className="mt-3 bg-white rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl">🛵</span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-ink text-sm">{order.tracking.deliveryAgent.name}</p>
                    <p className="text-muted text-xs">{order.tracking.deliveryAgent.vehicle}</p>
                  </div>
                  <a href={`tel:${order.tracking.deliveryAgent.phone}`}
                    className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center text-sm hover:bg-green-600 transition-colors">📞</a>
                </div>
              )}
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 border border-faint shrink-0">
                  {item.product?.productImage
                    ? <img src={item.product.productImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-base">🍜</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-ink text-sm truncate">{item.product?.productName || 'Item'}</p>
                  <p className="text-muted text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="text-pink font-display font-bold text-sm">NPR {(item.price * item.quantity)?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Rate */}
          {canRate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="font-display font-bold text-ink text-sm mb-2">Rate your order</p>
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRatingVal(n)}
                    className={`text-2xl transition-transform hover:scale-125 ${n <= ratingVal ? 'text-yellow-400' : 'text-faint'}`}>★</button>
                ))}
              </div>
              <button onClick={handleRate} disabled={savingRating} className="btn-pink text-sm py-2 px-4 gap-2 rounded-xl">
                {savingRating ? <span className="spinner" /> : <Star size={13}/>} Submit Rating
              </button>
            </div>
          )}

          {order.rating && (
            <p className="text-sm text-slate">You rated: {'⭐'.repeat(order.rating)}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling} className="btn-outline text-red-500 border-red-200 hover:bg-red-50 text-sm py-2 px-4 rounded-xl gap-1">
                {cancelling ? <span className="spinner-pink" /> : <XCircle size={13}/>} Cancel Order
              </button>
            )}
            <Link to="/restaurants" className="btn-soft text-sm py-2 px-4 rounded-xl gap-1">
              <RefreshCw size={13}/> Reorder
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const { pathname } = useLocation()

  const load = () => {
    setLoading(true)
    api.get(ROUTES.orders).then(({ ok, data }) => { if (ok) setOrders(data.orders || []) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="page-wrap">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar active="/orders" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header bar matching screenshot */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-faint">
            <div className="flex-1">
              <p className="text-slate text-sm">Order food from the widest range of restaurants.</p>
            </div>
            <Link to="/restaurants" className="btn-pink text-sm gap-1.5 ml-4">
              Find Restaurants
            </Link>
          </div>

          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-ink">Previous Orders</h2>
            <button onClick={load} className="btn-ghost gap-1.5 text-sm"><RefreshCw size={13}/> Refresh</button>
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-3xl" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">No orders yet</h3>
              <p className="text-muted mb-6">Place your first order!</p>
              <Link to="/restaurants" className="btn-pink">Browse Menu</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => <OrderCard key={order._id} order={order} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
