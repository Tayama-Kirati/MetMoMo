import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const fmt = (n) => `NPR ${Math.round(n || 0).toLocaleString()}`
const monthStart = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10) }

export default function AdminPayouts() {
  const [settings, setSettings] = useState(null)
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [payouts, setPayouts] = useState(null)

  useEffect(() => { api.get(ROUTES.adminSettings).then(({ ok, data }) => { if (ok) setSettings(data.data) }) }, [])
  useEffect(() => {
    const end = new Date(to); end.setHours(23, 59, 59, 999)
    api.get(`${ROUTES.adminPayouts}?from=${from}&to=${end.toISOString()}`).then(({ ok, data }) => { if (ok) setPayouts(data.data) })
  }, [from, to, settings?.commissionPercent])

  const save = async (e) => {
    e.preventDefault()
    const { ok, data } = await api.patch(ROUTES.adminSettings, settings)
    if (ok) { setSettings(data.data); toast.success('Settings saved') } else toast.error(data?.message || 'Could not save')
  }

  const totals = (payouts?.rows || []).reduce((t, r) => ({ sales: t.sales + r.foodSales, commission: t.commission + r.commission, payout: t.payout + r.payout }), { sales: 0, commission: 0, payout: 0 })

  return (
    <div className="page-wrap max-w-5xl">
      <title>Payouts · Admin · MetMoMo</title>
      <h1 className="font-display font-black text-3xl text-ink mb-8">Payouts &amp; settings</h1>

      {settings && (
        <form onSubmit={save} className="card p-6 mb-8 grid sm:grid-cols-4 gap-4 items-end">
          <label className="text-xs font-bold text-muted">Platform commission (% of food sales)
            <input type="number" min="0" max="100" className="input-field mt-1" value={settings.commissionPercent}
              onChange={e => setSettings(s => ({ ...s, commissionPercent: e.target.value }))}/></label>
          <label className="text-xs font-bold text-muted">Rider share (% of delivery fee)
            <input type="number" min="0" max="100" className="input-field mt-1" value={settings.riderSharePercent}
              onChange={e => setSettings(s => ({ ...s, riderSharePercent: e.target.value }))}/></label>
          <label className="text-xs font-bold text-muted">Loyalty points per NPR 100
            <input type="number" min="0" className="input-field mt-1" value={settings.loyaltyPointsPerHundred}
              onChange={e => setSettings(s => ({ ...s, loyaltyPointsPerHundred: e.target.value }))}/></label>
          <button className="btn-pink justify-center py-3"><Save size={15}/> Save</button>
        </form>
      )}

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="text-xs font-bold text-muted">From<input type="date" className="input-field mt-1" value={from} onChange={e => setFrom(e.target.value)}/></label>
        <label className="text-xs font-bold text-muted">To<input type="date" className="input-field mt-1" value={to} onChange={e => setTo(e.target.value)}/></label>
        <p className="text-xs text-muted pb-3">Delivered orders only · commission {payouts?.commissionPercent ?? '—'}%</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-faint text-left text-xs text-muted uppercase">
            {['Restaurant', 'Orders', 'Food sales', 'Commission', 'Payout'].map((h, i) => <th key={h} className={`px-4 py-3 font-bold ${i ? 'text-right' : ''}`}>{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {!payouts ? <tr><td colSpan={5} className="px-4 py-8"><div className="skeleton h-6 rounded"/></td></tr>
              : payouts.rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No delivered orders in this period.</td></tr>
              : payouts.rows.map(r => (
                <tr key={r.restaurantId}>
                  <td className="px-4 py-3 text-ink font-semibold">{r.name || 'Deleted restaurant'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{r.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{fmt(r.foodSales)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{fmt(r.commission)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-ink">{fmt(r.payout)}</td>
                </tr>
              ))}
          </tbody>
          {payouts?.rows.length > 0 && (
            <tfoot><tr className="border-t-2 border-faint font-bold text-ink">
              <td className="px-4 py-3">Total</td><td/>
              <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.sales)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.commission)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.payout)}</td>
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
