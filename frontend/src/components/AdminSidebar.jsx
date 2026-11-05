
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Store,
  ShoppingBag,
  Tags,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h2>ShopEase</h2>
        <p>ADMIN PANEL</p>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <Package size={19} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <Tags size={19} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/admin/products?add=true"
          className="admin-nav-link"
        >
          <PlusCircle size={19} />
          <span>Add Product</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          <ShoppingBag size={19} />
          <span>Orders</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-bottom">
        <Link to="/" className="admin-nav-link">
          <Store size={19} />
          <span>Back to Store</span>
        </Link>
      </div>
    </aside>
  );
}
