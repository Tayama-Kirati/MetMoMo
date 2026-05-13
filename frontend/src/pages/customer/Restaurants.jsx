// // import { useEffect, useState, useMemo } from 'react'
// import { Link } from 'react-router-dom'
// import { Star, Clock, Search, ChevronRight } from 'lucide-react'
// import { api, ROUTES } from '../../services/api'
// import toast from 'react-hot-toast'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import { useMemo } from 'react'

// export default function Restaurants() {
//   const [restaurants, setRestaurants] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [filter, setFilter] = useState('all')

//   useEffect(() => {
//     const fetchRestaurants = async () => {
//       try {
//         const { ok, data } = await api.get(ROUTES.restaurants)

//         if (ok) {
//           setRestaurants(data?.data || [])
//         } else {
//           toast.error('Failed to load restaurants')
//         }
//       } catch {
//         toast.error('Something went wrong')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchRestaurants()
//   }, [])

//   // 🔥 Memoized filtered data
//   const filtered = useMemo(() => {
//     return restaurants.filter(r => {
//       const name = r.name?.toLowerCase() || ''
//       const matchSearch =
//         !search || name.includes(search.toLowerCase())

//       if (filter === 'open') return matchSearch && r.isOpen
//       if (filter === 'popular') return matchSearch && r.isPopular
//       if (filter === 'featured') return matchSearch && r.isFeatured
//       if (filter === 'free') return matchSearch && r.deliveryFee === 0

//       return matchSearch
//     })
//   }, [restaurants, search, filter])

//   const openCount = useMemo(() => {
//     return restaurants.filter(r => r.isOpen).length
//   }, [restaurants])

//   return (
//     <div>
//       {/* HEADER */}
//       <div className="stripe-bg py-12">
//         <div className="wrap">
//           <h1 className="font-display font-black text-4xl text-ink mb-2">
//             Restaurants
//           </h1>

//           <p className="text-slate mb-6">
//             {openCount} open right now · {restaurants.length} total
//           </p>

//           {/* SEARCH */}
//           <div className="relative max-w-md">
//             <Search
//               size={17}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
//             />
//             <input
//               className="input-field pl-11 rounded-full"
//               placeholder="Search restaurants..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="page-wrap">
//         {/* FILTERS */}
//         <div className="flex gap-2 flex-wrap mb-8">
//           {[
//             { k: 'all', l: 'All' },
//             { k: 'open', l: '🟢 Open Now' },
//             { k: 'popular', l: '🔥 Popular' },
//             { k: 'featured', l: '⭐ Featured' },
//             { k: 'free', l: '🚚 Free Delivery' },
//           ].map(f => (
//             <button
//               key={f.k}
//               onClick={() => setFilter(f.k)}
//               className={`chip ${
//                 filter === f.k ? 'chip-active' : 'chip-idle'
//               }`}
//             >
//               {f.l}
//             </button>
//           ))}
//         </div>

