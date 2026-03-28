import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { ok, data } = await api.post('/auth/login', form)
    if (ok && data.token) {
      login(data.token)
      toast.success('Welcome back!')
      navigate('/')
    } else {
      toast.error(data.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-16 bg-yellow">
    
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-yellow  blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
         
        <div className="bg- border border-black rounded-3xl p-8 shadow-deep">
          <div className="text-center mb-8">
            <div className="text-8xl mb-3">🍜</div>
            <h1 className="font-body font-extrabold text-4xl text-black">Welcome Back</h1>
            <p className="text-muted text-sm mt-1">Sign in to your MoMo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-display font-semibold text-muted block mb-1.5">Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-display font-semibold text-muted">Password</label>
                <Link to="/forgot-password" className="text-xs text-white hover:text-yellow-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base mt-2 gap-2">
              {loading ? <span className="spinner" /> : <LogIn size={18}/>}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange hover:text-orange-light font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
