import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ChevronRight, ShoppingCart, CheckCircle, MapPin, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const PROMOS = { 'FIRST20': 20, 'MOMO10': 10, 'RUSH15': 15, 'WELCOME': 25 }

export default function Cart() {
  const { cartItems, removeFromCart, fetchCart } = useCart()
  const navigate  = useNavigate()
  const [removing, setRemoving]   = useState(null)
  const [placing, setPlacing]     = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null) // saved for receipt
  const [promo, setPromo]         = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [payMethod, setPayMethod]       = useState('COD')
  const [step, setStep]                 = useState(1)
  const [savedAddress, setSavedAddress] = useState('')
  const [usingSaved, setUsingSaved]     = useState(false)
  const [showNewForm, setShowNewForm]   = useState(false)
  const [newAddr, setNewAddr]           = useState({ street: '', landmark: '', city: '' })
  const [saveNew, setSaveNew]           = useState(false)
  const [feeEstimate, setFeeEstimate]   = useState(null)
  const [estimating, setEstimating]     = useState(false)
  const debounceRef = useRef(null)

  // Combined address string used for the order
  const address = usingSaved
    ? savedAddress
    : [newAddr.street, newAddr.landmark, newAddr.city].filter(Boolean).join(', ')

  // Load saved address from profile
  useEffect(() => {
    api.get(ROUTES.profile).then(({ ok, data }) => {
      if (ok && data.data?.address) {
        const parts = [data.data.address, data.data.landmark, data.data.city].filter(Boolean)
        setSavedAddress(parts.join(', '))
        setUsingSaved(true)
      }
    })
  }, [])

  // Get restaurant from first cart item
  const restaurantId = cartItems[0]?.restaurant?._id

  // Debounce address → call AI estimate
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!address.trim() || address.trim().length < 8 || !restaurantId) {
      setFeeEstimate(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setEstimating(true)
      try {
        const res = await fetch('/api/delivery/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId, customerAddress: address }),
        })
        const data = await res.json()
        if (res.ok) setFeeEstimate(data)
      } catch {}
      setEstimating(false)
    }, 700)
    return () => clearTimeout(debounceRef.current)
  }, [address, restaurantId])

  const subtotal    = cartItems.reduce((s, p) => s + (p.productPrice || 0), 0)
  const deliveryFee = feeEstimate ? feeEstimate.deliveryFee : (subtotal >= 500 ? 0 : 50)
  const discount    = promoApplied ? Math.floor(subtotal * (PROMOS[promoApplied] / 100)) : 0
  const total       = subtotal + deliveryFee - discount

  const handleRemove = async (id) => {
    setRemoving(id); await removeFromCart(id); setRemoving(null)
  }

  const applyPromo = () => {
    const code = promo.trim().toUpperCase()
    if (PROMOS[code]) { setPromoApplied(code); toast.success(`${PROMOS[code]}% off applied! 🎉`) }
    else toast.error('Invalid code. Try FIRST20')
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) { toast.error('Enter delivery address'); return }
    setPlacing(true)

    // Save new address to profile if checked
    if (!usingSaved && saveNew && newAddr.street.trim()) {
      await api.patch(ROUTES.profile, {
        address:  newAddr.street.trim(),
        landmark: newAddr.landmark.trim(),
        city:     newAddr.city.trim() || 'Kathmandu',
      })
    }

    const orderPayload = {
      items:          cartItems.map(p => ({ product: p._id, quantity: 1 })),
      totalAmount:    total,
      shippingAddress: address,
      paymentDetails: { method: payMethod, status: 'unpaid' },
      promoCode:      promoApplied || '',
      discountAmount: discount,
      deliveryFee,
    }

    if (payMethod === 'khalti') {
      // Khalti: initiate payment, then redirect
      const { ok, data } = await api.post('/payment', orderPayload)
      if (ok && data.paymentUrl) {
        fetchCart()
        window.location.href = data.paymentUrl   // redirect to Khalti
      } else {
        toast.error(data?.message || 'Khalti payment failed to start')
      }
    } else {
      // COD: create order normally
      const { ok, data } = await api.post(ROUTES.createOrder, orderPayload)
      if (ok) {
        setPlacedOrder({ items: [...cartItems], total, subtotal, discount, deliveryFee, address, promoApplied })
        fetchCart()
        setStep(3)
      } else toast.error(data?.message || 'Order failed')
    }

    setPlacing(false)
  }

  if (cartItems.length === 0 && step !== 3) return (
    <div className="page-wrap text-center py-24">
      <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center text-5xl mx-auto mb-6">🛒</div>
      <h2 className="font-display font-black text-2xl text-ink mb-3">Your cart is empty</h2>
      <p className="text-muted mb-7">Add some delicious momos to get started!</p>
      <Link to="/restaurants" className="btn-pink px-8 py-3.5 gap-2">Browse Menu <ArrowRight size={16}/></Link>
    </div>
  )

  if (step === 3) {
    const o = placedOrder
    return (
      <div className="page-wrap max-w-lg mx-auto py-10 animate-fade-up">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={44} className="text-green-500"/>
          </div>
          <h2 className="font-display font-black text-3xl text-ink mb-1">Order Placed! 🎉</h2>
          <p className="text-muted text-sm">Your momos are on their way. Estimated: <strong className="text-ink">25–35 min</strong></p>
        </div>

        {/* Receipt / Bill */}
        {o && (
          <div className="card p-6 mb-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-faint">
              <h3 className="font-display font-bold text-ink text-lg">Final Bill</h3>
              <span className="text-xs text-muted bg-gray-100 px-3 py-1 rounded-full font-semibold">Cash on Delivery</span>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {o.items.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                    {p.productImage
                      ? <img src={p.productImage} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-lg">🍜</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{p.productName}</p>
                    <p className="text-muted text-xs">{p.productCategory}</p>
                  </div>
                  <p className="font-bold text-pink text-sm shrink-0">NPR {p.productPrice?.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="bg-pink-50 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2">
              <MapPin size={14} className="text-pink-500 mt-0.5 shrink-0"/>
              <p className="text-sm text-ink">{o.address}</p>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-faint pt-4 text-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>NPR {o.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted">
                <span className="flex items-center gap-1"><Truck size={11}/> Delivery</span>
                <span className={o.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>{o.deliveryFee === 0 ? 'FREE' : `NPR ${o.deliveryFee}`}</span>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount ({o.promoApplied})</span><span>– NPR {o.discount?.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between border-t border-faint pt-2 font-display font-extrabold text-base">
                <span>Total Payable</span>
                <span className="text-pink">NPR {o.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Review prompt */}
        <div className="card p-5 mb-5 bg-yellow-50 border-yellow-200">
          <p className="font-display font-bold text-ink text-sm mb-1">Enjoyed your order? ⭐</p>
          <p className="text-muted text-xs mb-3">Once delivered, you can rate and review each item from your Orders page.</p>
          <Link to="/orders" className="text-xs font-bold text-pink-600 hover:underline">Go to My Orders →</Link>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/orders"      className="btn-pink flex-1 justify-center gap-2 py-3.5">Track Order <ChevronRight size={15}/></Link>
          <Link to="/restaurants" className="btn-outline flex-1 justify-center py-3.5">Order More</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap">
      <h1 className="font-display font-black text-3xl text-ink mb-2">My Cart</h1>
      <p className="text-muted mb-8">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[{n:1,l:'Cart'},{n:2,l:'Checkout'}].map((s,i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button onClick={() => s.n < step && setStep(s.n)}
              className={`flex items-center gap-2 text-sm font-display font-bold ${step >= s.n ? 'text-pink' : 'text-muted'} ${s.n < step ? 'cursor-pointer' : 'cursor-default'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 font-bold transition-all
                ${step > s.n ? 'bg-pink text-white border-pink' : step === s.n ? 'bg-pink-50 text-pink border-pink' : 'bg-white text-muted border-faint'}`}>
                {step > s.n ? '✓' : s.n}
              </span>{s.l}
            </button>
            {i < 1 && <ChevronRight size={14} className="text-faint" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-3">
              {cartItems.map(p => (
                <div key={p._id} className="card p-4 flex items-center gap-4">
                  <Link to={`/product/${p._id}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 shrink-0">
                    {p.productImage ? <img src={p.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-ink truncate">{p.productName}</h3>
                    <p className="text-muted text-sm">{p.productCategory}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-pink text-lg">NPR {p.productPrice?.toLocaleString()}</p>
                    <button onClick={() => handleRemove(p._id)} disabled={removing === p._id}
                      className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs mt-1 ml-auto transition-colors">
                      {removing === p._id ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={11}/>} Remove
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setStep(2)} className="btn-pink w-full justify-center py-3.5 text-base gap-2 mt-4 rounded-2xl">
                Proceed to Checkout <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleOrder} className="space-y-5">
              <div className="card p-6 space-y-4">
                <h3 className="font-display font-bold text-xl text-ink">Delivery Address</h3>

                {/* Saved address card */}
                {savedAddress && (
                  <button type="button"
                    onClick={() => { setUsingSaved(true); setShowNewForm(false); setFeeEstimate(null) }}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      usingSaved ? 'border-pink-500 bg-pink-50' : 'border-faint hover:border-pink-300'
                    }`}>
                    <MapPin size={18} className={`mt-0.5 shrink-0 ${usingSaved ? 'text-pink-600' : 'text-muted'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${usingSaved ? 'text-pink-600' : 'text-muted'}`}>Saved Address</p>
                      <p className="text-sm text-ink font-semibold">{savedAddress}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${usingSaved ? 'border-pink-500' : 'border-faint'}`}>
                      {usingSaved && <div className="w-2.5 h-2.5 rounded-full bg-pink-500"/>}
                    </div>
                  </button>
                )}

                {/* Add New Address button */}
                {!showNewForm ? (
                  <button type="button"
                    onClick={() => { setShowNewForm(true); setUsingSaved(false); setFeeEstimate(null) }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-600 font-bold text-sm transition-all">
                    <Plus size={18}/> Add New Address
                  </button>
                ) : (
                  /* New address form */
                  <div className="border-2 border-pink-500 bg-pink-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">New Address</p>
                      {savedAddress && (
                        <button type="button" onClick={() => { setShowNewForm(false); setUsingSaved(true); setFeeEstimate(null) }}
                          className="text-xs text-muted hover:text-ink transition-colors">✕ Cancel</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Street / Area *</label>
                      <input className="input-field rounded-xl" placeholder="e.g. Thamel, New Road"
                        value={newAddr.street}
                        onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))}
                        required={!usingSaved}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">Landmark</label>
                        <input className="input-field rounded-xl" placeholder="Near school, hospital…"
                          value={newAddr.landmark}
                          onChange={e => setNewAddr(a => ({ ...a, landmark: e.target.value }))}/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">City *</label>
                        <input className="input-field rounded-xl" placeholder="Kathmandu"
                          value={newAddr.city}
                          onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                          required={!usingSaved}/>
                      </div>
                    </div>
                    {estimating && (
                      <p className="text-xs text-pink-500 flex items-center gap-1">
                        <span className="w-3 h-3 border border-pink-400 border-t-transparent rounded-full animate-spin"/>
                        AI is calculating delivery fee…
                      </p>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input type="checkbox" checked={saveNew} onChange={e => setSaveNew(e.target.checked)}
                        className="w-4 h-4 accent-pink-600 rounded"/>
                      <span className="text-xs text-muted font-semibold">Save this address for future orders</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-xl text-ink">Payment</h3>
                {[{val:'COD',label:'Cash on Delivery',icon:'💵'},{val:'khalti',label:'Khalti',icon:'📱'}].map(pm => (
                  <label key={pm.val} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${payMethod === pm.val ? 'border-pink bg-pink-50' : 'border-faint hover:border-pink/40'}`}>
                    <input type="radio" name="pm" value={pm.val} checked={payMethod === pm.val} onChange={() => setPayMethod(pm.val)} className="hidden" />
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="font-display font-bold text-ink text-sm flex-1">{pm.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === pm.val ? 'border-pink' : 'border-faint'}`}>
                      {payMethod === pm.val && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
                    </div>
                  </label>
                ))}
              </div>
              <button type="submit" disabled={placing} className="btn-pink w-full justify-center py-4 text-base gap-2 rounded-2xl">
                {placing ? <><span className="spinner"/> Placing...</> : <><ShoppingBag size={18}/> Place Order · NPR {total.toLocaleString()}</>}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-outline w-full justify-center py-3 text-sm rounded-2xl">← Back to Cart</button>
            </form>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="font-display font-bold text-xl text-ink">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {cartItems.map(p => (
                <div key={p._id} className="flex justify-between">
                  <span className="text-muted truncate mr-2">{p.productName}</span>
                  <span className="font-semibold shrink-0">NPR {p.productPrice?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {!promoApplied ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="input-field pl-8 py-2.5 text-sm rounded-full" placeholder="Promo code"
                    value={promo} onChange={e => setPromo(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()} />
                </div>
                <button onClick={applyPromo} className="btn-outline text-sm px-4 py-2.5 rounded-full shrink-0">Apply</button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-3 py-2.5">
                <span className="text-green-700 text-sm font-display font-bold">🎉 {promoApplied} – {PROMOS[promoApplied]}% off</span>
                <button onClick={() => { setPromoApplied(null); setPromo('') }} className="text-green-600 text-xs font-semibold hover:text-green-800">Remove</button>
              </div>
            )}
            <p className="text-xs text-muted">Try: FIRST20, MOMO10, RUSH15</p>

            <div className="space-y-2 border-t border-faint pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>NPR {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-start">
                <span className="text-muted flex items-center gap-1"><Truck size={11}/> Delivery
                  {estimating && <span className="w-3 h-3 border border-pink-400 border-t-transparent rounded-full animate-spin ml-1"/>}
                </span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>{deliveryFee === 0 ? 'FREE' : `NPR ${deliveryFee}`}</span>
              </div>
              {feeEstimate && (
                <div className="bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 text-xs text-slate">
                  <span className="inline-flex items-center gap-1 text-pink-600 font-semibold">✦ AI · {feeEstimate.distanceKm} km</span>
                  <p className="mt-0.5 text-muted">{feeEstimate.explanation}</p>
                </div>
              )}
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>– NPR {discount.toLocaleString()}</span></div>}
              <div className="flex justify-between border-t border-faint pt-2 font-display font-extrabold">
                <span>Total</span><span className="text-pink text-xl">NPR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
