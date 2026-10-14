import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ChevronRight, CheckCircle, MapPin, Plus, Minus, Clock, Crosshair, KeyRound } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { usePrefs } from '../../context/PreferencesContext'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const PAY_METHODS = [
  { val: 'COD',    label: 'Cash on Delivery', icon: '💵' },
  { val: 'khalti', label: 'Khalti',           icon: '📱' },
  { val: 'esewa',  label: 'eSewa',            icon: '💚' },
]

// eSewa expects a browser form POST with signed fields
function submitEsewaForm(formUrl, fields) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = formUrl
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'; input.name = name; input.value = value
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}

const addressText = (a) => [a.street, a.landmark, a.city].filter(Boolean).join(', ')

// Earliest schedulable slot (now + 45 min), formatted for <input type="datetime-local">
const minSchedule = () => {
  const d = new Date(Date.now() + 45 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function Cart() {
  const { cartItems, removeFromCart, setQuantity, fetchCart } = useCart()
  const { t } = usePrefs()
  const [step, setStep]                 = useState(1)
  const [busyItem, setBusyItem]         = useState(null)
  const [placing, setPlacing]           = useState(false)
  const [placedOrder, setPlacedOrder]   = useState(null)

  const [addresses, setAddresses]       = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)   // address _id, or 'new'
  const [newAddr, setNewAddr]           = useState({ label: 'Home', street: '', landmark: '', city: 'Kathmandu' })
  const [saveNew, setSaveNew]           = useState(true)
  const [coords, setCoords]             = useState(null)

  const [promoInput, setPromoInput]     = useState('')
  const [promoCode, setPromoCode]       = useState('')
  const [coupons, setCoupons]           = useState([])
  const [payMethod, setPayMethod]       = useState('COD')
  const [scheduleOn, setScheduleOn]     = useState(false)
  const [scheduledFor, setScheduledFor] = useState('')

  const [quote, setQuote]               = useState(null)
  const [quoteError, setQuoteError]     = useState('')
  const [quoting, setQuoting]           = useState(false)
  const debounceRef = useRef(null)

  // Cart stores one entry per unit — group into lines with quantities
  const lines = useMemo(() => {
    const map = new Map()
    cartItems.forEach(p => {
      const line = map.get(p._id) || { product: p, quantity: 0 }
      line.quantity += 1
      map.set(p._id, line)
    })
    return [...map.values()]
  }, [cartItems])
  const items = useMemo(() => lines.map(l => ({ product: l.product._id, quantity: l.quantity })), [lines])
  const localSubtotal = lines.reduce((s, l) => s + (l.product.productPrice || 0) * l.quantity, 0)
  const restaurant = lines[0]?.product.restaurant

  useEffect(() => {
    api.get(ROUTES.addresses).then(({ ok, data }) => {
      if (!ok) return
      setAddresses(data.data || [])
      const def = (data.data || []).find(a => a.isDefault) || data.data?.[0]
      setSelectedAddr(def ? def._id : 'new')
    })
    api.get(ROUTES.coupons).then(({ ok, data }) => { if (ok) setCoupons(data.data || []) })
  }, [])

  const chosen = addresses.find(a => a._id === selectedAddr)
  const shippingAddress = selectedAddr === 'new' ? addressText(newAddr) : chosen ? addressText(chosen) : ''
  const location = selectedAddr === 'new' ? coords : (chosen?.lat != null ? { lat: chosen.lat, lng: chosen.lng } : null)

  // Ask the server for authoritative totals whenever the order changes
  useEffect(() => {
    if (!items.length) { setQuote(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setQuoting(true)
      const { ok, data } = await api.post(ROUTES.quote, {
        items,
        promoCode: promoCode || undefined,
        shippingAddress: shippingAddress.trim().length >= 5 ? shippingAddress : undefined,
      })
      if (ok) { setQuote(data.data); setQuoteError('') }
      else {
        setQuoteError(data?.message || 'Could not price your order')
        if (promoCode && /code/i.test(data?.message || '')) { toast.error(data.message); setPromoCode('') }
      }
      setQuoting(false)
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [items, promoCode, shippingAddress])

  const changeQty = async (productId, quantity) => {
    setBusyItem(productId)
    if (quantity <= 0) await removeFromCart(productId)
    else await setQuantity(productId, quantity)
    setBusyItem(null)
  }

  const applyPromo = (code = promoInput) => {
    const c = code.trim().toUpperCase()
    if (c) setPromoCode(c)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Location is not available on this device')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success('Location pinned') },
      () => toast.error('Could not get your location'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!shippingAddress.trim()) { toast.error('Enter delivery address'); return }
    if (scheduleOn && !scheduledFor) { toast.error('Pick a delivery time'); return }
    setPlacing(true)

    if (selectedAddr === 'new' && saveNew && newAddr.street.trim()) {
      await api.post(ROUTES.addresses, { ...newAddr, ...(coords || {}) })
    }

    const payload = {
      items,
      shippingAddress,
      promoCode: promoCode || undefined,
      location: location || undefined,
      scheduledFor: scheduleOn ? new Date(scheduledFor).toISOString() : undefined,
    }

    if (payMethod === 'khalti') {
      const { ok, data } = await api.post(ROUTES.payKhalti, payload)
      if (ok && data.paymentUrl) { window.location.href = data.paymentUrl; return }
      toast.error(data?.message || 'Khalti payment failed to start')
    } else if (payMethod === 'esewa') {
      const { ok, data } = await api.post(ROUTES.payEsewa, payload)
      if (ok && data.formUrl) { submitEsewaForm(data.formUrl, data.fields); return }
      toast.error(data?.message || 'eSewa payment failed to start')
    } else {
      const { ok, data } = await api.post(ROUTES.createOrder, payload)
      if (ok) {
        setPlacedOrder({ ...data.data, lines })
        fetchCart()
        setStep(3)
      } else toast.error(data?.message || 'Order failed')
    }
    setPlacing(false)
  }

  if (cartItems.length === 0 && step !== 3) return (
    <div className="page-wrap text-center py-24">
      <title>Cart · MetMoMo</title>
      <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center text-5xl mx-auto mb-6">🛒</div>
      <h2 className="font-display font-black text-2xl text-ink mb-3">Your cart is empty</h2>
      <p className="text-muted mb-7">Add some delicious momos to get started!</p>
      <Link to="/restaurants" className="btn-pink px-8 py-3.5 gap-2">Browse Menu <ArrowRight size={16}/></Link>
    </div>
  )

  if (step === 3 && placedOrder) {
    const o = placedOrder
    return (
      <div className="page-wrap max-w-lg mx-auto py-10 animate-fade-up">
        <title>Order placed · MetMoMo</title>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={44} className="text-green-500"/>
          </div>
          <h2 className="font-display font-black text-3xl text-ink mb-1">Order Placed! 🎉</h2>
          <p className="text-muted text-sm">
            {o.scheduledFor
              ? <>Scheduled for <strong className="text-ink">{new Date(o.scheduledFor).toLocaleString()}</strong></>
              : <>Estimated: <strong className="text-ink">{restaurant?.deliveryTime || '25–35'} min</strong></>}
          </p>
        </div>

        {o.deliveryCode && (
          <div className="card p-5 mb-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink"><KeyRound size={22}/></div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('deliveryCode')}</p>
              <p className="text-xs text-muted">{t('deliveryCodeHint')}</p>
            </div>
            <span className="font-display font-black text-3xl tracking-[0.2em] text-ink">{o.deliveryCode}</span>
          </div>
        )}

        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-faint">
            <h3 className="font-display font-bold text-ink text-lg">Final Bill</h3>
            <span className="text-xs text-muted bg-gray-100 px-3 py-1 rounded-full font-semibold">Cash on Delivery</span>
          </div>
          <div className="space-y-3 mb-4">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink">{it.quantity} × {it.name}</span>
                <span className="font-bold text-pink">NPR {(it.price * it.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-pink-50 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2">
            <MapPin size={14} className="text-pink-500 mt-0.5 shrink-0"/>
            <p className="text-sm text-ink">{o.shippingAddress}</p>
          </div>
          <Totals q={o} t={t} />
        </div>

        <div className="flex gap-3">
          <Link to={`/orders/${o._id}`} className="btn-pink flex-1 justify-center gap-2 py-3.5">{t('trackOrder')} <ChevronRight size={15}/></Link>
          <Link to="/restaurants" className="btn-outline flex-1 justify-center py-3.5">Order More</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap">
      <title>Cart · MetMoMo</title>
      <h1 className="font-display font-black text-3xl text-ink mb-2">My Cart</h1>
      <p className="text-muted mb-8">
        {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}{restaurant?.name ? ` from ${restaurant.name}` : ''}
      </p>

      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, l: t('cart') }, { n: 2, l: t('checkout') }].map((s, i) => (
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
              {lines.map(({ product: p, quantity }) => (
                <div key={p._id} className="card p-4 flex items-center gap-4">
                  <Link to={`/product/${p._id}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 shrink-0">
                    {p.productImage ? <img src={p.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-ink truncate">{p.productName}</h3>
                    <p className="text-muted text-sm">NPR {p.productPrice?.toLocaleString()} each</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button aria-label="Decrease" disabled={busyItem === p._id} onClick={() => changeQty(p._id, quantity - 1)}
                        className="w-8 h-8 rounded-full border border-faint flex items-center justify-center hover:border-pink disabled:opacity-50"><Minus size={14}/></button>
                      <span className="w-6 text-center font-bold text-ink">{quantity}</span>
                      <button aria-label="Increase" disabled={busyItem === p._id || quantity >= 20} onClick={() => changeQty(p._id, quantity + 1)}
                        className="w-8 h-8 rounded-full border border-faint flex items-center justify-center hover:border-pink disabled:opacity-50"><Plus size={14}/></button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-pink text-lg">NPR {(p.productPrice * quantity).toLocaleString()}</p>
                    <button onClick={() => changeQty(p._id, 0)} disabled={busyItem === p._id}
                      className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs mt-1 ml-auto transition-colors">
                      <Trash2 size={11}/> Remove
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
              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-xl text-ink">Delivery Address</h3>

                {addresses.map(a => (
                  <button type="button" key={a._id} onClick={() => setSelectedAddr(a._id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedAddr === a._id ? 'border-pink-500 bg-pink-50' : 'border-faint hover:border-pink-300'}`}>
                    <MapPin size={18} className={`mt-0.5 shrink-0 ${selectedAddr === a._id ? 'text-pink-600' : 'text-muted'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${selectedAddr === a._id ? 'text-pink-600' : 'text-muted'}`}>
                        {a.label}{a.isDefault ? ' · Default' : ''}
                      </p>
                      <p className="text-sm text-ink font-semibold">{addressText(a)}</p>
                    </div>
                  </button>
                ))}

                {selectedAddr !== 'new' ? (
                  <button type="button" onClick={() => setSelectedAddr('new')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-600 font-bold text-sm transition-all">
                    <Plus size={18}/> Add New Address
                  </button>
                ) : (
                  <div className="border-2 border-pink-500 bg-pink-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">New Address</p>
                      {addresses.length > 0 && (
                        <button type="button" onClick={() => setSelectedAddr(addresses[0]._id)} className="text-xs text-muted hover:text-ink">✕ Cancel</button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map(l => (
                        <button type="button" key={l} onClick={() => setNewAddr(a => ({ ...a, label: l }))}
                          className={newAddr.label === l ? 'chip-active' : 'chip-idle'}>{l}</button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Street / Area *</label>
                      <input className="input-field rounded-xl" placeholder="e.g. Thamel, New Road"
                        value={newAddr.street} onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">Landmark</label>
                        <input className="input-field rounded-xl" placeholder="Near school, hospital…"
                          value={newAddr.landmark} onChange={e => setNewAddr(a => ({ ...a, landmark: e.target.value }))}/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">City *</label>
                        <input className="input-field rounded-xl" placeholder="Kathmandu"
                          value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} required/>
                      </div>
                    </div>
                    <button type="button" onClick={useMyLocation}
                      className="flex items-center gap-2 text-xs font-bold text-pink-600 hover:underline">
                      <Crosshair size={14}/> {coords ? `Pinned (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : 'Pin my current location for the rider'}
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={saveNew} onChange={e => setSaveNew(e.target.checked)} className="w-4 h-4 accent-pink-600 rounded"/>
                      <span className="text-xs text-muted font-semibold">Save this address for future orders</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-xl text-ink">When?</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setScheduleOn(false)} className={!scheduleOn ? 'chip-active' : 'chip-idle'}>Deliver now</button>
                  <button type="button" onClick={() => { setScheduleOn(true); setScheduledFor(s => s || minSchedule()) }}
                    className={scheduleOn ? 'chip-active' : 'chip-idle'}><Clock size={13} className="mr-1"/> Schedule</button>
                </div>
                {scheduleOn && (
                  <input type="datetime-local" className="input-field rounded-xl" min={minSchedule()}
                    value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} required/>
                )}
                {quote && !quote.restaurantOpen && !scheduleOn && (
                  <p className="text-xs text-red-500">This restaurant isn't taking orders right now — schedule for later instead.</p>
                )}
              </div>

              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-xl text-ink">Payment</h3>
                {PAY_METHODS.map(pm => (
                  <label key={pm.val} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${payMethod === pm.val ? 'border-pink bg-pink-50' : 'border-faint hover:border-pink/40'}`}>
                    <input type="radio" name="pm" value={pm.val} checked={payMethod === pm.val} onChange={() => setPayMethod(pm.val)} className="sr-only" />
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="font-display font-bold text-ink text-sm flex-1">{pm.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === pm.val ? 'border-pink' : 'border-faint'}`}>
                      {payMethod === pm.val && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
                    </div>
                  </label>
                ))}
              </div>

              {quoteError && <p className="text-sm text-red-500">{quoteError}</p>}
              <button type="submit" disabled={placing || quoting || !!quoteError} className="btn-pink w-full justify-center py-4 text-base gap-2 rounded-2xl">
                {placing ? <><span className="spinner"/> Placing...</> : <><ShoppingBag size={18}/> {t('placeOrder')} · NPR {(quote?.totalAmount ?? localSubtotal).toLocaleString()}</>}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-outline w-full justify-center py-3 text-sm rounded-2xl">← Back to Cart</button>
            </form>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="font-display font-bold text-xl text-ink">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {lines.map(({ product: p, quantity }) => (
                <div key={p._id} className="flex justify-between">
                  <span className="text-muted truncate mr-2">{quantity} × {p.productName}</span>
                  <span className="font-semibold shrink-0">NPR {(p.productPrice * quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {!promoCode ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="input-field pl-8 py-2.5 text-sm rounded-full" placeholder="Promo code" aria-label="Promo code"
                    value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }} />
                </div>
                <button onClick={() => applyPromo()} className="btn-outline text-sm px-4 py-2.5 rounded-full shrink-0">Apply</button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-3 py-2.5">
                <span className="text-green-700 text-sm font-display font-bold">🎉 {promoCode}{quote?.discount ? ` – NPR ${quote.discount} off` : ''}</span>
                <button onClick={() => { setPromoCode(''); setPromoInput('') }} className="text-green-600 text-xs font-semibold hover:text-green-800">Remove</button>
              </div>
            )}
            {!promoCode && coupons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {coupons.slice(0, 4).map(c => (
                  <button key={c._id} onClick={() => { setPromoInput(c.code); applyPromo(c.code) }} title={c.description}
                    className="text-xs font-bold px-3 py-1 rounded-full border border-dashed border-pink-300 text-pink-600 hover:bg-pink-50">
                    {c.code}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-faint pt-3">
              {quote ? <Totals q={quote} t={t} loading={quoting} /> : (
                <div className="flex justify-between text-sm"><span className="text-muted">{t('subtotal')}</span><span>NPR {localSubtotal.toLocaleString()}</span></div>
              )}
              {quote?.distanceKm != null && (
                <p className="mt-2 text-xs text-muted flex items-center gap-1"><Truck size={11}/> About {quote.distanceKm} km away</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Totals({ q, t, loading }) {
  return (
    <div className={`space-y-2 text-sm ${loading ? 'opacity-60' : ''}`}>
      <div className="flex justify-between"><span className="text-muted">{t('subtotal')}</span><span>NPR {q.subtotal?.toLocaleString()}</span></div>
      <div className="flex justify-between">
        <span className="text-muted flex items-center gap-1"><Truck size={11}/> {t('delivery')}</span>
        <span className={q.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>{q.deliveryFee === 0 ? 'FREE' : `NPR ${q.deliveryFee}`}</span>
      </div>
      {q.discount > 0 && (
        <div className="flex justify-between text-green-600"><span>{t('discount')}{q.promoCode ? ` (${q.promoCode})` : ''}</span><span>– NPR {q.discount.toLocaleString()}</span></div>
      )}
      <div className="flex justify-between border-t border-faint pt-2 font-display font-extrabold">
        <span>{t('total')}</span><span className="text-pink text-xl">NPR {q.totalAmount?.toLocaleString()}</span>
      </div>
    </div>
  )
}
