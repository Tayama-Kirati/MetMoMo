import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star, Clock, Truck, ShieldCheck, Zap } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

const FOOD_CATEGORIES = [
  { name: 'C-momo',   emoji: '🌶️', img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=200&h=200&fit=crop' },
  { name: 'Pizza',    emoji: '🍕', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
  { name: 'Burger',   emoji: '🍔', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
  { name: 'Kimbap',   emoji: '🍱', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop' },
  { name: 'Corn Dog', emoji: '🌭', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
  { name: 'Ramen',    emoji: '🍜', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop' },
]

const TRENDING_ITEMS = [
  { name: 'Buff Momo',      cat: 'Steamed Momo', price: 180, img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop' },
  { name: 'Jhol Momo',      cat: 'Jhol Momo',    price: 250, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop' },
  { name: 'Chicken Sekuwa', cat: 'Snacks',        price: 280, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get(ROUTES.products),
      api.get(ROUTES.restaurants),
    ]).then(([p, r]) => {
      if (p.ok) setProducts(p.data.data || [])
      if (r.ok) setRestaurants(r.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/menu?q=${encodeURIComponent(searchQ.trim())}`)
  }

  const featured = (products.length > 0 ? products : TRENDING_ITEMS).filter(p => p.productStatus === 'available' || !p.productStatus).slice(0, 6)

  return (
    <div>

      {/* ── HERO ── stripe bg matching screenshot */}
      <section className="relative stripe-bg overflow-hidden pt-10 pb-16">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-pink/8 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-pink/6 pointer-events-none" />

        <div className="wrap grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="animate-fade-up">
            {/* Small label */}
            <div className="inline-flex items-center gap-2 bg-pink/10 text-pink px-3 py-1.5 rounded-full text-xs font-display font-bold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
              Online ordering
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl text-ink leading-tight mb-4">
              Best Food<br />
              <span className="text-pink">Delivery</span> Apps
            </h1>

            <p className="text-slate text-base leading-relaxed mb-8 max-w-md">
              My app is the fastest, easiest and most convenient way to enjoy the best food of your favourite restaurants at home, at the office or wherever you want to.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-6">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  className="input-field pl-11 py-3.5 rounded-full"
                  placeholder="Order food from the widest range of restaurants..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-pink px-6 py-3.5 rounded-full shrink-0 shadow-pink">
                Find Restaurants
              </button>
            </form>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Zap size={14}/>, t: '30 min delivery' },
                { icon: <Star size={14}/>, t: '4.9★ rated' },
                { icon: <Truck size={14}/>, t: 'Free delivery NPR 500+' },
              ].map(s => (
                <div key={s.t} className="flex items-center gap-1.5 bg-white border border-faint rounded-full px-3 py-1.5 text-xs font-display font-semibold text-slate shadow-card">
                  <span className="text-pink">{s.icon}</span>{s.t}
                </div>
              ))}
            </div>
          </div>

          {/* Right – hero illustration */}
          <div className="hidden md:flex items-center justify-center relative min-h-[340px]">
            {/* Big food illustration */}
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink/20 to-pink-100 animate-pulse-soft" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-pink-50 shadow-float flex items-center justify-center">
                <span className="text-[110px] animate-float filter drop-shadow-xl">🍜</span>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute top-4 -right-4 card px-4 py-3 flex items-center gap-3 shadow-float animate-fade-up" style={{animationDelay:'0.3s'}}>
              <span className="text-2xl">⭐</span>
              <div><p className="font-display font-bold text-ink text-sm">4.9 Rating</p><p className="text-muted text-xs">2k+ reviews</p></div>
            </div>
            <div className="absolute bottom-10 -left-6 card px-4 py-3 flex items-center gap-3 shadow-float animate-fade-up" style={{animationDelay:'0.5s'}}>
              <span className="text-2xl">⚡</span>
              <div><p className="font-display font-bold text-ink text-sm">25 mins</p><p className="text-muted text-xs">Avg. delivery</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING FOOD ITEMS (matching screenshot grid) ── */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Trending Food Items</h2>
              <p className="section-sub">Most ordered this week</p>
            </div>
            <Link to="/menu" className="btn-soft gap-1 text-sm">See all <ArrowRight size={14}/></Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {FOOD_CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/menu?q=${cat.name}`}
                className="flex flex-col items-center group cursor-pointer">
                <div className="w-full aspect-square rounded-3xl overflow-hidden bg-pink-50 border-2 border-transparent group-hover:border-pink transition-all duration-200 shadow-card group-hover:shadow-pink mb-2.5">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
                </div>
                <span className="font-display font-bold text-ink text-sm group-hover:text-pink transition-colors text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US (matching screenshot) ── */}
      <section className="stripe-bg py-16">
        <div className="wrap">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-black text-3xl text-ink mb-5">About Us</h2>
            <p className="text-slate leading-relaxed">
              My app is the fastest, easiest and most convenient way to enjoy the best food of your favourite restaurants at home, at the office or wherever you want to. We know that your time is valuable and sometimes every minute in the day counts. That's why we deliver!<br/><br/>
              So you can spend more time doing the things you love.
            </p>
          </div>

          {/* Big restaurant search CTA */}
          <div className="mt-12 relative rounded-4xl overflow-hidden">
            <div className="relative h-52 bg-gradient-to-r from-ink to-ink/80 flex flex-col items-center justify-center text-white text-center px-6 gap-4"
              style={{backgroundImage:'url(https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop)', backgroundSize:'cover', backgroundPosition:'center'}}>
              <div className="absolute inset-0 bg-ink/60" />
              <div className="relative">
                <p className="font-display font-bold text-lg mb-4">Order food from the widest range of restaurants.</p>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                  <input className="flex-1 bg-white/20 backdrop-blur border border-white/30 rounded-full px-5 py-3 text-white placeholder:text-white/60 focus:outline-none focus:border-white text-sm"
                    placeholder="Search restaurants..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                  <button type="submit" className="btn-pink shrink-0 rounded-full px-5">Find Restaurants</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS from DB ── */}
      {featured.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">🔥 Most Loved Items</h2>
                <p className="section-sub">Fresh from our partner restaurants</p>
              </div>
              <Link to="/menu" className="btn-soft gap-1 text-sm">Full menu <ArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.slice(0,8).map((p, i) => (
                <Link key={p._id || i} to={p._id ? `/product/${p._id}` : '/menu'}
                  className="card-hover group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                    {(p.productImage || p.img) ? (
                      <img src={p.productImage || p.img} alt={p.productName || p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}
                    <div className="absolute top-2 left-2 badge-pink text-[10px]">{p.productCategory || p.cat}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-ink text-sm leading-tight">{p.productName || p.name}</h3>
                    <p className="font-display font-extrabold text-pink mt-2">NPR {(p.productPrice || p.price)?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RESTAURANTS ── */}
      {restaurants.length > 0 && (
        <section className="section stripe-bg">
          <div className="wrap">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">🏪 Top Restaurants</h2>
                <p className="section-sub">Delivering to you right now</p>
              </div>
              <Link to="/restaurants" className="btn-pink text-sm gap-1">View all <ArrowRight size={14}/></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {restaurants.filter(r => r.isOpen).slice(0,4).map(r => (
                <Link key={r._id} to={`/restaurants/${r._id}`} className="card-hover group overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-pink-50 to-rose-light flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {r.coverImage ? <img src={r.coverImage} alt={r.name} className="w-full h-full object-cover" /> : r.emoji || '🍜'}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-ink text-base">{r.name}</h3>
                    <p className="text-slate text-xs mt-0.5 line-clamp-1">{r.description}</p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="flex items-center gap-1 text-yellow-500 font-display font-bold"><Star size={11} fill="currentColor"/> {r.rating?.toFixed(1)}</span>
                      <span className="flex items-center gap-1 text-slate"><Clock size={11}/> {r.deliveryTime} min</span>
                      <span className={r.deliveryFee === 0 ? 'text-green-600 font-bold' : 'text-slate'}>
                        {r.deliveryFee === 0 ? '🚚 Free' : `NPR ${r.deliveryFee}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WEEKLY PROMO (matches screenshot) ── */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-4xl bg-ink text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url(https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop)', backgroundSize:'cover'}}/>
            <div className="relative z-10">
              <p className="font-display font-black text-4xl md:text-5xl text-white mb-1">Weekly Promo</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display font-black text-6xl text-pink">20%</span>
                <span className="font-display font-black text-4xl text-pink">OFF</span>
              </div>
              <p className="text-white/70 mb-6">Get it delivered fresh from the farm</p>
              <Link to="/menu" className="btn-pink gap-2 inline-flex">ORDER NOW <ArrowRight size={15}/></Link>
            </div>
            <div className="relative z-10 hidden md:block text-[100px] animate-float">🥗</div>
          </div>
        </div>
      </section>
    </div>
  )
}
