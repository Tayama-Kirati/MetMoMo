// Wishlist
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { api, ROUTES } from '../../services/api'
import { useEffect } from 'react'
import { useMemo } from 'react'
import ProductCard from '../../components/ui/ProductCard'
 

export default function Wishlist() {
  const { wishlist, toggle } = useWishlist()
  const { addToCart } = useCart()
  const { token } = useAuth()
  const [adding, setAdding] = useState(null)

  const handleAdd = async (p) => {
    if (!token) { toast.error('Please login'); return }
    setAdding(p._id)
    const res = await addToCart(p._id)
    if (res.ok) toast.success(`${p.productName} added! 🛒`)
    else toast.error('Could not add')
    setAdding(null)
  }

  if (wishlist.length === 0) return (
    <div className="page-wrap text-center py-24">
      <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center mx-auto mb-6"><Heart size={48} className="text-pink-200"/></div>
      <h2 className="font-display font-black text-2xl text-ink mb-3">Wishlist is empty</h2>
      <p className="text-muted mb-7">Save your favourite items here!</p>
      <Link to="/restaurants" className="btn-pink gap-2">Browse Menu <ArrowRight size={15}/></Link>
    </div>
  )

  return (
    <div className="page-wrap">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">My Wishlist</h1>
          <p className="text-muted mt-1">{wishlist.length} saved items</p>
        </div>
        {token && wishlist.some(p => p.productStatus === 'available') && (
          <button onClick={async () => {
            for (const p of wishlist.filter(x => x.productStatus === 'available')) await addToCart(p._id)
            toast.success('All items added to cart!')
          }} className="btn-pink gap-2"><ShoppingCart size={15}/> Add All</button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishlist.map(p => (
          <div key={p._id} className="card-hover group overflow-hidden flex flex-col">
            <Link to={`/product/${p._id}`} className="relative block overflow-hidden bg-pink-50" style={{aspectRatio:'4/3'}}>
              {p.productImage ? <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}
              <span className="absolute top-2.5 left-2.5 badge-pink text-[10px]">{p.productCategory}</span>
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <Link to={`/product/${p._id}`}><h3 className="font-display font-bold text-ink hover:text-pink transition-colors">{p.productName}</h3></Link>
              <p className="text-muted text-xs mt-0.5 line-clamp-2 flex-1">{p.productDescription}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-faint">
                <span className="font-display font-extrabold text-pink text-lg">NPR {p.productPrice?.toLocaleString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggle(p)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={13}/></button>
                  {p.productStatus === 'available' && (
                    <button onClick={() => handleAdd(p)} disabled={adding === p._id} className="btn-pink px-3 py-1.5 text-xs gap-1 rounded-xl">
                      {adding === p._id ? <span className="spinner"/> : <ShoppingCart size={11}/>} Add
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
