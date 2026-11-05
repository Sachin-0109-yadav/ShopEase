
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
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="shop-navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          <ShoppingBag size={25} />
          <span>Shop<span>Ease</span></span>
        </Link>

        <nav className="navbar-links">

          <Link to="/">
            <Home size={17} />
            Home
          </Link>

          {user ? (
            <>
              <Link to="/cart">
                <ShoppingCart size={17} />
                Cart
              </Link>
              <Link to="/wishlist">
               <Heart size={17} />
                 Wishlist
               </Link>

              <Link to="/profile">
                <User size={17} />
                My Profile
              </Link>

              <Link to="/my-orders">
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
              <Link to="/login">
                <LogIn size={17} />
                Login
              </Link>

              <Link to="/register" className="navbar-register">
                <UserPlus size={17} />
                Register
              </Link>

              <Link to="/wishlist">
  <Heart size={17} />
  Wishlist
</Link>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}
