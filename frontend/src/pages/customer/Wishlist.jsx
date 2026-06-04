import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight, Star, Clock, Truck } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { wishlist, toggle, favRestaurants, toggleRestaurant } = useWishlist()
  const { addToCart } = useCart()
  const { token } = useAuth()
  const [adding, setAdding] = useState(null)
  const [tab, setTab] = useState('items') // 'items' | 'restaurants'

  const handleAdd = async (p) => {
    if (!token) { toast.error('Please login'); return }
    setAdding(p._id)
    const res = await addToCart(p._id)
    if (res?.ok) toast.success(`${p.productName} added! 🛒`)
    else toast.error('Could not add')
    setAdding(null)
  }

  const handleAddAll = async () => {
    for (const p of wishlist.filter(x => x.productStatus === 'available')) await addToCart(p._id)
    toast.success('All items added to cart!')
  }

  const isEmpty = wishlist.length === 0 && favRestaurants.length === 0

  if (isEmpty) return (
    <div className="page-wrap text-center py-24">
      <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center mx-auto mb-6">
        <Heart size={48} className="text-pink-200"/>
      </div>
      <h2 className="font-display font-black text-2xl text-ink mb-3">No favourites yet</h2>
      <p className="text-muted mb-7">Heart food items and restaurants to save them here!</p>
      <Link to="/restaurants" className="btn-pink gap-2">Browse Restaurants <ArrowRight size={15}/></Link>
    </div>
  )

  return (
    <div className="page-wrap">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">My Favourites</h1>
          <p className="text-muted mt-1">
            {wishlist.length} food item{wishlist.length !== 1 ? 's' : ''} · {favRestaurants.length} restaurant{favRestaurants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {tab === 'items' && token && wishlist.some(p => p.productStatus === 'available') && (
          <button onClick={handleAddAll} className="btn-pink gap-2">
            <ShoppingCart size={15}/> Add All to Cart
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-7 border-b border-faint">
        {[
          { key: 'items',       label: 'Favourite Food',        count: wishlist.length },
          { key: 'restaurants', label: 'Favourite Restaurants',  count: favRestaurants.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 px-1 text-sm font-display font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === t.key
                ? 'border-pink text-pink'
                : 'border-transparent text-muted hover:text-ink'
            }`}>
            {t.label}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-pink text-white' : 'bg-gray-100 text-muted'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Food Items Tab */}
      {tab === 'items' && (
        wishlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🍜</p>
            <p className="font-display font-bold text-ink mb-1">No favourite food yet</p>
            <p className="text-muted text-sm mb-5">Tap the heart on any dish to save it here.</p>
            <Link to="/restaurants" className="btn-pink">Browse Food</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map(p => (
              <div key={p._id} className="card-hover group overflow-hidden flex flex-col">
                <Link to={`/product/${p._id}`}
                  className="relative block overflow-hidden bg-pink-50" style={{ aspectRatio: '4/3' }}>
                  {p.productImage
                    ? <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}
                  <span className="absolute top-2.5 left-2.5 badge-pink text-[10px]">{p.productCategory}</span>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/product/${p._id}`}>
                    <h3 className="font-display font-bold text-ink hover:text-pink transition-colors truncate">{p.productName}</h3>
                  </Link>
                  <p className="text-muted text-xs mt-0.5 line-clamp-2 flex-1">{p.productDescription}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-faint">
                    <span className="font-display font-extrabold text-pink text-lg">NPR {p.productPrice?.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { toggle(p); toast('Removed from favourites') }}
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <Trash2 size={13}/>
                      </button>
                      {p.productStatus === 'available' && (
                        <button onClick={() => handleAdd(p)} disabled={adding === p._id}
                          className="btn-pink px-3 py-1.5 text-xs gap-1 rounded-xl">
                          {adding === p._id ? <span className="spinner"/> : <ShoppingCart size={11}/>} Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Restaurants Tab */}
      {tab === 'restaurants' && (
        favRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-display font-bold text-ink mb-1">No favourite restaurants yet</p>
            <p className="text-muted text-sm mb-5">Tap the heart on any restaurant to save it here.</p>
            <Link to="/restaurants" className="btn-pink">Browse Restaurants</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favRestaurants.map(r => (
              <div key={r._id} className="card-hover group overflow-hidden flex flex-col">
                <Link to={`/restaurants/${r._id}`} className="relative h-40 block overflow-hidden bg-pink-100">
                  {r.coverImage
                    ? <img src={r.coverImage} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">{r.emoji || '🏪'}</div>}
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-card">
                    <Star size={11} className="text-yellow-400" fill="currentColor"/>
                    <span className="font-bold text-xs">{r.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  <div className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-400 text-green-900' : 'bg-gray-400 text-white'}`}>
                    {r.isOpen ? '● Open' : '● Closed'}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/restaurants/${r._id}`}>
                        <h3 className="font-display font-bold text-ink hover:text-pink transition-colors truncate">{r.name}</h3>
                      </Link>
                      <p className="text-muted text-xs line-clamp-1 mt-0.5">{r.description}</p>
                    </div>
                    <button onClick={() => { toggleRestaurant(r); toast('Removed from favourites') }}
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-faint text-xs text-muted">
                    <span className="flex items-center gap-1"><Clock size={11}/> {r.deliveryTime} min</span>
                    <span className={r.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                      <Truck size={11} className="inline mr-0.5"/>
                      {r.deliveryFee === 0 ? 'Free' : `NPR ${r.deliveryFee}`}
                    </span>
                  </div>
                  <Link to={`/restaurants/${r._id}`} className="btn-pink w-full justify-center mt-3 py-2 text-sm rounded-xl">
                    View Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
