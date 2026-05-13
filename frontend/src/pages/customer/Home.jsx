import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star, Clock, Truck, Zap, MapPin, ShoppingBag } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

const FOOD_CATEGORIES = [
  { name: 'Momo',   img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop' },
  { name: 'Pizza',  img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
  { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
  { name: 'Kimbap', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop' },
  { name: 'Sekuwa', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
  { name: 'Ramen',  img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop' },
]

const TOP_PICKS = [
  { name: 'Buff Momo',      desc: 'Steamed dumplings with spicy tomato sauce', price: 180, tag: 'Bestseller', tagBg: 'bg-pink-500',   img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=280&fit=crop' },
  { name: 'Jhol Momo',      desc: 'Momo soaked in aromatic sesame tomato broth', price: 250, tag: 'New',       tagBg: 'bg-green-500', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=280&fit=crop' },
  { name: 'Chicken Sekuwa', desc: 'Grilled marinated chicken skewers with chutney', price: 280, tag: 'Trending', tagBg: 'bg-orange-500', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=280&fit=crop' },
  { name: 'Veg Momo',       desc: 'Pan-fried veggie dumplings with ginger dip', price: 160, tag: 'Popular',   tagBg: 'bg-purple-500', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=280&fit=crop' },
]

const STATIC_RESTAURANTS = [
  { _id: 'r1', name: 'Momo Palace',     description: 'Authentic Nepali dumplings & more', rating: 4.8, deliveryTime: 25, deliveryFee: 0,   isFeatured: true,  coverImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=220&fit=crop' },
  { _id: 'r2', name: 'Burger Junction', description: 'Premium burgers, fries & shakes',   rating: 4.6, deliveryTime: 30, deliveryFee: 50,  isPopular: true,   coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=220&fit=crop' },
  { _id: 'r3', name: 'Pizza Hub',       description: 'Wood-fired pizzas & creamy pastas', rating: 4.7, deliveryTime: 35, deliveryFee: 0,   isFeatured: true,  coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=220&fit=crop' },
  { _id: 'r4', name: 'Korean Kitchen',  description: 'Kimbap, Ramen & Korean BBQ',        rating: 4.9, deliveryTime: 40, deliveryFee: 100, isPopular: true,   coverImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=220&fit=crop' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get(ROUTES.products), api.get(ROUTES.restaurants)]).then(([p, r]) => {
      if (p.ok) setProducts(p.data.data || [])
      if (r.ok) setRestaurants(r.data.data || [])
    })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/menu?q=${encodeURIComponent(searchQ.trim())}`)
  }

  const featured = products.filter(p => p.productStatus === 'available' || !p.productStatus).slice(0, 8)
  const displayRestaurants = restaurants.length > 0 ? restaurants.slice(0, 4) : STATIC_RESTAURANTS

  return (
    <div>

      {/* ── HERO ── */}
      <section className="relative bg-pink-50 overflow-hidden pt-10 pb-16">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-200/40 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-pink-200/30 pointer-events-none" />

        <div className="wrap grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-500 px-3 py-1.5 rounded-full text-xs font-bold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              Delivering across Kathmandu Valley
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl text-ink leading-tight mb-4">
              Delicious Food<br />
              <span className="text-pink">Delivered Fast</span>
            </h1>

            <p className="text-slate text-base leading-relaxed mb-8 max-w-md">
              Order your favourite Nepali dishes and international cuisine from top restaurants. Fresh, hot, and right at your doorstep.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-6">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  className="input-field pl-11 py-3.5 rounded-full"
                  placeholder="Search for food or restaurants..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-pink px-6 py-3.5 rounded-full shrink-0">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Zap size={14}/>,   t: '30 min delivery' },
                { icon: <Star size={14}/>,  t: '4.9★ rated' },
                { icon: <Truck size={14}/>, t: 'Free delivery NPR 500+' },
              ].map(s => (
                <div key={s.t} className="flex items-center gap-1.5 bg-white border border-pink-100 rounded-full px-3 py-1.5 text-xs font-semibold text-slate shadow-card">
                  <span className="text-pink">{s.icon}</span>{s.t}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center relative min-h-[340px]">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/50 to-pink-100" />
              <div className="absolute inset-3 rounded-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
                  alt="Delicious food"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute top-4 -right-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-fade-up" style={{animationDelay:'0.3s'}}>
              <span className="text-2xl">⭐</span>
              <div><p className="font-bold text-ink text-sm">4.9 Rating</p><p className="text-slate text-xs">2k+ reviews</p></div>
            </div>
            <div className="absolute bottom-10 -left-6 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-fade-up" style={{animationDelay:'0.5s'}}>
              <span className="text-2xl">⚡</span>
              <div><p className="font-bold text-ink text-sm">25 mins</p><p className="text-slate text-xs">Avg. delivery</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="text-center mb-10">
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Order in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: <MapPin size={26} className="text-pink"/>,       title: 'Choose Restaurant', desc: 'Browse top restaurants near you and explore their full menus' },
              { step: '02', icon: <ShoppingBag size={26} className="text-pink"/>,   title: 'Place Your Order',  desc: 'Select your favourite items and checkout in seconds' },
              { step: '03', icon: <Truck size={26} className="text-pink"/>,         title: 'Fast Delivery',     desc: 'We deliver your hot, fresh food right to your doorstep' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center p-7 rounded-3xl bg-pink-50 border border-pink-100 hover:border-pink-300 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <span className="font-display font-black text-pink-200 text-4xl mb-1">{s.step}</span>
                <h3 className="font-display font-bold text-ink text-lg mb-2">{s.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section bg-pink-50">
        <div className="wrap">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-sub">What are you craving today?</p>
            </div>
            <Link to="/menu" className="btn-soft gap-1 text-sm">See all <ArrowRight size={14}/></Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {FOOD_CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/menu?q=${cat.name}`} className="flex flex-col items-center group cursor-pointer">
                <div className="w-full aspect-square rounded-3xl overflow-hidden bg-white border-2 border-transparent group-hover:border-pink-400 transition-all duration-200 shadow-card group-hover:shadow-[0_6px_18px_rgba(255,45,120,0.25)] mb-2.5">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-bold text-ink text-sm group-hover:text-pink transition-colors text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PICKS ── */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Top Picks For You</h2>
              <p className="section-sub">Handpicked fan favourites this week</p>
            </div>
            <Link to="/menu" className="btn-soft gap-1 text-sm">View menu <ArrowRight size={14}/></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOP_PICKS.map((item, i) => (
              <Link key={i} to={`/menu?q=${encodeURIComponent(item.name)}`} className="card-hover group overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className={`absolute top-3 left-3 ${item.tagBg} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow`}>{item.tag}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-ink text-base mb-1">{item.name}</h3>
                  <p className="text-slate text-xs leading-snug mb-3 line-clamp-2">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-pink text-base">NPR {item.price}</span>
                    <span className="text-xs font-semibold text-pink bg-pink-50 px-3 py-1 rounded-full border border-pink-100">Order now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RESTAURANTS ── always visible */}
      <section className="section bg-pink-50">
        <div className="wrap">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Top Restaurants</h2>
              <p className="section-sub">Delivering to you right now</p>
            </div>
            <Link to="/menu" className="btn-pink text-sm gap-1">View all <ArrowRight size={14}/></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayRestaurants.map(r => (
              <Link key={r._id} to={`/restaurants/${r._id}`} className="card-hover group overflow-hidden">
                <div className="relative h-40 overflow-hidden bg-pink-100">
                  {r.coverImage ? (
                    <img src={r.coverImage} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 text-6xl">🍽️</div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-card">
                    <Star size={11} className="text-yellow-400" fill="currentColor" />
                    <span className="font-bold text-xs">{r.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  {r.isFeatured && <span className="absolute top-2 left-2 badge-pink text-[10px]">⭐ Featured</span>}
                  {r.isPopular && !r.isFeatured && <span className="absolute top-2 left-2 badge badge-yellow text-[10px]">🔥 Popular</span>}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-ink text-base mb-0.5">{r.name}</h3>
                  <p className="text-slate text-xs line-clamp-1 mb-3">{r.description}</p>
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
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

      {/* ── MOST LOVED ITEMS from DB ── */}
      {featured.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Most Loved Items</h2>
                <p className="section-sub">Fresh from our partner restaurants</p>
              </div>
              <Link to="/products" className="btn-soft gap-1 text-sm">Full menu <ArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((p, i) => (
                <Link key={p._id || i} to={p._id ? `/products/${p._id}` : '/products'} className="card-hover group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                    {(p.productImage || p.img) ? (
                      <img src={p.productImage || p.img} alt={p.productName || p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 text-5xl">🍽️</div>
                    )}
                    {(p.productCategory || p.cat) && (
                      <div className="absolute top-2 left-2 badge-pink text-[10px]">{p.productCategory || p.cat}</div>
                    )}
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

      {/* ── WEEKLY PROMO ── */}
      <section className="section bg-pink-50">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-[32px] bg-ink text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop)', backgroundSize:'cover'}}/>
            <div className="relative z-10">
              <p className="font-display font-black text-4xl md:text-5xl text-white mb-1">Weekly Promo</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display font-black text-6xl text-pink">20%</span>
                <span className="font-display font-black text-4xl text-pink">OFF</span>
              </div>
              <p className="text-white/70 mb-6">Use code <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">METMOMO20</span> at checkout</p>
              <Link to="/menu" className="btn-pink gap-2 inline-flex">ORDER NOW <ArrowRight size={15}/></Link>
            </div>
            <div className="relative z-10 hidden md:block">
              <div className="w-52 h-52 rounded-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-pink/30">
                <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop" alt="Promo food" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
