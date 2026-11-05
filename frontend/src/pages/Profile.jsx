
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="auth-logo">
          <ShoppingBag /> ShopEase
        </Link>

        <h1>My Account</h1>
        <p className="auth-subtitle">
          Welcome, {user.full_name}
        </p>

        <div className="profile-detail">
          <User />
          <div>
            <span>Full Name</span>
            <strong>{user.full_name}</strong>
          </div>
        </div>

        <div className="profile-detail">
          <Mail />
          <div>
            <span>Email Address</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="profile-detail">
          <Phone />
          <div>
            <span>Phone Number</span>
            <strong>{user.phone || "Not provided"}</strong>
          </div>
        </div>

        <div className="profile-detail">
          <User />
          <div>
            <span>Account Type</span>
            <strong>{user.role}</strong>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>

        <Link to="/" className="back-home">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
