import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, UtensilsCrossed, PlusCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/owner',            icon: <LayoutDashboard size={18}/>, label: 'Dashboard',       exact: true  },
  { to: '/owner/restaurant', icon: <Store size={18}/>,           label: 'My Restaurant',   exact: false },
  { to: '/owner/menu',       icon: <UtensilsCrossed size={18}/>, label: 'Menu Items',      exact: false },
  { to: '/owner/add-item',   icon: <PlusCircle size={18}/>,      label: 'Add Food Item',   exact: false },
]

export default function OwnerLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col bg-white border-r border-faint pt-6 pb-4 px-3 sticky top-16 h-[calc(100vh-64px)]">

        {/* Owner identity */}
        <div className="flex items-center gap-3 px-3 pb-5 border-b border-faint mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink to-rose-dark text-white font-display font-black text-base flex items-center justify-center shadow-pink-sm shrink-0">
            {user?.userName?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-ink text-sm truncate">{user?.userName}</p>
            <p className="text-[11px] text-muted truncate">Restaurant Owner</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all
                ${isActive
                  ? 'bg-pink text-white shadow-pink-sm'
                  : 'text-slate hover:bg-pink-50 hover:text-pink'}`
              }>
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-2 border-t border-faint pt-4">
          <LogOut size={18}/> Sign Out
        </button>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-faint flex items-center justify-around py-2 px-2">
        {NAV.map(({ to, icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all
              ${isActive ? 'text-pink' : 'text-muted'}`
            }>
            {icon}
            <span>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>

      {/* ── Page content ── */}
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        {children}
      </main>
    </div>
  )
}
