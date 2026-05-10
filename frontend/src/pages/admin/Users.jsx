import { useEffect, useState } from 'react'
import { Trash2, Search, Users, Shield } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { api.get(ROUTES.adminUsers).then(({ok,data})=>{ if(ok) setUsers(data.data||[]) }).finally(()=>setLoading(false)) }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    setDeleting(id)
    const { ok } = await api.delete(ROUTES.adminUser(id))
    if (ok) { toast.success('User deleted'); setUsers(u => u.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeleting(null)
  }

  const filtered = users.filter(u => u.userName?.toLowerCase().includes(search.toLowerCase()) || u.userEmail?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-wrap">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="font-display font-black text-3xl text-ink">Users</h1><p className="text-muted mt-1">{users.length} registered users</p></div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
          <input className="input-field pl-11 rounded-full" placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? <div className="space-y-3">{[...Array(6)].map((_,i)=><div key={i} className="skeleton h-16 rounded-2xl"/>)}</div>
      : filtered.length === 0 ? <div className="text-center py-20 text-muted"><Users size={48} className="mx-auto mb-4 opacity-30"/><p className="font-display font-semibold">No users found</p></div>
      : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-faint bg-pink-50/50">
                {['User','Phone','Role','Joined',''].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-display font-bold text-muted uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-faint">
                {filtered.map(u=>(
                  <tr key={u._id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black text-sm flex items-center justify-center shadow-pink-sm">{u.userName?.[0]?.toUpperCase()}</div>
                        <div><p className="font-display font-bold text-ink text-sm">{u.userName}</p><p className="text-muted text-xs">{u.userEmail}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted text-sm">{u.userPhoneNumber||'—'}</td>
                    <td className="px-5 py-4"><span className={`badge ${u.userRole==='admin'?'badge-pink':'badge-gray'} flex items-center gap-1 w-fit`}>{u.userRole==='admin'&&<Shield size={9}/>}{u.userRole}</span></td>
                    <td className="px-5 py-4 text-muted text-sm">{u.createdAt?new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
                    <td className="px-5 py-4">
                      {u.userRole !== 'admin' && (
                        <button onClick={()=>handleDelete(u._id)} disabled={deleting===u._id} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                          {deleting===u._id?<span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin"/>:<Trash2 size={13}/>}
                        </button>
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
