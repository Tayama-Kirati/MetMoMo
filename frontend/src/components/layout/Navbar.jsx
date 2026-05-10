import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Search, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'
import  '../../assets/momo.webp'


export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { count: wishCount } = useWishlist()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)
  const isAdmin = user?.userRole === 'admin'

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

  const handleLogout = () => { logout(); toast.success('See you soon!'); navigate('/') }

  const NavLink = ({ to, label }) => {
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-faint' : 'bg-white/90 backdrop-blur-md'}`}>

        <div className="wrap h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            {/* <div className="w-9 h-9 rounded-2xl bg-pink flex items-center justify-center text-white text-lg shadow-pink-sm font-display font-black">M</div> */}
            <img src="/assets/momo.webp" alt="Metmomo Logo" className="w-9 h-9 rounded-2xl object-cover " />
            <span className="font--display: 'Fredoka One', cursive;  font-black text-xl text-ink">
              Met<span className="text-pink">MoMo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/restaurants" label="Restaurants" />
            <NavLink to="/menu" label="Menu" />
            {user && <NavLink to="/orders" label="My Orders" />}
            {isAdmin && <NavLink to="/admin" label="Admin" />}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {user ? (
              <>
                <Link to="/wishlist"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 relative transition-all">
                  <Heart size={19} />
                  {wishCount > 0 && <span className="notif-dot">{wishCount > 9 ? '9+' : wishCount}</span>}
                </Link>
                <Link to="/cart"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate hover:text-pink hover:bg-pink-50 relative transition-all">
                  <ShoppingCart size={19} />
                  {cartCount > 0 && <span className="notif-dot">{cartCount > 9 ? '9+' : cartCount}</span>}
                </Link>

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
                        { to: '/profile',  icon: <User size={14}/>, label: 'My Profile' },
                        { to: '/orders',   icon: <ShoppingCart size={14}/>, label: 'My Orders' },
                        { to: '/wishlist', icon: <Heart size={14}/>, label: 'Wishlist' },
                        ...(isAdmin ? [{ to: '/admin', icon: <LayoutDashboard size={14}/>, label: 'Admin Panel' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDrop(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-ink hover:bg-pink-50 hover:text-pink transition-colors">
                          <span className="text-muted">{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <div className="border-t border-faint mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={14}/> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-outline text-sm px-4 py-2 hidden sm:inline-flex">Login</Link>
                <Link to="/register" className="btn-pink text-sm px-4 py-2">Sign Up</Link>
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
            {[
              { to: '/', l: 'Home' }, { to: '/restaurants', l: 'Restaurants' }, { to: '/menu', l: 'Menu' },
              ...(user ? [{ to: '/orders', l: 'My Orders' }, { to: '/wishlist', l: 'Wishlist' }, { to: '/cart', l: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}` }, { to: '/profile', l: 'Profile' }] : []),
              ...(isAdmin ? [{ to: '/admin', l: 'Admin Dashboard' }] : []),
            ].map(({ to, l }) => (
              <Link key={to} to={to}
                className={`px-4 py-3 rounded-2xl font-display font-semibold text-sm transition-colors ${pathname === to ? 'bg-pink-50 text-pink' : 'text-ink hover:bg-pink-50 hover:text-pink'}`}>
                {l}
              </Link>
            ))}
            {!user ? (
              <div className="flex gap-2 mt-2 pt-3 border-t border-faint">
                <Link to="/login"    className="btn-outline flex-1 justify-center py-3">Login</Link>
                <Link to="/register" className="btn-pink flex-1 justify-center py-3">Sign Up</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-red-500 hover:bg-red-50 mt-1 border-t border-faint pt-3">
                <LogOut size={14}/> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
