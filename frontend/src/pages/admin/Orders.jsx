// Admin Orders
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Package, RefreshCw, ChevronDown, ChevronUp, Download, Undo2 } from 'lucide-react'
import { api, ROUTES, download } from '../../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','preparation','ontheway','delivered','cancelled']
const STATUS_CLS = { pending:'badge-yellow', confirmed:'badge-green', preparation:'badge-pink', ontheway:'badge-gray', delivered:'badge-green', cancelled:'badge-red' }
const EMOJI = { pending:'⏳', confirmed:'✅', preparation:'👨‍🍳', ontheway:'🛵', delivered:'🏠', cancelled:'❌' }

export default function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [params] = useSearchParams()
  const payment = params.get('payment') || ''
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(page), limit: '100' })
    if (payment) qs.set('payment', payment)
    api.get(`${ROUTES.allOrders}?${qs}`)
      .then(({ ok, data }) => { if (ok) { setOrders(data.orders || []); setPages(data.pages || 1); setTotal(data.total || 0) } })
      .finally(() => setLoading(false))
  }, [page, payment])
  useEffect(() => { load() }, [load])

  const exportCsv = async () => {
    const qs = new URLSearchParams()
    if (statusFilter !== 'all') qs.set('status', statusFilter)
    if (payment) qs.set('payment', payment)
    const ok = await download(`${ROUTES.adminOrdersCsv}?${qs}`, `metmomo-orders-${new Date().toISOString().slice(0, 10)}.csv`)
    if (!ok) toast.error('Export failed')
  }

  const markRefunded = async (orderId) => {
    if (!confirm('Confirm you have refunded this payment in Khalti/eSewa?')) return
    const { ok, data } = await api.patch(ROUTES.adminRefund(orderId))
    if (ok) { setOrders(prev => prev.map(o => o._id === orderId ? data.data : o)); toast.success('Marked as refunded') }
    else toast.error(data?.message || 'Could not update')
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId + newStatus)
    const { ok, data } = await api.patch(ROUTES.updateStatus(orderId), { status: newStatus })
    if (ok) { setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o)); toast.success(`→ ${newStatus}`) }
    else toast.error(data.message || 'Update failed')
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const ms = !search || o._id?.toLowerCase().includes(search.toLowerCase()) || o.shippingAddress?.toLowerCase().includes(search.toLowerCase()) || o.user?.userName?.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || o.orderStatus === statusFilter
    return ms && mf
  })

  return (
    <div className="page-wrap">
      <title>Orders · Admin · MetMoMo</title>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">All Orders</h1>
          <p className="text-muted mt-1">{total} total{payment ? ` · payment: ${payment}` : ''}</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={exportCsv} className="btn-outline text-sm gap-2"><Download size={13}/> Export CSV</button>
          <button onClick={load} className="btn-outline text-sm gap-2"><RefreshCw size={13}/> Refresh</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['all',...STATUSES].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`chip ${statusFilter===s?'chip-active':'chip-idle'} text-xs gap-1`}>
            {s !== 'all' && EMOJI[s]} {s} ({s==='all'?orders.length:orders.filter(o=>o.orderStatus===s).length})
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
        <input className="input-field pl-11 rounded-full" placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-20 rounded-3xl"/>)}</div>
      : filtered.length === 0 ? <div className="text-center py-16 text-muted"><Package size={40} className="mx-auto mb-3 opacity-30"/><p>No orders found.</p></div>
      : (
        <div className="space-y-4">
          {filtered.map(o => {
            const isExp = expanded === o._id
            return (
              <div key={o._id} className="card overflow-hidden">
                <div className="p-5 cursor-pointer flex flex-wrap items-start justify-between gap-3" onClick={() => setExpanded(isExp ? null : o._id)}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-bold text-ink text-sm">#{o._id?.slice(-10).toUpperCase()}</span>
                      <span className={`badge ${STATUS_CLS[o.orderStatus]||'badge-gray'} text-[10px]`}>{EMOJI[o.orderStatus]} {o.orderStatus}</span>
                    </div>
                    <p className="text-muted text-xs">{o.createdAt?new Date(o.createdAt).toLocaleString():'—'}</p>
                    {o.user && <p className="text-ink text-xs font-semibold mt-0.5">{o.user.userName} · {o.user.userEmail}</p>}
                    {o.restaurant && <p className="text-muted text-xs">🏪 {o.restaurant.name}{o.driver ? ` · 🛵 ${o.driver.userName}` : ''}</p>}
                    <p className="text-muted text-xs">📍 {o.shippingAddress}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-display font-extrabold text-pink text-xl">NPR {o.totalAmount?.toLocaleString()}</p>
                      <p className="text-muted text-xs">{o.paymentDetails?.method} · {o.paymentDetails?.status}</p>
                    </div>
                    {isExp ? <ChevronUp size={15} className="text-muted"/> : <ChevronDown size={15} className="text-muted"/>}
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-faint px-5 pb-5 pt-3 space-y-4 animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                      {(o.items||[]).map((item,i)=>(
                        <div key={i} className="flex items-center gap-1.5 bg-pink-50 border border-pink-100 rounded-xl px-3 py-1.5 text-xs">
                          <span className="font-display font-bold text-ink">{item.name||item.product?.productName||'Item'}</span>
                          <span className="text-muted">×{item.quantity}</span>
                          <span className="text-pink font-bold">NPR {((item.price||0)*item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-muted uppercase tracking-wider mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map(s => (
                          <button key={s} disabled={o.orderStatus===s||!!updating} onClick={()=>updateStatus(o._id,s)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-bold border-2 transition-all ${o.orderStatus===s?'bg-pink text-white border-pink shadow-pink-sm':'bg-white text-muted border-faint hover:border-pink hover:text-pink'}`}>
                            {updating===o._id+s?<span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/>:EMOJI[s]} {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {o.paymentDetails?.status === 'refund_pending' && (
                      <button onClick={() => markRefunded(o._id)} className="btn-outline text-sm gap-2"><Undo2 size={13}/> Mark refund as done</button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-2 disabled:opacity-40">← Prev</button>
          <span className="text-sm text-muted">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-outline py-2 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
