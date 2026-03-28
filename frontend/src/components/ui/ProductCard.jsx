import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Star, Clock, Zap, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product, layout = 'grid', badge = null }) {
  const { token } = useAuth()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [adding, setAdding] = useState(false)
  const wishlisted = isWishlisted(product._id)
  const available = product.productStatus === 'available'

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!token) { toast.error('Please login to add to cart 🔐'); return }
    setAdding(true)
    const res = await addToCart(product._id)
    if (res.ok) toast.success(`${product.productName} added! 🛒`)
    else toast.error('Could not add to cart')
    setAdding(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    toggle(product)
    toast(wishlisted ? '💔 Removed from wishlist' : '❤️ Added to wishlist!', { icon: '' })
  }

  /* ── LIST LAYOUT ── */
  if (layout === 'list') return (
    <Link to={`/product/${product._id}`} className="card-hover flex items-center gap-4 p-3 sm:p-4 group">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-cream-dark shrink-0">
        {product.productImage
          ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🍜</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="badge badge-gray text-[10px] mb-1">{product.productCategory}</span>
            <h3 className="font-display font-bold text-charcoal text-base leading-tight truncate">{product.productName}</h3>
            <p className="text-slate text-xs mt-0.5 line-clamp-1">{product.productDescription}</p>
          </div>
          <button onClick={handleWishlist}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-cream text-slate hover:text-red-400'}`}>
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display font-extrabold text-primary text-xl">NPR {product.productPrice?.toLocaleString()}</span>
          {available
            ? <button onClick={handleAdd} disabled={adding}
                className="btn-primary px-4 py-2 text-xs gap-1.5">
                {adding ? <span className="spinner" /> : <Plus size={13}/>} Add to Cart
              </button>
            : <span className="badge badge-gray">Unavailable</span>}
        </div>
      </div>
    </Link>
  )

  /* ── GRID LAYOUT (default) ── */
  return (
    <Link to={`/product/${product._id}`} className="card-hover group flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden bg-cream-dark" style={{aspectRatio:'4/3'}}>
        {product.productImage
          ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-cream-dark to-primary-50">🍜</div>}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="badge badge-primary text-[10px]">{product.productCategory}</span>
          {badge && <span className="badge badge-gold text-[10px]">{badge}</span>}
        </div>

        <button onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl shadow-card flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90
            ${wishlisted ? 'bg-red-500 text-white shadow-red-200' : 'bg-white text-slate hover:text-red-400'}`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {!available && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
            <span className="badge badge-gray text-xs">Currently Unavailable</span>
          </div>
        )}

        {/* Quick add pill — appears on hover */}
        {available && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAdd} disabled={adding}
              className="w-full py-3 bg-primary text-white font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-light transition-colors">
              {adding ? <span className="spinner" /> : <ShoppingCart size={15}/>}
              {adding ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-charcoal text-[15px] leading-tight line-clamp-1">{product.productName}</h3>
        <p className="text-slate text-xs leading-relaxed mt-1 line-clamp-2 flex-1">{product.productDescription}</p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-faint/50">
          <div>
            <span className="font-body font-medium text-primary text-xl">NPR {product.productPrice?.toLocaleString()}</span>
            {product.productQuantity <= 5 && available && (
              <p className="text-[10px] text-orange-500 font-semibold mt-0.5 flex items-center gap-1">
                <Zap size={9}/> Only {product.productQuantity} left!
              </p>
            )}
          </div>
          {available && (
            <button onClick={handleAdd} disabled={adding}
              className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow-sm hover:bg-primary-light hover:shadow-glow-primary hover:scale-110 transition-all duration-200 disabled:opacity-60 disabled:scale-100">
              {adding ? <span className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={17}/>}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}