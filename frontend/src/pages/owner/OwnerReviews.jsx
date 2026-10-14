import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, RefreshCw, MessageSquare } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

function ReplyBox({ review, onSaved }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(review.ownerReply?.text || '')
  const [saving, setSaving] = useState(false)

  const save = async (value) => {
    setSaving(true)
    const { ok, data } = await api.patch(`/owner/reviews/${review._id}/reply`, { text: value })
    if (ok) { toast.success(data.message); onSaved(data.data.ownerReply); setOpen(false) }
    else toast.error(data?.message || 'Could not save reply')
    setSaving(false)
  }

  if (!open) return review.ownerReply?.text ? (
    <div className="mt-3 pl-3 border-l-2 border-pink-200">
      <p className="text-xs font-bold text-pink">Your reply</p>
      <p className="text-sm text-slate">{review.ownerReply.text}</p>
      <button onClick={() => setOpen(true)} className="text-xs text-muted hover:text-pink mt-1">Edit</button>
    </div>
  ) : (
    <button onClick={() => setOpen(true)} className="mt-2 text-xs font-bold text-pink hover:underline">Reply publicly</button>
  )

  return (
    <div className="mt-3 space-y-2">
      <textarea value={text} onChange={e => setText(e.target.value)} maxLength={1000} rows={3}
        placeholder="Thank the customer or respond to their feedback…" aria-label="Reply"
        className="input-field text-sm" />
      <div className="flex gap-2">
        <button onClick={() => save(text)} disabled={saving || !text.trim()} className="btn-pink text-xs py-1.5 px-3">Post reply</button>
        {review.ownerReply?.text && <button onClick={() => save('')} disabled={saving} className="text-xs text-red-500 px-2">Remove</button>}
        <button onClick={() => setOpen(false)} className="text-xs text-muted px-2">Cancel</button>
      </div>
    </div>
  )
}

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          className={n <= rating ? 'text-yellow-400' : 'text-gray-200'}
          fill={n <= rating ? 'currentColor' : 'none'}/>
      ))}
    </div>
  )
}

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState(0)   // 0 = all, 1-5 = star filter

  const load = async () => {
    setLoading(true)
    const { ok, data } = await api.get('/owner/reviews')
    if (ok) setReviews(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered  = filter === 0 ? reviews : reviews.filter(r => r.rating === filter)
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Count per star
  const starCounts = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }))

  return (
    <div className="page-wrap max-w-3xl mx-auto">
      <title>Reviews · Restaurant dashboard</title>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-2xl text-ink flex items-center gap-2">
            <MessageSquare size={22} className="text-pink"/> Customer Reviews
          </h1>
          <p className="text-muted text-sm mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={load} className="btn-ghost-pink gap-1.5 text-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Summary card */}
      {reviews.length > 0 && (
        <div className="card p-5 mb-6 flex flex-col sm:flex-row gap-5">
          {/* Average */}
          <div className="text-center sm:border-r sm:border-faint sm:pr-6">
            <p className="font-display font-black text-5xl text-pink">{avgRating}</p>
            <StarRow rating={Math.round(avgRating)} size={16}/>
            <p className="text-muted text-xs mt-1">Average rating</p>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-1.5">
            {starCounts.map(({ star, count }) => {
              const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
              return (
                <button key={star} onClick={() => setFilter(filter === star ? 0 : star)}
                  className={`w-full flex items-center gap-2 group rounded-xl px-2 py-1 transition-colors ${filter === star ? 'bg-pink-50' : 'hover:bg-gray-50'}`}>
                  <span className="text-xs font-bold text-muted w-3">{star}</span>
                  <Star size={11} className="text-yellow-400" fill="currentColor"/>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}/>
                  </div>
                  <span className="text-xs text-muted w-6 text-right">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter chips */}
      {reviews.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button onClick={() => setFilter(0)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 0 ? 'bg-pink text-white shadow-pink-sm' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>
            All ({reviews.length})
          </button>
          {[5,4,3,2,1].filter(s => reviews.some(r => r.rating === s)).map(s => (
            <button key={s} onClick={() => setFilter(filter === s ? 0 : s)}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === s ? 'bg-pink text-white shadow-pink-sm' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>
              {s} <Star size={10} fill="currentColor"/>
              <span className="opacity-70">({reviews.filter(r => r.rating === s).length})</span>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-3xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">⭐</p>
          <p className="font-display font-bold text-xl text-ink mb-1">
            {reviews.length === 0 ? 'No reviews yet' : 'No reviews for this rating'}
          </p>
          <p className="text-muted text-sm">
            {reviews.length === 0
              ? 'Reviews from customers will appear here once they start ordering.'
              : 'Try a different star filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r._id} className="card p-4 flex gap-4">
              {/* Product image */}
              <Link to={`/product/${r.productId?._id}`}
                className="w-14 h-14 rounded-2xl overflow-hidden bg-pink-50 shrink-0 hover:opacity-80 transition-opacity">
                {r.productId?.productImage
                  ? <img src={r.productId.productImage} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>}
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <Link to={`/product/${r.productId?._id}`}
                      className="font-display font-bold text-ink text-sm hover:text-pink transition-colors">
                      {r.productId?.productName || 'Product'}
                    </Link>
                    <p className="text-muted text-xs">{r.userId?.userName || 'Customer'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRow rating={r.rating} size={13}/>
                    <p className="text-muted text-[10px] mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate mt-2 italic">"{r.message}"</p>
                <ReplyBox review={r} onSaved={(ownerReply) => setReviews(list => list.map(x => x._id === r._id ? { ...x, ownerReply } : x))} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
