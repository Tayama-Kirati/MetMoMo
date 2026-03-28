import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Star, Truck, ShieldCheck } from 'lucide-react'
import { api,ROUTES } from '../../services/api'
import ProductCard from '../../components/ui/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(ROUTES.products).then(({ ok, data }) => {
      if (ok) setFeatured((data.data || []).slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark min-h-[88vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-orange/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber/6 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left content */}
          <div className="animate-fade-up">
            <div className="badge-orange mb-6 inline-flex">
              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              Now delivering in 30 mins
            </div>
            <h1 className="font-serif font-extrabold text-5xl md:text-6xl text-chalk leading-[1.05] tracking-tight mb-6">
              Freshly Steamed<br />
              <span className="text-orange">MoMos</span> Delivered<br />
              to You
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">
              Fastest, Easiest and The Most Convenient way to enjoy the best food of your favourite restaurants at home, at the office or wherever you want to.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary text-base px-7 py-3.5 gap-2">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn-secondary text-base px-7 py-3.5">
                View Menu
              </Link>
            </div>

          
            {/* <div className="flex gap-8 mt-12 pt-8 border-t border-dark-3">
              {[
                { value: '500+', label: 'Orders Today' },
                { value: '4.9★', label: 'Rating' },
                { value: '30min', label: 'Delivery' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-display font-extrabold text-2xl text-chalk">{s.value}</div>
                  <div className="text-muted text-sm">{s.label}</div>
                </div>
              ))}
            </div> */}
          </div>

       
          <div className="hidden md:flex items-center justify-center relative">
            <div className="w-80 h-80 rounded-full bg-gradient-to-br from-orange/20 to-amber/10 border border-orange/20 flex items-center justify-center animate-pulse-slow">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-orange/30 to-amber/15 border border-orange/30 flex items-center justify-center">
                <span className="text-[100px] animate-float">🍜</span>
              </div>
            </div>
          
            <div className="absolute top-8 right-4 bg-dark-2 border border-mid rounded-xl px-4 py-3 shadow-card animate-fade-up" style={{animationDelay:'0.3s'}}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Truck size={15}/></div>
                <div>
                  <div className="font-display font-bold text-chalk text-sm">Free Delivery</div>
                  <div className="text-muted text-xs">on orders over NPR 500</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-12 left-2 bg-dark-2 border border-mid rounded-xl px-4 py-3 shadow-card animate-fade-up" style={{animationDelay:'0.5s'}}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-amber"><Star size={15}/></div>
                <div>
                  <div className="font-display font-bold text-chalk text-sm">Top Rated</div>
                  <div className="text-muted text-xs">4.9 stars · 2k+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-dark-3 bg-dark-2">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Truck size={22} className="text-orange" />, title: 'Fast Delivery', desc: 'Under 30 minutes' },
            { icon: <Star size={22} className="text-amber" />, title: 'Top Quality', desc: 'Fresh ingredients' },
            { icon: <Clock size={22} className="text-green-400" />, title: 'Open Daily', desc: '7am – 12pm' },
            { icon: <ShieldCheck size={22} className="text-blue-400" />, title: 'Safe & Hygienic', desc: 'Certified kitchen' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-3 border border-mid flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-display font-bold text-chalk text-sm">{f.title}</div>
                <div className="text-muted text-xs">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="p-10 badge-orange text-5xl font-serif  font-bold mb-3">Popular Items</div>
            <h2 className="section-title font-serif p-10 font-normal text-3xl ">Today's Picks</h2>
          </div>
          <Link to="/menu" className="btn-ghost gap-1 font-serif font-normal text-sm text-black ">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="skeleton aspect-[4/3] w-full" />
                <div className="bg-dark-2 p-4 space-y-2">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-4">🍜</div>
            <p>No products available yet.</p>
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange to-orange-light p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute right-0 top-0 bottom-0 text-[160px] leading-none opacity-10 pointer-events-none select-none">🍜</div>
          <div>
            <h2 className="font-serif  font-extrabold text-5xl   text-black mb-3">
              Hungry? Order Now!
            </h2>
            <p className="text-black font-thin text-lg">Get your favourite momos in under 30 minutes.</p>
          </div>
          <Link to="/menu" className="bg-white text-orange font-serif font-normal text-base px-8 py-4 rounded-xl hover:shadow-orange hover:scale-105 transition-all duration-200 shrink-0 flex items-center gap-2">
            Explore Menu <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
