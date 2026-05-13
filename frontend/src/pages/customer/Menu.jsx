import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, ChevronRight, X, Truck, LayoutGrid, List } from 'lucide-react'
import { api, ROUTES } from '../../services/api'

const FILTERS = [
  { k: 'all',      l: 'All' },
  { k: 'open',     l: '🟢 Open Now' },
  { k: 'popular',  l: '🔥 Popular' },
  { k: 'featured', l: '⭐ Featured' },
  { k: 'free',     l: '🚚 Free Delivery' },
]

export default function Menu() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [view, setView]               = useState('grid')

  useEffect(() => {
    api.get(ROUTES.restaurants)
      .then(({ ok, data }) => { if (ok) setRestaurants(data.data || []) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      const q = search.toLowerCase()
      const ms = !search || r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || (r.cuisine || []).some(c => c.toLowerCase().includes(q))
      if (filter === 'open')     return ms && r.isOpen
      if (filter === 'popular')  return ms && r.isPopular
      if (filter === 'featured') return ms && r.isFeatured
      if (filter === 'free')     return ms && r.deliveryFee === 0
      return ms
    })
  }, [restaurants, search, filter])

  const openCount = restaurants.filter(r => r.isOpen).length

  return (
    <div>
      {/* ── Header ── */}
      <div className="bg-pink text-white py-10">
        <div className="wrap">
          <h1 className="font-display font-black text-4xl mb-1">Order Food</h1>
          <p className="text-pink-100 text-sm mb-5">
            {openCount} restaurants open now · {restaurants.length} total
          </p>
          <div className="relative max-w-lg">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-10"/>
            <input
              className="w-full bg-white/20 backdrop-blur border border-white/30 rounded-full pl-12 pr-10 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-white transition-all text-sm"
              placeholder="Search restaurants or cuisine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                <X size={15}/>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Filters + view toggle */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)}
                className={`chip ${filter === f.k ? 'chip-active' : 'chip-idle'}`}>
                {f.l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-faint rounded-2xl p-1 shadow-card shrink-0">
            <button onClick={() => setView('grid')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${view === 'grid' ? 'bg-pink text-white shadow-pink-sm' : 'text-muted hover:text-pink'}`}>
              <LayoutGrid size={15}/>
            </button>
            <button onClick={() => setView('list')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${view === 'list' ? 'bg-pink text-white shadow-pink-sm' : 'text-muted hover:text-pink'}`}>
              <List size={15}/>
            </button>
          </div>
        </div>

        {loading ? (
          <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            {[...Array(6)].map((_, i) => <div key={i} className={`skeleton rounded-3xl ${view === 'grid' ? 'h-64' : 'h-24'}`}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-display font-bold text-xl text-ink mb-2">No restaurants found</p>
            <p className="text-slate text-sm mb-5">Try a different search or filter</p>
            <button onClick={() => { setSearch(''); setFilter('all') }} className="btn-pink">Show All</button>
          </div>
        ) : view === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <Link key={r._id} to={`/restaurants/${r._id}`} className="card-hover group overflow-hidden">
                <div className="relative h-44 overflow-hidden bg-pink-50">
                  {r.coverImage ? (
                    <img src={r.coverImage} alt={r.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 text-7xl">
                      {r.emoji || '🍽️'}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {r.isFeatured && <span className="badge-pink text-[10px]">⭐ Featured</span>}
                    {r.isPopular && !r.isFeatured && <span className="badge badge-yellow text-[10px]">🔥 Popular</span>}
                    {!r.isOpen && <span className="badge-gray text-[10px]">Closed</span>}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-card">
                    <Star size={11} className="text-yellow-400" fill="currentColor"/>
                    <span className="font-bold text-xs">{r.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  {!r.isOpen && <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"/>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink text-lg leading-tight">{r.name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {r.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-muted text-sm line-clamp-1 mb-3">{r.description}</p>
                  {(r.cuisine || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {r.cuisine.slice(0, 3).map(c => <span key={c} className="badge-gray text-[10px]">{c}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <span className="flex items-center gap-1 text-slate"><Clock size={11}/> {r.deliveryTime} min</span>
                    <span className={r.deliveryFee === 0 ? 'text-green-600 font-bold' : 'text-slate'}>
                      <Truck size={11} className="inline mr-0.5"/>
                      {r.deliveryFee === 0 ? 'Free' : `NPR ${r.deliveryFee}`}
                    </span>
                    <span className="flex items-center gap-0.5 text-pink font-bold group-hover:gap-1.5 transition-all">
                      Order <ChevronRight size={11}/>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── List View ── */
          <div className="bg-white rounded-3xl border border-faint shadow-card divide-y divide-faint overflow-hidden">
            {filtered.map(r => (
              <Link key={r._id} to={`/restaurants/${r._id}`}
                className="flex items-center gap-4 p-4 hover:bg-pink-50/60 transition-colors group">

                {/* Thumbnail */}
                <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                  {r.coverImage
                    ? <img src={r.coverImage} alt={r.name} loading="lazy" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!r.isOpen ? 'opacity-60 grayscale' : ''}`}/>
                    : <div className="w-full h-full flex items-center justify-center text-3xl">{r.emoji || '🍽️'}</div>}
                  {!r.isOpen && <div className="absolute inset-0 bg-white/30"/>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-display font-bold text-ink text-base leading-tight">{r.name}</h3>
                    {r.isFeatured && <span className="badge-pink text-[9px]">⭐ Featured</span>}
                    {r.isPopular && <span className="badge badge-yellow text-[9px]">🔥 Popular</span>}
                  </div>
                  <p className="text-muted text-xs line-clamp-1 mb-2">{r.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate flex-wrap">
                    <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" fill="currentColor"/> {r.rating?.toFixed(1) || '4.5'}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {r.deliveryTime} min</span>
                    <span className={`flex items-center gap-1 ${r.deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}`}>
                      <Truck size={10}/> {r.deliveryFee === 0 ? 'Free delivery' : `NPR ${r.deliveryFee}`}
                    </span>
                    {(r.cuisine || []).length > 0 && (
                      <span className="text-muted">{r.cuisine.slice(0, 2).join(' · ')}</span>
                    )}
                  </div>
                </div>

                {/* Status + CTA */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${r.isOpen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {r.isOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className="flex items-center gap-0.5 text-pink font-bold text-sm group-hover:gap-1.5 transition-all">
                    Order <ChevronRight size={13}/>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
