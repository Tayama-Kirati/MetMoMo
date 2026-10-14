import { useEffect, useState } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import { api, ROUTES } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { code: '', description: '', type: 'percent', value: '', maxDiscount: '', minOrder: '', firstOrderOnly: false, usageLimit: '', perUserLimit: '1', expiresAt: '' }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => api.get(ROUTES.adminCoupons).then(({ ok, data }) => { if (ok) setCoupons(data.data || []) })
  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = { ...form }
    ;['value', 'maxDiscount', 'minOrder', 'usageLimit', 'perUserLimit'].forEach(k => { body[k] = Number(body[k] || 0) })
    if (!body.expiresAt) delete body.expiresAt
    const { ok, data } = await api.post(ROUTES.adminCoupons, body)
    if (ok) { toast.success('Coupon created'); setForm(EMPTY); load() } else toast.error(data?.message || 'Could not create')
    setSaving(false)
  }

  const toggle = async (c) => {
    const { ok } = await api.patch(ROUTES.adminCoupon(c._id), { isActive: !c.isActive })
    if (ok) load()
  }
  const remove = async (c) => {
    if (!confirm(`Delete ${c.code}?`)) return
    const { ok } = await api.delete(ROUTES.adminCoupon(c._id))
    if (ok) { toast.success('Deleted'); load() }
  }

  return (
    <div className="page-wrap max-w-5xl">
      <title>Coupons · Admin · MetMoMo</title>
      <h1 className="font-display font-black text-3xl text-ink mb-1">Coupons</h1>
      <p className="text-muted mb-8">Promo codes are checked on the server at checkout.</p>

      <form onSubmit={create} className="card p-6 mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <label className="text-xs font-bold text-muted">Code
          <input required className="input-field mt-1 uppercase" value={form.code} onChange={set('code')} placeholder="DASHAIN25"/></label>
        <label className="text-xs font-bold text-muted">Type
          <select className="input-field mt-1" value={form.type} onChange={set('type')}>
            <option value="percent">% off</option><option value="flat">NPR off</option>
          </select></label>
        <label className="text-xs font-bold text-muted">Value
          <input required type="number" min="1" className="input-field mt-1" value={form.value} onChange={set('value')}/></label>
        <label className="text-xs font-bold text-muted">Max discount (NPR, 0 = none)
          <input type="number" min="0" className="input-field mt-1" value={form.maxDiscount} onChange={set('maxDiscount')}/></label>
        <label className="text-xs font-bold text-muted">Min order (NPR)
          <input type="number" min="0" className="input-field mt-1" value={form.minOrder} onChange={set('minOrder')}/></label>
        <label className="text-xs font-bold text-muted">Total uses (0 = unlimited)
          <input type="number" min="0" className="input-field mt-1" value={form.usageLimit} onChange={set('usageLimit')}/></label>
        <label className="text-xs font-bold text-muted">Uses per customer
          <input type="number" min="0" className="input-field mt-1" value={form.perUserLimit} onChange={set('perUserLimit')}/></label>
        <label className="text-xs font-bold text-muted">Expires
          <input type="date" className="input-field mt-1" value={form.expiresAt} onChange={set('expiresAt')}/></label>
        <label className="text-xs font-bold text-muted sm:col-span-2">Description (shown to customers)
          <input className="input-field mt-1" value={form.description} onChange={set('description')} placeholder="25% off for Dashain"/></label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.firstOrderOnly} onChange={set('firstOrderOnly')} className="accent-pink-600"/> First order only
        </label>
        <button disabled={saving} className="btn-pink justify-center py-3"><Plus size={15}/> Create coupon</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-faint text-left text-xs text-muted uppercase">
            {['Code', 'Discount', 'Rules', 'Used', 'Status', ''].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No coupons yet.</td></tr>}
            {coupons.map(c => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-bold text-ink"><Tag size={12} className="inline mr-1 text-pink"/>{c.code}<p className="text-xs text-muted font-normal">{c.description}</p></td>
                <td className="px-4 py-3 text-ink">{c.type === 'percent' ? `${c.value}%` : `NPR ${c.value}`}{c.maxDiscount ? ` (max ${c.maxDiscount})` : ''}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {c.minOrder ? `Min NPR ${c.minOrder}. ` : ''}{c.firstOrderOnly ? 'First order. ' : ''}{c.perUserLimit ? `${c.perUserLimit}/customer. ` : ''}
                  {c.expiresAt ? `Until ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                </td>
                <td className="px-4 py-3 text-ink tabular-nums">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(c)} className={c.isActive ? 'badge-green' : 'badge-gray'}>{c.isActive ? 'Active' : 'Paused'}</button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(c)} aria-label="Delete" className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100"><Trash2 size={13}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
