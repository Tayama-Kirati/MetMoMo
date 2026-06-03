import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function getPasswordStrength(password) {
  if (!password) return null
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { label: 'Weak', bar: 'w-1/3 bg-red-400', text: 'text-red-500' }
  if (score <= 3) return { label: 'Medium', bar: 'w-2/3 bg-yellow-400', text: 'text-yellow-600' }
  return { label: 'Strong', bar: 'w-full bg-green-500', text: 'text-green-600' }
}

const Field = ({ label, type = 'text', placeholder, value, onChange }) => (
  <div>
    <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
      {label}
    </label>
    <input
      className="w-full h-11 px-3.5 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
      type={type}
      placeholder={placeholder || ''}
      value={value}
      onChange={onChange}
      required
    />
  </div>
)

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', password: '', confirmPassword: '', userName: '',
    userRole: 'customer',
  })
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    const autoUserName = (form.firstName + form.lastName).toLowerCase().replace(/\s+/g, '') || form.email.split('@')[0]
    setLoading(true)
    try {
      const { ok, data } = await api.post(ROUTES.register, {
        userName:    autoUserName,
        email:       form.email,
        phoneNumber: form.phoneNumber,
        password:    form.password,
        firstName:   form.firstName,
        lastName:    form.lastName,
        userRole:    form.userRole,
      })
      if (ok && data.token) {
        login(data.token)
        toast.success(form.userRole === 'restaurant_owner'
          ? 'Welcome! Your restaurant owner account is ready.'
          : 'Welcome to MetMomo!')
        navigate(form.userRole === 'restaurant_owner' ? '/owner' : '/', { replace: true })
      } else if (ok) {
        toast.success('Account created! Please log in.')
        navigate('/login', { replace: true })
      } else {
        toast.error(data?.message || 'Registration failed')
      }
    } catch {
      toast.error('Could not connect to server. Please check your connection.')
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
        if (ok && data.token) { login(data.token); toast.success('Account created with Google!'); navigate('/') }
        else toast.error(data?.message || 'Google sign-in failed')
        setLoading(false)
      },
    })
    window.google.accounts.id.prompt()
  }

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {/* Back */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-500 hover:text-pink-600 text-sm font-display font-semibold mb-8 transition-colors"
        >
          ← Back
        </Link>

        <div className="bg-pink-50 rounded-2xl border border-pink-200 shadow-sm px-6 sm:px-10 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-pink-500 text-3xl font-bold">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join MetMomo and enjoy ordering food fast</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <p className="text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">I want to join as</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'customer',          icon: '🛍️', label: 'Customer',           sub: 'Order food from restaurants' },
                  { value: 'restaurant_owner',  icon: '🏪', label: 'Restaurant Owner',   sub: 'List and manage my restaurant' },
                ].map(({ value, icon, label, sub }) => (
                  <button key={value} type="button"
                    onClick={() => setForm(f => ({ ...f, userRole: value }))}
                    className={`flex flex-col items-center gap-1 px-3 py-4 rounded-xl border-2 transition-all text-center ${
                      form.userRole === value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-pink-200 bg-white hover:border-pink-400'
                    }`}>
                    <span className="text-2xl">{icon}</span>
                    <span className={`text-sm font-bold ${form.userRole === value ? 'text-pink-600' : 'text-gray-700'}`}>{label}</span>
                    <span className="text-[11px] text-gray-400 leading-tight">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive grid: 1 col on mobile, 2 on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name"   placeholder="First Name"           value={form.firstName}       onChange={set('firstName')} />
              <Field label="Last Name"    placeholder="Last Name"          value={form.lastName}        onChange={set('lastName')} />
              <Field label="Email"        type="email" placeholder="you@example.com" value={form.email}      onChange={set('email')} />
              <Field label="Phone Number" placeholder="98XXXXXXXX"      value={form.phoneNumber}     onChange={set('phoneNumber')} />

              {/* Password with show/hide */}
              <div>
                <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password && (() => {
                  const s = getPasswordStrength(form.password)
                  return (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-pink-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${s.bar}`} />
                      </div>
                      <p className={`text-[11px] font-semibold mt-1 ${s.text}`}>{s.label} password</p>
                    </div>
                  )
                })()}
              </div>

              {/* Confirm Password with show/hide */}
              <div>
                <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1">Passwords do not match</p>
                )}
                {!passwordMismatch && form.confirmPassword.length > 0 && (
                  <p className="text-[11px] font-semibold text-green-600 mt-1">Passwords match</p>
                )}
              </div>

              {/* <Field label="Username" placeholder="username" value={form.userName} onChange={set('userName')} /> */}
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-pink-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-pink-200" />
            </div>
            <button onClick={handleGoogleSignIn} type="button" className="w-full h-11 flex items-center justify-center gap-2.5 border border-pink-300 rounded-xl text-sm font-medium text-pink-500 hover:bg-pink-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-pink-200 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-600 hover:text-pink-700 font-display font-bold transition-colors">
                Log In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}