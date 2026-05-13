// Admin Dashboard
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingBag, TrendingUp, ArrowRight, Store } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

export default function AdminDashboard() {
  const [orders, setOrders]       = useState([])
  const [products, setProducts]   = useState([])
  const [users, setUsers]         = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([api.get(ROUTES.adminUsers), api.get(ROUTES.products), api.get('/orders/all'), api.get(ROUTES.restaurants)])
      .then(([u, p, o, r]) => {
        if (u.ok) setUsers(u.data.data || [])
        if (p.ok) setProducts(p.data.data || [])
        if (o.ok) setOrders(o.data.orders || [])
        if (r.ok) setRestaurants(r.data.restaurants || [])
      }).finally(() => setLoading(false))
  }, [])

  const revenue = orders.filter(o => o.orderStatus === 'delivered').reduce((s,o) => s + (o.totalAmount||0), 0)

  const STATS = [
    { label:'Total Orders',   value:orders.length,       icon:<ShoppingBag size={22}/>, color:'text-pink',       bg:'bg-pink-50 border-pink-200',   to:'/admin/orders'      },
    { label:'Products',       value:products.length,     icon:<Package size={22}/>,     color:'text-blue-500',   bg:'bg-blue-50 border-blue-200',   to:'/admin/products'    },
    { label:'Customers',      value:users.length,        icon:<Users size={22}/>,       color:'text-purple-500', bg:'bg-purple-50 border-purple-200',to:'/admin/users'       },
    { label:'Restaurants',    value:restaurants.length,  icon:<Store size={22}/>,       color:'text-green-600',  bg:'bg-green-50 border-green-200',  to:'/admin/restaurants' },
    { label:'Revenue (NPR)',  value:revenue.toLocaleString(), icon:<TrendingUp size={22}/>, color:'text-amber-600', bg:'bg-amber-50 border-amber-200', to:'/admin/orders'    },
  ]

  const STATUS_CLS = { pending:'badge-yellow', confirmed:'badge-green', preparation:'badge-pink', ontheway:'badge-gray', delivered:'badge-green', cancelled:'badge-red' }

  return (
    <div className="page-wrap">
      <div className="mb-10">
        <h1 className="font-display font-black text-3xl text-ink">Admin Dashboard</h1>
        <p className="text-muted mt-1">Overview of your MoMoGo business</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {STATS.map(s => (
          <Link key={s.label} to={s.to} className="card p-5 hover:shadow-card-lg transition-all group">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className={`font-display font-black text-2xl ${s.color} mb-0.5`}>{loading ? '—' : s.value}</p>
            <p className="text-muted text-sm">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        {[
          { to:'/admin/products',    label:'Manage Products',    icon:'📦', desc:'Add, edit & delete items' },
          { to:'/admin/restaurants', label:'Manage Restaurants', icon:'🏪', desc:'Add & edit restaurants'   },
          { to:'/admin/users',       label:'Manage Users',       icon:'👥', desc:'View & manage customers'  },
          { to:'/admin/orders',      label:'All Orders',         icon:'🛒', desc:'View & update orders'     },
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
          <Link to="/admin/orders" className="btn-ghost text-sm gap-1">View all <ArrowRight size={13}/></Link>
        </div>
        {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-14 rounded-2xl"/>)}</div> : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-faint bg-pink-50/50">
                  {['Order ID','Address','Status','Amount'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-display font-bold text-muted uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-faint">
                  {orders.slice(0,8).map(o=>(
                    <tr key={o._id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-display font-bold text-ink text-sm">#{o._id?.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-muted text-sm max-w-[140px] truncate">{o.shippingAddress}</td>
                      <td className="px-5 py-3.5"><span className={`badge ${STATUS_CLS[o.orderStatus]||'badge-gray'} text-[10px]`}>{o.orderStatus}</span></td>
                      <td className="px-5 py-3.5 font-display font-bold text-pink">NPR {o.totalAmount?.toLocaleString()}</td>
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
