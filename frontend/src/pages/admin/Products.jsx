import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Search, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const CATS = ['Steamed Momo','Fried Momo','Jhol Momo','C-Momo','Kothey Momo','Drinks','Snacks','Desserts','Thali','Newari Special']
const EMPTY = { productName:'', productDescription:'', productPrice:'', productCategory:'', productStatus:'available', productQuantity:'', restaurant:'' }

export default function AdminProducts() {
  const [products, setProducts]       = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [catFilter, setCatFilter]     = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [editId, setEditId]           = useState(null)
  const [imageFile, setImageFile]     = useState(null)
  const [saving, setSaving]           = useState(false)
  const [deletingId, setDeletingId]   = useState(null)
  const [togglingId, setTogglingId]   = useState(null)

  const load = async () => {
    setLoading(true)
    const [p, r] = await Promise.all([api.get(ROUTES.products), api.get(ROUTES.restaurants)])
    if (p.ok) setProducts(p.data.data || [])
    if (r.ok) setRestaurants(r.data.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setImageFile(null); setModal('create') }
  const openEdit   = (p) => {
    setForm({
      productName: p.productName, productDescription: p.productDescription,
      productPrice: p.productPrice, productCategory: p.productCategory,
      productStatus: p.productStatus, productQuantity: p.productQuantity,
      restaurant: p.restaurant?._id || p.restaurant || '',
    })
    setEditId(p._id); setImageFile(null); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setImageFile(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (imageFile) fd.append('productImage', imageFile)
    const { ok, data } = modal === 'create'
      ? await api.postForm(ROUTES.products, fd)
      : await api.patchForm(ROUTES.product(editId), fd)
    if (ok) { toast.success(modal === 'create' ? 'Product created!' : 'Updated!'); closeModal(); load() }
    else toast.error(data?.message || 'Failed')
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    const { ok } = await api.delete(ROUTES.product(id))
    if (ok) { toast.success('Deleted'); setProducts(p => p.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingId(null)
  }

  const handleToggleStatus = async (product) => {
    setTogglingId(product._id)
    const { ok, data } = await api.patch(`/products/${product._id}/status`)
    if (ok) {
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, productStatus: data.data.productStatus } : p))
      toast.success(`${product.productName} is now ${data.data.productStatus}`)
    } else {
      toast.error('Could not update status')
    }
    setTogglingId(null)
  }

  const f = (field) => ({ value: form[field] ?? '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const allCats = ['All', ...new Set(products.map(p => p.productCategory).filter(Boolean))]

  const filtered = products.filter(p => {
    const ms = !search || p.productName?.toLowerCase().includes(search.toLowerCase())
    const mc = catFilter === 'All' || p.productCategory === catFilter
    const mst = statusFilter === 'all' || p.productStatus === statusFilter
    return ms && mc && mst
  })

  const availableCount   = products.filter(p => p.productStatus === 'available').length
  const unavailableCount = products.length - availableCount

  return (
    <div className="page-wrap">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">Menu Items</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted">
            <span>{products.length} total</span>
            <span>·</span>
            <span className="text-green-600 font-semibold">{availableCount} available</span>
            <span>·</span>
            <span className="text-red-400">{unavailableCount} unavailable</span>
          </div>
        </div>
        <button onClick={openCreate} className="btn-pink gap-2"><Plus size={16}/> Add Item</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
          <input className="input-field pl-11 rounded-full" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[['all','All'],['available','Available'],['unavailable','Unavailable']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-4 h-10 rounded-full text-sm font-semibold transition-all ${statusFilter === v ? 'bg-pink text-white shadow-pink-sm' : 'bg-white border border-faint text-slate hover:border-pink hover:text-pink'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {allCats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`chip ${catFilter === c ? 'chip-active' : 'chip-idle'} text-xs`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton aspect-[4/3] rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto mb-4 text-faint" />
          <p className="font-display font-bold text-xl text-ink mb-2">No products found</p>
          <button onClick={openCreate} className="btn-pink mt-2">Add First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => {
            const available = p.productStatus === 'available'
            return (
              <div key={p._id} className="card overflow-hidden group hover:shadow-card-lg transition-all">
                <div className="relative aspect-[4/3] bg-pink-50 overflow-hidden">
                  {p.productImage
                    ? <img src={p.productImage} alt={p.productName}
                        className={`w-full h-full object-cover ${!available ? 'grayscale opacity-60' : ''}`} />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(p)} title="Edit"
                      className="w-9 h-9 rounded-xl bg-white text-ink flex items-center justify-center hover:text-pink transition-colors shadow-card">
                      <Pencil size={14}/>
                    </button>
                    <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id} title="Delete"
                      className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-card">
                      {deletingId === p._id
                        ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Trash2 size={14}/>}
                    </button>
                  </div>

                  {p.restaurant?.name && (
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 text-[9px] font-display font-bold text-pink truncate max-w-[90%]">
                      {p.restaurant.emoji} {p.restaurant.name}
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-display font-bold text-ink text-sm truncate">{p.productName}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted text-xs">{p.productCategory}</span>
                    <span className="text-pink font-display font-bold text-sm">NPR {p.productPrice?.toLocaleString()}</span>
                  </div>

                  {/* Availability toggle */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-faint">
                    <span className={`text-[11px] font-bold ${available ? 'text-green-600' : 'text-gray-400'}`}>
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={togglingId === p._id}
                      title="Toggle availability"
                      className="transition-opacity disabled:opacity-40"
                    >
                      {togglingId === p._id
                        ? <span className="w-4 h-4 border-2 border-pink/30 border-t-pink rounded-full animate-spin inline-block"/>
                        : available
                          ? <ToggleRight size={24} className="text-green-500"/>
                          : <ToggleLeft  size={24} className="text-gray-400"/>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-4xl shadow-float w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-faint sticky top-0 bg-white rounded-t-4xl z-10">
              <h2 className="font-display font-black text-xl text-ink">{modal === 'create' ? '+ Add Menu Item' : 'Edit Item'}</h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink hover:bg-pink-100 transition-colors"><X size={18}/></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-display font-bold text-ink block mb-2">Product Name *</label>
                <input className="input-field" placeholder="e.g. Buff Momo" required {...f('productName')} />
              </div>
              <div>
                <label className="text-xs font-display font-bold text-ink block mb-2">Description *</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Describe this item..." required {...f('productDescription')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-ink block mb-2">Price (NPR) *</label>
                  <input className="input-field" type="number" min="1" placeholder="200" required {...f('productPrice')} />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-ink block mb-2">Quantity *</label>
                  <input className="input-field" type="number" min="0" placeholder="50" required {...f('productQuantity')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-ink block mb-2">Category *</label>
                  <select className="input-field" required {...f('productCategory')}>
                    <option value="">Select category</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-ink block mb-2">Status</label>
                  <select className="input-field" {...f('productStatus')}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-display font-bold text-ink block mb-2">Assign to Restaurant</label>
                <select className="input-field" {...f('restaurant')}>
                  <option value="">No restaurant (global item)</option>
                  {restaurants.map(r => (
                    <option key={r._id} value={r._id}>{r.emoji} {r.name}</option>
                  ))}
                </select>
                <p className="text-muted text-xs mt-1">This item will appear in the restaurant's menu page.</p>
              </div>

              <div>
                <label className="text-xs font-display font-bold text-ink block mb-2">Product Image</label>
                <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-pink hover:bg-pink-100 transition-colors">
                  <Upload size={18} className="text-pink shrink-0"/>
                  <span className="text-sm text-slate truncate">{imageFile ? imageFile.name : 'Click to upload image (JPG, PNG, WebP)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-pink flex-1 justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {saving ? 'Saving...' : modal === 'create' ? '+ Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
