import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { STRINGS } from '../i18n/strings'
import { useAuth } from './AuthContext'
import { api, ROUTES } from '../services/api'

const PreferencesContext = createContext(null)

const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
const write = (key, value) => { try { localStorage.setItem(key, value) } catch {} }

export function PreferencesProvider({ children }) {
  const { user } = useAuth()
  const [lang, setLang] = useState(() => read('mg_lang', 'en'))
  const [dark, setDark] = useState(() => read('mg_dark', 'false') === 'true')

  // Logged-in users carry their preference across devices (applied once per login)
  const savedLang = user?.preferences?.preferredLanguage
  const savedDark = user?.preferences?.darkMode
  const userId = user?._id
  useEffect(() => {
    if (!userId) return
    if (savedLang) setLang(savedLang === 'ne' ? 'ne' : 'en')
    if (typeof savedDark === 'boolean') setDark(savedDark)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on login, not on every toggle
  }, [userId])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    write('mg_dark', String(dark))
  }, [dark])

  useEffect(() => {
    document.documentElement.lang = lang === 'ne' ? 'ne' : 'en'
    write('mg_lang', lang)
  }, [lang])

  const save = (patch) => {
    if (user) api.patch(ROUTES.profile, { preferences: { ...(user.preferences || {}), ...patch } })
  }
  const toggleDark = () => setDark(d => { save({ darkMode: !d, preferredLanguage: lang }); return !d })
  const toggleLang = () => setLang(l => { const next = l === 'en' ? 'ne' : 'en'; save({ preferredLanguage: next, darkMode: dark }); return next })

  const t = useCallback((key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key, [lang])

  return (
    <PreferencesContext.Provider value={{ lang, dark, toggleDark, toggleLang, t }}>
      {children}
    </PreferencesContext.Provider>
  )
}
export const usePrefs = () => useContext(PreferencesContext)
