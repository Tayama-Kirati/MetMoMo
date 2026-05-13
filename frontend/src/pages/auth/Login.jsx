import { use, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api, ROUTES } from '../../services/api'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { ok, data } = await api.post(ROUTES.login,  {
      email: form.email,
      password: form.password,
    })

    if (ok && data.token) { login(data.token); toast.success(`Welcome back, ${data.user?.userName || 'there'}!`); 
    if (data.user?.userRole === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        // Go back to where they were, or home
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } else {
      toast.error(data?.message || 'Invalid credentials')
    }
 
    setLoading(false)
  }

  const handleGoogleSignIn = () => {
    if (!window.google) { toast.error('Google Sign-In unavailable. Try again shortly.'); return }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) { toast.error('Google Sign-In not configured yet.'); return }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        setLoading(true)
        const { ok, data } = await api.post('/auth/google', { credential: res.credential })
        if (ok && data.token) { login(data.token); toast.success('Signed in with Google!'); navigate(location.state?.from || '/') }
        else toast.error(data?.message || 'Google sign-in failed')
        setLoading(false)
      },
    })
    window.google.accounts.id.prompt()
  }

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-bold  text-gray-500 hover:text-pink-600 transition-colors mb-5"
        > ← Back to Home        </Link>

        {/* Card */}
        <div className="bg-pink-50 rounded-2xl border border-pink-200 shadow-sm px-6 sm:px-9 py-10">

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-pink-600 mb-1">Welcome back</h1>
          <p className="text-sm font-display font-extralight text-gray-400 mb-8">Sign in to order your delicious food</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-display text-pink-400 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-display text-pink-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  className="w-full h-11 px-3.5 pr-11 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-pink-400 cursor-pointer">
                <input type="checkbox" className="accent-pink-600 w-4 h-4" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-pink-500 hover:text-pink-800 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-pink-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-pink-200" />
          </div>

          {/* Google Button */}
          <button onClick={handleGoogleSignIn} type="button" className="w-full h-11 flex items-center justify-center gap-2.5 border border-pink-300 rounded-xl text-sm font-medium text-pink-500 hover:bg-pink-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-pink-600 font-medium hover:text-pink-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}