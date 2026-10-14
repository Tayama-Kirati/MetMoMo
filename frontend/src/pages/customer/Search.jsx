import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, SlidersHorizontal, X, Star, Clock } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import ProductCard from '../../components/ui/ProductCard'
import { usePrefs } from '../../context/PreferencesContext'

const SORTS = [
  { v: '',           l: 'Relevance' },
  { v: 'price_asc',  l: 'Price: low to high' },
  { v: 'price_desc', l: 'Price: high to low' },
  { v: 'rating',     l: 'Top rated' },
  { v: 'newest',     l: 'Newest' },
]
const SPICE = ['mild', 'medium', 'hot', 'extra-hot']

export default function Search() {
  const { t } = usePrefs()
  const [params, setParams] = useSearchParams()
  const [text, setText] = useState(params.get('q') || '')
  const [products, setProducts] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [meta, setMeta] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const q        = params.get('q') || ''
  const veg      = params.get('veg') || ''
  const spice    = params.get('spice') || ''
  const sort     = params.get('sort') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const page     = Number(params.get('page') || 1)

  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (!('page' in patch)) next.delete('page')
    setParams(next)
  }

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ status: 'available', page: String(page), limit: '24' })
    if (q) qs.set('search', q)
    if (veg) qs.set('veg', veg)
    if (spice) qs.set('spice', spice)
    if (sort) qs.set('sort', sort)
    if (minPrice) qs.set('minPrice', minPrice)
    if (maxPrice) qs.set('maxPrice', maxPrice)

    Promise.all([
      api.get(`${ROUTES.products}?${qs}`),
      q ? api.get(`${ROUTES.restaurants}?search=${encodeURIComponent(q)}`) : Promise.resolve({ ok: true, data: { data: [] } }),
    ]).then(([p, r]) => {
      if (p.ok) { setProducts(p.data.data || []); setMeta({ total: p.data.total || 0, pages: p.data.pages || 1 }) }
      if (r.ok) setRestaurants(r.data.data || [])
    }).finally(() => setLoading(false))
  }, [q, veg, spice, sort, minPrice, maxPrice, page])

  const activeFilters = [veg, spice, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="page-wrap">
      <title>{q ? `“${q}” · Search · MetMoMo` : 'Search · MetMoMo'}</title>

      <form onSubmit={e => { e.preventDefault(); update({ q: text.trim() }) }} role="search"
        className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border-2 border-faint focus-within:border-pink rounded-2xl px-4 h-12">
          <SearchIcon size={18} className="text-muted" />
          <input autoFocus value={text} onChange={e => setText(e.target.value)} placeholder={t('searchPlaceholder')}
            aria-label={t('search')} className="flex-1 bg-transparent outline-none text-ink" />
          {text && <button type="button" aria-label="Clear" onClick={() => { setText(''); update({ q: '' }) }}><X size={16} className="text-muted"/></button>}
        </div>
        <button type="button" onClick={() => setShowFilters(v => !v)}
          className={`h-12 px-4 rounded-2xl border-2 flex items-center gap-2 font-semibold text-sm ${showFilters || activeFilters ? 'border-pink text-pink' : 'border-faint text-slate'}`}>
          <SlidersHorizontal size={16}/> <span className="hidden sm:inline">Filters</span>{activeFilters ? ` (${activeFilters})` : ''}
        </button>
      </form>

      {showFilters && (
        <div className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
          <div>
            <p className="text-xs font-bold uppercase text-muted mb-2">Diet</p>
            <div className="flex flex-wrap gap-2">
              {[['', 'Any'], ['true', '🥬 Veg'], ['false', '🍗 Non-veg']].map(([v, l]) => (
                <button key={l} onClick={() => update({ veg: v })} className={veg === v ? 'chip-active' : 'chip-idle'}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted mb-2">Spice</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => update({ spice: '' })} className={!spice ? 'chip-active' : 'chip-idle'}>Any</button>
              {SPICE.map(s => <button key={s} onClick={() => update({ spice: s })} className={spice === s ? 'chip-active' : 'chip-idle'}>{s}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted mb-2">Price (NPR)</p>
            <div className="flex items-center gap-2">
              <input type="number" min="0" placeholder="Min" defaultValue={minPrice} aria-label="Minimum price"
                onBlur={e => update({ minPrice: e.target.value })} className="input-field py-2" />
              <span className="text-muted">–</span>
              <input type="number" min="0" placeholder="Max" defaultValue={maxPrice} aria-label="Maximum price"
                onBlur={e => update({ maxPrice: e.target.value })} className="input-field py-2" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted mb-2">Sort by</p>
            <select value={sort} onChange={e => update({ sort: e.target.value })} className="input-field py-2" aria-label="Sort by">
              {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-bold text-lg text-ink mb-3">Restaurants</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {restaurants.map(r => (
              <Link key={r._id} to={`/restaurants/${r._id}`} className="card p-4 min-w-[220px] hover:border-pink">
                <p className="font-display font-bold text-ink">{r.emoji} {r.name}</p>
                <p className="text-xs text-muted truncate">{(r.cuisine || []).join(', ') || r.address}</p>
                <div className="flex items-center gap-3 text-xs text-muted mt-2">
                  <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400"/> {r.rating || '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/> {r.deliveryTime} min</span>
                  {!r.acceptingOrders && <span className="text-red-500">Closed</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-ink">{q ? `Dishes matching “${q}”` : 'All dishes'}</h2>
        {!loading && <span className="text-sm text-muted">{meta.total} result{meta.total === 1 ? '' : 's'}</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-ink font-semibold mb-1">Nothing found</p>
          <p className="text-muted text-sm">Try another dish name or loosen the filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          {meta.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="btn-outline py-2 disabled:opacity-40">← Prev</button>
              <span className="text-sm text-muted">Page {page} of {meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => update({ page: String(page + 1) })} className="btn-outline py-2 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
