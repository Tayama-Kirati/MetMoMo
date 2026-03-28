import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingBag, TrendingUp, ArrowRight, Clock, CheckCircle, ChefHat, Truck } from 'lucide-react'
import { api, ROUTES} from '../../services/api'

const STATUS_CLS = { pending: 'badge-gold', preparation: 'badge-primary', ontheway: 'badge-gray', delivered: 'badge-green', cancelled: 'badge-gray' }

export default function AdminDashboard() {
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.get(ROUTES.getUsers()), api.get(ROUTES.getProducts()), api.get(ROUTES.getOrders())])
      .then(([u, p, o]) => {
        if (u.ok) setUsers(u.data.data || [])
        if (p.ok) setProducts(p.data.data || [])
        if (o.ok) setOrders(o.data.orders || [])
      }).finally(() => setLoading(false))
  }, [])

  const revenue      = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const pending      = orders.filter(o => o.orderStatus === 'pending').length
  const delivered    = orders.filter(o => o.orderStatus === 'delivered').length
  const available    = products.filter(p => p.productStatus === 'available').length

  const STATS = [
    { label: 'Total Orders',   value: orders.length,   sub: `${pending} pending`,   icon: <ShoppingBag size={22}/>, color: 'text-primary',  bg: 'bg-primary-50 border-primary/20',  to: ROUTES.getOrders},
    { label: 'Products',       value: products.length, sub: `${available} available`, icon: <Package size={22}/>,    color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200',        to: ROUTES.getProducts },
    { label: 'Customers',      value: users.length,    sub: 'registered users',       icon: <Users size={22}/>,      color: 'text-purple-500',bg: 'bg-purple-50 border-purple-200',   to: ROUTES.getUsers    },
    { label: 'Revenue (NPR)',  value: revenue.toLocaleString(), sub: `${delivered} delivered`, icon: <TrendingUp size={22}/>, color: 'text-gold', bg: 'bg-amber-50 border-amber-200', to: ROUTES.getOrders},
  ]

  const QUICK = [
    { to: 'ROUTES.getProducts', label: 'Manage Products', desc: 'Add, edit & delete items', icon: '📦', grad: 'from-primary/10 to-primary/5'    },
    { to: 'ROUTES.getUsers',    label: 'Manage Users',    desc: 'View & manage customers',  icon: '👥', grad: 'from-blue-500/10 to-blue-500/5'  },
    { to: 'ROUTES.getOrders',   label: 'View Orders',     desc: 'All customer orders',      icon: '🛒', grad: 'from-sage/10 to-sage/5'           },
  ]

  return (
    <div className="wrap py-10">
      <div className="mb-10">
        <span className="section-label font-body font-medium text-orange-500">Admin Panel</span>
        <h1 className="section-title font-body">Dashboard</h1>
        <p className="section-sub">Overview of your MetMoMo business</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {STATS.map(s => (
          <Link key={s.label} to={s.to} className="card p-5 hover:shadow-card-lg transition-all group">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className={`font-body font-extrabold text-2xl ${s.color} mb-0.5`}>{loading ? '—' : s.value}</p>
            <p className="font-body font-bold text-charcoal text-sm">{s.label}</p>
            <p className="text-slate text-xs mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {QUICK.map(q => (
          <Link key={q.to} to={q.to}
            className="card p-6 hover:shadow-card-lg hover:-translate-y-1 transition-all group">
            <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${q.grad} flex items-center justify-center text-3xl mb-5`}>{q.icon}</div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-body font-bold text-charcoal text-base">{q.label}</h3>
                <p className="text-slate text-sm">{q.desc}</p>
              </div>
              <ArrowRight size={18} className="text-slate group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders table */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-body font-bold text-charcoal text-xl">Recent Orders</h2>
          <Link to="/admin/orders" className="btn-ghost gap-1 text-sm">View all <ArrowRight size={14}/></Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-slate">No orders yet.</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-faint bg-cream/50">
                    {['Order ID','Items','Address','Status','Amount'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-body font-bold text-slate uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-faint/50">
                  {orders.slice(0, 10).map(o => (
                    <tr key={o._id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-5 py-4 font-body font-bold text-charcoal text-sm whitespace-nowrap">#{o._id?.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-4 text-slate text-sm">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                      <td className="px-5 py-4 text-slate text-sm max-w-[180px] truncate">{o.shippingAddress}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_CLS[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
                      </td>
                      <td className="px-5 py-4 font-body font-bold text-primary whitespace-nowrap">NPR {o.totalAmount?.toLocaleString()}</td>
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