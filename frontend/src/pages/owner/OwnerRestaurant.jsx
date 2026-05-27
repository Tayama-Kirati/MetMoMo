import { useEffect, useState } from 'react'
import { Upload, Save } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', description: '', address: '', phone: '', email: '',
  cuisine: '', deliveryTime: '25-35', deliveryFee: '0',
  minimumOrder: '100', isOpen: 'true', emoji: '🍜',
  openingHours: '9:00 AM – 10:00 PM',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">
        {label}{required && <span className="text-pink ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function OwnerRestaurant() {
  const [restaurant, setRestaurant] = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [coverFile, setCoverFile]   = useState(null)
  const [preview, setPreview]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/owner/restaurant').then(({ ok, data }) => {
      if (ok && data.data) {
        const d = data.data
        setRestaurant(d)
        setForm({
          name:         d.name,
          description:  d.description,
          address:      d.address,
          phone:        d.phone        || '',
          email:        d.email        || '',
          cuisine:      (d.cuisine || []).join(', '),
          deliveryTime: d.deliveryTime,
          deliveryFee:  String(d.deliveryFee),
          minimumOrder: String(d.minimumOrder),
          isOpen:       String(d.isOpen),
          emoji:        d.emoji,
          openingHours: d.openingHours,
        })
        setPreview(d.coverImage || null)
      }
    }).finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (coverFile) fd.append('coverImage', coverFile)

    const { ok, data } = restaurant
      ? await api.patchForm('/owner/restaurant', fd)
      : await api.postForm('/owner/restaurant', fd)

    if (ok) {
      toast.success(restaurant ? 'Restaurant updated!' : 'Restaurant created!')
      setRestaurant(data.data)
      setPreview(data.data.coverImage || null)
      setCoverFile(null)
    } else {
      toast.error(data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="page-wrap space-y-4">
      {[...Array(5)].map((_,i) => <div key={i} className="skeleton h-14 rounded-2xl"/>)}
    </div>
  )

  return (
    <div className="page-wrap max-w-2xl">

      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink">
          {restaurant ? 'Restaurant Settings' : 'Set Up Your Restaurant'}
        </h1>
        <p className="text-muted mt-1">
          {restaurant
            ? 'Update your restaurant information. Changes will be visible to customers immediately.'
            : 'Fill in your restaurant details to get listed on MetMomo.'}
        </p>
      </div>

      {!restaurant && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6 text-sm text-pink-700 font-medium">
          🎉 You're almost there! Add your restaurant info to start receiving orders.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Cover image */}
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-pink-100 to-rose-200 overflow-hidden">
            {preview
              ? <img src={preview} alt="Cover" className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">🏪</div>}
          </div>
          <div className="p-4">
            <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-3.5 cursor-pointer hover:border-pink transition-colors group">
              <Upload size={18} className="text-pink shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {coverFile ? coverFile.name : 'Upload cover photo'}
                </p>
                <p className="text-xs text-muted">JPG, PNG or WebP · recommended 1200×400</p>
              </div>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files[0]
                  if (!f) return
                  setCoverFile(f)
                  setPreview(URL.createObjectURL(f))
                }}/>
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-3xl border border-faint shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink border-b border-faint pb-3">Basic Information</h2>

          <Field label="Restaurant Name" required>
            <input className="input-field" placeholder="e.g. Momo Corner" required value={form.name} onChange={set('name')}/>
          </Field>

          <Field label="Description" required>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Tell customers what makes your restaurant special..."
              required value={form.description} onChange={set('description')}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Emoji">
              <input className="input-field" placeholder="🍜" value={form.emoji} onChange={set('emoji')}/>
            </Field>
            <Field label="Status">
              <select className="input-field" value={form.isOpen} onChange={set('isOpen')}>
                <option value="true">🟢 Open</option>
                <option value="false">🔴 Closed</option>
              </select>
            </Field>
          </div>

          <Field label="Cuisine Types">
            <input className="input-field" placeholder="Nepali, Momo, Street Food (comma separated)"
              value={form.cuisine} onChange={set('cuisine')}/>
          </Field>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-3xl border border-faint shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink border-b border-faint pb-3">Contact & Location</h2>

          <Field label="Full Address" required>
            <input className="input-field" placeholder="e.g. Thamel Marg, Kathmandu" required
              value={form.address} onChange={set('address')}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone Number">
              <input className="input-field" placeholder="01-XXXXXXX" value={form.phone} onChange={set('phone')}/>
            </Field>
            <Field label="Email">
              <input className="input-field" type="email" placeholder="info@restaurant.com"
                value={form.email} onChange={set('email')}/>
            </Field>
          </div>
        </div>

        {/* Delivery details */}
        <div className="bg-white rounded-3xl border border-faint shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink border-b border-faint pb-3">Delivery Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Delivery Time (min)">
              <input className="input-field" placeholder="25-35" value={form.deliveryTime} onChange={set('deliveryTime')}/>
            </Field>
            <Field label="Delivery Fee (NPR)">
              <input className="input-field" type="number" min="0" placeholder="0"
                value={form.deliveryFee} onChange={set('deliveryFee')}/>
            </Field>
            <Field label="Min. Order (NPR)">
              <input className="input-field" type="number" min="0" placeholder="100"
                value={form.minimumOrder} onChange={set('minimumOrder')}/>
            </Field>
          </div>

          <Field label="Opening Hours">
            <input className="input-field" placeholder="9:00 AM – 10:00 PM"
              value={form.openingHours} onChange={set('openingHours')}/>
          </Field>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-pink gap-2 px-8">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
              : <><Save size={16}/> {restaurant ? 'Save Changes' : 'Create Restaurant'}</>}
          </button>
        </div>
      </form>
    </div>
  )
}
