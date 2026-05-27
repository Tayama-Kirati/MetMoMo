import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, ToggleLeft, ToggleRight, Store, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATS = ['Steamed Momo','Fried Momo','Jhol Momo','C-Momo','Kothey Momo','Drinks','Snacks','Desserts','Thali','Newari Special','Other']

const EMPTY_RESTAURANT = {
  name: '', description: '', address: '', phone: '', email: '',
  cuisine: '', deliveryTime: '25-35', deliveryFee: '0',
  minimumOrder: '100', isOpen: 'true', emoji: '🍜', openingHours: '9:00 AM – 10:00 PM',
}
const EMPTY_PRODUCT = {
  productName: '', productDescription: '', productPrice: '',
  productCategory: '', productStatus: 'available', productQuantity: '',
}

/* ─── small helpers ─────────────────────────────────── */
function Label({ children }) {
  return <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{children}</p>
}
function Input({ ...props }) {
  return <input className="input-field rounded-2xl" {...props} />
}
function Textarea({ ...props }) {
  return <textarea className="input-field resize-none rounded-2xl" rows={3} {...props} />
}
function Select({ children, ...props }) {
  return <select className="input-field rounded-2xl" {...props}>{children}</select>
}

/* ─── Section toggle ────────────────────────────────── */
function Section({ title, icon, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-pink-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-display font-bold text-ink text-lg">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-muted"/> : <ChevronDown size={18} className="text-muted"/>}
      </button>
      {open && <div className="px-6 pb-6 border-t border-faint pt-4">{children}</div>}
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────── */
export default function OwnerPortal() {
  const { user } = useAuth()

  const [restaurant, setRestaurant]     = useState(null)
  const [products, setProducts]         = useState([])
  const [loadingPage, setLoadingPage]   = useState(true)

  // restaurant form
  const [rForm, setRForm]               = useState(EMPTY_RESTAURANT)
  const [rCoverFile, setRCoverFile]     = useState(null)
  const [rCoverPreview, setRCoverPreview] = useState(null)
  const [rSaving, setRSaving]           = useState(false)
  const [rOpen, setROpen]               = useState(true)

  // product modal
  const [pModal, setPModal]             = useState(null)   // 'create' | 'edit'
  const [pForm, setPForm]               = useState(EMPTY_PRODUCT)
  const [pEditId, setPEditId]           = useState(null)
  const [pImageFile, setPImageFile]     = useState(null)
  const [pSaving, setPSaving]           = useState(false)
  const [deletingId, setDeletingId]     = useState(null)
  const [togglingId, setTogglingId]     = useState(null)
  const [pOpen, setPOpen]               = useState(true)

  /* load data */
  const load = async () => {
    setLoadingPage(true)
    const [r, p] = await Promise.all([
      api.get('/owner/restaurant'),
      api.get('/owner/products'),
    ])
    if (r.ok && r.data.data) {
      const d = r.data.data
      setRestaurant(d)
      setRForm({
        name: d.name, description: d.description, address: d.address,
        phone: d.phone || '', email: d.email || '',
        cuisine: (d.cuisine || []).join(', '),
        deliveryTime: d.deliveryTime, deliveryFee: String(d.deliveryFee),
        minimumOrder: String(d.minimumOrder), isOpen: String(d.isOpen),
        emoji: d.emoji, openingHours: d.openingHours,
      })
      setRCoverPreview(d.coverImage || null)
    }
    if (p.ok) setProducts(p.data.data || [])
    setLoadingPage(false)
  }

  useEffect(() => { load() }, [])

  /* restaurant save */
  const handleRestaurantSave = async (e) => {
    e.preventDefault(); setRSaving(true)
    const fd = new FormData()
    Object.entries(rForm).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (rCoverFile) fd.append('coverImage', rCoverFile)

    const { ok, data } = restaurant
      ? await api.patchForm('/owner/restaurant', fd)
      : await api.postForm('/owner/restaurant', fd)

    if (ok) {
      toast.success(restaurant ? 'Restaurant updated!' : 'Restaurant created!')
      setRestaurant(data.data)
      setRCoverPreview(data.data.coverImage || null)
      setRCoverFile(null)
    } else {
      toast.error(data?.message || 'Failed to save')
    }
    setRSaving(false)
  }

  const rf = (field) => ({ value: rForm[field] ?? '', onChange: e => setRForm(p => ({ ...p, [field]: e.target.value })) })

  /* product helpers */
  const openCreateProduct = () => { setPForm(EMPTY_PRODUCT); setPEditId(null); setPImageFile(null); setPModal('create') }
  const openEditProduct   = (p) => {
    setPForm({
      productName: p.productName, productDescription: p.productDescription,
      productPrice: p.productPrice, productCategory: p.productCategory,
      productStatus: p.productStatus, productQuantity: p.productQuantity,
    })
    setPEditId(p._id); setPImageFile(null); setPModal('edit')
  }
  const closeProductModal = () => { setPModal(null); setPEditId(null); setPImageFile(null) }

  const handleProductSave = async (e) => {
    e.preventDefault(); setPSaving(true)
    const fd = new FormData()
    Object.entries(pForm).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (pImageFile) fd.append('productImage', pImageFile)

    const { ok, data } = pModal === 'create'
      ? await api.postForm('/owner/products', fd)
      : await api.patchForm(`/owner/products/${pEditId}`, fd)

    if (ok) {
      toast.success(pModal === 'create' ? 'Item added!' : 'Item updated!')
      closeProductModal()
      const p = await api.get('/owner/products')
      if (p.ok) setProducts(p.data.data || [])
    } else {
      toast.error(data?.message || 'Failed to save')
    }
    setPSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    setDeletingId(id)
    const { ok } = await api.delete(`/owner/products/${id}`)
    if (ok) { toast.success('Deleted'); setProducts(prev => prev.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingId(null)
  }

  const handleToggle = async (product) => {
    setTogglingId(product._id)
    const { ok, data } = await api.patch(`/owner/products/${product._id}/status`)
    if (ok) {
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, productStatus: data.data.productStatus } : p))
      toast.success(`${product.productName} is now ${data.data.productStatus}`)
    } else {
      toast.error('Could not update status')
    }
    setTogglingId(null)
  }

  const pf = (field) => ({ value: pForm[field] ?? '', onChange: e => setPForm(p => ({ ...p, [field]: e.target.value })) })

  const availableCount   = products.filter(p => p.productStatus === 'available').length
  const unavailableCount = products.length - availableCount

  if (loadingPage) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="w-10 h-10 border-4 border-pink/20 border-t-pink rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="page-wrap max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">
            {restaurant ? `${restaurant.emoji || '🏪'} ${restaurant.name}` : 'Owner Portal'}
          </h1>
          <p className="text-muted text-sm mt-1">
            Welcome back, <span className="font-semibold text-ink">{user?.userName}</span>
            {restaurant && <span> · {products.length} menu items</span>}
          </p>
        </div>
        {restaurant && (
          <div className={`px-4 py-2 rounded-full text-sm font-bold border ${restaurant.isOpen ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            {restaurant.isOpen ? '● Open' : '● Closed'}
          </div>
        )}
      </div>

      {/* ── Restaurant Section ── */}
      <Section
        title={restaurant ? 'Restaurant Info' : 'Set Up Your Restaurant'}
        icon={<Store size={18}/>}
        open={rOpen}
        onToggle={() => setROpen(v => !v)}
      >
        {!restaurant && (
          <div className="mb-5 p-4 bg-pink-50 border border-pink-100 rounded-2xl text-sm text-pink-700">
            You don't have a restaurant yet. Fill in the details below to get listed on MetMomo.
          </div>
        )}

        <form onSubmit={handleRestaurantSave} className="space-y-4">

          {/* Cover preview */}
          {rCoverPreview && (
            <div className="w-full h-36 rounded-2xl overflow-hidden bg-gray-100">
              <img src={rCoverPreview} alt="Cover" className="w-full h-full object-cover"/>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Restaurant Name *</Label>
              <Input placeholder="e.g. Momo Corner" required {...rf('name')}/>
            </div>
            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <Textarea placeholder="Tell customers about your restaurant..." required {...rf('description')}/>
            </div>
            <div className="sm:col-span-2">
              <Label>Address *</Label>
              <Input placeholder="e.g. Thamel Marg, Kathmandu" required {...rf('address')}/>
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="01-XXXXXXX" {...rf('phone')}/>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="info@restaurant.com" {...rf('email')}/>
            </div>
            <div className="sm:col-span-2">
              <Label>Cuisine (comma separated)</Label>
              <Input placeholder="Nepali, Momo, Street Food" {...rf('cuisine')}/>
            </div>
            <div>
              <Label>Delivery Time (min)</Label>
              <Input placeholder="25-35" {...rf('deliveryTime')}/>
            </div>
            <div>
              <Label>Delivery Fee (NPR)</Label>
              <Input type="number" min="0" placeholder="0" {...rf('deliveryFee')}/>
            </div>
            <div>
              <Label>Min. Order (NPR)</Label>
              <Input type="number" min="0" placeholder="100" {...rf('minimumOrder')}/>
            </div>
            <div>
              <Label>Opening Hours</Label>
              <Input placeholder="9:00 AM – 10:00 PM" {...rf('openingHours')}/>
            </div>
            <div>
              <Label>Emoji</Label>
              <Input placeholder="🍜" {...rf('emoji')}/>
            </div>
            <div>
              <Label>Status</Label>
              <Select {...rf('isOpen')}>
                <option value="true">🟢 Open</option>
                <option value="false">🔴 Closed</option>
              </Select>
            </div>
          </div>

          {/* Cover image upload */}
          <div>
            <Label>Cover Image</Label>
            <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-3 cursor-pointer hover:border-pink transition-colors">
              <Upload size={16} className="text-pink shrink-0"/>
              <span className="text-sm text-muted truncate">
                {rCoverFile ? rCoverFile.name : 'Click to upload cover image'}
              </span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files[0]
                  if (!f) return
                  setRCoverFile(f)
                  setRCoverPreview(URL.createObjectURL(f))
                }}/>
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={rSaving} className="btn-pink gap-2">
              {rSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {rSaving ? 'Saving...' : restaurant ? 'Save Changes' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Products Section ── */}
      {restaurant && (
        <Section
          title="Menu Items"
          icon={<Package size={18}/>}
          open={pOpen}
          onToggle={() => setPOpen(v => !v)}
        >
          {/* Stats + Add button */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="text-green-600 font-semibold">{availableCount} available</span>
              <span>·</span>
              <span className="text-red-400">{unavailableCount} unavailable</span>
            </div>
            <button onClick={openCreateProduct} className="btn-pink gap-2 text-sm">
              <Plus size={14}/> Add Item
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">🍜</p>
              <p className="font-display font-bold text-ink mb-1">No items yet</p>
              <p className="text-muted text-sm mb-4">Add your first menu item to start taking orders</p>
              <button onClick={openCreateProduct} className="btn-pink">Add First Item</button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map(p => {
                const available = p.productStatus === 'available'
                return (
                  <div key={p._id}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-faint hover:border-pink-100 hover:bg-pink-50/30 transition-all group">

                    {/* Image */}
                    <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100">
                      {p.productImage
                        ? <img src={p.productImage} alt={p.productName} className={`w-full h-full object-cover ${!available ? 'grayscale opacity-60' : ''}`}/>
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-ink text-sm truncate">{p.productName}</p>
                      <p className="text-muted text-xs">{p.productCategory} · NPR {p.productPrice?.toLocaleString()}</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-semibold hidden sm:inline ${available ? 'text-green-600' : 'text-gray-400'}`}>
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                      <button onClick={() => handleToggle(p)} disabled={togglingId === p._id} className="disabled:opacity-40 transition-opacity">
                        {togglingId === p._id
                          ? <span className="w-5 h-5 border-2 border-pink/30 border-t-pink rounded-full animate-spin inline-block"/>
                          : available
                            ? <ToggleRight size={26} className="text-green-500"/>
                            : <ToggleLeft  size={26} className="text-gray-400"/>}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditProduct(p)}
                        className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-40">
                        {deletingId === p._id
                          ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/>
                          : <Trash2 size={13}/>}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      )}

      {/* ── Product Modal ── */}
      {pModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeProductModal}>
          <div className="bg-white rounded-4xl shadow-float w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-faint sticky top-0 bg-white rounded-t-4xl z-10">
              <h2 className="font-display font-black text-xl text-ink">
                {pModal === 'create' ? '+ Add Menu Item' : 'Edit Item'}
              </h2>
              <button onClick={closeProductModal} className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink hover:bg-pink-100 transition-colors">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleProductSave} className="p-6 space-y-4">
              <div>
                <Label>Item Name *</Label>
                <Input placeholder="e.g. Buff Momo" required {...pf('productName')}/>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea placeholder="Describe this dish..." required {...pf('productDescription')}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (NPR) *</Label>
                  <Input type="number" min="1" placeholder="200" required {...pf('productPrice')}/>
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" min="0" placeholder="50" required {...pf('productQuantity')}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select required {...pf('productCategory')}>
                    <option value="">Select category</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Availability</Label>
                  <Select {...pf('productStatus')}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Item Image</Label>
                <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-pink transition-colors">
                  <Upload size={16} className="text-pink shrink-0"/>
                  <span className="text-sm text-muted truncate">
                    {pImageFile ? pImageFile.name : 'Click to upload (JPG, PNG)'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setPImageFile(e.target.files[0])}/>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeProductModal} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={pSaving} className="btn-pink flex-1 justify-center gap-2">
                  {pSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {pSaving ? 'Saving...' : pModal === 'create' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
