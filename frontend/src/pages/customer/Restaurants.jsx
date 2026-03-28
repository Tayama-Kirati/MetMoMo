import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, MapPin, Truck, Search, ChevronRight, Zap, Tag } from 'lucide-react'

const ALL = [
  { id: 1, name: 'Momo Corner Thamel', tag: 'Best Momos in Town', rating: 4.9, reviews: 2140, time: '20–25', minOrder: 150, fee: 0, open: true, popular: true, emoji: '🏠', bg: 'from-orange-100 to-red-50', tags: ['Momo','Nepali','Fast Food'], dist: '1.2 km', cat: 'momos' },
  { id: 2, name: 'Himalayan Bites', tag: 'Authentic Street Food', rating: 4.7, reviews: 872, time: '25–30', minOrder: 200, fee: 30, open: true, popular: true, emoji: '🏔️', bg: 'from-blue-100 to-indigo-50', tags: ['Street','Snacks','Drinks'], dist: '2.1 km', cat: 'street' },
  { id: 3, name: 'Kathmandu Kitchen', tag: 'Home-style Cooking', rating: 4.8, reviews: 653, time: '30–35', minOrder: 250, fee: 0, open: true, popular: false, emoji: '🏡', bg: 'from-green-100 to-teal-50', tags: ['Nepali','Thali','Comfort Food'], dist: '3.4 km', cat: 'nepali' },
  { id: 4, name: 'Street Bites Patan', tag: 'Quick Bites & Snacks', rating: 4.6, reviews: 430, time: '15–20', minOrder: 100, fee: 20, open: true, popular: false, emoji: '🛵', bg: 'from-violet-100 to-purple-50', tags: ['Fast','Snacks','Drinks'], dist: '0.8 km', cat: 'street' },
  { id: 5, name: 'Newari Kitchen', tag: 'Traditional Newari Cuisine', rating: 4.8, reviews: 789, time: '25–35', minOrder: 200, fee: 0, open: true, popular: true, emoji: '🍲', bg: 'from-red-100 to-pink-50', tags: ['Newari','Traditional','Momos'], dist: '4.2 km', cat: 'nepali' },
  { id: 6, name: 'Durbar Square Dine', tag: 'Heritage Flavours', rating: 4.5, reviews: 310, time: '35–40', minOrder: 300, fee: 50, open: false, popular: false, emoji: '🏛️', bg: 'from-yellow-100 to-amber-50', tags: ['Fine Dining','Cultural'], dist: '5.0 km', cat: 'fine' },
  { id: 7, name: 'Patan Momo House', tag: 'Old Town Favourite', rating: 4.7, reviews: 560, time: '20–28', minOrder: 150, fee: 0, open: true, popular: true, emoji: '🏮', bg: 'from-pink-100 to-rose-50', tags: ['Momo','Street','Local'], dist: '2.8 km', cat: 'momos' },
  { id: 8, name: 'ThamelEats', tag: 'Fusion Nepali Food', rating: 4.4, reviews: 220, time: '30–40', minOrder: 200, fee: 40, open: true, popular: false, emoji: '🌏', bg: 'from-cyan-100 to-sky-50', tags: ['Fusion','Nepali','International'], dist: '1.7 km', cat: 'nepali' },
  { id: 9, name: 'Momo Mania', tag: 'Momo Specialists Since 2010', rating: 4.9, reviews: 3200, time: '18–25', minOrder: 100, fee: 0, open: true, popular: true, emoji: '🎯', bg: 'from-lime-100 to-green-50', tags: ['Momo','Fast','Value'], dist: '3.1 km', cat: 'momos' },
  { id: 10, name: 'Chiya Corner', tag: 'Tea & Snacks Heaven', rating: 4.3, reviews: 180, time: '10–15', minOrder: 80, fee: 10, open: true, popular: false, emoji: '☕', bg: 'from-amber-100 to-yellow-50', tags: ['Drinks','Snacks','Desserts'], dist: '0.5 km', cat: 'drinks' },
  { id: 11, name: 'Heritage Newari', tag: 'Authentic Newari Feast', rating: 4.8, reviews: 490, time: '35–45', minOrder: 400, fee: 0, open: false, popular: false, emoji: '🎎', bg: 'from-orange-100 to-yellow-50', tags: ['Newari','Fine Dining','Traditional'], dist: '6.2 km', cat: 'fine' },
  { id: 12, name: 'Boudha Bites', tag: 'Healthy & Organic', rating: 4.6, reviews: 340, time: '28–35', minOrder: 250, fee: 30, open: true, popular: false, emoji: '🌿', bg: 'from-emerald-100 to-teal-50', tags: ['Healthy','Organic','Veg'], dist: '4.8 km', cat: 'healthy' },
]

