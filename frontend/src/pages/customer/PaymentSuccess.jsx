import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const orderId  = params.get('orderId')

  return (
    <div className="page-wrap text-center py-24 animate-fade-up">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={52} className="text-green-500"/>
      </div>
      <h2 className="font-display font-black text-3xl text-ink mb-3">Payment Successful! 🎉</h2>
      <p className="text-muted mb-2">Your Khalti payment was confirmed.</p>
      <p className="text-muted mb-8">Your order is being prepared.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-pink gap-2 px-7 py-3.5">Track My Order</Link>
        <Link to="/restaurants" className="btn-outline gap-2 px-7 py-3.5">Order More</Link>
      </div>
    </div>
  )
}
