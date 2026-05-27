import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ChevronLeft, Send, Plus, Minus, Share2 } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductCard from '../../components/ui/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)
  const [qty, setQty]         = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const wishlisted = product ? isWishlisted(product._id) : false

  useEffect(() => {
    setLoading(true)
    api.get(ROUTES.product(id)).then(({ ok, data }) => {
      if (ok) {
        const p = Array.isArray(data.data?.product) ? data.data.product[0] : data.data?.product
        setProduct(p || null)
        setReviews(data.data?.productReviews || [])
      }
    }).finally(() => setLoading(false))
    api.get(ROUTES.products).then(({ ok, data }) => { if (ok) setRelated((data.data || []).filter(p => p._id !== id).slice(0, 4)) })
    window.scrollTo(0, 0)
  }, [id])

  const handleAdd = async () => {
    if (!token) { toast.error('Please login'); return }
    setAdding(true)
    for (let i = 0; i < qty; i++) await addToCart(product._id)
    toast.success(`${qty}× ${product.productName} added! 🛒`)
    setAdding(false)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!token) { toast.error('Please login to review'); return }
    setSubmitting(true)
    const { ok, data } = await api.post(ROUTES.createReview(id), reviewForm)
    if (ok) {
      toast.success('Review submitted! ⭐')
      setReviewForm({ rating: 5, message: '' })
      setReviews(prev => [...prev, { _id: Date.now(), rating: reviewForm.rating, message: reviewForm.message, userId: { userName: 'You' } }])
    } else toast.error(data.message || 'Could not submit')
    setSubmitting(false)
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const available = product?.productStatus === 'available'

  if (loading) return (
    <div className="page-wrap grid md:grid-cols-2 gap-10">
      <div className="skeleton aspect-square rounded-3xl" />
      <div className="space-y-4">{[80,60,100,40,60].map((w,i) => <div key={i} className="skeleton h-5 rounded-2xl" style={{width:`${w}%`}}/>)}</div>
    </div>
  )
  if (!product) return (
    <div className="page-wrap text-center py-20">
      <p className="text-5xl mb-4">😔</p>
      <h2 className="font-display font-bold text-xl text-ink mb-3">Product not found</h2>
      <button onClick={() => navigate('/menu')} className="btn-pink">Browse Menu</button>
    </div>
  )

  return (
    <div className="page-wrap">
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link to="/" className="hover:text-pink transition-colors">Home</Link><span>/</span>
        <Link to="/restaurants" className="hover:text-pink transition-colors">Menu</Link><span>/</span>
        <span className="text-ink font-semibold truncate">{product.productName}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-14">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-pink-50 border border-faint shadow-card-lg group">
          {product.productImage ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-[100px]">🍜</div>}
          <button onClick={() => { toggle(product); toast(wishlisted ? '💔 Removed' : '❤️ Added to wishlist!', {icon:''}) }}
            className={`absolute top-4 right-4 w-11 h-11 rounded-2xl shadow-float flex items-center justify-center transition-all hover:scale-110 ${wishlisted ? 'bg-pink text-white' : 'bg-white text-muted hover:text-pink'}`}>
            <Heart size={19} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge-pink">{product.productCategory}</span>
            <span className={`badge ${available ? 'badge-green' : 'badge-gray'}`}>{available ? '✓ Available' : 'Unavailable'}</span>
            {product.isVeg && <span className="badge-green">🥬 Veg</span>}
            {product.isSpicy && <span className="badge badge-red">🌶️ Spicy</span>}
          </div>

          <h1 className="font-display font-black text-3xl md:text-4xl text-ink leading-tight mb-3">{product.productName}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= Math.round(avgRating) ? 'text-yellow-400' : 'text-faint'} fill={i <= Math.round(avgRating) ? 'currentColor' : 'none'} />)}
              <span className="font-display font-bold text-ink">{avgRating}</span>
              <span className="text-muted text-sm">({reviews.length} reviews)</span>
            </div>
          )}

          <p className="text-slate leading-relaxed mb-6">{product.productDescription}</p>

          <div className="py-5 border-y border-faint mb-6 flex items-baseline gap-2">
            <span className="text-muted text-sm font-display font-semibold">NPR</span>
            <span className="font-display font-black text-5xl text-pink">{product.productPrice?.toLocaleString()}</span>
          </div>

          {available ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-faint rounded-2xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-11 h-11 flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 transition-colors"><Minus size={16}/></button>
                <span className="w-10 text-center font-display font-bold text-ink text-lg">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.productQuantity, q+1))} className="w-11 h-11 flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 transition-colors"><Plus size={16}/></button>
              </div>
              <button onClick={handleAdd} disabled={adding} className="btn-pink flex-1 justify-center py-3.5 text-base gap-2 rounded-2xl">
                {adding ? <span className="spinner" /> : <ShoppingCart size={18}/>}
                {adding ? 'Adding...' : `Add to Cart · NPR ${(product.productPrice * qty).toLocaleString()}`}
              </button>
            </div>
          ) : (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-center text-muted">Currently unavailable. Check back soon!</div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div>
          <h2 className="font-display font-black text-2xl text-ink mb-6">Reviews <span className="text-muted font-normal text-lg">({reviews.length})</span></h2>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-muted"><Star size={32} className="mx-auto mb-3 text-faint" /><p>No reviews yet. Be the first!</p></div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black flex items-center justify-center text-sm">{r.userId?.userName?.[0]?.toUpperCase()||'?'}</div>
                    <div>
                      <p className="font-display font-bold text-ink text-sm">{r.userId?.userName||'Customer'}</p>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={11} className={i<=r.rating?'text-yellow-400':'text-faint'} fill={i<=r.rating?'currentColor':'none'}/>)}</div>
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">"{r.message}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {token ? (
          <div>
            <h2 className="font-display font-black text-2xl text-ink mb-6">Write a Review</h2>
            <form onSubmit={handleReview} className="card p-6 space-y-4">
              <div>
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-3">YOUR RATING</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({...f, rating: n}))}
                      className={`text-3xl transition-all hover:scale-125 ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-faint'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">YOUR REVIEW</p>
                <textarea className="input-field resize-none rounded-2xl" rows={4} placeholder="Share your experience..." value={reviewForm.message} onChange={e => setReviewForm(f => ({...f, message: e.target.value}))} required />
              </div>
              <button type="submit" disabled={submitting} className="btn-pink gap-2 rounded-xl">
                {submitting ? <span className="spinner"/> : <Send size={14}/>} Submit Review
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="font-display font-bold text-xl text-ink mb-2">Share your experience</p>
            <p className="text-muted text-sm mb-5">Login to write a review.</p>
            <Link to="/login" className="btn-pink">Login to Review</Link>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-display font-black text-2xl text-ink mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
