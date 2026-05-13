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
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.forgotPassword, { email })
    if (ok) { toast.success('OTP sent!'); setStep(2) }
    else toast.error(data.message || 'Email not found')
    setLoading(false)
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.verifyOtp, { email, otp: Number(otp) })
    if (ok) { toast.success('OTP verified!'); setStep(3) }
    else toast.error(data.message || 'Invalid OTP')
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.resetPassword, { email, ...passwords })
    if (ok) { toast.success('Password reset!'); setStep(4) }
    else toast.error(data.message || 'Reset failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Back */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors mb-5"
        >
          ← Back to Login
        </Link>

        {/* Step dots */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step >= s ? 'w-10 bg-pink-500' : 'w-5 bg-pink-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-pink-50 rounded-2xl border border-pink-200 shadow-sm px-6 sm:px-9 py-10">

          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto mb-4">
                  <Mail size={26} className="text-pink-500" />
                </div>
                <h1 className="font-display font-bold text-2xl text-pink-600">Forgot Password?</h1>
                <p className="text-gray-400 text-sm mt-2">Enter your registered email to receive an OTP</p>
              </div>
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span className="spinner" /> : null}
                  {loading ? 'Sending...' : 'Send OTP'}
                  {!loading && <ArrowRight size={15} />}
                </button>
              </form>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={26} className="text-yellow-500" />
                </div>
                <h1 className="font-display font-bold text-2xl text-pink-600">Enter OTP</h1>
                <p className="text-gray-400 text-sm mt-2">
                  Sent to <strong className="text-pink-500">{email}</strong>
                </p>
              </div>
              <form onSubmit={handleOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                    OTP Code
                  </label>
                  <input
                    className="w-full h-14 px-3.5 rounded-xl border border-pink-300 bg-white text-3xl font-bold text-center tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                    type="number"
                    placeholder="••••"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span className="spinner" /> : null}
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full h-11 border border-pink-300 text-pink-500 hover:bg-pink-100 text-sm font-medium rounded-xl transition-colors"
                >
                  ← Change email
                </button>
              </form>
            </>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <Lock size={26} className="text-green-500" />
                </div>
                <h1 className="font-display font-bold text-2xl text-pink-600">New Password</h1>
                <p className="text-gray-400 text-sm mt-2">Choose a strong password</p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-11 px-3.5 pr-11 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
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
                </div>
                <div>
                  <label className="block text-xs font-display font-bold text-pink-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-11 px-3.5 pr-11 rounded-xl border border-pink-300 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span className="spinner" /> : <Lock size={15} />}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h1 className="font-display font-bold text-2xl text-pink-600 mb-3">Password Reset!</h1>
              <p className="text-gray-400 text-sm mb-8">Your password has been changed successfully.</p>
              <Link
                to="/login"
                className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight size={15} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}