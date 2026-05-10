import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ firstName:'', lastName:'', email:'', phoneNumber:'', userName:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post(ROUTES.register, {
      userName:    `${form.firstName} ${form.lastName}`.trim() || form.userName,
      email:       form.email,
      phoneNumber: form.phoneNumber,
      password:    form.password,
    })
    if (ok) { toast.success('Account created! Please login.'); navigate('/login') }
    else toast.error(data.message || 'Registration failed')
    setLoading(false)
  }

  const Field = ({ label, field, type='text', placeholder }) => (
    <div>
      <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{label}</p>
      <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink"
        type={type} placeholder={placeholder || ''}
        value={form[field]} onChange={set(field)} required />
    </div>
  )

  return (
    <div className="min-h-screen stripe-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <Link to="/" className="flex items-center gap-2 text-slate hover:text-pink text-sm font-display font-semibold mb-8 transition-colors">
          ← Back
        </Link>

        <div className="card p-10 shadow-float">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-pink mx-auto flex items-center justify-center text-white font-display font-black text-2xl shadow-pink mb-4">M</div>
            <h1 className="font-display font-black text-2xl text-ink">Create Account</h1>
            <p className="text-muted text-sm mt-1">Join MoMoGo and enjoy food delivered fast</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Matching screenshot: 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="FIRST NAME"    field="firstName"   placeholder="Aarav" />
              <Field label="EMAIL"         field="email"       type="email" placeholder="you@example.com" />
              <Field label="LAST NAME"     field="lastName"    placeholder="Sharma" />
              <Field label="PHONE NUMBER"  field="phoneNumber" placeholder="98XXXXXXXX" />
              <div>
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">USERNAME</p>
                <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink"
                  placeholder="username" value={form.userName} onChange={set('userName')} />
              </div>
              <div>
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">PASSWORD</p>
                <div className="relative">
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink pr-11"
                    type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={set('password')} required />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pink transition-colors">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pink w-full justify-center py-3.5 text-base rounded-xl mt-2 gap-2">
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-faint text-center">
            <p className="text-slate text-sm">Already have an account?{' '}
              <Link to="/login" className="text-pink hover:text-pink-700 font-display font-bold transition-colors">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
