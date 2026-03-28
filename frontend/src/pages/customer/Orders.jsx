import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat, ArrowRight, RefreshCw } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

const STATUS = {
  pending:     { label: 'Pending',     icon: <Clock size={13}/>,        cls: 'badge-gold',    step: 0 },
  preparation: { label: 'Preparing',   icon: <ChefHat size={13}/>,      cls: 'badge-primary', step: 1 },
  ontheway:    { label: 'On the Way',  icon: <Truck size={13}/>,        cls: 'badge-gray',    step: 2 },
  delivered:   { label: 'Delivered',   icon: <CheckCircle size={13}/>,  cls: 'badge-green',   step: 3 },
  cancelled:   { label: 'Cancelled',   icon: <XCircle size={13}/>,      cls: 'badge-gray',    step: -1 },
}

const TRACK_STEPS = [
  { label: 'Order Placed', icon: '📋' },
  { label: 'Preparing',    icon: '👨‍🍳' },
  { label: 'On the Way',   icon: '🛵' },
  { label: 'Delivered',    icon: '✅' },
]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get(ROUTES.orders).then(({ ok, data }) => {
      if (ok) setOrders(data.orders || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter)

  if (loading) return (
    <div className="wrap py-12 space-y-4">
      <div className="skeleton h-10 w-48 rounded-2xl mb-8" />
      {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-3xl" />)}
    </div>
  )

  return (
    <div className="wrap py-10">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="section-title font-body font-bold">My Orders</h1>
          <p className="section-sub">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary font-body font-thin gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {[
          { k: 'all', l: 'All Orders' },
          { k: 'pending', l: 'Pending' },
          { k: 'preparation', l: 'Preparing' },
          { k: 'ontheway', l: 'On the Way' },
          { k: 'delivered', l: 'Delivered' },
          { k: 'cancelled', l: 'Cancelled' },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`chip ${filter === f.k ? 'chip-active' : 'chip-idle'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-28">
          <div className="w-28 h-28 bg-cream-dark rounded-4xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-card">📦</div>
          <h2 className="font-body font-extrabold text-2xl text-charcoal mb-3">No orders yet</h2>
          <p className="text-slate mb-8">Place your first order and it'll show up here!</p>
          <Link to="/menu" className="btn-primary font-body gap-2 px-8 py-4 text-base">Browse Menu <ArrowRight size={16}/></Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(order => {
            const s = STATUS[order.orderStatus] || STATUS.pending
            const isExpanded = expanded === order._id
            return (
              <div key={order._id} className="card overflow-hidden">
                {/* Order header */}
                <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={14} className="text-primary" />
                      <span className="font-body font-extrabold text-charcoal text-sm">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${s.cls} flex items-center gap-1`}>{s.icon} {s.label}</span>
                    <span className={`badge ${order.paymentDetails?.status === 'paid' ? 'badge-green' : 'badge-gold'}`}>
                      {order.paymentDetails?.method || 'COD'} · {order.paymentDetails?.status || 'unpaid'}
                    </span>
                  </div>
                </div>

                {/* Progress tracker for active orders */}
                {order.orderStatus !== 'cancelled' && (
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-0">
                      {TRACK_STEPS.map((t, i) => {
                        const done  = s.step > i
                        const active = s.step === i
                        return (
                          <div key={t.label} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all
                                ${done ? 'bg-primary border-primary text-white' : active ? 'bg-primary-50 border-primary text-primary' : 'bg-white border-slate-faint text-slate-faint'}`}>
                                {t.icon}
                              </div>
                              <span className={`text-[9px] font-display font-bold mt-1 text-center leading-tight ${done || active ? 'text-charcoal' : 'text-slate-light'}`}>{t.label}</span>
                            </div>
                            {i < TRACK_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 mb-3 transition-all ${s.step > i ? 'bg-primary' : 'bg-slate-faint'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="border-t border-slate-faint px-5 py-4 space-y-3">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-dark shrink-0 border border-slate-faint">
                        {item.product?.productImage
                          ? <img src={item.product.productImage} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🍜</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-charcoal text-sm truncate">{item.product?.productName || 'Momo Item'}</p>
                        <p className="text-slate text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-body font-bold text-charcoal text-sm shrink-0">
                        NPR {((item.product?.productPrice || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-faint bg-cream/50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-slate text-sm flex items-center gap-1.5 flex-wrap">
                    📍 <span>{order.shippingAddress}</span>
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-black text-m">Total</span>
                      <p className="font-body font-semibold  text-primary text-xl">NPR {order.totalAmount?.toLocaleString()}</p>
                    </div>
                    <Link to="/menu" className="btn-secondary font-body font-thin text-sm py-2 px-4 gap-1">Reorder</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}