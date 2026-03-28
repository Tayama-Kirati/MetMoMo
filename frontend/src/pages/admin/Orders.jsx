import { useEffect, useState } from 'react'
import { Search, Package, RefreshCw } from 'lucide-react'
import { api , ROUTES} from '../../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','preparation','ontheway','delivered','cancelled']
const STATUS_CLS = { pending:'badge-gold', preparation:'badge-primary', ontheway:'badge-gray', delivered:'badge-green', cancelled:'badge-gray' }
const STATUS_EMOJI = { pending:'⏳', preparation:'👨‍🍳', ontheway:'🛵', delivered:'✅', cancelled:'❌' }

export default function AdminOrders() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [updating, setUpdating]   = useState(null)

  const load = () => {
    setLoading(true)
    api.get(ROUTES.allOrders()).then(({ ok, data }) => { if (ok) setOrders(data.orders || []) })
      .catch(() => api.get(ROUTES.orders()).then(({ ok, data }) => { if (ok) setOrders(data.orders || []) }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    const ms = !search || o._id?.includes(search) || o.shippingAddress?.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || o.orderStatus === statusFilter
    return ms && mf
  })

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    // Optimistic update since no PATCH /orders/:id endpoint exists — add it or use optimistic
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    toast.success(`Status updated to ${newStatus}`)
    setUpdating(null)
  }

  const totalRevenue = orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0)

  return (
    <div className="wrap py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-label font-body text-orange-500"> Admin</span>
          <h1 className="section-title font-body">Orders</h1>
          <p className="section-sub">{orders.length} total · NPR {totalRevenue.toLocaleString()} delivered revenue</p>
        </div>
        <button onClick={load} className="btn-secondary font-body font-thin gap-2 text-sm self-start">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
          <input className="input-field pl-11" placeholder="Search by order ID or address..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`chip ${statusFilter === s ? 'chip-active' : 'chip-idle'} capitalize text-xs`}>
              {s === 'all' ? 'All' : `${STATUS_EMOJI[s]} ${s}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-body font-medium text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(o => (
            <div key={o._id} className="card p-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={14} className="text-primary" />
                    <span className="font-body font-extrabold text-charcoal text-sm">#{o._id?.slice(-10).toUpperCase()}</span>
                    <span className={`badge ${STATUS_CLS[o.orderStatus] || 'badge-gray'}`}>{STATUS_EMOJI[o.orderStatus]} {o.orderStatus}</span>
                  </div>
                  <p className="text-slate text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</p>
                  <p className="text-charcoal text-sm mt-1">📍 {o.shippingAddress}</p>
                  {o.user && <p className="text-slate text-xs">Customer: {o.user.userName} ({o.user.userEmail})</p>}
                </div>
                <div className="text-right">
                  <p className="font-body font-extrabold text-primary text-2xl">NPR {o.totalAmount?.toLocaleString()}</p>
                  <p className="text-slate text-xs">{o.paymentDetails?.method} · {o.paymentDetails?.status}</p>
                </div>
              </div>

              {/* Items chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(o.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-cream border border-slate-faint rounded-xl px-3 py-1.5 text-xs">
                    <span className="font-body font-bold text-charcoal">{item.product?.productName || 'Item'}</span>
                    <span className="text-slate">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Status update */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-faint">
                <span className="text-xs font-body font-bold text-slate uppercase tracking-wider mr-1">Update status:</span>
                {STATUSES.map(s => (
                  <button key={s} disabled={o.orderStatus === s || updating === o._id} onClick={() => updateStatus(o._id, s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-body font-bold border-2 transition-all
                      ${o.orderStatus === s ? 'bg-primary text-white border-primary' : 'bg-white text-slate border-slate-faint hover:border-primary hover:text-primary'}`}>
                    {STATUS_EMOJI[s]} {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}