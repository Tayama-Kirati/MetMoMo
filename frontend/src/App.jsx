import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Layout from "./components/layout/Layout";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Customer
import Home from "./pages/customer/Home";
import Menu from "./pages/customer/Menu";
import Restaurants from "./pages/customer/Restaurants";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Orders from "./pages/customer/Orders";
import Profile from "./pages/customer/Profile";
import Wishlist from "./pages/customer/Wishlist";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";

/* ── Route guards ───────────────────────────────────── */
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <PageLoader />;
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.userRole !== "admin") return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <PageLoader />;
  return token ? <Navigate to="/" replace /> : children;
}

function PageLoader() {
  return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-float inline-block">🍜</div>
        <div
          className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"
          style={{ borderWidth: 3 }}
        />
        <p className="text-slate text-sm mt-4 font-display font-semibold">
          Loading MoMoGo...
        </p>
      </div>
    </div>
  );
}

/* ── App routes ─────────────────────────────────────── */
function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Guest only */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        {/* Authenticated */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <Wishlist />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
              <div className="text-8xl mb-6 animate-bounce-light">🍜</div>
              <h1 className="font-display font-extrabold text-5xl text-charcoal mb-3">
                404
              </h1>
              <p className="text-slate text-lg mb-2">
                Oops! This page doesn't exist.
              </p>
              <p className="text-slate-light text-sm mb-8">
                The momo you're looking for has been eaten.
              </p>
              <a href="/" className="btn-primary px-8 py-3.5 text-base">
                Back to Home
              </a>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1C1C1E",
                color: "#FFF8F0",
                borderRadius: "16px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "14px 18px",
              },
              success: { iconTheme: { primary: "#FF4500", secondary: "#fff" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
