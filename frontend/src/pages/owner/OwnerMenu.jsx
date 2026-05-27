import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, UtensilsCrossed } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function OwnerMenu() {
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    const { ok, data } = await api.get('/owner/products')
    if (ok) setProducts(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (product) => {
    setTogglingId(product._id)
    const { ok, data } = await api.patch(`/owner/products/${product._id}/status`)
    if (ok) {
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, productStatus: data.data.productStatus } : p))
      toast.success(`${product.productName} marked as ${data.data.productStatus}`)
    } else {
      toast.error('Could not update availability')
    }
    setTogglingId(null)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    const { ok } = await api.delete(`/owner/products/${id}`)
    if (ok) { toast.success('Item deleted'); setProducts(prev => prev.filter(p => p._id !== id)) }
    else toast.error('Could not delete item')
    setDeletingId(null)
  }

  const allCats = ['All', ...new Set(products.map(p => p.productCategory).filter(Boolean))]

  const filtered = products.filter(p => {
    const ms  = !search || p.productName?.toLowerCase().includes(search.toLowerCase())
    const mc  = catFilter === 'All' || p.productCategory === catFilter
    const mst = statusFilter === 'all' || p.productStatus === statusFilter
    return ms && mc && mst
  })

  const availableCount   = products.filter(p => p.productStatus === 'available').length
  const unavailableCount = products.length - availableCount

  return (
    <div className="page-wrap">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
        <Link to="/owner/add-item" className="btn-pink gap-2">
          <Plus size={15}/> Add Food Item
        </Link>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-6">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
          <input className="input-field pl-11 rounded-full" placeholder="Search items..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[['all','All'],['available','✅ Available'],['unavailable','⏸️ Unavailable']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${statusFilter === v ? 'bg-pink text-white border-pink shadow-pink-sm' : 'border-faint text-slate hover:border-pink hover:text-pink bg-white'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {allCats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`chip text-xs ${catFilter === c ? 'chip-active' : 'chip-idle'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed size={48} className="mx-auto mb-4 text-faint"/>
          <p className="font-display font-bold text-xl text-ink mb-2">
            {products.length === 0 ? 'No menu items yet' : 'No items match your filter'}
          </p>
          <p className="text-muted text-sm mb-6">
            {products.length === 0 ? 'Start adding dishes to your menu' : 'Try clearing the search or filter'}
          </p>
          <Link to="/owner/add-item" className="btn-pink">Add First Item</Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
          <div className="divide-y divide-faint">
            {filtered.map(p => {
              const available = p.productStatus === 'available'
              return (
                <div key={p._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-pink-50/30 transition-colors group">

                  {/* Image */}
                  <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100">
                    {p.productImage
                      ? <img src={p.productImage} alt={p.productName}
                          className={`w-full h-full object-cover ${!available ? 'grayscale opacity-60' : ''}`}/>
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-ink text-sm truncate">{p.productName}</p>
                    <p className="text-muted text-xs truncate">{p.productDescription}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-pink font-display font-bold text-sm">NPR {p.productPrice?.toLocaleString()}</span>
                      <span className="text-muted text-xs">{p.productCategory}</span>
                      <span className="text-muted text-xs">Qty: {p.productQuantity}</span>
                    </div>
                  </div>

                  {/* Availability button */}
                  <button
                    onClick={() => handleToggle(p)}
                    disabled={togglingId === p._id}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all disabled:opacity-50
                      ${available
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {togglingId === p._id
                      ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin"/>
                      : <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`}/>}
                    {available ? 'Available' : 'Unavailable'}
                  </button>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link to={`/owner/edit-item/${p._id}`}
                      className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      title="Edit">
                      <Pencil size={13}/>
                    </Link>
                    <button onClick={() => handleDelete(p._id, p.productName)} disabled={deletingId === p._id}
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-40"
                      title="Delete">
                      {deletingId === p._id
                        ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/>
                        : <Trash2 size={13}/>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="px-5 py-3 border-t border-faint bg-gray-50/50 text-xs text-muted">
            Showing {filtered.length} of {products.length} items
          </div>
        </div>
      )}
    </div>
  )
}
