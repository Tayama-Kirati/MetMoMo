import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setPasswords(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { ok, data } = await api.post(ROUTES.resetPassword, passwords)
    if (ok) { toast.success('Password updated!'); setDone(true) }
    else toast.error(data?.message || 'Reset failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors mb-5"
        >
          ← Back
        </button>

        {/* Card */}
        <div className="bg-pink-50 rounded-2xl border border-pink-200 shadow-sm px-6 sm:px-9 py-10">

          {!done ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <Lock size={26} className="text-green-500" />
                </div>
                <h1 className="font-display font-bold text-2xl text-pink-600">Reset Password</h1>
                <p className="text-gray-400 text-sm mt-2">Choose a strong new password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New Password */}
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
                      onChange={set('newPassword')}
                      required
                      autoFocus
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

                {/* Confirm Password */}
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
                      onChange={set('confirmPassword')}
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

                  {/* Live match indicator */}
                  {passwords.confirmPassword.length > 0 && (
                    <p className={`text-xs mt-1.5 ${
                      passwords.newPassword === passwords.confirmPassword
                        ? 'text-green-500'
                        : 'text-red-400'
                    }`}>
                      {passwords.newPassword === passwords.confirmPassword
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span className="spinner" /> : <Lock size={15} />}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h1 className="font-display font-bold text-2xl text-pink-600 mb-3">Password Updated!</h1>
              <p className="text-gray-400 text-sm mb-8">Your password has been changed successfully.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full h-11 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}