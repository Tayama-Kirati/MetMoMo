import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { api, ROUTES } from '../services/api'
import { usePrefs } from '../context/PreferencesContext'

// Floating "MoMo Buddy" assistant: recommends dishes from the live menu
export default function ChatWidget() {
  const { t } = usePrefs()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])   // { role, content, suggestions? }
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setSending(true)

    const { ok, data } = await api.post(ROUTES.aiChat, {
      messages: next.map(({ role, content }) => ({ role, content })),
    })
    setMessages(m => [...m, ok
      ? { role: 'assistant', content: data.data.reply, suggestions: data.data.suggestions }
      : { role: 'assistant', content: data?.message || 'Sorry, I could not answer right now.', error: true },
    ])
    setSending(false)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] bg-white border border-faint rounded-3xl shadow-float flex flex-col animate-scale-in"
          role="dialog" aria-label={t('assistantTitle')}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-faint">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink text-white flex items-center justify-center"><Sparkles size={16} /></div>
              <p className="font-display font-bold text-ink">{t('assistantTitle')}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-pink-50">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            <div className="bg-pink-50 text-ink rounded-2xl rounded-tl-md px-3 py-2 max-w-[85%]">{t('assistantHello')}</div>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={`rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-pink text-white rounded-tr-md'
                  : m.error ? 'bg-red-50 text-red-600 rounded-tl-md'
                  : 'bg-pink-50 text-ink rounded-tl-md'}`}>
                  {m.content}
                </div>
                {m.suggestions?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.suggestions.map(p => (
                      <Link key={p._id} to={`/product/${p._id}`} onClick={() => setOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-2xl border border-faint hover:border-pink transition-colors">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-pink-50 shrink-0">
                          {p.productImage
                            ? <img src={p.productImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">🥟</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink truncate">{p.productName}</p>
                          <p className="text-xs text-muted truncate">{p.restaurant?.name}</p>
                        </div>
                        <span className="text-pink font-bold text-xs shrink-0">NPR {p.productPrice}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="bg-pink-50 rounded-2xl rounded-tl-md px-3 py-2 w-14 flex gap-1" aria-label="Thinking">
                {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-pink rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-faint">
            <input value={input} onChange={e => setInput(e.target.value)} maxLength={500}
              placeholder={t('assistantPlaceholder')} aria-label={t('assistantPlaceholder')}
              className="flex-1 h-10 px-3 rounded-xl border border-faint bg-white text-sm text-ink focus:outline-none focus:border-pink" />
            <button type="submit" disabled={sending || !input.trim()} aria-label={t('send')}
              className="w-10 h-10 rounded-xl bg-pink text-white flex items-center justify-center disabled:opacity-50">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)} aria-label={t('assistantTitle')}
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full bg-pink text-white shadow-pink flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}
