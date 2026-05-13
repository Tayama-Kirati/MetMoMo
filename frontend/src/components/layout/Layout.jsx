import Navbar from './Navbar'
import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-ink text-white mt-16">
        <div className="wrap py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="w-9 h-9 rounded-2xl bg-pink flex items-center justify-center text-white font-display font-black text-lg">M</div> */}
              <span className="font-display   font-black text-3xl text-ink -ml-15">
              Met<span className="text-pink">MoMo</span>
            </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">Authentic Nepali food ordering system, delivering delicious food to your doorstep.</p>
            <p className="text-gray-500 text-xs">SERVICE HOURS<br/>07 A.M. TO 10P.M. (NST)</p>
          </div>
          {[
            { title: 'WE\'RE MetMomo', links: ['About us', 'Delivery Charges', 'Get Help', 'Contact Us'] },
            { title: 'Quick Links', links: ['Home', 'Restaurants', 'My Orders'] },
            { title: 'Support', links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-pink-500 text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><span className="text-muted hover:text-pink text-sm transition-colors cursor-pointer">{l}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="wrap py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
            <span>Our helpline stays the same across Kathmandu, Bhaktapur and  Lalitpur for seamless support.</span>
            <span className="font-display font-light">98****234, 97*****23</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
