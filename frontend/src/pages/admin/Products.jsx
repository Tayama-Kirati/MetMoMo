import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Search, Package } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { productName: '', productDescription: '', productPrice: '', productCategory: '', productStatus: 'available', productQuantity: '' }
const CATS   = ['Steamed Momo','Fried Momo','Jhol Momo','C-Momo','Kothey Momo','Drinks','Snacks','Desserts']

export default function AdminProducts() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [editId, setEditId]       = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get(ROUTES.products).then(({ ok, data }) => { if (ok) setProducts(data.data || []) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setImageFile(null); setModal('create') }
  const openEdit   = (p) => {
    setForm({ productName: p.productName, productDescription: p.productDescription, productPrice: p.productPrice, productCategory: p.productCategory, productStatus: p.productStatus, productQuantity: p.productQuantity })
    setEditId(p._id); setImageFile(null); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setImageFile(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) fd.append('productImage', imageFile)
    const { ok, data } = modal === 'create'
      ? await api.postForm('/products/product', fd)
      : await api.patchForm(ROUTES.product(id), fd)
    if (ok) { toast.success(modal === 'create' ? 'Product created! 🍜' : 'Product updated!'); closeModal(); load() }
    else toast.error(data.message || 'Failed to save')
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return
    setDeletingId(id)
    const { ok } = await api.delete(`/products/product/${id}`)
    if (ok) { toast.success('Product deleted'); setProducts(p => p.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingId(null)
  }

  const f = (field) => ({ value: form[field] ?? '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const filtered = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.productCategory?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="wrap py-10">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="section-label">📦 Admin</span>
          <h1 className="section-title">Products</h1>
          <p className="section-sub">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16}/> Add Product</button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light pointer-events-none" />
        <input className="input-field pl-11" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton aspect-[4/3] rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-slate">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-display font-semibold text-lg">No products found</p>
          <button onClick={openCreate} className="btn-primary mt-5">Add First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div key={p._id} className="card overflow-hidden group hover:shadow-card-lg transition-all">
              <div className="relative aspect-[4/3] bg-cream-dark">
                {p.productImage
                  ? <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🍜</div>}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(p)} className="w-9 h-9 rounded-xl bg-white text-charcoal flex items-center justify-center hover:bg-cream transition-colors shadow-card">
                    <Pencil size={14}/>
                  </button>
                  <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                    className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-card">
                    {deletingId === p._id ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={14}/>}
                  </button>
                </div>
                <div className={`absolute top-2 left-2 badge ${p.productStatus === 'available' ? 'badge-green' : 'badge-gray'} text-[10px]`}>
                  {p.productStatus}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-display font-bold text-charcoal text-sm truncate">{p.productName}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate text-xs">{p.productCategory}</span>
                  <span className="text-primary font-display font-bold text-sm">NPR {p.productPrice?.toLocaleString()}</span>
                </div>
                <p className="text-slate text-[10px] mt-0.5">Qty: {p.productQuantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl shadow-card-xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-faint sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-display font-extrabold text-charcoal text-xl">{modal === 'create' ? '+ Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center text-slate hover:text-charcoal transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-display font-bold text-charcoal block mb-2">Product Name *</label>
                <input className="input-field" placeholder="e.g. Buff Momo" required {...f('productName')} />
              </div>
              <div>
                <label className="text-xs font-display font-bold text-charcoal block mb-2">Description *</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Describe the product..." required {...f('productDescription')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Price (NPR) *</label>
                  <input className="input-field" type="number" min="1" placeholder="200" required {...f('productPrice')} />
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Quantity *</label>
                  <input className="input-field" type="number" min="0" placeholder="50" required {...f('productQuantity')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Category *</label>
                  <select className="input-field" required {...f('productCategory')}>
                    <option value="">Select category</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-display font-bold text-charcoal block mb-2">Status *</label>
                  <select className="input-field" {...f('productStatus')}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-display font-bold text-charcoal block mb-2">Product Image</label>
                <label className="flex items-center gap-3 w-full bg-cream border-2 border-dashed border-slate-faint rounded-2xl px-4 py-4 cursor-pointer hover:border-primary transition-colors group">
                  <Upload size={18} className="text-slate group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-sm text-slate truncate">{imageFile ? imageFile.name : 'Click to upload (JPG, PNG, WebP)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
                  {saving ? <span className="spinner" /> : null}
                  {saving ? 'Saving...' : modal === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}