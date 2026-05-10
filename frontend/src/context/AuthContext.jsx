import { createContext, useContext, useState, useEffect } from 'react'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mg_token'))
  const [loading, setLoading] = useState(true)
  useEffect(() => { token ? fetchProfile() : setLoading(false) }, [token])
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: token } })
      if (res.ok) { const d = await res.json(); setUser(d.data) } else logout()
    } catch { logout() } finally { setLoading(false) }
  }
  const login = (t) => { localStorage.setItem('mg_token', t); setToken(t) }
  const logout = () => { localStorage.removeItem('mg_token'); setToken(null); setUser(null) }
  return <AuthContext.Provider value={{ user, token, login, logout, loading, refetchUser: fetchProfile }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
