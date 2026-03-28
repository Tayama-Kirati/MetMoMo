import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { api,ROUTES } from '../../services/api'
import ProductCard from '../../components/ui/ProductCard'

export default function Menu() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    api.get(ROUTES.products).then(({ ok, data }) => {
      if (ok) { setProducts(data.data || []); setFiltered(data.data || []) }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let list = products
    if (search) list = list.filter(p =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productDescription?.toLowerCase().includes(search.toLowerCase())
    )
    if (category !== 'All') list = list.filter(p => p.productCategory === category)
    if (status !== 'All') list = list.filter(p => p.productStatus === status)
    setFiltered(list)
  }, [search, category, status, products])

  const categories = ['All', ...new Set(products.map(p => p.productCategory).filter(Boolean))]

  return (
    <div className="page-container">
      <div className="mb-10">
        <div className="badge-orange text-5xl justify-center text-center font-serif font-extrabold ml-10 mb-3">Our Menu</div>
        <h1 className="section-title text-3xl text-center font-serif font-normal ml-10 mb-3">Everything We Serve</h1>
        <p className="text-muted  text-center text-thin ml-10">Freshly prepared, authentically Nepali.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 ml-10 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute  left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-10"
            placeholder="Search momos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select className="input-field w-auto mr-10" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          {/* <select className="input-field w-auto" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select> */}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all duration-150 border
              ${category === c
                ? 'bg-orange text-white border-orange shadow-orange-sm'
                : 'bg-dark-3 text-muted border-mid hover:border-orange hover:text-orange'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-muted text-sm mb-6">
        {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="skeleton aspect-[4/3] w-full" />
              <div className="bg-dark-2 p-4 space-y-2">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted font-serif font-normal text-lg">No items match your search.</p>
          <button onClick={() => { setSearch(''); setCategory('All'); setStatus('All') }} className="btn-secondary font-serif font-thin  mt-4">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
