import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ChevronLeft, Send, Minus, Plus, Share2, Tag, Clock, Package } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'
import ProductCard from '../../components/ui/ProductCard'

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
  const [adding, setAdding] = useState(false)
  const [qty, setQty] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
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
    // fetch all products for related
    api.get(ROUTES.products).then(({ ok, data }) => {
      if (ok) setRelated((data.data || []).filter(p => p._id !== id).slice(0, 4))
    })
    window.scrollTo(0, 0)
  }, [id])

  const handleAdd = async () => {
    if (!token) { toast.error('Please login to add to cart'); return }
    setAdding(true)
    for (let i = 0; i < qty; i++) await addToCart(product._id)
    toast.success(`${qty}x ${product.productName} added! 🛒`)
    setAdding(false)
  }

  const handleWishlist = () => {
    toggle(product)
    toast(wishlisted ? '💔 Removed from wishlist' : '❤️ Added to wishlist!', { icon: '' })
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!token) { toast.error('Please login to review'); return }
    if (!reviewForm.message.trim()) { toast.error('Please write a review'); return }
    setSubmitting(true)
    const { ok, data } = await api.post(ROUTES.createReview(id), reviewForm)
    if (ok) {
      toast.success('Review submitted! ⭐')
      setReviewForm({ rating: 5, message: '' })
      api.get(ROUTES.product(id)).then(({ ok: ok2, data: d2 }) => { if (ok2) setReviews(d2?.data?.productReviews || []) })
      setReviews(prev => [...prev, { _id: Date.now(), rating: reviewForm.rating, message: reviewForm.message, userId: { userName: 'You' } }])
    } else toast.error(data.message || 'Could not submit review')
    setSubmitting(false)
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const available = product?.productStatus === 'available'

  if (loading) return (
    <div className="wrap py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4 pt-4">
          {[80, 60, 100, 40, 60].map((w, i) => <div key={i} className={`skeleton h-5 rounded-2xl`} style={{ width: `${w}%` }} />)}
          <div className="skeleton h-14 rounded-2xl mt-6" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="wrap py-32 text-center">
      <p className="text-6xl mb-5">😔</p>
      <h2 className="font-body font-bold text-2xl text-charcoal mb-3">Product not found</h2>
      <button onClick={() => navigate('/menu')} className="btn-primary">Browse Menu</button>
    </div>
  )

  return (
    <div>
      <div className="wrap py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
          <span>/</span>
          <span className="text-charcoal font-semibold truncate">{product.productName}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Image column */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-dark border border-slate-faint shadow-card-lg mb-4 group">
              {product.productImage
                ? <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                : <div className="w-full h-full flex items-center justify-center text-[120px]">🍜</div>
              }
              {!available && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="badge badge-gray text-sm">Currently Unavailable</span>
                </div>
              )}
              <button onClick={handleWishlist}
                className={`absolute top-5 right-5 w-12 h-12 rounded-2xl shadow-float flex items-center justify-center transition-all duration-200 hover:scale-110
                  ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-slate hover:text-red-500'}`}>
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className="absolute top-5 left-5 w-10 h-10 rounded-2xl bg-white/90 shadow-card text-slate hover:text-primary flex items-center justify-center transition-colors"
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!') }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Info column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="badge badge-primary">{product.productCategory}</span>
              <span className={`badge ${available ? 'badge-green' : 'badge-gray'}`}>
                {available ? '✓ Available' : 'Unavailable'}
              </span>
            </div>

            <h1 className="font-body font-extrabold text-3xl md:text-4xl text-charcoal leading-tight mb-3">
              {product.productName}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} className={i <= Math.round(avgRating) ? 'text-gold' : 'text-slate-faint'} fill={i <= Math.round(avgRating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="font-body font-bold text-charcoal">{avgRating}</span>
                <span className="text-slate text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <p className="text-slate leading-relaxed mb-6 text-base">{product.productDescription}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 py-5 border-y border-slate-faint mb-6">
              <span className="text-slate font-body font-semibold text-sm">NPR</span>
              <span className="font-body font-extrabold text-5xl text-primary">{product.productPrice?.toLocaleString()}</span>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: <Package size={15}/>, label: 'In Stock', value: `${product.productQuantity} left` },
                { icon: <Clock size={15}/>, label: 'Prep Time', value: '15–20 min' },
                { icon: <Tag size={15}/>, label: 'Category', value: product.productCategory },
              ].map(m => (
                <div key={m.label} className="bg-cream-dark rounded-2xl p-3 text-center">
                  <div className="flex justify-center text-primary mb-1">{m.icon}</div>
                  <p className="text-slate text-[10px] font-body font-semibold uppercase tracking-wider">{m.label}</p>
                  <p className="font-body font-bold text-charcoal text-xs mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Qty + Add to cart */}
            {available ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-faint rounded-2xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-slate hover:text-primary hover:bg-cream-dark transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-body font-bold text-charcoal text-lg">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.productQuantity, q + 1))} className="w-11 h-11 flex items-center justify-center text-slate hover:text-primary hover:bg-cream-dark transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1 justify-center py-3.5 text-base gap-2">
                  {adding ? <span className="spinner" /> : <ShoppingCart size={18} />}
                  {adding ? 'Adding...' : `Add to Cart · NPR ${(product.productPrice * qty).toLocaleString()}`}
                </button>
              </div>
            ) : (
              <div className="bg-slate-faint/50 rounded-2xl p-4 text-center text-slate">
                This item is currently unavailable. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Review list */}
          <div>
            <h2 className="font-body font-extrabold text-2xl text-charcoal mb-6 flex items-center gap-2">
              Customer Reviews <span className="badge badge-primary">{reviews.length}</span>
            </h2>
            {reviews.length === 0 ? (
              <div className="card p-10 text-center text-slate">
                <Star size={36} className="mx-auto mb-3 text-slate-faint" />
                <p className="font-body font-semibold">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r._id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-hero-gradient text-white font-body font-extrabold flex items-center justify-center text-sm shadow-glow-sm">
                          {r.userId?.userName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-body font-bold text-charcoal text-sm">{r.userId?.userName || 'Customer'}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={11} className={i <= r.rating ? 'text-gold' : 'text-slate-faint'} fill={i <= r.rating ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate text-sm leading-relaxed">"{r.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write review */}
          <div>
            <h2 className="font-body font-extrabold text-2xl text-charcoal mb-6">Write a Review</h2>
            {token ? (
              <form onSubmit={handleReview} className="card p-6 space-y-5">
                <div>
                  <label className="text-xs font-body font-bold text-charcoal block mb-3">Your Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                        className={`text-3xl transition-all duration-150 hover:scale-125 ${n <= reviewForm.rating ? 'text-gold' : 'text-slate-faint'}`}>★</button>
                    ))}
                    <span className="self-center text-sm text-slate ml-2">{['','Poor','Fair','Good','Great','Excellent'][reviewForm.rating]}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-body font-bold text-charcoal block mb-2">Your Review</label>
                  <textarea className="input-field resize-none" rows={4} placeholder="Tell others what you think about this item..."
                    value={reviewForm.message} onChange={e => setReviewForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary gap-2">
                  {submitting ? <span className="spinner" /> : <Send size={15} />}
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="card p-8 text-center">
                <Star size={32} className="mx-auto mb-3 text-gold" />
                <p className="font-body font-bold text-charcoal mb-2">Share your experience</p>
                <p className="text-slate text-sm mb-5">Login to write a review for this product.</p>
                <Link to="/login" className="btn-primary">Login to Review</Link>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-body font-extrabold text-2xl text-charcoal mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}