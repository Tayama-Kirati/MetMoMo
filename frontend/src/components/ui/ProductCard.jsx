import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product, layout = 'grid' }) {
  const { token } = useAuth()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [adding, setAdding] = useState(false)
  const wishlisted  = isWishlisted(product._id)
  const available   = product.productStatus === 'available'

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!token) { toast.error('Please login first '); return }
    setAdding(true)
    const res = await addToCart(product._id)
    if (res.ok) toast.success(`${product.productName} added!`)
    else toast.error('Could not add to cart')
    setAdding(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    toggle(product)
    toast(wishlisted ? 'Removed from wishlist' : ' Added to wishlist!', { icon: '' })
  }

  if (layout === 'list') return (
    <Link to={`/product/${product._id}`} className="card-hover flex items-center gap-4 p-3 group">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 shrink-0">
        {product.productImage
          ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">
            <img src="/placeholder.png" alt={product.productName} className="w-full h-full object-cover" />
          </div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-pink font-display font-bold uppercase tracking-wider mb-0.5">{product.productCategory}</p>
        <h3 className="font-display font-bold text-ink text-base leading-tight truncate">{product.productName}</h3>
        <p className="text-muted text-xs mt-0.5 line-clamp-1">{product.productDescription}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-extrabold text-pink text-lg">NPR {product.productPrice?.toLocaleString()}</p>
        {available && (
          <button onClick={handleAdd} disabled={adding}
            className="mt-1.5 w-8 h-8 rounded-xl bg-pink text-white flex items-center justify-center hover:bg-pink-600 hover:scale-110 transition-all shadow-pink-sm ml-auto disabled:opacity-60">
            {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14}/>}
          </button>
        )}
      </div>
    </Link>
  )

  return (
    <Link to={`/product/${product._id}`} className="card-hover group flex flex-col overflow-hidden">
      <div className="relative overflow-hidden bg-pink-50" style={{aspectRatio:'4/3'}}>
        {product.productImage
          ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-pink-50 to-rose-light">🍜</div>}

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="badge-pink text-[10px]">{product.productCategory}</span>
          {product.isBestSeller && <span className="badge badge-yellow text-[9px]">🔥 Best Seller</span>}
        </div>

        <button onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-xl shadow-card flex items-center justify-center transition-all hover:scale-110
            ${wishlisted ? 'bg-pink text-white' : 'bg-white text-muted hover:text-pink'}`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {!available && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
            <span className="badge-gray text-xs">Unavailable</span>
          </div>
        )}

        {/* Quick add on hover */}
        {available && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAdd} disabled={adding}
              className="w-full py-2.5 bg-pink text-white font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors">
              {adding ? <span className="spinner" /> : <ShoppingCart size={14}/>}
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-ink text-sm leading-tight line-clamp-1">{product.productName}</h3>
        <p className="text-muted text-xs mt-1 line-clamp-2 flex-1 leading-relaxed">{product.productDescription}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-faint">
          <span className="font-display font-extrabold text-pink text-lg">NPR {product.productPrice?.toLocaleString()}</span>
          {product.productQuantity <= 5 && available && (
            <span className="text-[10px] text-orange-500 font-display font-bold">Only {product.productQuantity} left!</span>
          )}
          {available && (
            <button onClick={handleAdd} disabled={adding}
              className="w-8 h-8 rounded-xl bg-pink text-white flex items-center justify-center hover:bg-pink-600 hover:scale-110 transition-all shadow-pink-sm disabled:opacity-60">
              {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15}/>}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
