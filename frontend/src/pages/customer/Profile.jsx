import { useState, useEffect } from 'react'
import { User, Lock, Star, Trash2, Save, Eye, EyeOff, Edit3, ShoppingBag, Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { api, ROUTES } from '../../services/api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const TABS = [
  { k: 'profile',  l: 'My Profile',  icon: <User size={15}/> },
  { k: 'password', l: 'Password',    icon: <Lock size={15}/> },
  { k: 'reviews',  l: 'My Reviews',  icon: <Star size={15}/> },
]

export default function Profile() {
  const { user, refetchUser } = useAuth()
  const { count: wishCount } = useWishlist()
  const { cartCount } = useCart()
  const [tab, setTab] = useState('profile')
  const [pf, setPf] = useState({ userName: '', userEmail: '', userPhoneNumber: '' })
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [show, setShow] = useState({ old: false, new: false, conf: false })
  const [reviews, setReviews] = useState([])
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
    else toast.error(data.message || 'Failed to change password')
    setSavingPw(false)
  }

  const deleteReview = async (id) => {
    setDeletingR(id)
    const { ok } = await api.delete(ROUTES.deleteReview(id))
    if (ok) { toast.success('Review deleted'); setReviews(r => r.filter(x => x._id !== id)) }
    else toast.error('Could not delete review')
    setDeletingR(null)
  }

  return (
    <div className="wrap py-10">
      <div className="grid lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center mb-5">
            <div className="w-20 h-20 rounded-3xl bg-hero-gradient text-white font-body font-extrabold text-3xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
              {user?.userName?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-body font-extrabold text-xl text-charcoal">{user?.userName}</h2>
            <p className="text-slate text-sm truncate">{user?.userEmail}</p>
            <span className={`badge mt-3 ${user?.userRole === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
              {user?.userRole}
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Link to="/orders" className="card p-4 text-center hover:shadow-card-lg transition-shadow group">
              <ShoppingBag size={20} className="text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="font-body font-extrabold text-charcoal text-lg">—</p>
              <p className="text-slate text-xs">Orders</p>
            </Link>
            <Link to="/wishlist" className="card p-4 text-center hover:shadow-card-lg transition-shadow group">
              <Heart size={20} className="text-red-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="font-body font-extrabold text-charcoal text-lg">{wishCount}</p>
              <p className="text-slate text-xs">Wishlist</p>
            </Link>
          </div>

          {/* Tab nav */}
          <div className="card p-2 space-y-1">
            {TABS.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-body font-semibold transition-all
                  ${tab === t.k ? 'bg-primary-50 text-primary' : 'text-slate hover:bg-cream-dark hover:text-charcoal'}`}>
                {t.icon} {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center"><User size={18} className="text-primary" /></div>
                <div>
                  <h2 className="font-body font-bold text-charcoal text-xl">Edit Profile</h2>
                  <p className="text-slate text-sm">Update your personal information</p>
                </div>
              </div>
              <form onSubmit={saveProfile} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-body font-bold text-charcoal block mb-2">Full Name</label>
                    <input className="input-field" placeholder="Your name" value={pf.userName} onChange={e => setPf(f => ({ ...f, userName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-body font-bold text-charcoal block mb-2">Phone Number</label>
                    <input className="input-field" placeholder="98XXXXXXXX" value={pf.userPhoneNumber} onChange={e => setPf(f => ({ ...f, userPhoneNumber: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-body font-bold text-charcoal block mb-2">Email Address</label>
                  <input className="input-field" type="email" placeholder="you@example.com" value={pf.userEmail} onChange={e => setPf(f => ({ ...f, userEmail: e.target.value }))} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={saving} className="btn-primary font-body  gap-2">
                     Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center"><Lock size={18} className="text-primary" /></div>
                <div>
                  <h2 className="font-body font-bold text-charcoal text-xl">Change Password</h2>
                  <p className="text-slate text-sm">Keep your account secure with a strong password</p>
                </div>
              </div>
              <form onSubmit={changePw} className="space-y-5">
                {[
                  { k: 'old',  f: 'oldPassword',     l: 'Current Password' },
                  { k: 'new',  f: 'newPassword',     l: 'New Password' },
                  { k: 'conf', f: 'confirmPassword', l: 'Confirm New Password' },
                ].map(({ k, f, l }) => (
                  <div key={k}>
                    <label className="text-xs font-body font-bold text-charcoal block mb-2">{l}</label>
                    <div className="relative">
                      <input className="input-field pr-12" type={show[k] ? 'text' : 'password'} placeholder="••••••••"
                        value={pw[f]} onChange={e => setPw(p => ({ ...p, [f]: e.target.value }))} required />
                      <button type="button" onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-primary transition-colors">
                        {show[k] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <button type="submit" disabled={savingPw} className="btn-primary gap-2">
                    {savingPw ? <span className="spinner" /> : <Lock size={15} />} Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews tab */}
          {tab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-body font-bold text-charcoal text-xl">My Reviews</h2>
                <span className="badge badge-primary">{reviews.length}</span>
              </div>
              {loadingR ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-3xl" />)}</div>
              ) : reviews.length === 0 ? (
                <div className="card p-10 text-center text-slate">
                  <Star size={36} className="mx-auto mb-3 text-slate-faint" />
                  <p className="font-body font-semibold mb-2">No reviews yet</p>
                  <p className="text-sm mb-5">Order something and share your experience!</p>
                  <Link to="/menu" className="btn-primary text-sm">Browse Menu</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="card p-5 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {r.productId && (
                          <Link to={`/product/${r.productId._id || r.productId}`} className="font-body font-bold text-charcoal text-sm hover:text-primary transition-colors block mb-1 truncate">
                            {r.productId.productName || 'Product'}
                          </Link>
                        )}
                        <div className="flex items-center gap-1.5 mb-2">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={13} className={i <= r.rating ? 'text-gold' : 'text-slate-faint'} fill={i <= r.rating ? 'currentColor' : 'none'} />
                          ))}
                          <span className="text-slate text-xs ml-1">Rating: {r.rating}/5</span>
                        </div>
                        <p className="text-slate text-sm leading-relaxed">"{r.message}"</p>
                      </div>
                      <button onClick={() => deleteReview(r._id)} disabled={deletingR === r._id}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50">
                        {deletingR === r._id
                          ? <span className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}