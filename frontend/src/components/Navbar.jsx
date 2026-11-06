
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="shop-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <ShoppingBag size={25} />
          <span>Shop<span>Ease</span></span>
        </Link>

        <button
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        <nav className={`navbar-links ${menuOpen ? "navbar-links-open" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            <Home size={17} />
            Home
          </Link>

          <Link to="/wishlist" onClick={closeMenu}>
            <Heart size={17} />
            Wishlist
          </Link>

          {user ? (
            <>
              <Link to="/cart" onClick={closeMenu}>
                <ShoppingCart size={17} />
                Cart
              </Link>

              <Link to="/profile" onClick={closeMenu}>
                <User size={17} />
                My Profile
              </Link>

              <Link to="/my-orders" onClick={closeMenu}>
                <ClipboardList size={17} />
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="navbar-logout"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                <LogIn size={17} />
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register"
                onClick={closeMenu}
              >
                <UserPlus size={17} />
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
