
import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { getAdminProducts } from "../../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");

        const products = await getAdminProducts();

        setStats({
          total: products.length,
          active: products.filter(
            (product) => product.is_active
          ).length,
          inactive: products.filter(
            (product) => !product.is_active
          ).length,
          lowStock: products.filter(
            (product) =>
              product.is_active &&
              product.stock_quantity <= 5
          ).length,
        });
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: stats.total,
      icon: Package,
      color: "#2563eb",
    },
    {
      title: "Active Products",
      value: stats.active,
      icon: CheckCircle,
      color: "#16a34a",
    },
    {
      title: "Inactive Products",
      value: stats.inactive,
      icon: XCircle,
      color: "#dc2626",
    },
    {
      title: "Low Stock Products",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "#d97706",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <h1>Dashboard Overview</h1>
        <p>
          Welcome to your ShopEase administration panel.
        </p>
      </div>

      {error && (
        <div className="admin-error">{error}</div>
      )}

      {loading ? (
        <p>Loading dashboard statistics...</p>
      ) : (
        <div className="admin-stats-grid">
          {cards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="admin-stat-card"
                key={item.title}
              >
                <div>
                  <p>{item.title}</p>
                  <h2>{item.value}</h2>
                </div>

                <div
                  className="admin-stat-icon"
                  style={{ color: item.color }}
                >
                  <Icon size={28} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-welcome-card">
        <h2>ShopEase Admin Panel</h2>
        <p>
          Manage your products, inventory, and store operations
          from one place.
        </p>
      </div>
    </div>
  );
}
