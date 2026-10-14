import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, UtensilsCrossed, PlusCircle, ToggleLeft, ToggleRight, ArrowRight, AlertCircle, TrendingUp, ShoppingBag, Clock, DollarSign } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

/* ── Mini bar chart ─────────────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[9px] text-muted font-semibold hidden sm:block">
            {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ''}
          </span>
          <div className="w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t from-pink to-rose-400"
            style={{ height: `${Math.max((d.revenue / max) * 80, d.revenue > 0 ? 6 : 2)}px` }} />
          <span className="text-[8px] text-muted text-center truncate w-full">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stat card ───────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = 'pink' }) {
  const colors = {
    pink:   { bg: 'bg-pink-50   border-pink-200',   text: 'text-pink-600',   icon: 'bg-pink-100'   },
    green:  { bg: 'bg-green-50  border-green-200',  text: 'text-green-600',  icon: 'bg-green-100'  },
    blue:   { bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-600',   icon: 'bg-blue-100'   },
    orange: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', icon: 'bg-orange-100' },
  }
  const c = colors[color] || colors.pink
  return (
    <div className={`card p-5 border ${c.bg}`}>
      <div className={`w-10 h-10 rounded-2xl ${c.icon} flex items-center justify-center mb-3`}>
        <span className={c.text}>{icon}</span>
      </div>
      <p className={`font-display font-black text-2xl ${c.text} mb-0.5`}>{value}</p>
      <p className="font-semibold text-ink text-sm">{label}</p>
      {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

const fmt = (n) => n >= 1000 ? `NPR ${(n / 1000).toFixed(1)}k` : `NPR ${n}`

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts]     = useState([])
  const [finance, setFinance]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(false)
  const [period, setPeriod]         = useState('daily') // 'daily' | 'weekly' | 'monthly'

  useEffect(() => {
    Promise.all([
      api.get('/owner/restaurant'),
      api.get('/owner/products'),
      api.get('/owner/finance'),
    ]).then(([r, p, f]) => {
      if (r.ok && r.data.data) setRestaurant(r.data.data)
      if (p.ok) setProducts(p.data.data || [])
      if (f.ok) setFinance(f.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const toggleOpen = async () => {
    if (!restaurant) return
    setToggling(true)
    const fd = new FormData()
    fd.append('isOpen', String(!restaurant.isOpen))
    const { ok, data } = await api.patchForm('/owner/restaurant', fd)
    if (ok) { setRestaurant(data.data); toast.success(`Restaurant is now ${data.data.isOpen ? 'Open' : 'Closed'}`) }
    else toast.error('Could not update status')
    setToggling(false)
  }

  const available   = products.filter(p => p.productStatus === 'available').length
  const unavailable = products.length - available

  const chartData = period === 'daily' ? finance?.daily
    : period === 'weekly' ? finance?.weekly
    : finance?.monthly

  const QUICK = [
    { to: '/owner/restaurant', icon: '🏪', label: 'Restaurant Info',  desc: 'Edit name, address, hours' },
    { to: '/owner/menu',       icon: '📋', label: 'View Menu',         desc: 'See all your items' },
    { to: '/owner/add-item',   icon: '➕', label: 'Add Food Item',     desc: 'List a new dish' },
    { to: '/owner/orders',     icon: '📦', label: 'View Orders',       desc: 'Manage incoming orders' },
  ]

  if (loading) return (
    <div className="page-wrap space-y-4">
      <div className="skeleton h-40 rounded-3xl"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-3xl"/>)}
      </div>
      <div className="skeleton h-56 rounded-3xl"/>
    </div>
  )

  return (
    <div className="page-wrap space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="font-display font-black text-3xl text-ink">
          Welcome back, {user?.userName?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted mt-1">Here's what's happening with your restaurant today.</p>
      </div>

      {/* No restaurant prompt */}
      {!restaurant ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
          <AlertCircle size={24} className="text-amber-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-display font-bold text-ink text-lg mb-1">You don't have a restaurant yet</p>
            <p className="text-muted text-sm mb-4">Set up your restaurant profile so customers can find you on MetMomo.</p>
            <Link to="/owner/restaurant" className="btn-pink gap-2"><Store size={15}/> Set Up Restaurant</Link>
          </div>
        </div>
      ) : (
        /* Restaurant card */
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
          <div className="relative h-36 bg-gradient-to-br from-pink-100 to-rose-200 overflow-hidden">
            {restaurant.coverImage
              ? <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">{restaurant.emoji || '🍜'}</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            <div className="absolute bottom-4 left-5 text-white">
              <h2 className="font-display font-black text-2xl">{restaurant.name}</h2>
              <p className="text-white/80 text-sm">{restaurant.address}</p>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm text-slate">
              <span>🕐 {restaurant.deliveryTime} min</span>
              <span>🚚 {restaurant.deliveryFee === 0 ? 'Free delivery' : `NPR ${restaurant.deliveryFee}`}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/owner/restaurant" className="btn-outline text-sm gap-2 py-2 px-4">Edit Info</Link>
              <button onClick={toggleOpen} disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all disabled:opacity-50
                  ${restaurant.isOpen ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                {toggling
                  ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/>
                  : restaurant.isOpen ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCE SECTION ── */}
      {restaurant && (
        <div>
          <h2 className="font-display font-bold text-xl text-ink mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-pink"/> Finance Overview
          </h2>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<DollarSign size={18}/>}
              label="Today's Revenue"
              value={fmt(finance?.summary?.todayRevenue || 0)}
              sub={`${finance?.summary?.todayOrders || 0} orders`}
              color="pink"
            />
            <StatCard
              icon={<TrendingUp size={18}/>}
              label="This Week"
              value={fmt(finance?.summary?.weekRevenue || 0)}
              sub={`${finance?.summary?.weekOrders || 0} orders`}
              color="blue"
            />
            <StatCard
              icon={<ShoppingBag size={18}/>}
              label="This Month"
              value={fmt(finance?.summary?.monthRevenue || 0)}
              sub={`${finance?.summary?.monthOrders || 0} orders`}
              color="green"
            />
            <StatCard
              icon={<Clock size={18}/>}
              label="Active Orders"
              value={finance?.summary?.activeOrders || 0}
              sub={`${finance?.summary?.totalOrders || 0} total delivered`}
              color="orange"
            />
          </div>

          {/* Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold text-ink">Revenue Chart</h3>
                <p className="text-muted text-xs mt-0.5">Total all-time: <span className="font-bold text-ink">{fmt(finance?.summary?.totalRevenue || 0)}</span></p>
              </div>
              <div className="flex gap-1.5 bg-pink-50 p-1 rounded-2xl">
                {[
                  { key: 'daily',   label: 'Day'   },
                  { key: 'weekly',  label: 'Week'  },
                  { key: 'monthly', label: 'Month' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setPeriod(key)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      period === key ? 'bg-pink-600 text-white shadow-pink-sm' : 'text-pink-600 hover:bg-pink-100'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {chartData && chartData.length > 0 ? (
              <>
                <BarChart data={chartData} />
                {/* Table below chart */}
                <div className="mt-5 border-t border-faint pt-4 space-y-2 max-h-40 overflow-y-auto">
                  {[...chartData].reverse().filter(d => d.revenue > 0).slice(0, 6).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{d.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted text-xs">{d.orders} order{d.orders !== 1 ? 's' : ''}</span>
                        <span className="font-display font-bold text-pink">{fmt(d.revenue)}</span>
                      </div>
                    </div>
                  ))}
                  {chartData.every(d => d.revenue === 0) && (
                    <p className="text-center text-muted text-sm py-4">No revenue data yet for this period.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted">
                <p className="text-3xl mb-2">📊</p>
                <p>No data yet — start getting orders!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Best sellers + busiest hours */}
      {restaurant && finance && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-1">Best sellers</h2>
            <p className="text-muted text-xs mb-4">Delivered orders, all time</p>
            {finance.bestSellers?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-faint">
                    <th className="font-semibold pb-2">Item</th>
                    <th className="font-semibold pb-2 text-right">Sold</th>
                    <th className="font-semibold pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {finance.bestSellers.map((b, i) => (
                    <tr key={b.productId} className="border-b border-faint last:border-0">
                      <td className="py-2 text-ink"><span className="text-muted mr-2">{i + 1}.</span>{b.name}</td>
                      <td className="py-2 text-right text-ink tabular-nums">{b.quantity}</td>
                      <td className="py-2 text-right text-ink tabular-nums">{fmt(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-muted">No delivered orders yet.</p>}
          </div>

          <BusiestHours hours={finance.busiestHours || []} />
        </div>
      )}

      {/* Item stats */}
      {restaurant && (
        <div>
          <h2 className="font-display font-bold text-xl text-ink mb-4">Menu Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Items', value: products.length, color: 'text-pink',      bg: 'bg-pink-50 border-pink-200',   icon: '🍜' },
              { label: 'Available',   value: available,       color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: '✅' },
              { label: 'Unavailable', value: unavailable,     color: 'text-gray-400',  bg: 'bg-gray-50 border-gray-200',   icon: '⏸️' },
            ].map(s => (
              <Link to="/owner/menu" key={s.label} className={`card p-5 border ${s.bg} hover:shadow-card-lg transition-all`}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className={`font-display font-black text-3xl ${s.color} mb-0.5`}>{s.value}</p>
                <p className="text-muted text-sm">{s.label}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-bold text-xl text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK.map(q => (
            <Link key={q.to} to={q.to}
              className="card p-5 hover:shadow-card-lg hover:-translate-y-0.5 transition-all group">
              <div className="text-3xl mb-3">{q.icon}</div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-ink text-sm">{q.label}</h3>
                  <p className="text-muted text-xs mt-0.5">{q.desc}</p>
                </div>
                <ArrowRight size={15} className="text-muted group-hover:text-pink group-hover:translate-x-1 transition-all shrink-0"/>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

// Orders by hour of day — single series, so no legend; hover a bar for its value
function BusiestHours({ hours }) {
  const max = Math.max(1, ...hours.map(h => h.orders))
  const peak = hours.reduce((a, b) => (b.orders > a.orders ? b : a), { hour: 0, orders: 0 })
  const label = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`
  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-lg text-ink mb-1">Busiest hours</h2>
      <p className="text-muted text-xs mb-4">
        {peak.orders ? <>Peak at <span className="font-bold text-ink">{label(peak.hour)}</span> · orders placed per hour of day</> : 'Orders placed per hour of day'}
      </p>
      <div className="flex items-end gap-[2px] h-32 border-b border-faint" role="img"
        aria-label={`Orders by hour. Busiest hour: ${label(peak.hour)} with ${peak.orders} orders.`}>
        {hours.map(h => (
          <div key={h.hour} className="group relative flex-1 h-full flex items-end">
            <div className="w-full rounded-t-[4px] bg-pink transition-opacity group-hover:opacity-80"
              style={{ height: `${(h.orders / max) * 100}%`, minHeight: h.orders ? 2 : 0 }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 text-white text-[11px] px-2 py-1 z-10">
              {label(h.hour)} · {h.orders} order{h.orders === 1 ? '' : 's'}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1.5">
        {[0, 6, 12, 18, 23].map(h => <span key={h}>{label(h)}</span>)}
      </div>
    </div>
  )
}
