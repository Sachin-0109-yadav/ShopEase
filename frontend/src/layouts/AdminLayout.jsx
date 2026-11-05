
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2>ShopEase Admin</h2>
            <p>Manage your online store</p>
          </div>

          <span className="admin-header-badge">
            Administrator
          </span>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
