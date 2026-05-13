import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.login, form)
    if (ok && data.token) {
      if (data.user?.userRole !== 'admin') {
        toast.error('Access denied. Admin accounts only.')
        setLoading(false)
        return
      }
      login(data.token)
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } else {
      toast.error(data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#1a0a10] text-white p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-pink flex items-center justify-center shadow-pink-sm">
              <span className="font-display font-black text-white text-lg">M</span>
            </div>
            <span className="font-display font-black text-2xl">
              Met<span className="text-pink">MoMo</span>
            </span>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-3xl bg-pink/20 border border-pink/30 flex items-center justify-center mb-6">
              <ShieldCheck size={28} className="text-pink"/>
            </div>
            <h2 className="font-display font-black text-3xl leading-tight mb-3">
              Admin<br/>Control Panel
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Secure access for authorized administrators only. Manage restaurants, products, orders and users from one place.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: '🏪', label: 'Manage Restaurants' },
            { icon: '📦', label: 'Product Catalogue'  },
            { icon: '🛒', label: 'Order Management'   },
            { icon: '👥', label: 'User Administration' },
          ].map(i => (
            <div key={i.label} className="flex items-center gap-3 text-sm text-white/60">
              <span>{i.icon}</span>
              <span>{i.label}</span>
            </div>
          ))}

          <div className="pt-6 border-t border-white/10">
            <Link to="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              ← Customer login
            </Link>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center bg-[#120609] px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-2xl bg-pink flex items-center justify-center">
              <span className="font-display font-black text-white">M</span>
            </div>
            <span className="font-display font-black text-xl text-white">
              Met<span className="text-pink">MoMo</span>
            </span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-pink/10 border border-pink/20 text-pink text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <ShieldCheck size={12}/> ADMIN ACCESS
            </div>
            <h1 className="font-display font-black text-3xl text-white mb-2">Sign in</h1>
            <p className="text-white/40 text-sm">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="admin@metmomo.com"
                value={form.email}
                onChange={set('email')}
                required
                className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-pink focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  className="w-full h-12 px-4 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-pink focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-white/40 cursor-pointer">
                <input type="checkbox" className="accent-pink w-4 h-4 rounded"/>
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-pink/70 hover:text-pink transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-pink hover:bg-rose-dark active:scale-95 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 shadow-pink-sm">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing in...</>
                : <><LayoutDashboard size={16}/> Enter Dashboard</>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/30 text-xs">
              Not an admin?{' '}
              <Link to="/login" className="text-pink/60 hover:text-pink transition-colors font-semibold">
                Customer login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
