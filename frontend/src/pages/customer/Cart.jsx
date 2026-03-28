import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ChevronRight, Plus, Minus, ShoppingCart, CheckCircle, MapPin, CreditCard } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { api ,ROUTES} from '../../services/api'
import toast from 'react-hot-toast'

const PROMOS = { 'FIRST20': 20, 'MOMO10': 10, 'RUSH15': 15, 'WELCOME': 25 }

export default function Cart() {
  const { cartItems, removeFromCart, fetchCart } = useCart()
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [payMethod, setPayMethod] = useState('COD')
  const [step, setStep] = useState(1)

  const subtotal    = cartItems.reduce((s, p) => s + (p.productPrice || 0), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const discount    = promoApplied ? Math.floor(subtotal * (PROMOS[promoApplied] / 100)) : 0
  const total       = subtotal + deliveryFee - discount

  const handleRemove = async (id) => {
    setRemoving(id)
    await removeFromCart(id)
    setRemoving(null)
  }

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase()
    if (PROMOS[code]) { setPromoApplied(code); toast.success(`${PROMOS[code]}% discount applied! 🎉`) }
    else toast.error('Invalid promo code. Try FIRST20')
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) { toast.error('Please enter your delivery address'); return }
    setPlacing(true)
    const { ok, data } = await api.post(ROUTES.createOrder, {
      items: cartItems.map(p => ({ product: p._id, quantity: 1 })),
      totalAmount: total,
      shippingAddress: address,
      paymentDetails: { method: payMethod, status: 'unpaid' },
    })
    if (ok) { fetchCart(); setStep(3) }
    else toast.error(data.message || 'Order failed. Try again.')
    setPlacing(false)
  }

  // Empty cart
  if (cartItems.length === 0 && step !== 3) return (
    <div className="wrap py-28 text-center">
      <div className="w-28 h-28 bg-cream-dark rounded-4xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-card">🛒</div>
      <h2 className="font-body font-extrabold text-3xl text-charcoal mb-3">Your cart is empty</h2>
      <p className="text-slate text-lg mb-8 max-w-sm mx-auto">Looks like you haven't added any items yet. Browse our menu to get started!</p>
      <Link to="/menu" className="btn-primary px-8 py-4 font-body text-base gap-2">Browse Menu <ArrowRight size={18}/></Link>
    </div>
  )

  // Order success
  if (step === 3) return (
    <div className="wrap py-28 text-center">
      <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-card">
        <CheckCircle size={56} className="text-sage" />
      </div>
      <h2 className="font-body font-extrabold text-3xl text-charcoal mb-3">Order Placed! 🎉</h2>
      <p className="text-slate text-lg mb-2">Your momos are being prepared with love.</p>
      <p className="text-slate mb-2">Estimated delivery: <strong className="text-charcoal">25–35 minutes</strong></p>
      <p className="text-slate text-sm mb-8">You will receive updates on your order status.</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/orders" className="btn-primary gap-2 px-7 py-3.5">Track Order <ChevronRight size={16}/></Link>
        <Link to="/menu" className="btn-secondary gap-2 px-7 py-3.5">Order More</Link>
      </div>
    </div>
  )

  return (
    <div className="wrap py-10">
      <h1 className="section-title font-body mb-2">My Cart</h1>
      <p className="section-sub mb-8">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>

      {/* Step tabs */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {[{ n: 1, l: 'Review Cart' }, { n: 2, l: 'Checkout' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button onClick={() => s.n < step && setStep(s.n)}
              className={`flex items-center gap-2 text-sm font-body font-bold transition-colors ${step >= s.n ? 'text-primary' : 'text-slate-light'} ${s.n < step ? 'cursor-pointer' : 'cursor-default'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 font-bold transition-all
                ${step > s.n ? 'bg-primary text-white border-primary' : step === s.n ? 'bg-primary-50 text-primary border-primary' : 'bg-white text-slate-light border-slate-faint'}`}>
                {step > s.n ? '✓' : s.n}
              </span>
              {s.l}
            </button>
            {i < 1 && <ChevronRight size={14} className="text-slate-faint" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-3">
              {cartItems.map(p => (
                <div key={p._id} className="card p-4 flex items-center gap-4 hover:shadow-card-lg transition-shadow">
                  <Link to={`/product/${p._id}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-cream-dark shrink-0">
                    {p.productImage
                      ? <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${p._id}`}>
                      <h3 className="font-body font-bold text-charcoal hover:text-primary transition-colors truncate">{p.productName}</h3>
                    </Link>
                    <p className="text-slate text-sm">{p.productCategory}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body font-extrabold text-primary text-xl">NPR {p.productPrice?.toLocaleString()}</p>
                    <button onClick={() => handleRemove(p._id)} disabled={removing === p._id}
                      className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs mt-1.5 ml-auto transition-colors">
                      {removing === p._id
                        ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={12} />} Remove
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => setStep(2)} className="btn-primary w-full justify-center py-4 font-body text-base gap-2 mt-4">
                Proceed to Checkout <ChevronRight size={18} />
              </button>
              <Link to="/menu" className="btn-secondary font-body w-full justify-center py-3.5 gap-2">
                <ShoppingCart size={16} /> Continue Shopping
              </Link>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleOrder} className="space-y-5">
              <div className="card p-6 space-y-4">
                <h3 className="font-body font-bold text-charcoal text-xl flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Delivery Details
                </h3>
                <div>
                  <label className="text-xs font-body font-bold text-charcoal block mb-2">Full Delivery Address *</label>
                  <textarea className="input-field resize-none" rows={3}
                    placeholder="Street, Area, Building, Landmark..."
                    value={address} onChange={e => setAddress(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-body font-bold text-charcoal block mb-2">Special Instructions (optional)</label>
                  <input className="input-field" placeholder="E.g. Extra spicy, no onions, ring the bell..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>
              </div>

              <div className="card p-6 space-y-3">
                <h3 className="font-body font-bold text-charcoal text-xl flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Payment Method
                </h3>
                {[
                  { val: 'COD',    label: 'Cash on Delivery', icon: '💵', desc: 'Pay in cash when your order arrives' },
                  { val: 'khalti', label: 'Khalti',           icon: '📱', desc: 'Pay online via Khalti digital wallet' },
                ].map(pm => (
                  <label key={pm.val}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                      ${payMethod === pm.val ? 'border-primary bg-primary-50' : 'border-slate-faint hover:border-primary/40'}`}>
                    <input type="radio" name="payment" value={pm.val} checked={payMethod === pm.val} onChange={() => setPayMethod(pm.val)} className="hidden" />
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="font-body font-bold text-charcoal text-sm">{pm.label}</p>
                      <p className="text-slate text-xs">{pm.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === pm.val ? 'border-primary' : 'border-slate-faint'}`}>
                      {payMethod === pm.val && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" disabled={placing} className="btn-primary w-full justify-center py-4  font-body text-base gap-2">
                {placing ? <><span className="spinner" /> Placing Order...</> : <><ShoppingBag size={18} /> Place Order · NPR {total.toLocaleString()}</>}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full justify-center font-body py-3.5 text-sm">← Back to Cart</button>
            </form>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-5">
            <h3 className="font-body font-bold text-charcoal text-xl">Order Summary</h3>

            <div className="space-y-2.5 text-sm">
              {cartItems.map(p => (
                <div key={p._id} className="flex justify-between">
                  <span className="text-slate truncate mr-2">{p.productName}</span>
                  <span className="text-charcoal font-semibold shrink-0">NPR {p.productPrice?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Promo */}
            {!promoApplied ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
                  <input className="input-field pl-8 py-2.5 text-sm" placeholder="Promo code"
                    value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()} />
                </div>
                <button onClick={applyPromo} className="btn-secondary px-4 py-2.5 text-sm shrink-0">Apply</button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <span className="text-green-700 text-sm font-body font-bold">🎉 {promoApplied} – {PROMOS[promoApplied]}% off</span>
                <button onClick={() => { setPromoApplied(null); setPromoCode('') }} className="text-green-600 hover:text-green-800 text-xs font-semibold">Remove</button>
              </div>
            )}
            <p className="text-xs text-slate -mt-3">Try: FIRST20, MOMO10, RUSH15</p>

            {/* Totals */}
            <div className="space-y-2.5 border-t border-slate-faint pt-4 text-sm">
              <div className="flex justify-between"><span className="text-slate">Subtotal</span><span className="font-semibold">NPR {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span className="text-slate flex items-center gap-1"><Truck size={12}/> Delivery</span>
                <span className={deliveryFee === 0 ? 'text-sage font-bold' : 'font-semibold'}>{deliveryFee === 0 ? 'FREE' : `NPR ${deliveryFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600 font-bold">– NPR {discount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between border-t border-slate-faint pt-3 mt-1">
                <span className="font-body font-extrabold text-charcoal text-base">Total</span>
                <span className="font-body font-extrabold text-primary text-2xl">NPR {total.toLocaleString()}</span>
              </div>
            </div>

            {deliveryFee > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                <p className="text-amber-700 text-xs font-body font-semibold">
                  Add NPR {(500 - subtotal).toLocaleString()} more for <span className="font-extrabold">FREE delivery!</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}