import { useEffect, useState } from 'react'
import { Trash2, Search, Users, Shield } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get(ROUTES.adminUsers()).then(({ ok, data }) => { if (ok) setUsers(data.data || []) }).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    setDeleting(id)
    const { ok } = await api.delete(ROUTES.adminUser(id))
    if (ok) { toast.success('User deleted'); setUsers(u => u.filter(x => x._id !== id)) }
    else toast.error('Could not delete user')
    setDeleting(null)
  }

  const filtered = users.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.userEmail?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="wrap py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-label">👥 Admin</span>
          <h1 className="section-title">Users</h1>
          <p className="section-sub">{users.length} registered users</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
          <input className="input-field pl-11" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-display font-semibold text-lg">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-faint bg-cream/50">
                  {['User','Phone','Role','Joined','Action'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-display font-bold text-slate uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-faint/50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-hero-gradient text-white font-display font-extrabold text-sm flex items-center justify-center shrink-0 shadow-glow-sm">
                          {u.userName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display font-bold text-charcoal text-sm">{u.userName}</p>
                          <p className="text-slate text-xs">{u.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate text-sm">{u.userPhoneNumber || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.userRole === 'admin' ? 'badge-primary' : 'badge-gray'} flex items-center gap-1 w-fit`}>
                        {u.userRole === 'admin' && <Shield size={10}/>} {u.userRole}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate text-sm whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {u.userRole !== 'admin' ? (
                        <button onClick={() => handleDelete(u._id)} disabled={deleting === u._id}
                          className="btn-icon w-9 h-9 bg-red-50 text-red-500 hover:bg-red-100 transition-colors rounded-xl">
                          {deleting === u._id
                            ? <span className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 size={14}/>}
                        </button>
                      ) : (
                        <span className="text-slate-light text-xs">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}