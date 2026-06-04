import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Send, Trash2, ArrowRight, MessageSquare } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

/* ── Star picker ─────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-125">
          <span className={(hover || value) >= n ? 'text-yellow-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  )
}

/* ── Review form for one product ─────────────────────── */
function ReviewForm({ product, onSubmitted }) {
  const [rating, setRating]   = useState(5)
  const [message, setMessage] = useState('')
  const [saving, setSaving]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) { toast.error('Write something first'); return }
    setSaving(true)
    const { ok, data } = await api.post(ROUTES.createReview(product._id), { rating, message })
    if (ok) { toast.success('Review submitted! ⭐'); onSubmitted(product._id, data.data) }
    else toast.error(data?.message || 'Could not submit')
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 border-t border-faint pt-3">
      <div>
        <p className="text-xs font-bold text-ink mb-1">Your Rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-xs font-bold text-ink mb-1">Your Review</p>
        <textarea
          className="input-field resize-none rounded-2xl text-sm"
          rows={3}
          placeholder="Share your experience with this dish…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={saving}
        className="btn-pink text-sm py-2 px-4 gap-1.5 rounded-xl">
        {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={13}/>}
        {saving ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

/* ── Card for one delivered order ────────────────────── */
function OrderReviewCard({ order, myReviewMap, onReviewSubmitted }) {
  const [open, setOpen] = useState(false)

  const reviewableItems = order.items?.filter(i => i.product?._id) || []
  const allReviewed = reviewableItems.every(i => myReviewMap[i.product._id])
  const pendingCount = reviewableItems.filter(i => !myReviewMap[i.product._id]).length

  return (
    <div className="card overflow-hidden">
      {/* Order header */}
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-pink-50/40 transition-colors">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-pink-50 shrink-0">
          {order.items?.[0]?.product?.productImage
            ? <img src={order.items[0].product.productImage} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink text-sm">
            Order #{order._id?.slice(-5).toUpperCase()}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
            {' · '}{reviewableItems.length} item{reviewableItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {allReviewed ? (
            <span className="text-[10px] font-bold bg-green-100 text-green-600 border border-green-200 px-2.5 py-1 rounded-full">
              ✓ All reviewed
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full">
              {pendingCount} to review
            </span>
          )}
        </div>
      </button>

      {/* Items with review forms */}
      {open && (
        <div className="border-t border-faint divide-y divide-faint">
          {reviewableItems.map(item => {
            const existing = myReviewMap[item.product._id]
            return (
              <div key={item.product._id} className="p-4">
                {/* Product row */}
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                    {item.product.productImage
                      ? <img src={item.product.productImage} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-xl">🍜</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-ink text-sm truncate">{item.product.productName}</p>
                    <p className="text-muted text-xs">{item.product.productCategory}</p>
                  </div>
                  <Link to={`/product/${item.product._id}`}
                    className="text-xs text-pink-500 hover:underline shrink-0">View</Link>
                </div>

                {existing ? (
                  /* Already reviewed */
                  <div className="mt-2 bg-green-50 border border-green-100 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`text-sm ${n <= existing.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      <DeleteReviewButton reviewId={existing._id}
                        onDeleted={() => onReviewSubmitted(item.product._id, null)} />
                    </div>
                    <p className="text-sm text-slate italic">"{existing.message}"</p>
                  </div>
                ) : (
                  /* Write review */
                  <ReviewForm
                    product={item.product}
                    onSubmitted={(productId, review) => onReviewSubmitted(productId, review)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DeleteReviewButton({ reviewId, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return
    setDeleting(true)
    const { ok } = await api.delete(ROUTES.deleteReview(reviewId))
    if (ok) { toast.success('Review deleted'); onDeleted() }
    else toast.error('Could not delete')
    setDeleting(false)
  }
  return (
    <button onClick={handleDelete} disabled={deleting}
      className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
      {deleting ? <span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin"/> : <Trash2 size={12}/>}
    </button>
  )
}

/* ── My existing reviews tab ─────────────────────────── */
function MyReviewsList({ reviews, onDeleted }) {
  if (reviews.length === 0) return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📝</p>
      <p className="font-display font-bold text-ink mb-1">No reviews yet</p>
      <p className="text-muted text-sm">Reviews you write will appear here.</p>
    </div>
  )
  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r._id} className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 shrink-0">
              {r.productId?.productImage
                ? <img src={r.productId.productImage} alt="" className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-xl">🍜</div>}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${r.productId?._id}`}
                className="font-display font-bold text-ink hover:text-pink transition-colors text-sm truncate block">
                {r.productId?.productName}
              </Link>
              <p className="text-muted text-xs">{r.productId?.productCategory}</p>
            </div>
            <DeleteReviewButton reviewId={r._id} onDeleted={() => onDeleted(r._id)}/>
          </div>
          <div className="flex mb-1.5">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`text-base ${n <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <p className="text-sm text-slate italic">"{r.message}"</p>
          <p className="text-muted text-[11px] mt-2">
            {new Date(r.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────── */
export default function Reviews() {
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [myReviews, setMyReviews]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [tab, setTab]                         = useState('write') // 'write' | 'mine'

  // Map productId → review for quick lookup
  const [reviewMap, setReviewMap] = useState({})

  useEffect(() => {
    Promise.all([
      api.get(ROUTES.orders),
      api.get(ROUTES.myReviews),
    ]).then(([o, r]) => {
      if (o.ok) {
        const delivered = (o.data.orders || []).filter(ord => ord.orderStatus === 'delivered')
        setDeliveredOrders(delivered)
      }
      if (r.ok) {
        const reviews = r.data.data || []
        setMyReviews(reviews)
        const map = {}
        reviews.forEach(rv => { if (rv.productId?._id) map[rv.productId._id] = rv })
        setReviewMap(map)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleReviewSubmitted = (productId, review) => {
    if (review) {
      setReviewMap(m => ({ ...m, [productId]: review }))
      setMyReviews(prev => [...prev, review])
    } else {
      // Deleted
      setReviewMap(m => { const n = { ...m }; delete n[productId]; return n })
    }
  }

  const handleReviewDeleted = (reviewId) => {
    setMyReviews(prev => {
      const removed = prev.find(r => r._id === reviewId)
      if (removed?.productId?._id) {
        setReviewMap(m => { const n = { ...m }; delete n[removed.productId._id]; return n })
      }
      return prev.filter(r => r._id !== reviewId)
    })
  }

  const pendingCount = deliveredOrders.reduce((acc, order) => {
    return acc + (order.items?.filter(i => i.product?._id && !reviewMap[i.product._id]).length || 0)
  }, 0)

  return (
    <div className="page-wrap max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl text-ink flex items-center gap-2">
          <MessageSquare size={26} className="text-pink"/> Reviews
        </h1>
        <p className="text-muted mt-1">Rate and review items from your delivered orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-faint mb-6">
        {[
          { key: 'write', label: 'Write Reviews', badge: pendingCount },
          { key: 'mine',  label: 'My Reviews',    badge: myReviews.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 px-1 mr-4 text-sm font-display font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === t.key ? 'border-pink text-pink' : 'border-transparent text-muted hover:text-ink'
            }`}>
            {t.label}
            {t.badge > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-pink text-white' : 'bg-gray-100 text-muted'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-3xl"/>)}
        </div>
      ) : tab === 'write' ? (
        deliveredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-display font-bold text-xl text-ink mb-2">No delivered orders yet</p>
            <p className="text-muted mb-6">Once an order is delivered, you can review it here.</p>
            <Link to="/restaurants" className="btn-pink gap-2">Browse Food <ArrowRight size={14}/></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map(order => (
              <OrderReviewCard
                key={order._id}
                order={order}
                myReviewMap={reviewMap}
                onReviewSubmitted={handleReviewSubmitted}
              />
            ))}
          </div>
        )
      ) : (
        <MyReviewsList reviews={myReviews} onDeleted={handleReviewDeleted}/>
      )}
    </div>
  )
}
