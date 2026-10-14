import { useEffect, useState } from 'react'
import { Star, EyeOff, Eye, Check, Trash2 } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminReportedReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get(ROUTES.adminReportedReviews).then(({ ok, data }) => { if (ok) setReviews(data.data || []) }).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const act = async (r, action) => {
    const { ok, data } = await api.patch(ROUTES.adminReview(r._id), { action })
    if (ok) { toast.success('Updated'); action === 'dismiss' ? setReviews(l => l.filter(x => x._id !== r._id)) : setReviews(l => l.map(x => x._id === r._id ? { ...x, ...data.data, userId: x.userId, productId: x.productId, reports: x.reports } : x)) }
    else toast.error(data?.message || 'Failed')
  }
  const remove = async (r) => {
    if (!confirm('Delete this review permanently?')) return
    const { ok } = await api.delete(ROUTES.adminReview(r._id))
    if (ok) { toast.success('Deleted'); setReviews(l => l.filter(x => x._id !== r._id)) }
  }

  return (
    <div className="page-wrap max-w-4xl">
      <title>Reported reviews · Admin · MetMoMo</title>
      <h1 className="font-display font-black text-3xl text-ink mb-1">Reported reviews</h1>
      <p className="text-muted mb-8">Hide reviews that break the rules, or dismiss reports that don't.</p>

      {loading ? <div className="skeleton h-40 rounded-3xl"/> : reviews.length === 0 ? (
        <p className="text-center text-muted py-16">No reported reviews 🎉</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className={`card p-5 ${r.isHidden ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div>
                  <p className="font-display font-bold text-ink text-sm">{r.productId?.productName || 'Product'} · by {r.userId?.userName || 'user'}</p>
                  <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= r.rating ? 'text-yellow-400' : 'text-gray-200'} fill={n <= r.rating ? 'currentColor' : 'none'}/>)}</div>
                </div>
                {r.isHidden && <span className="badge-gray">Hidden</span>}
              </div>
              <p className="text-sm text-slate italic mb-3">"{r.message}"</p>
              <div className="bg-red-50 rounded-2xl p-3 text-xs text-red-700 space-y-1 mb-3">
                <p className="font-bold">{r.reports.length} report{r.reports.length > 1 ? 's' : ''}</p>
                {r.reports.map((rep, i) => <p key={i}>• {rep.user?.userName || 'User'}: {rep.reason || 'no reason given'}</p>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {r.isHidden
                  ? <button onClick={() => act(r, 'restore')} className="btn-outline text-xs py-1.5"><Eye size={13}/> Restore</button>
                  : <button onClick={() => act(r, 'hide')} className="btn-pink text-xs py-1.5"><EyeOff size={13}/> Hide</button>}
                <button onClick={() => act(r, 'dismiss')} className="btn-outline text-xs py-1.5"><Check size={13}/> Dismiss reports</button>
                <button onClick={() => remove(r)} className="btn-outline text-xs py-1.5 text-red-500 border-red-200"><Trash2 size={13}/> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
