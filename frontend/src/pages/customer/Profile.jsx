import { useState, useEffect } from 'react'
import {
  ShoppingBag, Edit3, Lock, Star, Trash2, Eye, EyeOff, Save,
  LogOut, MapPin, Settings, User, Shield, X, Plus, Calendar,
  Phone, Mail, Globe, Home, Tag, Utensils,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { api, ROUTES } from '../../services/api'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Logout confirmation modal ─────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-scale-in text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <LogOut size={28} className="text-red-400" />
        </div>
        <h3 className="font-display font-bold text-ink text-xl mb-2">Sign Out?</h3>
        <p className="text-slate text-sm mb-6">Are you sure you want to sign out of your MetMomo account?</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 h-11 rounded-2xl border border-gray-200 text-slate font-semibold hover:bg-pink-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-11 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-95 transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setTab }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  const confirmLogout = () => { logout(); toast.success('See you soon!'); navigate('/') }

  const initials = user
    ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.userName?.[0] || 'U').toUpperCase()
    : 'U'

  const isAdmin = user?.userRole === 'admin'
  const isOwner = user?.userRole === 'restaurant_owner'
  const isCustomer = !isAdmin && !isOwner

  const links = [
    { k: 'basic',       icon: <User size={15}/>,          label: 'Basic Info' },
    ...(isCustomer ? [{ k: 'address',     icon: <MapPin size={15}/>,    label: 'Address' }] : []),
    ...(isCustomer ? [{ k: 'preferences', icon: <Settings size={15}/>,  label: 'Preferences' }] : []),
    { k: 'security',    icon: <Lock size={15}/>,           label: 'Security' },
    { k: 'account',     icon: <Shield size={15}/>,         label: 'Account Info' },
    ...(isCustomer ? [{ k: 'reviews', icon: <Star size={15}/>,        label: 'My Reviews' }] : []),
    ...(isCustomer ? [{ k: 'orders',  icon: <ShoppingBag size={15}/>, label: 'My Orders', href: '/orders' }] : []),
    ...(isOwner    ? [{ k: 'reviews', icon: <Star size={15}/>,        label: 'Food Reviews' }] : []),
  ]

  return (
    <>
      <aside className="w-60 shrink-0">
        <div className="card p-5 sticky top-24">
          {/* Avatar */}
          <div className="flex flex-col items-center py-4 mb-4 border-b border-gray-100">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="avatar" className="w-16 h-16 rounded-2xl object-cover shadow-pink-sm mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink to-rose-500 text-white font-display font-black text-2xl flex items-center justify-center shadow-pink-sm mb-2">
                {initials}
              </div>
            )}
            <p className="font-display font-bold text-ink text-sm text-center">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName}
            </p>
            <p className="text-muted text-xs truncate w-full text-center mt-0.5">{user?.userEmail}</p>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink px-2 py-0.5 rounded-full">
              {user?.userRole || 'Customer'}
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            {links.map(l => l.href ? (
              <Link key={l.k} to={l.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate hover:bg-pink-50 hover:text-pink transition-colors">
                {l.icon} {l.label}
              </Link>
            ) : (
              <button key={l.k} onClick={() => setTab(l.k)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${active === l.k ? 'bg-pink-50 text-pink' : 'text-slate hover:bg-pink-50 hover:text-pink'}`}>
                {l.icon} {l.label}
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100">
              <button onClick={() => setShowLogout(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={15}/> Sign Out
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {showLogout && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogout(false)} />}
    </>
  )
}

// ── Field helper ──────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <p className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
      {icon && <span className="text-pink">{icon}</span>}{label}
    </p>
    {children}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input className={`input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink ${className}`} {...props} />
)

const Select = ({ className = '', children, ...props }) => (
  <select className={`input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink ${className}`} {...props}>
    {children}
  </select>
)

// ── Main component ────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, refetchUser } = useAuth()
  const { count: wishCount }  = useWishlist()
  const [tab, setTab]   = useState('basic')
  const [saving, setSaving] = useState(false)

  const isAdmin    = user?.userRole === 'admin'
  const isOwner    = user?.userRole === 'restaurant_owner'
  const isCustomer = !isAdmin && !isOwner

  // ── Form state ──
  const [pf, setPf] = useState({
    firstName: '', lastName: '', userName: '', userEmail: '', userPhoneNumber: '',
    dateOfBirth: '', profileImage: '',
    address: '', city: '', state: '', country: 'Nepal', postalCode: '', landmark: '', deliveryInstructions: '',
    preferences: { darkMode: false, preferredLanguage: 'en', favoriteFoods: [], dietaryPreference: 'none', spicePreference: 'medium' },
  })
  const [foodInput, setFoodInput] = useState('')

  // ── Password state ──
  const [pw, setPw]   = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ old: false, new: false, conf: false })
  const [savingPw, setSavingPw] = useState(false)

  // ── Reviews ──
  const [reviews, setReviews]   = useState([])
  const [loadingR, setLoadingR] = useState(false)
  const [deletingR, setDeletingR] = useState(null)

  useEffect(() => {
    if (!user) return
    setPf({
      firstName:   user.firstName   || '',
      lastName:    user.lastName    || '',
      userName:    user.userName    || '',
      userEmail:   user.userEmail   || '',
      userPhoneNumber: user.userPhoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      profileImage: user.profileImage || '',
      address:     user.address     || '',
      city:        user.city        || '',
      state:       user.state       || '',
      country:     user.country     || 'Nepal',
      postalCode:  user.postalCode  || '',
      landmark:    user.landmark    || '',
      deliveryInstructions: user.deliveryInstructions || '',
      preferences: user.preferences || { darkMode: false, preferredLanguage: 'en', favoriteFoods: [], dietaryPreference: 'none', spicePreference: 'medium' },
    })
  }, [user])

  useEffect(() => {
    if (tab !== 'reviews') return
    setLoadingR(true)
    const url = isOwner ? '/owner/reviews' : ROUTES.myReviews
    api.get(url)
      .then(({ ok, data }) => { if (ok) setReviews(data.data || []) })
      .finally(() => setLoadingR(false))
  }, [tab, isOwner])

  const set  = (k) => (e) => setPf(f => ({ ...f, [k]: e.target.value }))
  const setPref = (k) => (val) => setPf(f => ({ ...f, preferences: { ...f.preferences, [k]: val } }))

  const addFood = () => {
    const t = foodInput.trim()
    if (!t || pf.preferences.favoriteFoods.includes(t)) return
    setPref('favoriteFoods')([...pf.preferences.favoriteFoods, t])
    setFoodInput('')
  }
  const removeFood = (f) => setPref('favoriteFoods')(pf.preferences.favoriteFoods.filter(x => x !== f))

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    const { ok, data } = await api.patch(ROUTES.profile, pf)
    if (ok) { toast.success('Profile updated!'); refetchUser() }
    else toast.error(data?.message || 'Update failed')
    setSaving(false)
  }

  const changePw = async (e) => {
    e.preventDefault()
    if (pw.newPassword !== pw.confirmPassword) { toast.error("Passwords don't match"); return }
    setSavingPw(true)
    const { ok, data } = await api.patch(ROUTES.changePassword, pw)
    if (ok) { toast.success('Password changed!'); setPw({ oldPassword: '', newPassword: '', confirmPassword: '' }) }
    else toast.error(data?.message || 'Failed')
    setSavingPw(false)
  }

  const deleteReview = async (id) => {
    setDeletingR(id)
    const { ok } = await api.delete(ROUTES.deleteReview(id))
    if (ok) { toast.success('Review deleted'); setReviews(r => r.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingR(null)
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'

  return (
    <div className="page-wrap">
      <div className="flex gap-8">
        <div className="hidden md:block">
          <Sidebar active={tab} setTab={setTab} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Mobile tab row */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 md:hidden">
            {[
              { k:'basic',    l:'Basic' },
              ...(isCustomer ? [{ k:'address',     l:'Address' }, { k:'preferences', l:'Prefs' }] : []),
              { k:'security', l:'Security' },
              { k:'account',  l:'Account' },
              ...(isCustomer ? [{ k:'reviews', l:'Reviews' }] : []),
              ...(isOwner    ? [{ k:'reviews', l:'Reviews' }] : []),
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`chip whitespace-nowrap ${tab===t.k?'chip-active':'chip-idle'}`}>{t.l}</button>
            ))}
          </div>

          {/* ── BASIC INFO ── */}
          {tab === 'basic' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <SectionHead title="Basic Information" sub="Your personal details" />

              {/* Avatar preview */}
              <div className="card p-5 flex items-center gap-4">
                {pf.profileImage ? (
                  <img src={pf.profileImage} alt="avatar" className="w-16 h-16 rounded-2xl object-cover shadow-card" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink to-rose-500 text-white font-display font-black text-2xl flex items-center justify-center">
                    {((pf.firstName?.[0] || '') + (pf.lastName?.[0] || '') || pf.userName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Profile Image URL</p>
                  <Input placeholder="https://..." value={pf.profileImage} onChange={set('profileImage')} />
                </div>
              </div>

              <div className="card p-6 grid sm:grid-cols-2 gap-4">
                <Field label="First Name" icon={<User size={12}/>}>
                  <Input placeholder="First name" value={pf.firstName} onChange={set('firstName')} />
                </Field>
                <Field label="Last Name" icon={<User size={12}/>}>
                  <Input placeholder="Last name" value={pf.lastName} onChange={set('lastName')} />
                </Field>
                <Field label="Username" icon={<Tag size={12}/>}>
                  <Input placeholder="username" value={pf.userName} onChange={set('userName')} />
                </Field>
                <Field label="Date of Birth" icon={<Calendar size={12}/>}>
                  <Input type="date" value={pf.dateOfBirth} onChange={set('dateOfBirth')} />
                </Field>
                <Field label="Phone Number" icon={<Phone size={12}/>}>
                  <Input type="tel" placeholder="98XXXXXXXX" value={pf.userPhoneNumber} onChange={set('userPhoneNumber')} />
                </Field>
                <Field label="Email Address" icon={<Mail size={12}/>}>
                  <Input type="email" placeholder="you@example.com" value={pf.userEmail} onChange={set('userEmail')} />
                </Field>
              </div>

              <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="User ID" value={user?._id} mono />
                <InfoRow label="Role" value={user?.userRole} badge />
              </div>

              <SaveBtn saving={saving} />
            </form>
          )}

          {/* ── ADDRESS ── */}
          {tab === 'address' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <SectionHead title="Address Information" sub="Your delivery location" />
              <div className="card p-6 grid sm:grid-cols-2 gap-4">
                <Field label="Street Address" icon={<Home size={12}/>} >
                  <Input placeholder="123 Street name" value={pf.address} onChange={set('address')} className="sm:col-span-2" />
                </Field>
                <Field label="City">
                  <Input placeholder="Kathmandu" value={pf.city} onChange={set('city')} />
                </Field>
                <Field label="State / Province">
                  <Input placeholder="Bagmati" value={pf.state} onChange={set('state')} />
                </Field>
                <Field label="Country" icon={<Globe size={12}/>}>
                  <Input placeholder="Nepal" value={pf.country} onChange={set('country')} />
                </Field>
                <Field label="Postal Code">
                  <Input placeholder="44600" value={pf.postalCode} onChange={set('postalCode')} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Landmark">
                    <Input placeholder="Near the big clock tower..." value={pf.landmark} onChange={set('landmark')} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Delivery Instructions">
                    <textarea
                      className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink resize-none"
                      rows={3} placeholder="Ring the bell twice, leave at the door..."
                      value={pf.deliveryInstructions} onChange={set('deliveryInstructions')} />
                  </Field>
                </div>
              </div>
              <SaveBtn saving={saving} />
            </form>
          )}

          {/* ── PREFERENCES ── */}
          {tab === 'preferences' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <SectionHead title="Preferences" sub="Personalise your experience" />
              <div className="card p-6 space-y-5">

                {/* Dark mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink text-sm">Dark Mode</p>
                    <p className="text-muted text-xs">Switch the app to dark theme</p>
                  </div>
                  <button type="button" onClick={() => setPref('darkMode')(!pf.preferences.darkMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${pf.preferences.darkMode ? 'bg-pink' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${pf.preferences.darkMode ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Preferred Language" icon={<Globe size={12}/>}>
                    <Select value={pf.preferences.preferredLanguage} onChange={e => setPref('preferredLanguage')(e.target.value)}>
                      <option value="en">English</option>
                      <option value="ne">Nepali (नेपाली)</option>
                      <option value="hi">Hindi</option>
                    </Select>
                  </Field>

                  <Field label="Dietary Preference" icon={<Utensils size={12}/>}>
                    <Select value={pf.preferences.dietaryPreference} onChange={e => setPref('dietaryPreference')(e.target.value)}>
                      <option value="none">No preference</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="non-vegetarian">Non-Vegetarian</option>
                      <option value="halal">Halal</option>
                    </Select>
                  </Field>

                  <Field label="Spice Preference">
                    <Select value={pf.preferences.spicePreference} onChange={e => setPref('spicePreference')(e.target.value)}>
                      <option value="mild">Mild 🟢</option>
                      <option value="medium">Medium 🟡</option>
                      <option value="hot">Hot 🟠</option>
                      <option value="extra-hot">Extra Hot 🔴</option>
                    </Select>
                  </Field>
                </div>

                {/* Favourite foods tags */}
                <Field label="Favourite Foods">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {pf.preferences.favoriteFoods.map(f => (
                      <span key={f} className="inline-flex items-center gap-1 bg-pink-100 text-pink text-xs font-semibold px-2.5 py-1 rounded-full">
                        {f}
                        <button type="button" onClick={() => removeFood(f)} className="hover:text-pink-700">
                          <X size={10}/>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Buff Momo" value={foodInput} onChange={e => setFoodInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFood() } }} />
                    <button type="button" onClick={addFood}
                      className="btn-pink rounded-xl px-4 shrink-0"><Plus size={15}/></button>
                  </div>
                </Field>
              </div>
              <SaveBtn saving={saving} />
            </form>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <div className="space-y-5">
              <SectionHead title="Security" sub="Manage your password and account safety" />

              <form onSubmit={changePw} className="card p-6 space-y-4">
                <h3 className="font-display font-bold text-ink">Change Password</h3>
                {[
                  { k: 'old',  f: 'oldPassword',     l: 'Current Password' },
                  { k: 'new',  f: 'newPassword',     l: 'New Password' },
                  { k: 'conf', f: 'confirmPassword', l: 'Confirm New Password' },
                ].map(({ k, f, l }) => (
                  <Field key={k} label={l} icon={<Lock size={12}/>}>
                    <div className="relative">
                      <Input className="pr-11" type={show[k] ? 'text' : 'password'} placeholder="••••••••"
                        value={pw[f]} onChange={e => setPw(p => ({ ...p, [f]: e.target.value }))} required />
                      <button type="button" onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pink transition-colors">
                        {show[k] ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </Field>
                ))}
                <button type="submit" disabled={savingPw} className="btn-pink gap-2 rounded-xl">
                  {savingPw ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <Lock size={15}/>}
                  Update Password
                </button>
              </form>

              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-ink">Security Info</h3>
                <InfoRow label="Password"      value="Hashed with bcrypt (12 rounds)" />
                <InfoRow label="Authentication" value="JWT — expires in 30 days" />
                <InfoRow label="Email verified" value={user?.isVerified ? 'Verified' : 'Not verified'} badge />
                <InfoRow label="Account status" value={user?.isBlocked ? 'Blocked' : 'Active'} badge />
                <Link to="/forgot-password" className="text-sm text-pink font-semibold hover:underline inline-block mt-1">
                  Forgot password? Reset it →
                </Link>
              </div>
            </div>
          )}

          {/* ── ACCOUNT INFO ── */}
          {tab === 'account' && (
            <div className="space-y-5">
              <SectionHead title="Account Information" sub="Read-only system details about your account" />
              <div className="card p-6 space-y-3">
                <InfoRow label="User ID"       value={user?._id}                       mono />
                <InfoRow label="Role"          value={user?.userRole}                  badge />
                <InfoRow label="Verified"      value={user?.isVerified ? 'Yes' : 'No'} />
                <InfoRow label="Blocked"       value={user?.isBlocked  ? 'Yes' : 'No'} />
                <InfoRow label="Last Login"    value={fmt(user?.lastLogin)} />
                <InfoRow label="Member Since"  value={fmt(user?.createdAt)} />
                <InfoRow label="Last Updated"  value={fmt(user?.updatedAt)} />
              </div>

              {isCustomer && (
                <div className="card p-6 space-y-2">
                  <h3 className="font-display font-bold text-ink mb-3">Account Features</h3>
                  {[
                    '✓ Multiple saved addresses',
                    '✓ Wishlist / Favourites',
                    '✓ Full order history',
                    '✓ Profile editing',
                    '✓ Password change',
                    '✓ Forgot password flow',
                    '○ Saved payment methods (coming soon)',
                    '○ Email verification (coming soon)',
                  ].map(f => (
                    <p key={f} className={`text-sm ${f.startsWith('✓') ? 'text-ink' : 'text-muted'}`}>{f}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === 'reviews' && !isOwner && (
            <div className="space-y-4">
              <SectionHead title="My Reviews" sub="Reviews you've left on orders" />
              {loadingR ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl"/>)}</div>
              ) : reviews.length === 0 ? (
                <div className="card p-10 text-center text-muted">
                  <Star size={36} className="mx-auto mb-3 text-gray-200"/>
                  <p className="font-display font-semibold">No reviews yet</p>
                  <Link to="/restaurants" className="btn-pink mt-4 text-sm inline-flex">Browse Menu</Link>
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
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-muted text-xs ml-1">{r.rating}/5</span>
                    </div>
                    <p className="text-slate text-sm leading-relaxed">"{r.message}"</p>
                  </div>
                  <button onClick={() => deleteReview(r._id)} disabled={deletingR === r._id}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                    {deletingR === r._id
                      ? <span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin"/>
                      : <Trash2 size={13}/>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── OWNER: FOOD REVIEWS ── */}
          {tab === 'reviews' && isOwner && (
            <div className="space-y-4">
              <SectionHead title="Food Reviews" sub="Reviews customers have left on your menu items" />
              {loadingR ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl"/>)}</div>
              ) : reviews.length === 0 ? (
                <div className="card p-10 text-center text-muted">
                  <Star size={36} className="mx-auto mb-3 text-gray-200"/>
                  <p className="font-display font-semibold">No reviews yet</p>
                  <p className="text-sm mt-1">Reviews customers leave on your dishes will appear here</p>
                </div>
              ) : reviews.map(r => (
                <div key={r._id} className="card p-5 flex items-start gap-4">
                  {/* Product image */}
                  {r.productId?.productImage ? (
                    <img src={r.productId.productImage} alt={r.productId.productName}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"/>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl shrink-0">🍜</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-ink text-sm truncate">
                      {r.productId?.productName || 'Unknown item'}
                    </p>
                    <p className="text-muted text-xs mb-1.5">
                      by {r.userId?.userName || 'Customer'}
                      {r.userId?.userEmail && <span className="ml-1">· {r.userId.userEmail}</span>}
                    </p>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-muted text-xs ml-1">{r.rating}/5</span>
                    </div>
                    <p className="text-slate text-sm leading-relaxed">"{r.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Small reusable pieces ─────────────────────────────────────────────────────
function SectionHead({ title, sub }) {
  return (
    <div className="mb-2">
      <h2 className="font-display font-bold text-2xl text-ink">{title}</h2>
      {sub && <p className="text-slate text-sm mt-0.5">{sub}</p>}
    </div>
  )
}

function InfoRow({ label, value, mono, badge }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold text-slate uppercase tracking-wider shrink-0">{label}</span>
      {badge ? (
        <span className="text-xs font-bold bg-pink-100 text-pink px-2 py-0.5 rounded-full capitalize">{value || '—'}</span>
      ) : (
        <span className={`text-sm text-ink text-right break-all ${mono ? 'font-mono text-xs text-muted' : ''}`}>{value || '—'}</span>
      )}
    </div>
  )
}

function SaveBtn({ saving }) {
  return (
    <button type="submit" disabled={saving} className="btn-pink gap-2 rounded-xl">
      {saving
        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
        : <Save size={15}/>}
      Save Changes
    </button>
  )
}