//         {/* LOADING */}
//         {loading ? (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="skeleton h-64 rounded-3xl" />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           /* EMPTY STATE */
//           <div className="text-center py-20">
//             <p className="text-5xl mb-4">🔍</p>
//             <p className="font-display font-bold text-xl text-ink mb-2">
//               No restaurants found
//             </p>
//             <button
//               onClick={() => {
//                 setSearch('')
//                 setFilter('all')
//               }}
//               className="btn-pink mt-3"
//             >
//               Show All
//             </button>
//           </div>
//         ) : (
//           /* GRID */
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(r => (
//               <Link
//                 key={r._id}
//                 to={`/restaurants/${r._id}`}
//                 className="card-hover group overflow-hidden"
//               >
//                 {/* IMAGE */}
//                 <div className="relative h-40 bg-gradient-to-br from-pink-50 to-rose-light overflow-hidden">
//                   {r.coverImage ? (
//                     <img
//                       src={r.coverImage}
//                       alt={r.name}
//                       loading="lazy"
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-7xl">
//                       {r.emoji || '🍜'}
//                     </div>
//                   )}

//                   {/* BADGES */}
//                   <div className="absolute top-3 left-3 flex gap-2">
//                     {r.isOpen && r.isFeatured && (
//                       <span className="badge-pink text-[10px]">
//                         ⭐ Featured
//                       </span>
//                     )}
//                     {r.isOpen && r.isPopular && (
//                       <span className="badge badge-yellow text-[10px]">
//                         🔥 Popular
//                       </span>
//                     )}
//                     {!r.isOpen && (
//                       <span className="badge-gray">Closed</span>
//                     )}
//                   </div>

//                   {/* RATING */}
//                   <div className="absolute top-3 right-3 bg-white/95 rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-card">
//                     <Star size={11} className="text-yellow-400" fill="currentColor" />
//                     <span className="font-bold text-xs">
//                       {r.rating?.toFixed(1) || 'N/A'}
//                     </span>
//                   </div>

//                   {!r.isOpen && (
//                     <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
//                   )}
//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-5">
//                   <h3 className="font-bold text-lg mb-1">
//                     {r.name}
//                   </h3>

//                   <p className="text-muted text-sm line-clamp-1 mb-3">
//                     {r.description}
//                   </p>

//                   {/* CUISINE */}
//                   <div className="flex flex-wrap gap-1.5 mb-3">
//                     {(r.cuisine || [])
//                       .slice(0, 3)
//                       .map(c => (
//                         <span key={c} className="badge-gray text-[10px]">
//                           {c}
//                         </span>
//                       ))}
//                   </div>

//                   {/* FOOTER */}
//                   <div className="flex items-center justify-between pt-3 border-t border-faint text-xs">
//                     <span className="flex items-center gap-1 text-slate">
//                       <Clock size={11} /> {r.deliveryTime} min
//                     </span>

//                     <span
//                       className={
//                         r.deliveryFee === 0
//                           ? 'text-green-600 font-bold'
//                           : 'text-slate'
//                       }
//                     >
//                       {r.deliveryFee === 0
//                         ? '🚚 Free'
//                         : `NPR ${r.deliveryFee}`}
//                     </span>

//                     <span className="flex items-center gap-1 text-pink font-bold group-hover:gap-2 transition-all">
//                       Order <ChevronRight size={11} />
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
// Customer — Restaurants listing page
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, Truck, Search, ChevronRight, X } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const FILTERS = [
  { k: 'all',      l: 'All' },
  { k: 'open',     l: '🟢 Open Now' },
  { k: 'popular',  l: '🔥 Popular' },
  { k: 'featured', l: '⭐ Featured' },
  { k: 'free',     l: '🚚 Free Delivery' },
]

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')

   useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)

        console.log('Fetching:', ROUTES.restaurants)

        const response = await api.get(ROUTES.restaurants)

        console.log('API Response:', response)

        if (response?.ok) {
          const restaurantData =
            response?.data?.restaurants ||
            response?.data?.data ||
            response?.data ||
            []

          console.log('Restaurants:', restaurantData)

          setRestaurants(Array.isArray(restaurantData) ? restaurantData : [])
        } else {
          toast.error('Failed to load restaurants')
          setRestaurants([])
        }
      } catch (error) {
        console.error('Restaurant Fetch Error:', error)

        toast.error('Something went wrong')
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      const q = search.toLowerCase()
      const ms = !search
        || r.name?.toLowerCase().includes(q)
        || r.description?.toLowerCase().includes(q)
        || (r.cuisine || []).some(c => c.toLowerCase().includes(q))

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
          <h1 className="font-display font-black text-4xl mb-1">Restaurants</h1>
          <p className="text-pink-100 text-sm mb-5">
            {openCount} open right now · {restaurants.length} total
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-10"/>
            <input
              className="w-full bg-white/20 backdrop-blur border border-white/30 rounded-full pl-12 pr-10 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-white transition-all text-sm"
              placeholder="Search restaurants or cuisine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                <X size={15}/>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`chip ${filter === f.k ? 'chip-active' : 'chip-idle'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-3xl"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
            /* Empty state */
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-display font-bold text-xl text-ink mb-2">No restaurants found</p>
            <p className="text-muted text-sm mb-4">Try a different search or filter</p>
            <button onClick={() => { setSearch(''); setFilter('all') }} className="btn-pink mt-2">
              Show All
            </button>
          </div>
        ) : (
          /* Restaurant grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <Link key={r._id} to={`/restaurants/${r._id}`} className="card-hover group overflow-hidden">

                {/* Cover image */}
                <div className="relative h-44 bg-gradient-to-br from-pink-100 to-pink-200 overflow-hidden">
                  {r.coverImage ? (
                    <img src={r.coverImage} alt={r.name} loading="lazy"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!r.isOpen ? 'grayscale opacity-70' : ''}`}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      {r.emoji || '🍽️'}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {r.isFeatured && <span className="badge-pink text-[10px]">⭐ Featured</span>}
                    {r.isPopular && !r.isFeatured && <span className="badge badge-yellow text-[10px]">🔥 Popular</span>}
                    {!r.isOpen && <span className="badge-gray text-[10px]">Closed</span>}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-card">
                    <Star size={11} className="text-yellow-400" fill="currentColor"/>
                    <span className="font-bold text-xs">{r.rating?.toFixed(1) || '4.5'}</span>
                  </div>

                  {/* Closed overlay */}
                  {!r.isOpen && <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"/>}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink text-lg leading-tight">{r.name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {r.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <p className="text-muted text-sm line-clamp-1 mb-3">{r.description}</p>

                  {/* Cuisine tags */}
                  {(r.cuisine || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {r.cuisine.slice(0, 3).map(c => (
                        <span key={c} className="badge-gray text-[10px]">{c}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-faint text-xs">
                    <span className="flex items-center gap-1 text-slate">
                      <Clock size={11}/> {r.deliveryTime} min
                    </span>
                    <span className={r.deliveryFee === 0 ? 'text-green-600 font-bold' : 'text-slate'}>
                      <Truck size={11} className="inline mr-0.5"/>
                      {r.deliveryFee === 0 ? 'Free' : `NPR ${r.deliveryFee}`}
                    </span>
                    <span className="flex items-center gap-0.5 text-pink font-bold group-hover:gap-1.5 transition-all">
                      View Menu <ChevronRight size={11}/>
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