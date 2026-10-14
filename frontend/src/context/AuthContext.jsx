import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

const readToken = () => { try { return localStorage.getItem('mg_token') } catch { return null } }

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(readToken)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    try { localStorage.removeItem('mg_token') } catch {}
    setToken(null); setUser(null)
  }, [])

  const fetchProfile = useCallback(async () => {
    const { ok, data, status } = await api.get('/profile')
    if (ok) setUser(data.data)
    else if (status === 401) logout()
    setLoading(false)
  }, [logout])

  useEffect(() => {
    if (token) fetchProfile()
    else setLoading(false)
  }, [token, fetchProfile])

  // api.js fires this when the server rejects our token
  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const login = (t) => {
    try { localStorage.setItem('mg_token', t) } catch {}
    setLoading(true)
    setToken(t)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refetchUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
