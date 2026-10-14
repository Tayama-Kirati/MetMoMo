import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Store, Bike } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminApprovals() {
  const [restaurants, setRestaurants] = useState([])
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.get(ROUTES.restaurants), api.get(`${ROUTES.adminUsers}?pendingApproval=true`)])
      .then(([r, u]) => {
        if (r.ok) setRestaurants((r.data.data || []).filter(x => x.isApproved === false))
        if (u.ok) setRiders(u.data.data || [])
      }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const approveRestaurant = async (r, isApproved) => {
    const { ok, data } = await api.patch(ROUTES.adminApproveRestaurant(r._id), { isApproved })
    if (ok) { toast.success(data.message); setRestaurants(list => list.filter(x => x._id !== r._id)) }
    else toast.error(data?.message || 'Failed')
  }
  const approveRider = async (u) => {
    const { ok, data } = await api.patch(ROUTES.adminUser(u._id), { isApproved: true })
    if (ok) { toast.success('Rider approved'); setRiders(list => list.filter(x => x._id !== u._id)) }
    else toast.error(data?.message || 'Failed')
  }
  const rejectRider = async (u) => {
    if (!confirm(`Block ${u.userName}'s rider account?`)) return
    const { ok } = await api.patch(ROUTES.adminUser(u._id), { isBlocked: true })
    if (ok) { toast.success('Rider blocked'); setRiders(list => list.filter(x => x._id !== u._id)) }
  }

  return (
    <div className="page-wrap max-w-4xl">
      <title>Approvals · Admin · MetMoMo</title>
      <h1 className="font-display font-black text-3xl text-ink mb-1">Approvals</h1>
      <p className="text-muted mb-8">New restaurants and riders wait here until you approve them.</p>

      {loading ? <div className="skeleton h-48 rounded-3xl" /> : (
        <div className="space-y-10">
          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3 flex items-center gap-2"><Store size={18}/> Restaurants ({restaurants.length})</h2>
            {restaurants.length === 0 ? <p className="text-sm text-muted">Nothing waiting.</p> : (
              <div className="space-y-3">
                {restaurants.map(r => (
                  <div key={r._id} className="card p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-display font-bold text-ink">{r.emoji} {r.name}</p>
                      <p className="text-xs text-muted">{r.address} · {r.phone || 'no phone'} · {r.email || 'no email'}</p>
                      <p className="text-sm text-slate mt-1 line-clamp-2">{r.description}</p>
                    </div>
                    <Link to={`/restaurants/${r._id}`} className="text-xs text-pink font-semibold">Preview</Link>
                    <button onClick={() => approveRestaurant(r, true)} className="btn-pink text-sm py-2"><CheckCircle size={14}/> Approve</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3 flex items-center gap-2"><Bike size={18}/> Riders ({riders.length})</h2>
            {riders.length === 0 ? <p className="text-sm text-muted">Nothing waiting.</p> : (
              <div className="space-y-3">
                {riders.map(u => (
                  <div key={u._id} className="card p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-display font-bold text-ink">{u.userName}</p>
                      <p className="text-xs text-muted">{u.userEmail} · {u.userPhoneNumber} · joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => rejectRider(u)} className="btn-outline text-sm py-2 text-red-500 border-red-200"><XCircle size={14}/> Reject</button>
                    <button onClick={() => approveRider(u)} className="btn-pink text-sm py-2"><CheckCircle size={14}/> Approve</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
