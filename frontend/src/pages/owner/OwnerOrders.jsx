import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { RefreshCw, ChevronDown, ChevronUp, Clock, Phone, Mail, Package } from 'lucide-react'

const STATUS_FLOW = ['pending', 'confirmed', 'preparation', 'ontheway', 'delivered']

const STATUS_STYLE = {
  pending:     { label: 'Pending',    bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  confirmed:   { label: 'Confirmed',  bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  preparation: { label: 'Preparing',  bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
  ontheway:    { label: 'On the Way', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  delivered:   { label: 'Delivered',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  cancelled:   { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-600',    border: 'border-red-200'    },
}

const NEXT_ACTIONS = {
  pending:     { label: 'Confirm Order',    next: 'confirmed'   },
  confirmed:   { label: 'Start Preparing',  next: 'preparation' },
  preparation: { label: 'Out for Delivery', next: 'ontheway'    },
  // ontheway: customer confirms delivery — no owner action here
}

function OrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded]   = useState(false)
  const [updating, setUpdating]   = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const st = STATUS_STYLE[order.orderStatus] || STATUS_STYLE.pending
  const nextAction = NEXT_ACTIONS[order.orderStatus]
  const customer = order.user

  const advance = async () => {
    if (!nextAction) return
    setUpdating(true)
    const { ok, data } = await api.patch(`/owner/orders/${order._id}/status`, { status: nextAction.next })
    if (ok) { toast.success(`Order marked as ${nextAction.next}`); onStatusUpdate(order._id, nextAction.next) }
    else toast.error(data?.message || 'Update failed')
    setUpdating(false)
  }

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    const { ok, data } = await api.patch(`/owner/orders/${order._id}/status`, { status: 'cancelled' })
    if (ok) { toast.success('Order cancelled'); onStatusUpdate(order._id, 'cancelled') }
    else toast.error(data?.message || 'Cancel failed')
    setCancelling(false)
  }

  return (
    <div className={`card overflow-hidden ${['pending','confirmed','preparation'].includes(order.orderStatus) ? 'border-pink/30' : ''}`}>
      {['pending','confirmed','preparation'].includes(order.orderStatus) && (
        <div className="h-1 bg-gradient-to-r from-pink via-rose-400 to-pink bg-[length:200%] animate-shimmer" />
      )}

      {/* Header row */}
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-ink text-sm">
              #{order._id?.slice(-6).toUpperCase()}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
              {st.label}
            </span>
            {order.paymentDetails?.method && (
              <span className="text-[10px] text-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                {order.paymentDetails.method}
              </span>
            )}
          </div>
          <p className="text-muted text-xs mt-0.5">
            <span className="font-semibold text-ink">{customer?.userName || 'Customer'}</span>
            {' · '}{new Date(order.createdAt).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-extrabold text-pink">NPR {order.totalAmount?.toLocaleString()}</p>
          <p className="text-muted text-xs">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted shrink-0"/> : <ChevronDown size={16} className="text-muted shrink-0"/>}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-faint px-4 pb-4 pt-3 space-y-4">

          {/* Customer info */}
          <div className="bg-pink-50 rounded-2xl p-3 space-y-1.5">
            <p className="text-xs font-display font-bold text-pink-600 uppercase tracking-wider">Customer</p>
            <p className="font-semibold text-ink text-sm">{customer?.userName}</p>
            {customer?.userEmail && (
              <p className="text-xs text-muted flex items-center gap-1.5"><Mail size={11}/>{customer.userEmail}</p>
            )}
            {customer?.userPhoneNumber && (
              <p className="text-xs text-muted flex items-center gap-1.5"><Phone size={11}/>{customer.userPhoneNumber}</p>
            )}
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Package size={11}/>{order.shippingAddress}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                    {item.product?.productImage
                      ? <img src={item.product.productImage} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-lg">🍜</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{item.product?.productName || 'Item'}</p>
                    <p className="text-muted text-xs">{item.product?.productCategory} · Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-pink text-sm shrink-0">
                    NPR {((item.product?.productPrice || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress steps */}
          {order.orderStatus !== 'cancelled' && (
            <div className="flex items-center gap-1">
              {STATUS_FLOW.map((s, i) => {
                const reached = STATUS_FLOW.indexOf(order.orderStatus) >= i
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-full h-1.5 rounded-full ${reached ? 'bg-pink' : 'bg-pink-100'}`}/>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 flex-col">
            {order.orderStatus === 'ontheway' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-700 font-semibold text-center">
                🛵 Waiting for customer to confirm delivery
              </div>
            )}
            <div className="flex gap-2">
              {nextAction && (
                <button onClick={advance} disabled={updating}
                  className="btn-pink flex-1 justify-center text-sm py-2.5 gap-2 rounded-xl">
                  {updating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {nextAction.label}
                </button>
              )}
              {!['delivered','cancelled','ontheway'].includes(order.orderStatus) && (
                <button onClick={cancel} disabled={cancelling}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  {cancelling ? '...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FILTERS = ['all', 'pending', 'confirmed', 'preparation', 'ontheway', 'delivered', 'cancelled']

export default function OwnerOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  const load = async () => {
    setLoading(true)
    const { ok, data } = await api.get('/owner/orders')
    if (ok) setOrders(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter)

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? orders.length : orders.filter(o => o.orderStatus === f).length
    return acc
  }, {})

  const newOrders = orders.filter(o => o.orderStatus === 'pending').length

  return (
    <div className="page-wrap max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-ink">
            Orders
            {newOrders > 0 && (
              <span className="ml-2 bg-pink text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {newOrders} new
              </span>
            )}
          </h1>
          <p className="text-muted text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={load} className="btn-ghost gap-1.5 text-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f
                ? 'bg-pink text-white shadow-pink-sm'
                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            }`}>
            {f === 'all' ? 'All' : STATUS_STYLE[f]?.label}
            {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-display font-bold text-ink text-lg mb-1">
            {filter === 'all' ? 'No orders yet' : `No ${STATUS_STYLE[filter]?.label?.toLowerCase()} orders`}
          </p>
          <p className="text-muted text-sm">Orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
