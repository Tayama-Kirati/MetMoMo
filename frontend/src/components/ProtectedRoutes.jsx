import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
 
/** Redirect logged-in users to their correct home page */
export function RoleRedirect() {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace/>
  if (user?.userRole === 'admin') return <Navigate to="/admin" replace/>
  return <Navigate to="/" replace/>
}
 
/** Protect any route — optionally require admin role */
export default function ProtectedRoute({ children, admin = false }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()
 
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="w-8 h-8 border-4 border-pink border-t-transparent rounded-full animate-spin"/>
    </div>
  )
 
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace/>
  }
 
  if (admin && user?.userRole !== 'admin') {
    return <Navigate to="/" replace/>
  }
 
  return children
}
 
/** Redirect already-logged-in users away from /login and /register */
export function GuestRoute({ children }) {
  const { token, user } = useAuth()
  if (token) {
    return <Navigate to={user?.userRole === 'admin' ? '/admin' : '/'} replace/>
  }
  return children
}
 