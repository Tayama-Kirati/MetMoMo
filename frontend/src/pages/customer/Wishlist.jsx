import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Trash2, ShoppingCart } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Wishlist() {
  const { wishlist, toggle } = useWishlist()
  const { addToCart } = useCart()
  const { token } = useAuth()
  const [adding, setAdding] = useState(null)

  const handleAdd = async (product) => {
    if (!token) { toast.error('Please login first'); return }
    setAdding(product._id)
    const res = await addToCart(product._id)
    if (res.ok) toast.success(`${product.productName} added to cart! 🛒`)
    else toast.error('Could not add to cart')
    setAdding(null)
  }

  const handleAddAll = async () => {
    if (!token) { toast.error('Please login first'); return }
    const avail = wishlist.filter(p => p.productStatus === 'available')
    for (const p of avail) await addToCart(p._id)
    toast.success(`${avail.length} items added to cart! 🛒`)
  }

  if (wishlist.length === 0) return (
    <div className="wrap py-28 text-center">
      <div className="w-28 h-28 bg-red-50 rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-card">
        <Heart size={52} className="text-red-300" />
      </div>
      <h2 className="font-body font-extrabold text-3xl text-charcoal mb-3">Your wishlist is empty</h2>
      <p className="text-slate text-lg mb-8 max-w-sm mx-auto">Save your favourite items here to order them later!</p>
      <Link to="/menu" className="btn-primary font-body font-regular gap-2 px-8 py-4 text-base">Browse Menu <ArrowRight size={18}/></Link>
    </div>
  )

  return (
    <div className="wrap py-10">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="section-title">My Wishlist</h1>
          <p className="section-sub">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
        {token && wishlist.some(p => p.productStatus === 'available') && (
          <button onClick={handleAddAll} className="btn-primary gap-2">
            <ShoppingCart size={16} /> Add All to Cart
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishlist.map(product => (
          <div key={product._id} className="card-hover group flex flex-col overflow-hidden">
            <Link to={`/product/${product._id}`} className="relative block overflow-hidden bg-cream-dark" style={{aspectRatio:'4/3'}}>
              {product.productImage
                ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}
              <span className="absolute top-3 left-3 badge badge-primary text-[10px]">{product.productCategory}</span>
              {product.productStatus !== 'available' && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="badge badge-gray">Unavailable</span>
                </div>
              )}
            </Link>

            <div className="p-4 flex flex-col flex-1">
              <Link to={`/product/${product._id}`}>
                <h3 className="font-body font-bold text-charcoal text-base leading-tight hover:text-primary transition-colors">{product.productName}</h3>
              </Link>
              <p className="text-slate text-xs mt-1 line-clamp-2 flex-1">{product.productDescription}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-faint/50">
                <span className="font-body font-extrabold text-primary text-xl">NPR {product.productPrice?.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(product)}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Remove">
                    <Trash2 size={14} />
                  </button>
                  {product.productStatus === 'available' && (
                    <button onClick={() => handleAdd(product)} disabled={adding === product._id}
                      className="btn-primary px-3 py-2 text-xs gap-1">
                      {adding === product._id ? <span className="spinner" /> : <ShoppingCart size={12} />}
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}