import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth }     from './context/AuthContext'
import { useNotifications }          from './hooks/useNotifications'
import { CartProvider }              from './context/CartContext'
import { WishlistProvider }          from './context/WishlistContext'
import Layout                        from './components/layout/Layout'

import Login          from './pages/auth/Login'
import AdminLogin     from './pages/auth/AdminLogin'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ProtectedRoute, { GuestRoute, RoleRedirect, OwnerRoute, DriverRoute } from './components/ProtectedRoutes'
import DriverOrders from './pages/driver/DriverOrders'
import OwnerLayout    from './components/layout/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerOrders    from './pages/owner/OwnerOrders'
import OwnerReviews   from './pages/owner/OwnerReviews'
import OwnerRestaurant from './pages/owner/OwnerRestaurant'
import OwnerMenu      from './pages/owner/OwnerMenu'
import OwnerItemForm  from './pages/owner/OwnerItemForm'

import Home           from './pages/customer/Home'
import CategoryPage   from './pages/customer/CategoryPage'
import Restaurants    from './pages/customer/Restaurants'
import RestaurantMenu from './pages/customer/RestaurantMenu'
import ProductDetail  from './pages/customer/ProductDetail'
import Cart           from './pages/customer/Cart'
import Orders         from './pages/customer/Orders'
import Reviews        from './pages/customer/Reviews'
import Profile        from './pages/customer/Profile'
import Wishlist       from './pages/customer/Wishlist'
import PaymentSuccess from './pages/customer/PaymentSuccess'
import PaymentFailed  from './pages/customer/PaymentFailed'

import AdminDashboard   from './pages/admin/Dashboard'
import AdminProducts    from './pages/admin/Products'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminUsers       from './pages/admin/Users'
import AdminOrders      from './pages/admin/Orders'

function PageLoader() {
  return (
    <div className="fixed inset-0 bg-blush flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-float inline-block">
          <img src="/logo.png" alt="MetMomo" className="w-16 h-16"/>
        </div>
        <div className="text-2xl font-display font-bold text-ink mb-2 animate-float">
          MetMomo 
        </div>
        <div className="w-10 h-10 border-[3px] border-pink/20 border-t-pink rounded-full animate-spin mx-auto"/>
        <p className="text-muted text-sm mt-4 font-display font-semibold">Loading MetMomo..</p>
      </div>
    </div>
  )
}
function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <PageLoader/>
  return token ? children : <Navigate to="/login" replace />
}
function AdminRoute({ children }) {
  const { user, token, loading } = useAuth()
  if (loading) return <PageLoader/>
  if (!token) return <Navigate to="/admin/login" replace />
  if (user?.userRole !== 'admin') return <Navigate to="/" replace />
  return children
}
// function GuestRoute({ children }) {
//   const { token, loading } = useAuth()
//   if (loading) return <PageLoader/>
//   return token ? <Navigate to="/" replace /> : children
// }

function AppRoutes() {
  const { user } = useAuth()
  useNotifications(user?._id)   // connect socket & listen for order notifications

  return (
    <Layout>
      <Toaster position="top-right" gutter={8}
        toastOptions={{
          duration: 3000,
          style: { background:'#2D1B25', color:'#FFF9FB', borderRadius:'20px', fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:'14px', fontWeight:'500', border:'1px solid rgba(255,45,120,0.2)', padding:'14px 18px' },
          success: { iconTheme: { primary:'#FF2D78', secondary:'#fff' } },
          error:   { iconTheme: { primary:'#EF4444', secondary:'#fff' } },
        }}
      />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="restaurants"     element={<Restaurants />} />
        <Route path="/redirect" element={<RoleRedirect/>}/>

        <Route path="/category/:name"   element={<CategoryPage />} />
        <Route path="/restaurants/:id" element={<RestaurantMenu />} />
        <Route path="/product/:id"     element={<ProductDetail />} />

        <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        <Route path="/cart"            element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed"  element={<PaymentFailed />} />
        <Route path="/orders"   element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/reviews"  element={<PrivateRoute><Reviews /></PrivateRoute>} />
        <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />

        <Route path="/driver" element={<DriverRoute><DriverOrders /></DriverRoute>} />

        <Route path="/owner" element={<OwnerRoute><OwnerLayout><OwnerDashboard /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/orders"   element={<OwnerRoute><OwnerLayout><OwnerOrders /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/reviews"  element={<OwnerRoute><OwnerLayout><OwnerReviews /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/restaurant" element={<OwnerRoute><OwnerLayout><OwnerRestaurant /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/menu"       element={<OwnerRoute><OwnerLayout><OwnerMenu /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/add-item"   element={<OwnerRoute><OwnerLayout><OwnerItemForm /></OwnerLayout></OwnerRoute>} />
        <Route path="/owner/edit-item/:id" element={<OwnerRoute><OwnerLayout><OwnerItemForm /></OwnerLayout></OwnerRoute>} />

        <Route path="/admin"               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products"      element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/restaurants"   element={<AdminRoute><AdminRestaurants /></AdminRoute>} />
        <Route path="/admin/users"         element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/orders"        element={<AdminRoute><AdminOrders /></AdminRoute>} />

         
        <Route path="*" element={
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
            <div className="text-8xl mb-6 animate-float">
              <img src="/logo.png" alt="MetMomo" className="w-20 h-20"/>
            </div>
            <h1 className="font-display font-black text-5xl text-ink mb-3">404</h1>
            <p className="text-muted text-lg mb-8">This page doesn't exist.</p>
            <a href="/" className="btn-pink px-8 py-3.5 text-base">Back to Home</a>
          </div>
        }/>
      </Routes> 
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
