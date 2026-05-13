import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Search, ToggleLeft, ToggleRight, Store, Star, Clock, Truck, ChevronUp, ChevronDown } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', description: '', address: '', phone: '', email: '',
  cuisine: '', deliveryTime: '25-35', deliveryFee: '0',
  minimumOrder: '100', isOpen: 'true', isPopular: 'false',
  isFeatured: 'false', emoji: '🍜', openingHours: '9:00 AM – 10:00 PM',
}

function Badge({ children, color = 'gray' }) {
  const cls = {
    green:  'bg-green-50  text-green-700  border-green-200',
    red:    'bg-red-50    text-red-600    border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    pink:   'bg-pink-50   text-pink       border-pink-200',
    gray:   'bg-gray-50   text-gray-500   border-gray-200',
  }[color]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>{children}</span>
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(null)   // 'create' | 'edit' | null
  const [form, setForm]               = useState(EMPTY)
  const [editId, setEditId]           = useState(null)
  const [coverFile, setCoverFile]     = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [deletingId, setDeletingId]   = useState(null)
  const [sortField, setSortField]     = useState('name')
  const [sortDir, setSortDir]         = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = () => {
    setLoading(true)
    api.get(ROUTES.restaurants)
      .then(({ ok, data }) => { if (ok) setRestaurants(data.data || []) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setCoverFile(null); setCoverPreview(null); setModal('create') }
  const openEdit   = (r) => {
    setForm({
      name: r.name, description: r.description, address: r.address,
      phone: r.phone || '', email: r.email || '',
      cuisine: (r.cuisine || []).join(', '),
      deliveryTime: r.deliveryTime, deliveryFee: String(r.deliveryFee),
      minimumOrder: String(r.minimumOrder), isOpen: String(r.isOpen),
      isPopular: String(r.isPopular), isFeatured: String(r.isFeatured),
      emoji: r.emoji, openingHours: r.openingHours,
    })
    setEditId(r._id); setCoverFile(null); setCoverPreview(r.coverImage || null); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setCoverFile(null); setCoverPreview(null) }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (coverFile) fd.append('coverImage', coverFile)
    const { ok, data } = modal === 'create'
      ? await api.postForm(ROUTES.restaurants, fd)
      : await api.patchForm(ROUTES.restaurant(editId), fd)
    if (ok) { toast.success(modal === 'create' ? 'Restaurant created!' : 'Updated!'); closeModal(); load() }
    else toast.error(data?.message || 'Failed to save')
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant? This cannot be undone.')) return
    setDeletingId(id)
    const { ok } = await api.delete(ROUTES.restaurant(id))
    if (ok) { toast.success('Deleted'); setRestaurants(r => r.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingId(null)
  }

  const toggleOpen = async (r) => {
    const fd = new FormData(); fd.append('isOpen', String(!r.isOpen))
    const { ok } = await api.patchForm(ROUTES.restaurant(r._id), fd)
    if (ok) {
      setRestaurants(prev => prev.map(x => x._id === r._id ? { ...x, isOpen: !r.isOpen } : x))
      toast.success(`${r.name} is now ${!r.isOpen ? 'Open' : 'Closed'}`)
    }
  }

  const f = (field) => ({ value: form[field] ?? '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = restaurants
    .filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !search || r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || (filterStatus === 'open' && r.isOpen) || (filterStatus === 'closed' && !r.isOpen)
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      let va = a[sortField] ?? ''
      let vb = b[sortField] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-gray-300"/>
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-pink"/> : <ChevronDown size={12} className="text-pink"/>
  }

  const openCount   = restaurants.filter(r => r.isOpen).length
  const closedCount = restaurants.length - openCount

  return (
    <div className="page-wrap">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-black text-3xl text-ink">Restaurants</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted">
            <span>{restaurants.length} total</span>
            <span>·</span>
            <span className="text-green-600 font-semibold">{openCount} open</span>
            <span>·</span>
            <span className="text-red-400">{closedCount} closed</span>
          </div>
        </div>
        <button onClick={openCreate} className="btn-pink gap-2">
          <Plus size={15}/> Add Restaurant
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
          <input className="input-field pl-10 rounded-2xl h-10 text-sm" placeholder="Search restaurants..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1.5">
          {[['all','All'], ['open','Open'], ['closed','Closed']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-4 h-10 rounded-2xl text-sm font-semibold transition-all ${filterStatus === v ? 'bg-pink text-white shadow-pink-sm' : 'bg-white border border-faint text-slate hover:border-pink hover:text-pink'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Store size={48} className="mx-auto mb-4 text-faint"/>
          <p className="font-display font-bold text-xl text-ink mb-2">No restaurants found</p>
          <p className="text-muted text-sm mb-5">Try a different search or add one</p>
          <button onClick={openCreate} className="btn-pink">Add First Restaurant</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-faint shadow-card overflow-hidden">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-faint bg-gray-50/80">
                  {[
                    { label: 'Restaurant', field: 'name',        w: 'w-64' },
                    { label: 'Cuisine',    field: null,           w: 'w-40' },
                    { label: 'Delivery',   field: 'deliveryTime', w: 'w-28' },
                    { label: 'Fee',        field: 'deliveryFee',  w: 'w-24' },
                    { label: 'Rating',     field: 'rating',       w: 'w-20' },
                    { label: 'Status',     field: 'isOpen',       w: 'w-28' },
                    { label: 'Actions',    field: null,           w: 'w-24' },
                  ].map(({ label, field, w }) => (
                    <th key={label} className={`text-left px-5 py-3.5 text-xs font-display font-bold text-muted uppercase tracking-wider ${w}`}>
                      {field ? (
                        <button className="flex items-center gap-1 hover:text-ink transition-colors" onClick={() => handleSort(field)}>
                          {label} <SortIcon field={field}/>
                        </button>
                      ) : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-faint">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-pink-50/30 transition-colors group">

                    {/* Restaurant name + image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100 shrink-0">
                          {r.coverImage
                            ? <img src={r.coverImage} alt={r.name} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-xl">{r.emoji || '🍜'}</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-ink text-sm truncate">{r.name}</p>
                          <p className="text-muted text-xs truncate max-w-[180px]">{r.address}</p>
                          <div className="flex gap-1 mt-1">
                            {r.isFeatured && <Badge color="pink">⭐ Featured</Badge>}
                            {r.isPopular  && <Badge color="yellow">🔥 Popular</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cuisine */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(r.cuisine || []).slice(0, 2).map(c => (
                          <Badge key={c} color="gray">{c}</Badge>
                        ))}
                        {(r.cuisine || []).length > 2 && (
                          <Badge color="gray">+{r.cuisine.length - 2}</Badge>
                        )}
                        {!(r.cuisine?.length) && <span className="text-muted text-xs">—</span>}
                      </div>
                    </td>

                    {/* Delivery time */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate">
                        <Clock size={12} className="text-muted shrink-0"/>
                        {r.deliveryTime} min
                      </span>
                    </td>

                    {/* Fee */}
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1 text-sm font-semibold ${r.deliveryFee === 0 ? 'text-green-600' : 'text-slate'}`}>
                        <Truck size={12} className="shrink-0"/>
                        {r.deliveryFee === 0 ? 'Free' : `NPR ${r.deliveryFee}`}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-sm font-bold text-ink">
                        <Star size={12} className="text-yellow-400" fill="currentColor"/>
                        {r.rating?.toFixed(1) || '—'}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-4">
                      <button onClick={() => toggleOpen(r)}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors">
                        {r.isOpen
                          ? <><ToggleRight size={24} className="text-green-500"/> <span className="text-green-600">Open</span></>
                          : <><ToggleLeft  size={24} className="text-gray-400"/>  <span className="text-gray-400">Closed</span></>}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} title="Edit"
                          className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <Pencil size={13}/>
                        </button>
                        <button onClick={() => handleDelete(r._id)} disabled={deletingId === r._id} title="Delete"
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-40">
                          {deletingId === r._id
                            ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/>
                            : <Trash2 size={13}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-5 py-3 border-t border-faint bg-gray-50/50 text-xs text-muted">
            Showing {filtered.length} of {restaurants.length} restaurants
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-4xl shadow-float w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between p-6 border-b border-faint sticky top-0 bg-white rounded-t-4xl z-10">
              <h2 className="font-display font-black text-xl text-ink">
                {modal === 'create' ? '🏪 Add Restaurant' : 'Edit Restaurant'}
              </h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink hover:bg-pink-100 transition-colors">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">

              {/* Cover image preview */}
              {coverPreview && (
                <div className="col-span-2 rounded-2xl overflow-hidden h-40 bg-pink-50">
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover"/>
                </div>
              )}

              {[
                { col: 2, label: 'Restaurant Name *', field: 'name',        placeholder: 'e.g. Momo Corner' },
                { col: 2, label: 'Description *',     field: 'description', placeholder: 'Tell customers about your restaurant...', isTextarea: true },
                { col: 2, label: 'Address *',         field: 'address',     placeholder: 'e.g. Thamel Marg, Kathmandu' },
                { col: 1, label: 'Phone',             field: 'phone',       placeholder: '01-XXXXXXX' },
                { col: 1, label: 'Email',             field: 'email',       placeholder: 'info@restaurant.com' },
                { col: 2, label: 'Cuisine (comma separated)', field: 'cuisine', placeholder: 'Nepali, Momo, Street Food' },
                { col: 1, label: 'Delivery Time',    field: 'deliveryTime', placeholder: '20-30' },
                { col: 1, label: 'Delivery Fee (NPR)', field: 'deliveryFee', placeholder: '0', type: 'number' },
                { col: 1, label: 'Min. Order (NPR)', field: 'minimumOrder', placeholder: '100', type: 'number' },
                { col: 1, label: 'Opening Hours',    field: 'openingHours', placeholder: '9:00 AM – 10:00 PM' },
                { col: 1, label: 'Emoji',            field: 'emoji',        placeholder: '🍜' },
              ].map(({ col, label, field, placeholder, isTextarea, type }) => (
                <div key={field} className={col === 2 ? 'col-span-2' : ''}>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{label}</p>
                  {isTextarea
                    ? <textarea className="input-field resize-none rounded-2xl" rows={3} placeholder={placeholder} {...f(field)}/>
                    : <input className="input-field rounded-2xl" type={type || 'text'} placeholder={placeholder} {...f(field)}/>}
                </div>
              ))}

              {[
                { field: 'isOpen',     label: 'Status',    opts: [['true', '🟢 Open'], ['false', '🔴 Closed']] },
                { field: 'isPopular',  label: 'Popular?',  opts: [['false', 'No'], ['true', '🔥 Yes']] },
                { field: 'isFeatured', label: 'Featured?', opts: [['false', 'No'], ['true', '⭐ Yes']] },
              ].map(({ field, label, opts }) => (
                <div key={field}>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{label}</p>
                  <select className="input-field rounded-2xl" {...f(field)}>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}

              <div className="col-span-2">
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">COVER IMAGE</p>
                <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-pink transition-colors group">
                  <Upload size={18} className="text-pink shrink-0"/>
                  <span className="text-sm text-muted truncate">{coverFile ? coverFile.name : 'Click to upload cover image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                </label>
              </div>

              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-pink flex-1 justify-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {saving ? 'Saving...' : modal === 'create' ? 'Create Restaurant' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
