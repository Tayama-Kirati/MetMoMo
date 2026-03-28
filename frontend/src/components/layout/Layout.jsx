import Navbar from './Navbar'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[104px]">{children}</main>

      {/* Newsletter strip */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="wrap flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif font-bold text-3xl mb-1">Get Exclusive Deals 🎁</h3>
            <p className="text-white/80 text-sm">Subscribe and get 15% off upto 250 on your very first order.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
            <input className="flex-1 md:w-72 bg-white/20 backdrop-blur border border-white/30 rounded-2xl px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:border-white text-sm" placeholder="Enter your email..." />
            <button type="submit" className="bg-white text-primary font-display font-bold px-5 py-3 rounded-2xl hover:bg-cream transition-colors shrink-0 flex items-center gap-1 text-sm">
              Subscribe <ArrowRight size={15}/>
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-charcoal text-white">
        <div className="wrap py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-hero-gradient flex items-center justify-center text-xl shadow-glow-sm">🍜</div>
              <div>
                <span className="font-serif font-extrabold text-lg block">MetMoMo</span>
                <span className="text-slate-light text-xs">Fast. Fresh. Delicious.</span>
              </div>
            </div>
            <p className="text-slate text-sm leading-relaxed mb-5"> Fastest, Easiest and The Most Convenient way to enjoy the best food of your favourite restaurants at home, at the office or wherever you want to.</p>
            <div className="space-y-2 text-sm text-slate">
              <div className="flex items-center gap-2"><MapPin size={14} className="text-primary shrink-0" /> Kathmandu, Nepal</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-primary shrink-0" /> +977 9800000000</div>
              <div className="flex items-center gap-2"><Mail size={14} className="text-primary shrink-0" /> metmomo@gmail.com.np</div>
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Explore', links: [{ to: '/', l: 'Home' }, { to: '/menu', l: 'Menu' }, { to: '/restaurants', l: 'Restaurants' }, { to: '/menu?cat=Steamed', l: 'Steamed Momos' }, { to: '/menu?cat=Fried', l: 'Fried Momos' }] },
            { title: 'Account', links: [{ to: '/login', l: 'Login' }, { to: '/register', l: 'Sign Up' }, { to: '/profile', l: 'My Profile' }, { to: '/orders', l: 'Order History' }, { to: '/wishlist', l: 'Wishlist' }] },
            { title: 'Support', links: [{ to: '/', l: 'Help Center' }, { to: '/', l: 'Track Order' }, { to: '/', l: 'Privacy Policy' }, { to: '/', l: 'Terms of Service' }, { to: '/', l: 'Refund Policy' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-white text-sm mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.l}><Link to={l.to} className="text-slate hover:text-white text-sm transition-colors">{l.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-2">
          <div className="wrap py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate text-sm">© 2025 MetMoMo. All rights reserved. Made with Love in Nepal.</p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Instagram size={18}/>, href: '#' },
                { icon: <Facebook size={18}/>, href: '#' },
                { icon: <Twitter size={18}/>, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className="w-9 h-9 rounded-xl bg-charcoal-2 text-slate hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}