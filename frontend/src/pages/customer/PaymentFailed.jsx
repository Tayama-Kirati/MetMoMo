import { Link, useSearchParams } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function PaymentFailed() {
  const [params] = useSearchParams()
  const reason   = params.get('reason') || 'unknown'

  return (
    <div className="page-wrap text-center py-24 animate-fade-up">
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <XCircle size={52} className="text-red-500"/>
      </div>
      <h2 className="font-display font-black text-3xl text-ink mb-3">Payment Failed</h2>
      <p className="text-muted mb-2">Your Khalti payment was not completed.</p>
      <p className="text-muted text-sm mb-8 capitalize">Reason: {reason.replace(/_/g, ' ')}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/cart" className="btn-pink gap-2 px-7 py-3.5">Try Again</Link>
        <Link to="/" className="btn-outline gap-2 px-7 py-3.5">Go Home</Link>
      </div>
    </div>
  )
}
