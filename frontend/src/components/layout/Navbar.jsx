import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Store, Star, Search, Moon, Sun, Languages, Bike } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'
import { usePrefs } from '../../context/PreferencesContext'

function LogoutModal({ onConfirm, onCancel }) {
  const { t } = usePrefs()
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-scale-in text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <LogOut size={28} className="text-red-400" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2 text-ink">{t('signOut')}?</h3>
        <p className="text-slate text-sm mb-6">{t('signOutConfirm')}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 h-11 rounded-2xl border border-gray-200 text-slate font-semibold hover:bg-pink-50 transition-colors">
            {t('cancel')}
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-11 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-95 transition-all">
            {t('signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}

const NavLink = ({ to, label, pathname }) => {
  const active = pathname === to || (to !== '/' && pathname.startsWith(to))
  return (
    <Link to={to}
      className={`font-display font-semibold text-sm transition-all duration-150 px-1 py-0.5 relative
        ${active ? 'text-pink' : 'text-slate hover:text-pink'}`}>
      {label}
      {active && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink rounded-full" />}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { count: wishCount } = useWishlist()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const dropRef = useRef(null)
  const isAdmin  = user?.userRole === 'admin'
  const isOwner  = user?.userRole === 'restaurant_owner'
  const isDriver = user?.userRole === 'delivery_rider'
  const isCustomer = !isOwner && !isAdmin && !isDriver
  const { t, dark, toggleDark, toggleLang } = usePrefs()
  const [query, setQuery] = useState('')

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setOpen(false)
  }

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', s)
    return () => window.removeEventListener('scroll', s)
  }, [])
  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  useEffect(() => { setOpen(false) }, [pathname])

  const confirmLogout = () => { logout(); toast.success('See you soon!'); navigate('/'); setShowLogout(false) }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-faint' : 'bg-white/90 backdrop-blur-md'}`}>

        <div className="wrap h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            {/* <div className="w-9 h-9 rounded-2xl bg-pink flex items-center justify-center text-white text-lg shadow-pink-sm font-display font-black">M</div> */}
            {/* <img src="/assets/momo.webp" alt="Metmomo Logo" className="w-9 h-9 rounded-2xl object-cover -ml-12 -mt-1" /> */}
            <span className="font-display   font-black text-3xl text-ink -ml-15">
              Met<span className="text-pink">MoMo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-center gap-12 flex-1 ml-9">
            <NavLink to="/" label={t('home')} pathname={pathname} />
            {isCustomer && <NavLink to="/restaurants" label={t('restaurants')} pathname={pathname} />}
            {isCustomer && user && <NavLink to="/orders" label={t('myOrders')} pathname={pathname} />}
            {isAdmin && <NavLink to="/admin" label={t('admin')} pathname={pathname} />}
            {isDriver && <NavLink to="/driver" label={t('deliveries')} pathname={pathname} />}
            {isOwner && <NavLink to="/owner" label={t('dashboard')} pathname={pathname} />}
            {isOwner && <NavLink to="/owner/orders" label={t('orders')} pathname={pathname} />}
            {isOwner && <NavLink to="/owner/menu" label={t('menuItems')} pathname={pathname} />}
            {isCustomer && (
              <form onSubmit={submitSearch} role="search" className="hidden lg:flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-3 h-9 w-64">
                <Search size={15} className="text-muted shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchPlaceholder')}
                  aria-label={t('search')}
                  className="bg-transparent outline-none text-sm flex-1 min-w-0 text-ink placeholder:text-muted" />
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {isCustomer && (
              <Link to="/search" aria-label={t('search')}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 transition-all">
                <Search size={19} />
              </Link>
            )}
            <button onClick={toggleLang} title={t('language')} aria-label={t('language')}
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-slate hover:text-pink hover:bg-pink-50 transition-all">
              <Languages size={18} />
            </button>
            <button onClick={toggleDark} title={t('darkMode')} aria-label={t('darkMode')}
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-slate hover:text-pink hover:bg-pink-50 transition-all">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                {isCustomer && (
                  <Link to="/wishlist"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 relative transition-all">
                    <Heart size={19} />
                    {wishCount > 0 && <span className="notif-dot">{wishCount > 9 ? '9+' : wishCount}</span>}
                  </Link>
                )}
                {isCustomer && (
                  <Link to="/cart"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 relative transition-all">
                    <ShoppingCart size={19} />
                    {cartCount > 0 && <span className="notif-dot">{cartCount > 9 ? '9+' : cartCount}</span>}
                  </Link>
                )}

                {/* Avatar dropdown */}
                <div className="relative ml-1" ref={dropRef}>
                  <button onClick={() => setDrop(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-2xl hover:bg-pink-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black text-sm flex items-center justify-center shadow-pink-sm">
                      {user.userName?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-display font-semibold text-sm text-ink max-w-[80px] truncate">{user.userName?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${drop ? 'rotate-180' : ''}`} />
                  </button>

                  {drop && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-faint rounded-3xl shadow-float p-2 animate-scale-in z-50">
                      <div className="px-3 py-2.5 border-b border-faint mb-1">
                        <p className="font-display font-bold text-ink text-sm">{user.userName}</p>
                        <p className="text-muted text-xs truncate">{user.userEmail}</p>
                      </div>
                      {[
                        { to: '/profile',  icon: <User size={14}/>,          label: t('myProfile') },
                        ...(isCustomer ? [{ to: '/orders',   icon: <ShoppingCart size={14}/>, label: t('myOrders') }] : []),
                        ...(isCustomer ? [{ to: '/reviews',  icon: <Star size={14}/>,         label: t('reviews')  }] : []),
                        ...(isCustomer ? [{ to: '/wishlist', icon: <Heart size={14}/>,        label: t('wishlist') }] : []),
                        ...(isAdmin ? [{ to: '/admin',        icon: <LayoutDashboard size={14}/>, label: t('adminPanel') }] : []),
                        ...(isDriver ? [{ to: '/driver',      icon: <Bike size={14}/>,        label: t('deliveries') }] : []),
                        ...(isOwner ? [{ to: '/owner',          icon: <Store size={14}/>,          label: t('dashboard')  }] : []),
                        ...(isOwner ? [{ to: '/owner/orders',  icon: <ShoppingCart size={14}/>,   label: t('orders')     }] : []),
                        ...(isOwner ? [{ to: '/owner/reviews', icon: <Star size={14}/>,           label: t('reviews')    }] : []),
                        ...(isOwner ? [{ to: '/owner/menu',    icon: <Store size={14}/>,          label: t('menuItems')  }] : []),
                        ...(isOwner ? [{ to: '/owner/restaurant', icon: <Store size={14}/>,       label: t('restaurant') }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDrop(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-ink hover:bg-pink-50 hover:text-pink transition-colors">
                          <span className="text-muted">{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <div className="border-t border-faint mt-1 pt-1">
                        <button onClick={() => { setDrop(false); setShowLogout(true) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={14}/> {t('signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-outline text-sm px-4 py-2 hidden sm:inline-flex">{t('login')}</Link>
                <Link to="/register" className="btn-outline text-sm px-4 py-2">{t('signUp')}</Link>
              </div>
            )}

            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate hover:bg-pink-50 ml-1" onClick={() => setOpen(v => !v)}>
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 pt-16" onClick={() => setOpen(false)}>
          <div className="bg-white border-b border-faint shadow-float px-4 py-4 flex flex-col gap-1 animate-slide-up" onClick={e => e.stopPropagation()}>
            {isCustomer && (
              <form onSubmit={submitSearch} role="search" className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-2xl px-3 h-11 mb-2">
                <Search size={16} className="text-muted" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchPlaceholder')}
                  aria-label={t('search')} className="bg-transparent outline-none text-sm flex-1 text-ink" />
              </form>
            )}
            {[
              { to: '/', l: t('home') },
              ...(isCustomer ? [{ to: '/restaurants', l: t('restaurants') }] : []),
              ...(isCustomer && user ? [{ to: '/orders',  l: t('myOrders') }, { to: '/reviews', l: t('reviews') }] : []),
              ...(isCustomer && user ? [{ to: '/wishlist', l: t('wishlist') }, { to: '/cart', l: `${t('cart')}${cartCount > 0 ? ` (${cartCount})` : ''}` }] : []),
              ...(user ? [{ to: '/profile', l: t('profile') }] : []),
              ...(isAdmin ? [{ to: '/admin', l: t('adminPanel') }] : []),
              ...(isDriver ? [{ to: '/driver', l: t('deliveries') }] : []),
              ...(isOwner ? [{ to: '/owner', l: t('dashboard') }, { to: '/owner/orders', l: t('orders') }, { to: '/owner/reviews', l: t('reviews') }, { to: '/owner/menu', l: t('menuItems') }, { to: '/owner/restaurant', l: t('restaurant') }] : []),
            ].map(({ to, l }) => (
              <Link key={to} to={to}
                className={`px-4 py-3 rounded-2xl font-display font-semibold text-sm transition-colors ${pathname === to ? 'bg-pink-50 text-pink' : 'text-ink hover:bg-pink-50 hover:text-pink'}`}>
                {l}
              </Link>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={toggleLang} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm text-ink hover:bg-pink-50">
                <Languages size={15}/> {t('language')}
              </button>
              <button onClick={toggleDark} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm text-ink hover:bg-pink-50">
                {dark ? <Sun size={15}/> : <Moon size={15}/>} {t('darkMode')}
              </button>
            </div>
            {!user ? (
              <div className="flex gap-2 mt-2 pt-3 border-t border-faint">
                <Link to="/login"    className="btn-outline flex-1 justify-center py-3">{t('login')}</Link>
                <Link to="/register" className="btn-pink flex-1 justify-center py-3">{t('signUp')}</Link>
              </div>
            ) : (
              <button onClick={() => { setOpen(false); setShowLogout(true) }} className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-red-500 hover:bg-red-50 mt-1 border-t border-faint pt-3">
                <LogOut size={14}/> {t('signOut')}
              </button>
            )}
          </div>
        </div>
      )}

      {showLogout && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogout(false)} />}
    </>
  )
}
