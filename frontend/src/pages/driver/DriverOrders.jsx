import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { RefreshCw, MapPin, Phone, Mail, CheckCircle, Package } from 'lucide-react'

function OrderCard({ order, onDelivered }) {
  const [confirming, setConfirming] = useState(false)
  const customer = order.user

  const handleConfirm = async () => {
    if (!confirm('Confirm this order has been delivered?')) return
    setConfirming(true)
    const { ok, data } = await api.patch(`/driver/orders/${order._id}/delivered`)
    if (ok) { toast.success('Delivery confirmed!'); onDelivered(order._id) }
    else toast.error(data?.message || 'Could not confirm')
    setConfirming(false)
  }

  return (
    <div className="card overflow-hidden border-orange-200">
      <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400" />
      <div className="p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-display font-bold text-ink">
              Order #{order._id?.slice(-6).toUpperCase()}
            </p>
            <p className="text-muted text-xs">
              {new Date(order.createdAt).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <span className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
            🛵 Out for Delivery
          </span>
        </div>

        {/* Delivery address */}
        <div className="bg-pink-50 rounded-2xl px-4 py-3 flex items-start gap-2">
          <MapPin size={15} className="text-pink-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-0.5">Deliver To</p>
            <p className="text-sm font-semibold text-ink">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 space-y-1.5">
          <p className="text-xs font-bold text-muted uppercase tracking-wider">Customer</p>
          <p className="font-semibold text-ink text-sm">{customer?.userName}</p>
          {customer?.userPhoneNumber && (
            <a href={`tel:${customer.userPhoneNumber}`}
              className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:underline">
              <Phone size={11}/> {customer.userPhoneNumber}
            </a>
          )}
          {customer?.userEmail && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Mail size={11}/> {customer.userEmail}
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Items</p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                  {item.product?.productImage
                    ? <img src={item.product.productImage} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-lg">🍜</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{item.product?.productName}</p>
                  <p className="text-muted text-xs">{item.product?.productCategory}</p>
                </div>
                <p className="font-bold text-pink text-sm shrink-0">
                  NPR {item.product?.productPrice?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total + confirm button */}
        <div className="flex items-center justify-between pt-2 border-t border-faint">
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="font-display font-extrabold text-pink text-lg">
              NPR {order.totalAmount?.toLocaleString()}
            </p>
          </div>
          <button onClick={handleConfirm} disabled={confirming}
            className="btn-pink gap-2 rounded-xl py-2.5 px-5">
            {confirming
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <CheckCircle size={15}/>}
            {confirming ? 'Confirming…' : 'Confirm Delivery'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DriverOrders() {
  const { user, logout } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { ok, data } = await api.get('/driver/orders')
    if (ok) setOrders(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelivered = (orderId) => {
    setOrders(prev => prev.filter(o => o._id !== orderId))
  }

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Driver header bar */}
      <div className="bg-white border-b border-faint sticky top-0 z-40 shadow-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-500 text-white font-display font-black text-base flex items-center justify-center shadow-sm">
              🛵
            </div>
            <div>
              <p className="font-display font-bold text-ink text-sm">{user?.userName}</p>
              <p className="text-muted text-[11px]">Delivery Driver</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="w-9 h-9 rounded-xl bg-pink-50 text-pink flex items-center justify-center hover:bg-pink-100 transition-colors">
              <RefreshCw size={15}/>
            </button>
            <button onClick={logout}
              className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-black text-2xl text-ink">Pending Deliveries</h1>
            <p className="text-muted text-sm mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} to deliver</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-56 rounded-3xl"/>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-display font-bold text-xl text-ink mb-2">No deliveries right now</h3>
            <p className="text-muted text-sm mb-5">Orders marked "Out for Delivery" will appear here.</p>
            <button onClick={load} className="btn-pink gap-2"><RefreshCw size={14}/> Refresh</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} onDelivered={handleDelivered}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
