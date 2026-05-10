import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post(ROUTES.login, form)
    if (ok && data.token) { login(data.token); toast.success('Welcome back! 👋'); navigate('/') }
    else toast.error(data.message || 'Invalid credentials')
    setLoading(false)
  }

  return (
    <div className="min-h-screen stripe-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Back arrow like screenshot */}
        <Link to="/" className="flex items-center gap-2 text-slate hover:text-pink text-sm font-display font-semibold mb-8 transition-colors">
          ← Back
        </Link>

        <div className="card p-10 shadow-float">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-pink mx-auto flex items-center justify-center text-white font-display font-black text-2xl shadow-pink mb-4">M</div>
            <h1 className="font-display font-black text-2xl text-ink">Welcome Back</h1>
            <p className="text-muted text-sm mt-1">Sign in to order your momos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (email) - styled like screenshot */}
            <div>
              <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">USERNAME</p>
              <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink"
                type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required autoFocus />
            </div>

            <div>
              <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">PASSWORD</p>
              <div className="relative">
                <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink pr-11"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pink transition-colors">
                  {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-pink hover:text-pink-700 font-display font-semibold transition-colors">
                Forget Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-pink w-full justify-center py-3.5 text-base rounded-xl mt-2 gap-2">
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-faint text-center">
            <p className="text-slate text-sm">Don't have an account?{' '}
              <Link to="/register" className="text-pink hover:text-pink-700 font-display font-bold transition-colors">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
