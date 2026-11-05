
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Package,
  X,
  Search,
  Image as ImageIcon,
} from "lucide-react";

import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
} from "../../api/adminApi";

import { getCategories } from "../../api/productApi";
import AdminProductForm from "./AdminProductForm";
import AdminProductImages from "./AdminProductImages";

import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [imageProduct, setImageProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setError("");

      const data = await getAdminProducts();
      setProducts(data);

      return data;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load products. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshImageProduct = async () => {
    const data = await fetchProducts();

    const updatedProduct = data.find(
      (item) => item.id === imageProduct?.id
    );

    if (updatedProduct) {
      setImageProduct(updatedProduct);
    }

    return updatedProduct;
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Unable to load categories:", err);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createAdminProduct(productData);

      setSuccess("Product created successfully!");
      setShowForm(false);
      setEditingProduct(null);

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateAdminProduct(
        editingProduct.id,
        productData
      );

      setSuccess("Product updated successfully!");
      setShowForm(false);
      setEditingProduct(null);

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = !product.is_active;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await updateAdminProduct(product.id, {
        is_active: newStatus,
      });

      setSuccess(
        `"${product.name}" ${
          newStatus ? "activated" : "deactivated"
        } successfully!`
      );

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to change product status."
      );
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openImageManager = (product) => {
    setImageProduct(product);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.brand?.toLowerCase().includes(searchText) ||
        product.slug?.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.category_id) === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [products, search, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <div className="admin-loading">
        Loading products...
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-page-heading admin-products-heading">
        <div>
          <h1>Product Management</h1>
          <p>Manage your ShopEase store products and inventory.</p>
        </div>

        <button
          className="admin-add-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="admin-error">{error}</div>
      )}

      {success && (
        <div className="admin-success">{success}</div>
      )}

      <div className="admin-product-toolbar">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by product name, brand or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-row">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={String(category.id)}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <p className="admin-results-count">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <div className="admin-products-table-wrapper">
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category ID</th>
              <th>Price</th>
              <th>Discount Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty-state">
                  <Package size={28} />
                  <p>No products found.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>#{product.id}</td>

                  <td>
                    <div className="admin-product-name">
                      <strong>{product.name}</strong>
                      <small>{product.brand || "No brand"}</small>
                    </div>
                  </td>

                  <td>{product.category_id}</td>

                  <td>
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td>
                    {product.discount_price
                      ? `₹${Number(product.discount_price).toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  <td>
                    <span
                      className={
                        product.stock_quantity === 0
                          ? "admin-stock-out"
                          : product.stock_quantity <= 5
                          ? "admin-stock-low"
                          : "admin-stock-available"
                      }
                    >
                      {product.stock_quantity === 0
                        ? "Out of stock"
                        : product.stock_quantity <= 5
                        ? `Low stock (${product.stock_quantity})`
                        : `In stock (${product.stock_quantity})`}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        product.is_active
                          ? "admin-status active"
                          : "admin-status inactive"
                      }
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-action-buttons">
                      <button
                        className="admin-edit-button"
                        onClick={() => openEditForm(product)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        className="admin-edit-button"
                        onClick={() => openImageManager(product)}
                      >
                        <ImageIcon size={15} />
                        Images ({product.images?.length || 0})
                      </button>

                      <button
                        className={
                          product.is_active
                            ? "admin-deactivate-button"
                            : "admin-activate-button"
                        }
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <AdminProductForm
              key={editingProduct?.id || "new-product"}
              initialData={editingProduct}
              onSubmit={
                editingProduct
                  ? handleUpdateProduct
                  : handleCreateProduct
              }
              onCancel={closeForm}
            />

            {saving && (
              <p className="admin-saving-message">
                Saving product...
              </p>
            )}
          </div>
        </div>
      )}

      {imageProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-image-modal">
            <AdminProductImages
              product={imageProduct}
              onClose={() => setImageProduct(null)}
              onUpdated={refreshImageProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
}
