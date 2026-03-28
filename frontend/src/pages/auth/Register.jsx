import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, ArrowLeft, Check } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ userName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-sage'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const { ok, data } = await api.post('/auth/register', {
      userName: form.userName, email: form.email,
      phoneNumber: form.phoneNumber, password: form.password,
    })
    if (ok) { toast.success('Account created! Please login.'); navigate('/login') }
    else toast.error(data.message || 'Registration failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-charcoal p-16">
        <div className="absolute inset-0" style={{background:'radial-gradient(circle at 70% 30%, rgba(255,69,0,0.15) 0%, transparent 60%)'}}/>
        <div className="relative text-white text-center">
          <div className="text-8xl mb-8 animate-float inline-block">🛵</div>
          <h2 className="font-display font-extrabold text-4xl mb-4 leading-tight">
            Join 50,000+<br />Happy Customers
          </h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed mb-10">
            Sign up and get your first order with 20% off using code FIRST20.
          </p>
          <div className="space-y-4 text-left">
            {[
              'Free delivery on your first 3 orders',
              'Exclusive member-only deals every week',
              'Real-time order tracking',
              'Priority customer support',
            ].map(b => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-white/80 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full border border-white/5" />
      </div>

      {/* Right form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-cream min-h-screen overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate hover:text-primary text-sm font-display font-semibold mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-hero-gradient flex items-center justify-center text-2xl shadow-glow-sm">🍜</div>
              <div>
                <span className="font-display font-extrabold text-xl text-charcoal block">MoMoGo</span>
                <span className="text-slate text-xs">Fast. Fresh. Delicious.</span>
              </div>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-charcoal mb-2">Create your account</h1>
            <p className="text-slate">It's free and takes less than a minute.</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Full Name *</label>
                  <input className="input-field" placeholder="Aarav Sharma" value={form.userName} onChange={set('userName')} required />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Email Address *</label>
                  <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Phone Number *</label>
                  <input className="input-field" type="tel" placeholder="98XXXXXXXX" value={form.phoneNumber} onChange={set('phoneNumber')} required />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Password *</label>
                  <div className="relative">
                    <input className="input-field pr-12" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={set('password')} required />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-primary transition-colors">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-faint'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate">{strengthLabel}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Confirm Password *</label>
                  <input className="input-field" type="password" placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={set('confirmPassword')} required />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate leading-relaxed">
                By signing up, you agree to our{' '}
                <span className="text-primary font-semibold cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-primary font-semibold cursor-pointer">Privacy Policy</span>.
              </p>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base gap-2">
                {loading ? <><span className="spinner" /> Creating account...</> : <><UserPlus size={18} /> Create Account</>}
              </button>
            </form>
          </div>

          <p className="text-center text-slate text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-display font-bold transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}