import { useState, useEffect } from 'react'
import { ShoppingBag, Edit3, Bell, LogOut, Lock, Star, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { api, ROUTES } from '../../services/api'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function Sidebar({ active }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); toast.success('Bye!'); navigate('/') }
  const links = [
    { to: '/orders',  icon: <ShoppingBag size={16}/>, label: 'My Order' },
    { to: '/profile', icon: <Edit3 size={16}/>,       label: 'Edit My Profile' },
    { to: '/profile', icon: <Bell size={16}/>,         label: 'Notifications' },
  ]
  return (
    <aside className="w-56 shrink-0">
      <div className="card p-4 sticky top-24">
        <div className="flex flex-col items-center py-4 mb-4 border-b border-faint">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black text-2xl flex items-center justify-center shadow-pink-sm mb-2">
            {user?.userName?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="font-display font-bold text-ink text-sm">{user?.userName}</p>
          <p className="text-muted text-xs truncate w-full text-center">{user?.userEmail}</p>
        </div>
        <nav className="space-y-1">
          {links.map(l => (
            <Link key={l.label} to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold transition-colors
                ${active === l.to ? 'bg-pink-50 text-pink' : 'text-slate hover:bg-pink-50 hover:text-pink'}`}>
              {l.icon} {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16}/> Logout
          </button>
        </nav>
      </div>
    </aside>
  )
}

const TABS = [
  { k: 'profile',  l: 'Edit Profile', icon: <Edit3 size={14}/> },
  { k: 'password', l: 'Password',     icon: <Lock size={14}/> },
  { k: 'reviews',  l: 'My Reviews',   icon: <Star size={14}/> },
]

export default function Profile() {
  const { user, refetchUser } = useAuth()
  const { count: wishCount } = useWishlist()
  const [tab, setTab]   = useState('profile')
  const [pf, setPf]     = useState({ userName: '', userEmail: '', userPhoneNumber: '' })
  const [saving, setSaving] = useState(false)
  const [pw, setPw]     = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [show, setShow] = useState({ old: false, new: false, conf: false })
  const [reviews, setReviews]   = useState([])
  const [loadingR, setLoadingR] = useState(false)
  const [deletingR, setDeletingR] = useState(null)

  useEffect(() => {
    if (user) setPf({ userName: user.userName || '', userEmail: user.userEmail || '', userPhoneNumber: user.userPhoneNumber || '' })
  }, [user])

  useEffect(() => {
    if (tab === 'reviews') {
      setLoadingR(true)
      api.get(ROUTES.myReviews).then(({ ok, data }) => { if (ok) setReviews(data.data || []) }).finally(() => setLoadingR(false))
    }
  }, [tab])

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    const { ok, data } = await api.patch(ROUTES.profile, pf)
    if (ok) { toast.success('Profile updated!'); refetchUser() }
    else toast.error(data.message || 'Update failed')
    setSaving(false)
  }

  const changePw = async (e) => {
    e.preventDefault()
    if (pw.newPassword !== pw.confirmPassword) { toast.error("Passwords don't match"); return }
    setSavingPw(true)
    const { ok, data } = await api.patch(ROUTES.changePassword, pw)
    if (ok) { toast.success('Password changed!'); setPw({ oldPassword: '', newPassword: '', confirmPassword: '' }) }
    else toast.error(data.message || 'Failed')
    setSavingPw(false)
  }

  const deleteReview = async (id) => {
    setDeletingR(id)
    const { ok } = await api.delete(ROUTES.deleteReview(id))
    if (ok) { toast.success('Review deleted'); setReviews(r => r.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingR(null)
  }

  return (
    <div className="page-wrap">
      <div className="flex gap-8">
        <div className="hidden md:block"><Sidebar active="/profile" /></div>

        <div className="flex-1 min-w-0">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-faint">
            <p className="text-slate text-sm">Order food from the widest range of restaurants.</p>
            <Link to="/restaurants" className="btn-pink text-sm gap-1.5">Find Restaurants</Link>
          </div>

          {/* Tab pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-display font-bold transition-all
                  ${tab === t.k ? 'bg-pink text-white shadow-pink-sm' : 'bg-white border border-faint text-slate hover:text-pink hover:border-pink'}`}>
                {t.icon} {t.l}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-xl text-ink">Edit My Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">FULL NAME</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink" placeholder="Your name"
                    value={pf.userName} onChange={e => setPf(f => ({...f, userName: e.target.value}))} />
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">PHONE NUMBER</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink" placeholder="98XXXXXXXX"
                    value={pf.userPhoneNumber} onChange={e => setPf(f => ({...f, userPhoneNumber: e.target.value}))} />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">EMAIL ADDRESS</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink" type="email"
                    value={pf.userEmail} onChange={e => setPf(f => ({...f, userEmail: e.target.value}))} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-pink gap-2 rounded-xl">
                {saving ? <span className="spinner" /> : <Save size={15}/>} Save Changes
              </button>
            </form>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <form onSubmit={changePw} className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-ink">Change Password</h2>
              {[
                { k: 'old',  f: 'oldPassword',     l: 'CURRENT PASSWORD' },
                { k: 'new',  f: 'newPassword',     l: 'NEW PASSWORD' },
                { k: 'conf', f: 'confirmPassword', l: 'CONFIRM NEW PASSWORD' },
              ].map(({ k, f, l }) => (
                <div key={k}>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{l}</p>
                  <div className="relative">
                    <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink pr-11"
                      type={show[k] ? 'text' : 'password'} placeholder="••••••••"
                      value={pw[f]} onChange={e => setPw(p => ({...p, [f]: e.target.value}))} required />
                    <button type="button" onClick={() => setShow(s => ({...s, [k]: !s[k]}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pink transition-colors">
                      {show[k] ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPw} className="btn-pink gap-2 rounded-xl">
                {savingPw ? <span className="spinner" /> : <Lock size={15}/>} Update Password
              </button>
            </form>
          )}

          {/* Reviews tab */}
          {tab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-ink">My Reviews</h2>
              {loadingR ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl" />)}</div>
              ) : reviews.length === 0 ? (
                <div className="card p-10 text-center text-muted">
                  <Star size={36} className="mx-auto mb-3 text-faint" />
                  <p className="font-display font-semibold">No reviews yet</p>
                  <Link to="/menu" className="btn-pink mt-4 text-sm">Browse Menu</Link>
                </div>
              ) : reviews.map(r => (
                <div key={r._id} className="card p-5 flex items-start gap-4">
                  <div className="flex-1">
                    {r.productId && (
                      <Link to={`/product/${r.productId._id || r.productId}`}
                        className="font-display font-bold text-ink text-sm hover:text-pink transition-colors block mb-1 truncate">
                        {r.productId.productName || 'Product'}
                      </Link>
                    )}
                    <div className="flex items-center gap-1 mb-1.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-faint'}`}>★</span>
                      ))}
                      <span className="text-muted text-xs ml-1">{r.rating}/5</span>
                    </div>
                    <p className="text-slate text-sm leading-relaxed">"{r.message}"</p>
                  </div>
                  <button onClick={() => deleteReview(r._id)} disabled={deletingR === r._id}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                    {deletingR === r._id ? <span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={13}/>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
