import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, UtensilsCrossed, PlusCircle, ToggleLeft, ToggleRight, ArrowRight, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(false)

  useEffect(() => {
    Promise.all([api.get('/owner/restaurant'), api.get('/owner/products')])
      .then(([r, p]) => {
        if (r.ok && r.data.data) setRestaurant(r.data.data)
        if (p.ok) setProducts(p.data.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleOpen = async () => {
    if (!restaurant) return
    setToggling(true)
    const fd = new FormData()
    fd.append('isOpen', String(!restaurant.isOpen))
    const { ok, data } = await api.patchForm('/owner/restaurant', fd)
    if (ok) {
      setRestaurant(data.data)
      toast.success(`Restaurant is now ${data.data.isOpen ? 'Open' : 'Closed'}`)
    } else {
      toast.error('Could not update status')
    }
    setToggling(false)
  }

  const available   = products.filter(p => p.productStatus === 'available').length
  const unavailable = products.length - available

  const QUICK = [
    { to: '/owner/restaurant', icon: '🏪', label: 'Restaurant Info',    desc: 'Edit name, address, hours' },
    { to: '/owner/menu',       icon: '📋', label: 'View Menu',           desc: 'See all your items' },
    { to: '/owner/add-item',   icon: '➕', label: 'Add Food Item',       desc: 'List a new dish' },
  ]

  if (loading) return (
    <div className="page-wrap">
      <div className="space-y-4">
        <div className="skeleton h-40 rounded-3xl"/>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_,i) => <div key={i} className="skeleton h-28 rounded-3xl"/>)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-wrap">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink">
          Welcome back, {user?.userName?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted mt-1">Here's what's happening with your restaurant today.</p>
      </div>

      {/* No restaurant yet — prompt */}
      {!restaurant ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4 mb-6">
          <AlertCircle size={24} className="text-amber-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-display font-bold text-ink text-lg mb-1">You don't have a restaurant yet</p>
            <p className="text-muted text-sm mb-4">Set up your restaurant profile so customers can find you on MetMomo.</p>
            <Link to="/owner/restaurant" className="btn-pink gap-2">
              <Store size={15}/> Set Up Restaurant
            </Link>
          </div>
        </div>
      ) : (
        /* Restaurant card */
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden mb-6">
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
              {(restaurant.cuisine || []).length > 0 && (
                <span>{restaurant.cuisine.slice(0, 2).join(', ')}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/owner/restaurant" className="btn-outline text-sm gap-2 py-2 px-4">
                Edit Info
              </Link>
              <button onClick={toggleOpen} disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all disabled:opacity-50
                  ${restaurant.isOpen
                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                {toggling
                  ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/>
                  : restaurant.isOpen
                    ? <ToggleRight size={20}/>
                    : <ToggleLeft  size={20}/>}
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {restaurant && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Items',     value: products.length, color: 'text-pink',      bg: 'bg-pink-50 border-pink-200',     icon: '🍜' },
            { label: 'Available',       value: available,       color: 'text-green-600', bg: 'bg-green-50 border-green-200',   icon: '✅' },
            { label: 'Unavailable',     value: unavailable,     color: 'text-gray-400',  bg: 'bg-gray-50 border-gray-200',     icon: '⏸️' },
          ].map(s => (
            <Link to="/owner/menu" key={s.label}
              className={`card p-5 border ${s.bg} hover:shadow-card-lg transition-all group`}>
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className={`font-display font-black text-3xl ${s.color} mb-0.5`}>{s.value}</p>
              <p className="text-muted text-sm">{s.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-bold text-xl text-ink mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
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
