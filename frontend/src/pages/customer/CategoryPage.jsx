import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, Star, ArrowLeft, ShoppingBag } from 'lucide-react'
import { api } from '../../services/api'

const CATEGORY_IMAGES = {
  Momo:   'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&h=300&fit=crop',
  Pizza:  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=300&fit=crop',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=300&fit=crop',
  Kimbap: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&h=300&fit=crop',
  Sekuwa: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=300&fit=crop',
  Ramen:  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=300&fit=crop',
}

function ProductCard({ product }) {
  const r = product.restaurant
  return (
    <Link to={`/product/${product._id}`} className="card-hover group overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
        {product.productImage ? (
          <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-pink-100 to-pink-200">🍽️</div>
        )}
        <div className="absolute top-2 left-2 badge-pink text-[10px]">{product.productCategory}</div>
        {product.productStatus !== 'available' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 font-bold text-xs px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-ink text-sm leading-tight mb-1">{product.productName}</h3>
        {r && (
          <p className="text-muted text-xs mb-2 flex items-center gap-1">
            <span>{r.emoji || '🏪'}</span>
            <span className="truncate">{r.name}</span>
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="font-display font-extrabold text-pink">NPR {product.productPrice?.toLocaleString()}</span>
          {r && (
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock size={10} /> {r.deliveryTime} min
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function RestaurantGroupCard({ restaurant, products }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-faint">
        <span className="text-2xl">{restaurant.emoji || '🏪'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink text-sm">{restaurant.name}</p>
          <p className="text-muted text-xs">{restaurant.address}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted shrink-0">
          <span className="flex items-center gap-1"><Clock size={11}/> {restaurant.deliveryTime} min</span>
          <span className={restaurant.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
            {restaurant.deliveryFee === 0 ? '🚚 Free' : `NPR ${restaurant.deliveryFee}`}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-faint">
        {products.map(p => (
          <Link key={p._id} to={`/product/${p._id}`} className="flex items-center gap-3 p-3 hover:bg-pink-50 transition-colors group">
            <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-pink-50">
              {p.productImage
                ? <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-ink text-xs leading-tight truncate">{p.productName}</p>
              <p className="font-bold text-pink text-xs mt-1">NPR {p.productPrice?.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const { name } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('grid') // 'grid' | 'byRestaurant'

  useEffect(() => {
    setLoading(true)
    api.get(`/products?search=${encodeURIComponent(name)}&status=available`)
      .then(({ ok, data }) => { if (ok) setProducts(data.data || []) })
      .finally(() => setLoading(false))
  }, [name])

  const heroImg = CATEGORY_IMAGES[name] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=300&fit=crop'

  // Group products by restaurant
  const byRestaurant = products.reduce((acc, p) => {
    const rId = p.restaurant?._id
    if (!rId) return acc
    if (!acc[rId]) acc[rId] = { restaurant: p.restaurant, products: [] }
    acc[rId].products.push(p)
    return acc
  }, {})
  const restaurantGroups = Object.values(byRestaurant)

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-44 overflow-hidden">
        <img src={heroImg} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-ink/30 flex items-end p-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-2 transition-colors">
              <ArrowLeft size={14}/> Back
            </Link>
            <h1 className="font-display font-black text-white text-3xl">{name}</h1>
            <p className="text-white/70 text-sm mt-1">
              {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} from ${restaurantGroups.length} restaurant${restaurantGroups.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {/* View toggle */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-ink text-lg">All {name} items</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${view === 'grid' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('byRestaurant')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${view === 'byRestaurant' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
              >
                By Restaurant
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="font-display font-bold text-xl text-ink mb-2">No {name} items found</h3>
            <p className="text-muted mb-6">Restaurants haven't added {name} to their menu yet.</p>
            <Link to="/restaurants" className="btn-pink">Browse all restaurants</Link>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="space-y-5">
            {restaurantGroups.map(({ restaurant, products: rProducts }) => (
              <RestaurantGroupCard key={restaurant._id} restaurant={restaurant} products={rProducts} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
