import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Store, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { name:'', description:'', address:'', phone:'', email:'', cuisine:'', deliveryTime:'25-35', deliveryFee:'0', minimumOrder:'100', isOpen:'true', isPopular:'false', isFeatured:'false', emoji:'🍜', openingHours:'9:00 AM – 10:00 PM' }

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [editId, setEditId]           = useState(null)
  const [coverFile, setCoverFile]     = useState(null)
  const [saving, setSaving]           = useState(false)
  const [deletingId, setDeletingId]   = useState(null)

  const load = () => { setLoading(true); api.get(ROUTES.restaurants).then(({ok,data})=>{ if(ok) setRestaurants(data.data||[]) }).finally(()=>setLoading(false)) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setCoverFile(null); setModal('create') }
  const openEdit   = (r) => {
    setForm({ name:r.name, description:r.description, address:r.address, phone:r.phone||'', email:r.email||'', cuisine:(r.cuisine||[]).join(', '), deliveryTime:r.deliveryTime, deliveryFee:String(r.deliveryFee), minimumOrder:String(r.minimumOrder), isOpen:String(r.isOpen), isPopular:String(r.isPopular), isFeatured:String(r.isFeatured), emoji:r.emoji, openingHours:r.openingHours })
    setEditId(r._id); setCoverFile(null); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setCoverFile(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if(v!=='') fd.append(k,v) })
    if (coverFile) fd.append('coverImage', coverFile)
    const { ok, data } = modal==='create' ? await api.postForm(ROUTES.restaurants, fd) : await api.patchForm(ROUTES.restaurant(editId), fd)
    if (ok) { toast.success(modal==='create'?'Restaurant created! 🏪':'Updated!'); closeModal(); load() }
    else toast.error(data.message||'Failed')
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant?')) return
    setDeletingId(id)
    const { ok } = await api.delete(ROUTES.restaurant(id))
    if (ok) { toast.success('Deleted'); setRestaurants(r => r.filter(x => x._id !== id)) }
    else toast.error('Could not delete')
    setDeletingId(null)
  }

  const toggleOpen = async (r) => {
    const fd = new FormData(); fd.append('isOpen', String(!r.isOpen))
    const { ok } = await api.patchForm(ROUTES.restaurant(r._id), fd)
    if (ok) { setRestaurants(prev => prev.map(x => x._id===r._id ? {...x, isOpen:!r.isOpen} : x)); toast.success(`${r.name} is now ${!r.isOpen?'Open':'Closed'}`) }
  }

  const f = (field) => ({ value: form[field]??'', onChange: e => setForm(p=>({...p,[field]:e.target.value})) })
  const filtered = restaurants.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-wrap">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div><h1 className="font-display font-black text-3xl text-ink">Restaurants</h1><p className="text-muted mt-1">{restaurants.length} total</p></div>
        <button onClick={openCreate} className="btn-pink gap-2"><Plus size={15}/> Add Restaurant</button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
        <input className="input-field pl-11 rounded-full" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_,i)=><div key={i} className="skeleton h-52 rounded-3xl"/>)}</div>
      : filtered.length === 0 ? <div className="text-center py-20"><Store size={48} className="mx-auto mb-4 text-faint"/><p className="font-display font-bold text-xl text-ink mb-4">No restaurants</p><button onClick={openCreate} className="btn-pink">Add First</button></div>
      : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r => (
            <div key={r._id} className="card overflow-hidden group hover:shadow-card-lg transition-all">
              <div className="relative h-36 bg-gradient-to-br from-pink-50 to-rose-light overflow-hidden">
                {r.coverImage ? <img src={r.coverImage} alt={r.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-6xl">{r.emoji||'🍜'}</div>}
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={()=>openEdit(r)} className="w-9 h-9 rounded-xl bg-white text-ink flex items-center justify-center hover:text-pink transition-colors shadow-card"><Pencil size={13}/></button>
                  <button onClick={()=>handleDelete(r._id)} disabled={deletingId===r._id} className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-card">
                    {deletingId===r._id?<span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Trash2 size={13}/>}
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {r.isFeatured && <span className="badge-pink text-[9px]">Featured</span>}
                  {r.isPopular  && <span className="badge badge-yellow text-[9px]">Popular</span>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-bold text-ink text-base">{r.name}</h3>
                  <button onClick={()=>toggleOpen(r)} title={r.isOpen?'Click to close':'Click to open'}>
                    {r.isOpen ? <ToggleRight size={26} className="text-green-500 hover:text-green-700 transition-colors"/> : <ToggleLeft size={26} className="text-muted hover:text-pink transition-colors"/>}
                  </button>
                </div>
                <p className="text-muted text-xs line-clamp-1 mb-3">{r.description}</p>
                <div className="flex items-center justify-between text-xs text-muted border-t border-faint pt-3">
                  <span>⏱ {r.deliveryTime} min</span>
                  <span>{r.deliveryFee===0?'🚚 Free':`NPR ${r.deliveryFee}`}</span>
                  <span>Min. NPR {r.minimumOrder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-4xl shadow-float w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scale-in" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-faint sticky top-0 bg-white rounded-t-4xl z-10">
              <h2 className="font-display font-black text-xl text-ink">{modal==='create'?'+ Add Restaurant':'Edit Restaurant'}</h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink hover:bg-pink-100 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              {[
                {col:2, label:'Restaurant Name *', field:'name', placeholder:'e.g. Momo Corner'},
                {col:2, label:'Description *', field:'description', placeholder:'Tell customers about your restaurant...', isTextarea:true},
                {col:2, label:'Address *', field:'address', placeholder:'e.g. Thamel Marg, Kathmandu'},
                {col:1, label:'Phone', field:'phone', placeholder:'01-XXXXXXX'},
                {col:1, label:'Email', field:'email', placeholder:'info@restaurant.com'},
                {col:2, label:'Cuisine (comma separated)', field:'cuisine', placeholder:'Nepali, Momo, Street Food'},
                {col:1, label:'Delivery Time', field:'deliveryTime', placeholder:'20-30'},
                {col:1, label:'Delivery Fee (NPR)', field:'deliveryFee', placeholder:'0', type:'number'},
                {col:1, label:'Min. Order (NPR)', field:'minimumOrder', placeholder:'100', type:'number'},
                {col:1, label:'Opening Hours', field:'openingHours', placeholder:'9:00 AM – 10:00 PM'},
                {col:1, label:'Emoji', field:'emoji', placeholder:'🍜'},
              ].map(({col,label,field,placeholder,isTextarea,type}) => (
                <div key={field} className={col===2?'col-span-2':''}>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{label}</p>
                  {isTextarea
                    ? <textarea className="input-field resize-none rounded-2xl" rows={3} placeholder={placeholder} {...f(field)}/>
                    : <input className="input-field rounded-2xl" type={type||'text'} placeholder={placeholder} {...f(field)}/>}
                </div>
              ))}
              {[
                {field:'isOpen',    label:'Status',   opts:[['true','Open'],['false','Closed']]},
                {field:'isPopular', label:'Popular?', opts:[['false','No'],['true','Yes']]},
                {field:'isFeatured',label:'Featured?',opts:[['false','No'],['true','Yes']]},
              ].map(({field,label,opts}) => (
                <div key={field}>
                  <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">{label}</p>
                  <select className="input-field rounded-2xl" {...f(field)}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-2">COVER IMAGE</p>
                <label className="flex items-center gap-3 w-full bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-pink transition-colors group">
                  <Upload size={18} className="text-pink shrink-0"/>
                  <span className="text-sm text-muted truncate">{coverFile?coverFile.name:'Click to upload cover image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e=>setCoverFile(e.target.files[0])}/>
                </label>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-pink flex-1 justify-center gap-2">
                  {saving?<span className="spinner"/>:null}{saving?'Saving...':modal==='create'?'Create Restaurant':'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