const FILTERS = ['All', 'Open Now', 'Popular', 'Free Delivery', 'Top Rated']

export default function Restaurants() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = ALL.filter(r => {
    const ms = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.tag.toLowerCase().includes(search.toLowerCase())
    if (filter === 'Open Now') return ms && r.open
    if (filter === 'Popular') return ms && r.popular
    if (filter === 'Free Delivery') return ms && r.fee === 0
    if (filter === 'Top Rated') return ms && r.rating >= 4.7
    return ms
  })

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-charcoal to-secondary text-white py-14">
        <div className="wrap">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-display font-bold mb-5">
            🏪 Restaurants
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3 leading-tight">
            Top Restaurants<br />Near You
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-lg">
            Handpicked from the best kitchens in Kathmandu. {ALL.filter(r => r.open).length} restaurants open right now.
          </p>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-all text-sm"
              placeholder="Search restaurants..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="wrap py-10">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`chip ${filter === f ? 'chip-active' : 'chip-idle'}`}>
              {f}
            </button>
          ))}
          <span className="text-slate text-sm self-center ml-2">{filtered.length} results</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-display font-bold text-charcoal text-xl mb-2">No restaurants found</h3>
            <p className="text-slate">Try a different search or filter.</p>
            <button onClick={() => { setSearch(''); setFilter('All') }} className="btn-primary mt-6">Clear Search</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <Link key={r.id} to="/menu" className="card-hover group overflow-hidden">
                {/* Cover image */}
                <div className={`relative h-40 bg-gradient-to-br ${r.bg} flex items-center justify-center overflow-hidden`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{r.emoji}</span>
                  {!r.open && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
                      <span className="badge badge-gray font-bold text-sm">Closed Now</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {r.open && <span className="badge badge-green text-[10px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse"/>Open</span>}
                    {r.popular && r.open && <span className="badge badge-primary text-[10px]">🔥 Popular</span>}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-card">
                    <Star size={11} className="text-gold" fill="currentColor" />
                    <span className="font-display font-extrabold text-charcoal text-xs">{r.rating}</span>
                    <span className="text-slate text-[10px]">({r.reviews.toLocaleString()})</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-display font-bold text-charcoal text-lg leading-tight mb-1">{r.name}</h3>
                  <p className="text-slate text-sm mb-3">{r.tag}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {r.tags.map(t => <span key={t} className="badge badge-gray text-[10px]">{t}</span>)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-faint/50 text-xs">
                    <div className="flex items-center gap-3 text-slate">
                      <span className="flex items-center gap-1"><Clock size={11}/> {r.time} min</span>
                      <span className="flex items-center gap-1"><MapPin size={11}/> {r.dist}</span>
                    </div>
                    <span className={`font-display font-bold text-xs ${r.fee === 0 ? 'text-sage' : 'text-charcoal'}`}>
                      {r.fee === 0 ? '🚚 Free delivery' : `Delivery NPR ${r.fee}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-slate text-xs">Min. order: NPR {r.minOrder}</span>
                    <span className="text-primary font-display font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      Order now <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}