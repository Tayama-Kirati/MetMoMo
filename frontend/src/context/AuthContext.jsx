import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('momo_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) fetchProfile()
    else setLoading(false)
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: token } })
      if (res.ok) {
        const data = await res.json()
        setUser(data.data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (newToken) => {
    localStorage.setItem('momo_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('momo_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refetchUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)