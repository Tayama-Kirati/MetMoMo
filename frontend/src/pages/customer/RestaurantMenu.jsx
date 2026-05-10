// import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, MapPin, Truck, Phone, ChevronLeft, Search, Plus, Heart } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'
import { useState, useEffect, useMemo } from 'react'


const CATEGORY_ICONS = {
  'Steamed Momo': '🫕', 'Fried Momo': '🍳', 'Jhol Momo': '🍲',
  'C-Momo': '🌶️', 'Kothey Momo': '🥟', 'Drinks': '🧃',
  'Snacks': '🍟', 'Desserts': '🍮', 'Thali': '🍱',
  'Newari Special': '🎎', 'default': '🍽️',
}

function ProductRow({ product, isRestaurantOpen }) {
  const { token } = useAuth()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [adding, setAdding] = useState(false)

  const wishlisted = isWishlisted(product._id)
  const available = product.productStatus === 'available'

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      toast.error('Please login to order')
      return
    }

    if (!isRestaurantOpen) {
      toast.error('Restaurant is closed')
      return
    }

    try {
      setAdding(true)
      const res = await addToCart(product._id)

      if (res.ok) toast.success(`${product.productName} added! 🛒`)
      else toast.error('Could not add to cart')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link to={`/product/${product._id}`}
      className="flex items-center gap-4 p-4 hover:bg-pink-50 transition-colors rounded-2xl group">

      {/* Image */}
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 border border-faint">
        {product.productImage ? (
          <img
            src={product.productImage}
            alt={product.productName}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!available ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{product.productName}</h4>
        <p className="text-xs text-muted line-clamp-2">
          {product.productDescription}
        </p>
        {!available && (
          <span className="text-red-400 text-xs font-bold">Unavailable</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <span className="font-bold text-pink">
          NPR {product.productPrice?.toLocaleString()}
        </span>

        <div className="flex gap-2">
          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggle(product)
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              wishlisted ? 'bg-pink text-white' : 'bg-pink-50 text-pink'
            }`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Add */}
          {available && (
            <button
              onClick={handleAdd}
              disabled={adding || !isRestaurantOpen}
              className="w-8 h-8 rounded-xl bg-pink text-white flex items-center justify-center disabled:opacity-50"
            >
              {adding ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={14} />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function RestaurantMenu() {
  const { id } = useParams()

  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActive] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { ok, data } = await api.get(ROUTES.restaurantMenu(id))

        if (ok) {
          setRestaurant(data?.data?.restaurant)
          setProducts(data?.data?.products || [])
        } else {
          toast.error('Failed to load restaurant')
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    window.scrollTo(0, 0)
  }, [id])

  // Categories
  const categories = useMemo(() => {
    return ['All', ...new Set(
      products.map(p => p.productCategory?.trim()).filter(Boolean)
    )]
  }, [products])

  // Filtered
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !search ||
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.productDescription?.toLowerCase().includes(search.toLowerCase())

      const matchCategory =
        activeCategory === 'All' || p.productCategory === activeCategory

      return matchSearch && matchCategory
    })
  }, [products, search, activeCategory])

  // Grouped
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(p => {
      const cat = p.productCategory || 'Other'
      if (!g[cat]) g[cat] = []
      g[cat].push(p)
    })
    return g
  }, [filtered])

  if (loading) return <div className="p-10 text-center">Loading...</div>

  if (!restaurant) {
    return (
      <div className="text-center p-10">
        <p>Restaurant not found</p>
        <Link to="/restaurants">Back</Link>
      </div>
    )
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>

      {/* Search */}
      <input
        className="border p-2 mt-3"
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Categories */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1 rounded ${
              activeCategory === c ? 'bg-pink text-white' : 'bg-gray-200'
            }`}
          >
            {CATEGORY_ICONS[c] || '🍽️'} {c}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <p>No items found</p>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="font-bold text-lg mb-2">{cat}</h2>
              {items.map(p => (
                <ProductRow
                  key={p._id}
                  product={p}
                  isRestaurantOpen={restaurant.isOpen}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}