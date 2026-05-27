import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, Save, ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const CATS = [
  'Steamed Momo','Fried Momo','Jhol Momo','C-Momo','Kothey Momo',
  'Drinks','Snacks','Desserts','Thali','Newari Special','Other',
]

const EMPTY = {
  productName: '', productDescription: '', productPrice: '',
  productCategory: '', productStatus: 'available', productQuantity: '',
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">
        {label}{required && <span className="text-pink ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-muted text-xs mt-1">{hint}</p>}
    </div>
  )
}

export default function OwnerItemForm() {
  const { id }    = useParams()           // present on edit, absent on add
  const isEdit    = Boolean(id)
  const navigate  = useNavigate()

  const [form, setForm]       = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Load existing product if editing
  useEffect(() => {
    if (!isEdit) return
    api.get(`/owner/products`).then(({ ok, data }) => {
      if (ok) {
        const p = (data.data || []).find(x => x._id === id)
        if (p) {
          setForm({
            productName:        p.productName,
            productDescription: p.productDescription,
            productPrice:       String(p.productPrice),
            productCategory:    p.productCategory,
            productStatus:      p.productStatus,
            productQuantity:    String(p.productQuantity),
          })
          setImagePreview(p.productImage || null)
        } else {
          toast.error('Item not found')
          navigate('/owner/menu')
        }
      }
    }).finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (imageFile) fd.append('productImage', imageFile)

    const { ok, data } = isEdit
      ? await api.patchForm(`/owner/products/${id}`, fd)
      : await api.postForm('/owner/products', fd)

    if (ok) {
      toast.success(isEdit ? 'Item updated!' : 'Item added to menu!')
      navigate('/owner/menu')
    } else {
      toast.error(data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="page-wrap max-w-xl space-y-4">
      {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-14 rounded-2xl"/>)}
    </div>
  )

  return (
    <div className="page-wrap max-w-xl">

      {/* Back */}
      <button onClick={() => navigate('/owner/menu')}
        className="flex items-center gap-2 text-muted hover:text-pink text-sm font-semibold mb-6 transition-colors">
        <ArrowLeft size={15}/> Back to Menu
      </button>

      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink">
          {isEdit ? 'Edit Food Item' : 'Add Food Item'}
        </h1>
        <p className="text-muted mt-1">
          {isEdit ? 'Update the details for this dish.' : 'Fill in the details to add a new dish to your menu.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image upload */}
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
          {/* Preview */}
          <div className="relative h-48 bg-gradient-to-br from-pink-100 to-rose-200 overflow-hidden">
            {imagePreview
              ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">🍜</div>}
          </div>
          <div className="p-4">
            <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-3.5 cursor-pointer hover:border-pink transition-colors">
              <Upload size={18} className="text-pink shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {imageFile ? imageFile.name : isEdit ? 'Click to replace photo' : 'Upload a photo of the dish'}
                </p>
                <p className="text-xs text-muted">JPG, PNG or WebP · square image works best</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
            </label>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-3xl border border-faint shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink border-b border-faint pb-3">Item Details</h2>

          <Field label="Item Name" required>
            <input className="input-field" placeholder="e.g. Buff Steamed Momo"
              required value={form.productName} onChange={set('productName')}/>
          </Field>

          <Field label="Description" required hint="Describe the ingredients, taste, or what makes it special.">
            <textarea className="input-field resize-none" rows={4}
              placeholder="e.g. Juicy buff momo filled with fresh herbs and spices, served with tomato achar..."
              required value={form.productDescription} onChange={set('productDescription')}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (NPR)" required>
              <input className="input-field" type="number" min="1" placeholder="200"
                required value={form.productPrice} onChange={set('productPrice')}/>
            </Field>
            <Field label="Quantity in stock" required hint="Set to 0 if temporarily out.">
              <input className="input-field" type="number" min="0" placeholder="50"
                required value={form.productQuantity} onChange={set('productQuantity')}/>
            </Field>
          </div>
        </div>

        {/* Category & availability */}
        <div className="bg-white rounded-3xl border border-faint shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink border-b border-faint pb-3">Category & Availability</h2>

          <Field label="Category" required>
            <select className="input-field" required value={form.productCategory} onChange={set('productCategory')}>
              <option value="">Select a category</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Availability" hint="You can toggle this anytime from the Menu page.">
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { value: 'available',   label: '✅ Available',   desc: 'Customers can order this' },
                { value: 'unavailable', label: '⏸️ Unavailable', desc: 'Hidden from ordering' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, productStatus: opt.value }))}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${
                    form.productStatus === opt.value
                      ? 'border-pink bg-pink-50'
                      : 'border-faint bg-white hover:border-pink-200'
                  }`}>
                  <span className={`text-sm font-bold ${form.productStatus === opt.value ? 'text-pink' : 'text-ink'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate('/owner/menu')} className="btn-outline px-6">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-pink gap-2 px-8">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
              : <><Save size={15}/> {isEdit ? 'Save Changes' : 'Add to Menu'}</>}
          </button>
        </div>
      </form>
    </div>
  )
}
