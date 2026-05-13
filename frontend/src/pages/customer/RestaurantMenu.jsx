import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, Truck, ChevronLeft, Search, Plus, Heart, X, MapPin, Phone, ShoppingBag } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  'Steamed Momo': '🫕', 'Fried Momo': '🍳', 'Jhol Momo': '🍲',
  'C-Momo': '🌶️', 'Kothey Momo': '🥟', 'Drinks': '🧃',
  'Snacks': '🍟', 'Desserts': '🍮', 'Thali': '🍱',
  'Newari Special': '🎎', 'All': '🍽️', 'Other': '🍜',
}

/* ── Product Card ── */
function ProductCard({ product, isRestaurantOpen }) {
  const { token } = useAuth()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [adding, setAdding] = useState(false)

  const wishlisted = isWishlisted(product._id)
  const available = product.productStatus === 'available'

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!token)           { toast.error('Please login to order'); return }
    if (!isRestaurantOpen){ toast.error('Restaurant is currently closed'); return }
    if (!available)       { toast.error('Item is unavailable'); return }
    setAdding(true)
    const res = await addToCart(product._id)
    if (res?.ok) toast.success(`${product.productName} added to cart!`)
    else         toast.error('Could not add to cart')
    setAdding(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    toggle(product)
  }

  return (
    <Link to={`/product/${product._id}`}
      className="group flex gap-4 p-4 rounded-2xl hover:bg-pink-50/70 transition-all duration-200 border border-transparent hover:border-pink-100">

      {/* Image */}
      <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100">
        {product.productImage ? (
          <img src={product.productImage} alt={product.productName} loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!available ? 'opacity-50 grayscale' : ''}`}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍜</div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 bg-white/90 px-1.5 py-0.5 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-display font-bold text-ink text-sm leading-tight mb-0.5">{product.productName}</h4>
          <p className="text-muted text-xs line-clamp-2 leading-relaxed">{product.productDescription}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display font-black text-pink text-base">NPR {product.productPrice?.toLocaleString()}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={handleWishlist}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                wishlisted ? 'bg-pink text-white shadow-pink-sm' : 'bg-pink-50 text-pink hover:bg-pink-100'}`}>
              <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'}/>
            </button>
            {available && (
              <button onClick={handleAdd} disabled={adding}
                className="w-8 h-8 rounded-xl bg-pink text-white flex items-center justify-center shadow-pink-sm hover:bg-rose-dark active:scale-95 transition-all disabled:opacity-60">
                {adding
                  ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <Plus size={14}/>}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Loading Skeleton ── */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 w-full"/>
      <div className="page-wrap pt-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded-2xl w-1/3"/>
        <div className="h-4 bg-gray-100 rounded-xl w-2/3"/>
        <div className="flex gap-3 mt-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-24 bg-gray-100 rounded-full"/>)}
        </div>
        <div className="grid gap-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl shrink-0"/>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-2/3"/>
                <div className="h-3 bg-gray-100 rounded w-full"/>
                <div className="h-3 bg-gray-100 rounded w-4/5"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function RestaurantMenu() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [activeCategory, setActive] = useState('All')
  const categoryRefs = useRef({})
  const contentRef   = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get(ROUTES.restaurantMenu(id))
      .then(({ ok, data }) => {
        if (ok) {
          setRestaurant(data?.data?.restaurant)
          setProducts(data?.data?.products || [])
        } else toast.error('Failed to load restaurant')
      })
      .catch(() => toast.error('Something went wrong'))
      .finally(() => setLoading(false))
  }, [id])

  const categories = useMemo(() =>
    ['All', ...new Set(products.map(p => p.productCategory?.trim()).filter(Boolean))]
  , [products])

  const filtered = useMemo(() =>
    products.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !search
        || p.productName?.toLowerCase().includes(q)
        || p.productDescription?.toLowerCase().includes(q)
      const matchCat = activeCategory === 'All' || p.productCategory === activeCategory
      return matchSearch && matchCat
    })
  , [products, search, activeCategory])

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(p => {
      const cat = p.productCategory || 'Other'
      if (!g[cat]) g[cat] = []
      g[cat].push(p)
    })
    return g
  }, [filtered])

  const scrollToCategory = (cat) => {
    setActive(cat)
    if (cat === 'All') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const el = categoryRefs.current[cat]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) return <Skeleton/>

  if (!restaurant) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🍽️</p>
      <p className="font-display font-bold text-xl text-ink mb-2">Restaurant not found</p>
      <Link to="/menu" className="btn-pink mt-4 inline-flex">Browse Restaurants</Link>
    </div>
  )

  const availableCount = products.filter(p => p.productStatus === 'available').length

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-pink-200 to-rose-300">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name}
            className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-9xl opacity-30">
            {restaurant.emoji || '🍽️'}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"/>

        {/* Back button */}
        <Link to="/menu"
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3.5 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30">
          <ChevronLeft size={16}/> Restaurants
        </Link>

        {/* Closed overlay */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/20 border border-white/40 text-white font-display font-bold text-2xl px-8 py-3 rounded-2xl backdrop-blur-sm">
              Currently Closed
            </span>
          </div>
        )}

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {restaurant.isFeatured && (
                  <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">⭐ Featured</span>
                )}
                {restaurant.isPopular && (
                  <span className="text-[10px] font-bold bg-orange-400 text-white px-2 py-0.5 rounded-full">🔥 Popular</span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${restaurant.isOpen ? 'bg-green-400 text-green-900' : 'bg-gray-400 text-white'}`}>
                  {restaurant.isOpen ? '● Open' : '● Closed'}
                </span>
              </div>
              <h1 className="font-display font-black text-white text-3xl leading-tight drop-shadow">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-white/80 text-sm mt-1 line-clamp-1">{restaurant.description}</p>
              )}
            </div>

            {/* Rating pill */}
            <div className="shrink-0 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2.5 text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star size={14} className="text-yellow-400" fill="currentColor"/>
                <span className="font-display font-black text-white text-lg">{restaurant.rating?.toFixed(1) || '4.5'}</span>
              </div>
              <p className="text-white/70 text-[10px]">rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Bar ── */}
      <div className="bg-white border-b border-faint">
        <div className="wrap">
          <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-none text-sm text-slate">
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock size={14} className="text-pink"/>
              <span>{restaurant.deliveryTime || '20-30'} min</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <Truck size={14} className="text-pink"/>
              <span>{restaurant.deliveryFee === 0 ? <span className="text-green-600 font-semibold">Free delivery</span> : `NPR ${restaurant.deliveryFee} delivery`}</span>
            </span>
            {restaurant.minimumOrder > 0 && (
              <span className="flex items-center gap-1.5 shrink-0">
                <ShoppingBag size={14} className="text-pink"/>
                <span>Min NPR {restaurant.minimumOrder}</span>
              </span>
            )}
            {restaurant.address && (
              <span className="flex items-center gap-1.5 shrink-0 truncate">
                <MapPin size={14} className="text-pink shrink-0"/>
                <span className="truncate">{restaurant.address}</span>
              </span>
            )}
            {restaurant.phoneNumber && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Phone size={14} className="text-pink"/>
                <span>{restaurant.phoneNumber}</span>
              </span>
            )}
            <span className="ml-auto shrink-0 text-muted text-xs">{availableCount} items available</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="wrap py-6 lg:flex lg:gap-8" ref={contentRef}>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 bg-white border border-faint rounded-3xl p-3 shadow-card">
            <p className="text-xs font-bold text-muted uppercase tracking-wider px-2 mb-2">Menu</p>
            {categories.map(cat => {
              const count = cat === 'All'
                ? filtered.length
                : filtered.filter(p => p.productCategory === cat).length
              return (
                <button key={cat} onClick={() => scrollToCategory(cat)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all text-left mb-0.5
                    ${activeCategory === cat ? 'bg-pink text-white shadow-pink-sm' : 'text-ink hover:bg-pink-50 hover:text-pink'}`}>
                  <span className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[cat] || '🍽️'}</span>
                    <span className="truncate">{cat}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeCategory === cat ? 'bg-white/30 text-white' : 'bg-gray-100 text-muted'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
            <input
              className="w-full bg-white border border-faint rounded-2xl pl-11 pr-10 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all shadow-card"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                <X size={15}/>
              </button>
            )}
          </div>

          {/* Mobile Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-5 lg:hidden">
            {categories.map(cat => (
              <button key={cat} onClick={() => scrollToCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all
                  ${activeCategory === cat ? 'bg-pink text-white shadow-pink-sm' : 'bg-white border border-faint text-slate hover:border-pink hover:text-pink'}`}>
                {CATEGORY_ICONS[cat] || '🍽️'} {cat}
              </button>
            ))}
          </div>

          {/* Items */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-display font-bold text-xl text-ink mb-2">Nothing found</p>
              <p className="text-muted text-sm mb-5">Try a different search or category</p>
              <button onClick={() => { setSearch(''); setActive('All') }} className="btn-pink">Show All</button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} ref={el => (categoryRefs.current[cat] = el)}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{CATEGORY_ICONS[cat] || '🍽️'}</span>
                    <div>
                      <h2 className="font-display font-bold text-ink text-lg leading-tight">{cat}</h2>
                      <p className="text-muted text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="bg-white rounded-3xl border border-faint shadow-card divide-y divide-faint overflow-hidden">
                    {items.map(p => (
                      <ProductCard key={p._id} product={p} isRestaurantOpen={restaurant.isOpen}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
