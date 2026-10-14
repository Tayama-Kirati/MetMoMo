// Admin Dashboard
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ShoppingBag, TrendingUp, ArrowRight, Store, Percent, Bike } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

const fmt = (n) => `NPR ${Math.round(n || 0).toLocaleString()}`

// Orders per day, last 30 days — single series, hover a bar for its values
function DailyOrders({ daily }) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const row = daily.find(x => x.date === key)
    days.push({ key, label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), orders: row?.orders || 0, revenue: row?.revenue || 0 })
  }
  const max = Math.max(1, ...days.map(d => d.orders))
  const total = days.reduce((s, d) => s + d.orders, 0)
  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-lg text-ink">Orders per day</h2>
      <p className="text-muted text-xs mb-4">Last 30 days · {total} orders (excluding cancelled)</p>
      <div className="flex items-end gap-[2px] h-40 border-b border-faint" role="img" aria-label={`Orders per day over the last 30 days, ${total} in total.`}>
        {days.map(d => (
          <div key={d.key} className="group relative flex-1 h-full flex items-end">
            <div className="w-full rounded-t-[4px] bg-pink group-hover:opacity-80" style={{ height: `${(d.orders / max) * 100}%`, minHeight: d.orders ? 2 : 0 }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 text-white text-[11px] px-2 py-1 z-10">
              {d.label} · {d.orders} orders · {fmt(d.revenue)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1.5">
        <span>{days[0].label}</span><span>{days[15].label}</span><span>Today</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(ROUTES.adminStats), api.get(`${ROUTES.allOrders}?limit=8`)])
      .then(([s, o]) => {
        if (s.ok) setStats(s.data.data)
        if (o.ok) setOrders(o.data.orders || [])
      }).finally(() => setLoading(false))
  }, [])

  const totalOrders = stats ? Object.values(stats.orders).reduce((a, b) => a + b, 0) : 0
  const STATS = stats ? [
    { label: 'Total orders',     value: totalOrders.toLocaleString(),                  icon: <ShoppingBag size={22}/>, color: 'text-pink',       bg: 'bg-pink-50 border-pink-200',     to: '/admin/orders' },
    { label: 'Delivered sales',  value: fmt(stats.revenue.gmv),                        icon: <TrendingUp size={22}/>,  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   to: '/admin/payouts' },
    { label: 'Commission',       value: fmt(stats.revenue.commission),                 icon: <Percent size={22}/>,     color: 'text-green-600',  bg: 'bg-green-50 border-green-200',   to: '/admin/payouts' },
    { label: 'Customers',        value: (stats.users.customer || 0).toLocaleString(),  icon: <Users size={22}/>,       color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200', to: '/admin/users' },
    { label: 'Riders',           value: (stats.users.delivery_rider || 0).toLocaleString(), icon: <Bike size={22}/>,  color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-200',     to: '/admin/users' },
  ] : []

  const pending = stats?.pending || {}
  const QUEUE = [
    { n: pending.restaurants, label: 'restaurants to approve', to: '/admin/approvals' },
    { n: pending.riders,      label: 'riders to approve',      to: '/admin/approvals' },
    { n: pending.reportedReviews, label: 'reported reviews',   to: '/admin/reviews' },
    { n: pending.refunds,     label: 'refunds to process',     to: '/admin/orders?payment=refund_pending' },
  ].filter(q => q.n > 0)

  const STATUS_CLS = { pending:'badge-yellow', confirmed:'badge-green', preparation:'badge-pink', ontheway:'badge-gray', delivered:'badge-green', cancelled:'badge-red' }

  return (
    <div className="page-wrap">
      <title>Admin dashboard · MetMoMo</title>
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink">Admin Dashboard</h1>
        <p className="text-muted mt-1">Overview of the MetMoMo platform</p>
      </div>

      {QUEUE.length > 0 && (
        <div className="card p-4 mb-8 border-yellow-200 bg-yellow-50 flex flex-wrap gap-3 items-center">
          <span className="font-display font-bold text-ink text-sm">Needs attention:</span>
          {QUEUE.map(q => (
            <Link key={q.label} to={q.to} className="text-sm font-semibold text-yellow-800 bg-white border border-yellow-200 rounded-full px-3 py-1 hover:border-yellow-400">
              {q.n} {q.label} →
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {(loading ? Array.from({ length: 5 }) : STATS).map((s, i) => s ? (
          <Link key={s.label} to={s.to} className="card p-5 hover:shadow-card-lg transition-all group">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${s.bg} ${s.color}`}>{s.icon}</div>
            <p className="font-display font-black text-2xl text-ink mb-0.5 tabular-nums">{s.value}</p>
            <p className="text-muted text-sm">{s.label}</p>
          </Link>
        ) : <div key={i} className="skeleton h-36 rounded-3xl" />)}
      </div>

      {stats && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2"><DailyOrders daily={stats.daily} /></div>
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4">Top restaurants</h2>
            {stats.topRestaurants.length === 0 ? <p className="text-sm text-muted">No delivered orders yet.</p> : (
              <ol className="space-y-3">
                {stats.topRestaurants.map((r, i) => (
                  <li key={r._id} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-ink truncate"><span className="text-muted mr-2">{i + 1}.</span>{r.name}</span>
                    <span className="text-ink tabular-nums shrink-0">{fmt(r.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { to:'/admin/approvals',   label:'Approvals',          icon:'✅', desc:'New restaurants & riders' },
          { to:'/admin/restaurants', label:'Restaurants',        icon:'🏪', desc:'Add & edit restaurants'   },
          { to:'/admin/products',    label:'Products',           icon:'📦', desc:'Add, edit & delete items' },
          { to:'/admin/users',       label:'Users',              icon:'👥', desc:'Block or remove accounts' },
          { to:'/admin/orders',      label:'Orders',             icon:'🛒', desc:'Status, refunds, CSV'     },
          { to:'/admin/coupons',     label:'Coupons',            icon:'🏷️', desc:'Promo codes'              },
          { to:'/admin/payouts',     label:'Payouts & settings', icon:'💰', desc:'Commission & payouts'     },
          { to:'/admin/reviews',     label:'Reported reviews',   icon:'🚩', desc:'Moderate reviews'         },
        ].map(q => (
          <Link key={q.to} to={q.to} className="card p-5 hover:shadow-card-lg hover:-translate-y-1 transition-all group">
            <div className="text-3xl mb-3">{q.icon}</div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-display font-bold text-ink text-sm">{q.label}</h3><p className="text-muted text-xs">{q.desc}</p></div>
              <ArrowRight size={16} className="text-muted group-hover:text-pink group-hover:translate-x-1 transition-all"/>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-ink">Recent Orders</h2>
          <Link to="/admin/orders" className="btn-ghost-pink text-sm gap-1">View all <ArrowRight size={13}/></Link>
        </div>
        {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-14 rounded-2xl"/>)}</div> : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-faint bg-pink-50/50">
                  {['Order ID','Restaurant','Status','Amount'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-display font-bold text-muted uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-faint">
                  {orders.map(o=>(
                    <tr key={o._id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-display font-bold text-ink text-sm">#{o._id?.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-muted text-sm max-w-[160px] truncate">{o.restaurant?.name || '—'}</td>
                      <td className="px-5 py-3.5"><span className={`badge ${STATUS_CLS[o.orderStatus]||'badge-gray'} text-[10px]`}>{o.orderStatus}</span></td>
                      <td className="px-5 py-3.5 font-display font-bold text-ink tabular-nums">{fmt(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
