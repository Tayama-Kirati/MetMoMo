import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email 2=otp 3=newpw 4=done
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const steps = [
    { n: 1, label: 'Email' },
    { n: 2, label: 'OTP' },
    { n: 3, label: 'Reset' },
  ]

  const handleEmail = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post('/auth/forgotpassword', { email })
    if (ok) { toast.success('OTP sent to your email!'); setStep(2) }
    else toast.error(data.message || 'Email not found')
    setLoading(false)
  }

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post('/auth/verifyotp', { email, otp: Number(otp) })
    if (ok) { toast.success('OTP verified!'); setStep(3) }
    else toast.error(data.message || 'Invalid OTP')
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("Passwords don't match"); return }
    setLoading(true)
    const { ok, data } = await api.post('/auth/resetpassword', { email, ...passwords })
    if (ok) { toast.success('Password reset!'); setStep(4) }
    else toast.error(data.message || 'Reset failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate hover:text-primary text-sm font-display font-semibold mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold border-2 transition-all
                  ${step > s.n ? 'bg-primary border-primary text-white' : step === s.n ? 'bg-primary-50 border-primary text-primary' : 'bg-white border-slate-faint text-slate-light'}`}>
                  {step > s.n ? <CheckCircle size={14} /> : s.n}
                </div>
                <span className={`text-xs font-display font-semibold ${step >= s.n ? 'text-charcoal' : 'text-slate-light'}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.n ? 'bg-primary' : 'bg-slate-faint'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="card p-8">
          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-primary" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-charcoal mb-2">Forgot Password?</h1>
                <p className="text-slate text-sm">Enter your registered email and we'll send an OTP to reset your password.</p>
              </div>
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Email Address</label>
                  <input className="input-field" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 gap-2">
                  {loading ? <span className="spinner" /> : null} Send OTP <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-amber-500" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-charcoal mb-2">Enter OTP</h1>
                <p className="text-slate text-sm">We sent a 4-digit code to <strong className="text-charcoal">{email}</strong></p>
              </div>
              <form onSubmit={handleOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">OTP Code</label>
                  <input className="input-field text-center text-3xl font-display font-extrabold tracking-[0.5em] py-4"
                    type="number" placeholder="••••" maxLength={4}
                    value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 gap-2">
                  {loading ? <span className="spinner" /> : null} Verify OTP
                </button>
                <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-sm">
                  ← Change email
                </button>
              </form>
            </>
          )}

          {/* Step 3 — New password */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-sage" />
                </div>
                <h1 className="font-display font-extrabold text-2xl text-charcoal mb-2">New Password</h1>
                <p className="text-slate text-sm">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">New Password</label>
                  <div className="relative">
                    <input className="input-field pr-12" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-primary transition-colors">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Confirm Password</label>
                  <input className="input-field" type="password" placeholder="Repeat your password"
                    value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 gap-2">
                  {loading ? <span className="spinner" /> : <Lock size={16} />} Reset Password
                </button>
              </form>
            </>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-sage" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-charcoal mb-3">Password Reset!</h1>
              <p className="text-slate text-sm mb-8">Your password has been successfully changed. You can now log in with your new password.</p>
              <Link to="/login" className="btn-primary w-full justify-center py-4 gap-2">
                Go to Login <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}