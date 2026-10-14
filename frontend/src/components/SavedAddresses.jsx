import { useEffect, useState } from 'react'
import { MapPin, Trash2, Star, Plus, Crosshair } from 'lucide-react'
import { api, ROUTES } from '../services/api'
import toast from 'react-hot-toast'

const EMPTY = { label: 'Home', street: '', landmark: '', city: 'Kathmandu' }

// Manage the addresses offered at checkout
export default function SavedAddresses() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [coords, setCoords] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => { api.get(ROUTES.addresses).then(({ ok, data }) => { if (ok) setList(data.data || []) }) }, [])

  const run = async (promise, msg) => {
    const { ok, data } = await promise
    if (ok) { setList(data.data); if (msg) toast.success(msg) } else toast.error(data?.message || 'Something went wrong')
    return ok
  }

  const add = async (e) => {
    e.preventDefault()
    if (await run(api.post(ROUTES.addresses, { ...form, ...(coords || {}) }), 'Address saved')) {
      setForm(EMPTY); setCoords(null); setAdding(false)
    }
  }

  const locate = () => navigator.geolocation?.getCurrentPosition(
    p => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); toast.success('Location pinned') },
    () => toast.error('Could not get your location'))

  return (
    <div className="card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-ink">Saved delivery addresses</h3>
        {!adding && <button type="button" onClick={() => setAdding(true)} className="btn-soft text-xs py-1.5"><Plus size={13}/> Add</button>}
      </div>
      {list.length === 0 && !adding && <p className="text-sm text-muted">No saved addresses yet. They'll appear at checkout.</p>}
      {list.map(a => (
        <div key={a._id} className="flex items-center gap-3 p-3 rounded-2xl border border-faint">
          <MapPin size={16} className="text-pink shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted uppercase">{a.label}{a.isDefault ? ' · Default' : ''}</p>
            <p className="text-sm text-ink truncate">{[a.street, a.landmark, a.city].filter(Boolean).join(', ')}</p>
          </div>
          {!a.isDefault && (
            <button type="button" onClick={() => run(api.patch(ROUTES.address(a._id), { isDefault: true }), 'Default updated')}
              title="Make default" aria-label="Make default" className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-yellow-500 hover:bg-yellow-50"><Star size={14}/></button>
          )}
          <button type="button" onClick={() => run(api.delete(ROUTES.address(a._id)), 'Address removed')}
            aria-label="Delete address" className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50"><Trash2 size={14}/></button>
        </div>
      ))}
      {adding && (
        <form onSubmit={add} className="space-y-3 border-t border-faint pt-3">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map(l => (
              <button type="button" key={l} onClick={() => setForm(f => ({ ...f, label: l }))} className={form.label === l ? 'chip-active' : 'chip-idle'}>{l}</button>
            ))}
          </div>
          <input required className="input-field" placeholder="Street / area" aria-label="Street" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))}/>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Landmark" aria-label="Landmark" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))}/>
            <input required className="input-field" placeholder="City" aria-label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}/>
          </div>
          <button type="button" onClick={locate} className="text-xs font-bold text-pink flex items-center gap-1"><Crosshair size={13}/> {coords ? 'Location pinned' : 'Pin my current location'}</button>
          <div className="flex gap-2">
            <button className="btn-pink text-sm py-2">Save address</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-outline text-sm py-2">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
