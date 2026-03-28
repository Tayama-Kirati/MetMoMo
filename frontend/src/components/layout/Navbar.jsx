import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import momo from "../../assets/momo.jpeg";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const isAdmin = user?.userRole === "admin";

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
    setMobileOpen(false);
  };

  const navLink = (to, label, icon) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-display font-medium text-sm transition-all duration-150
          ${active ? "bg-dark-3 text-chalk" : "text-muted hover:text-cream hover:bg-dark-3"}`}
      >
        {icon} {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 h-[68px] bg-white backdrop-blur-xl border-b border-white ">
      <div className="max-w-6xl mx-auto px-5 h-full flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">
            <img src={momo} alt="MoMo" className="w-8 h-8" />
          </span>
          <span className="font-body font-extrabold text-3xl text-black">
            Met<span className="text-orange-500">MoMo.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          {navLink("/", "Home")}
          {navLink("/menu", "Menu")}
          {user && navLink("/orders", "My Orders")}
          {isAdmin &&
            navLink("/admin", "Dashboard", <LayoutDashboard size={14} />)}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <>
              <Link
                to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-dark-3 border border-mid text-black hover:border-orange hover:text-orange transition-all duration-150"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-orange text-black text-[10px] font-display font-bold rounded-full flex items-center justify-center border-2 border-dark"
                    style={{ width: 18, height: 18 }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setDropOpen(true)}
                onMouseLeave={() => setDropOpen(false)}
              >
                <button className="w-9 h-9 rounded-full bg-gradient-to-br from-orange to-amber text-black font-display font-extrabold text-sm flex items-center justify-center border-2 border-transparent hover:border-orange transition-all">
                  {user.userName?.[0]?.toUpperCase()}
                </button>
                {dropOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-dark-2 border border-mid rounded-xl p-2 shadow-deep animate-fade-in">
                    <div className="px-3 pt-2 pb-1">
                      <p className="font-display font-bold text-chalk text-sm">
                        {user.userName}
                      </p>
                      <p className="text-muted text-xs truncate">
                        {user.userEmail}
                      </p>
                    </div>
                    <div className="h-px bg-dark-3 my-2" />
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-black hover:bg-dark-3 transition-colors"
                    >
                      <User size={14} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-orange hover:bg-dark-3 transition-colors"
                      >
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </Link>
                    )}
                    <div className="h-px bg-dark-3 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-dark-3 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Register
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-dark-3 border border-mid text-black hover:bg-dark-2 transition-all duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[68px] left-0 right-0 bg-dark-2 border-b border-mid px-5 py-4 flex flex-col gap-1 animate-fade-in z-50 text-black">
          {navLink("/", "Home")}
          {navLink("/menu", "Menu")}
          {user && navLink("/orders", "My Orders")}
          {user && navLink("/cart", "Cart")}
          {user && navLink("/profile", "Profile")}
          {isAdmin && navLink("/admin", "Admin Dashboard")}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary flex-1 text-sm justify-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary flex-1 text-sm justify-center"
              >
                Register
              </Link>
            </div>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-red-400 hover:bg-dark-3"
            >
              <LogOut size={14} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
