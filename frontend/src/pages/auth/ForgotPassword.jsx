import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleEmail = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post(ROUTES.forgotPassword, { email })
    if (ok) { toast.success('OTP sent!'); setStep(2) }
    else toast.error(data.message || 'Email not found')
    setLoading(false)
  }

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true)
    const { ok, data } = await api.post(ROUTES.verifyOtp, { email, otp: Number(otp) })
    if (ok) { toast.success('OTP verified!'); setStep(3) }
    else toast.error(data.message || 'Invalid OTP')
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("Passwords don't match"); return }
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.resetPassword, { email, ...passwords })
    if (ok) { toast.success('Password reset!'); setStep(4) }
    else toast.error(data.message || 'Reset failed')
    setLoading(false)
  }

  const stepDots = [1, 2, 3]

  return (
    <div className="min-h-screen stripe-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-slate hover:text-pink text-sm font-display font-semibold mb-8 transition-colors">
          ← Back to Login
        </Link>

        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepDots.map(s => (
              <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step >= s ? 'w-10 bg-pink' : 'w-5 bg-faint'}`} />
            ))}
          </div>
        )}

        <div className="card p-10 shadow-float">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto mb-4">
                  <Mail size={26} className="text-pink" />
                </div>
                <h1 className="font-display font-black text-2xl text-ink">Forgot Password?</h1>
                <p className="text-muted text-sm mt-2">Enter your registered email to receive an OTP</p>
              </div>
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">EMAIL ADDRESS</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink"
                    type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-pink w-full justify-center py-3.5 rounded-xl gap-2">
                  {loading ? <span className="spinner" /> : null} Send OTP <ArrowRight size={15}/>
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={26} className="text-yellow-600" />
                </div>
                <h1 className="font-display font-black text-2xl text-ink">Enter OTP</h1>
                <p className="text-muted text-sm mt-2">Sent to <strong className="text-ink">{email}</strong></p>
              </div>
              <form onSubmit={handleOtp} className="space-y-4">
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">OTP CODE</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink text-center text-3xl font-display font-black tracking-[0.5em] py-4"
                    type="number" placeholder="••••" value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-pink w-full justify-center py-3.5 rounded-xl gap-2">
                  {loading ? <span className="spinner" /> : null} Verify OTP
                </button>
                <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-sm">← Change email</button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <Lock size={26} className="text-green-600" />
                </div>
                <h1 className="font-display font-black text-2xl text-ink">New Password</h1>
                <p className="text-muted text-sm mt-2">Choose a strong password</p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">NEW PASSWORD</p>
                  <div className="relative">
                    <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink pr-11"
                      type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={passwords.newPassword} onChange={e => setPasswords(p => ({...p, newPassword: e.target.value}))} required />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pink transition-colors">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">CONFIRM PASSWORD</p>
                  <input className="input-field rounded-xl bg-pink-50 border-pink-200 focus:border-pink"
                    type="password" placeholder="Repeat password"
                    value={passwords.confirmPassword} onChange={e => setPasswords(p => ({...p, confirmPassword: e.target.value}))} required />
                </div>
                <button type="submit" disabled={loading} className="btn-pink w-full justify-center py-3.5 rounded-xl gap-2">
                  {loading ? <span className="spinner" /> : <Lock size={15}/>} Reset Password
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h1 className="font-display font-black text-2xl text-ink mb-3">Password Reset!</h1>
              <p className="text-muted text-sm mb-8">Your password has been changed successfully.</p>
              <Link to="/login" className="btn-pink w-full justify-center py-3.5 rounded-xl gap-2">
                Go to Login <ArrowRight size={15}/>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
