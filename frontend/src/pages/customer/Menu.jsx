// ── MENU PAGE ────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, LayoutGrid, List, X } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import ProductCard from '../../components/ui/ProductCard'

const CATS = ['All','Steamed Momo','Fried Momo','Jhol Momo','C-Momo','Kothey Momo','Drinks','Snacks','Desserts','Thali','Newari Special']

export default function Menu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [layout, setLayout]     = useState('grid')
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [status, setStatus]     = useState('All')
  const [sort, setSort]         = useState('default')
  const [searchParams]          = useSearchParams()

  useEffect(() => {
    const q = searchParams.get('q'), c = searchParams.get('cat')
    if (q) setSearch(q); if (c) setCat(c)
  }, [searchParams])

  useEffect(() => {
    api.get(ROUTES.products).then(({ ok, data }) => { if (ok) setProducts(data.data || []) }).finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const ms = !search || p.productName?.toLowerCase().includes(search.toLowerCase()) || p.productDescription?.toLowerCase().includes(search.toLowerCase())
    const mc = cat === 'All' || p.productCategory === cat
    const ms2 = status === 'All' || p.productStatus === status
    return ms && mc && ms2
  }).sort((a, b) => sort === 'price-asc' ? a.productPrice - b.productPrice : sort === 'price-desc' ? b.productPrice - a.productPrice : sort === 'name' ? a.productName.localeCompare(b.productName) : 0)

  return (
    <div>
      <div className="bg-pink text-white py-12 stripe-bg" style={{backgroundImage:'none'}}>
        <div className="wrap">
          <h1 className="font-display font-black text-4xl mb-3">Our Menu</h1>
          <p className="text-pink-100 mb-6">{products.length} freshly made items</p>
          <div className="relative max-w-lg">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"/>
            <input className="w-full bg-white/20 backdrop-blur border border-white/30 rounded-full pl-12 pr-4 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:border-white transition-all text-sm"
              placeholder="Search momos, drinks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
          {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`chip whitespace-nowrap ${cat === c ? 'chip-active' : 'chip-idle'}`}>{c}</button>)}
        </div>

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-2">
            <select className="input-field text-sm py-2 w-auto rounded-full" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <select className="input-field text-sm py-2 w-auto rounded-full" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted text-sm">{filtered.length} items</span>
            <div className="flex bg-pink-50 rounded-xl p-1 gap-1">
              <button onClick={() => setLayout('grid')} className={`p-2 rounded-xl transition-all ${layout==='grid'?'bg-pink text-white shadow-pink-sm':'text-slate'}`}><LayoutGrid size={15}/></button>
              <button onClick={() => setLayout('list')} className={`p-2 rounded-xl transition-all ${layout==='list'?'bg-pink text-white shadow-pink-sm':'text-slate'}`}><List size={15}/></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[...Array(8)].map((_,i) => <div key={i} className="skeleton aspect-[4/3] rounded-3xl" />)}</div>
        ) : filtered.length > 0 ? (
          layout === 'grid'
            ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{filtered.map(p => <ProductCard key={p._id} product={p} />)}</div>
            : <div className="space-y-3 max-w-3xl">{filtered.map(p => <ProductCard key={p._id} product={p} layout="list" />)}</div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-display font-bold text-xl text-ink mb-2">Nothing found</p>
            <button onClick={() => { setSearch(''); setCat('All') }} className="btn-pink mt-3">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
