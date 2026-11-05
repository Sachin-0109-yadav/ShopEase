
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  RefreshCw,
  X,
  Tags,
  Power,
} from "lucide-react";

import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deactivateAdminCategory,
} from "../../api/adminApi";

import "./AdminCategories.css";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "name" && !editingCategory
        ? {
            slug: value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
          }
        : {}),
    }));
  };

  const openAddForm = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2 || form.slug.trim().length < 2) {
      setError("Category name and slug must contain at least 2 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload);
        setSuccess("Category updated successfully.");
      } else {
        await createAdminCategory(payload);
        setSuccess("Category created successfully.");
      }

      closeForm();
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (category) => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"? This category will no longer appear in the customer store.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deactivateAdminCategory(category.id);

      setSuccess("Category deactivated successfully.");
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to deactivate category."
      );
    }
  };

  const handleActivate = async (category) => {
    try {
      setError("");
      setSuccess("");

      await updateAdminCategory(category.id, { is_active: true });

      setSuccess("Category activated successfully.");
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to activate category."
      );
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-heading">
        <div>
          <h1>Category Management</h1>
          <p>Create and manage your store categories.</p>
        </div>

        <div className="admin-category-heading-actions">
          <button
            className="admin-category-refresh"
            onClick={fetchCategories}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="admin-category-add"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-category-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-category-alert success">
          {success}
        </div>
      )}

      <div className="admin-category-summary">
        <div>
          <Tags size={22} />
          <span>Total Categories</span>
          <strong>{categories.length}</strong>
        </div>

        <div>
          <Power size={22} />
          <span>Active Categories</span>
          <strong>
            {categories.filter((category) => category.is_active).length}
          </strong>
        </div>
      </div>

      <div className="admin-category-table-card">
        <div className="admin-category-table-heading">
          <h2>All Categories</h2>
          <span>{categories.length} categories</span>
        </div>

        {loading ? (
          <div className="admin-category-message">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-category-message">
            No categories found. Add your first category.
          </div>
        ) : (
          <div className="admin-category-table-scroll">
            <table className="admin-category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="admin-category-name">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                          />
                        ) : (
                          <div className="admin-category-placeholder">
                            <Tags size={20} />
                          </div>
                        )}

                        <strong>{category.name}</strong>
                      </div>
                    </td>

                    <td>{category.slug}</td>

                    <td className="admin-category-description">
                      {category.description || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          category.is_active
                            ? "admin-category-status active"
                            : "admin-category-status inactive"
                        }
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-category-actions">
                        <button
                          className="admin-category-edit"
                          onClick={() => openEditForm(category)}
                          title="Edit category"
                        >
                          <Pencil size={16} />
                        </button>

                        {category.is_active ? (
                          <button
                            className="admin-category-deactivate"
                            onClick={() => handleDeactivate(category)}
                            title="Deactivate category"
                          >
                            <Power size={16} />
                          </button>
                        ) : (
                          <button
                            className="admin-category-activate"
                            onClick={() => handleActivate(category)}
                            title="Activate category"
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="admin-category-modal-backdrop">
          <div className="admin-category-modal">
            <div className="admin-category-modal-heading">
              <div>
                <h2>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <p>Enter your category information below.</p>
              </div>

              <button onClick={closeForm} aria-label="Close">
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Category Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </label>

              <label>
                Category Slug *
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="e.g. electronics"
                  required
                  minLength={2}
                  maxLength={120}
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short category description..."
                  rows={3}
                />
              </label>

              <label>
                Category Image URL
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/category.jpg"
                />
              </label>

              <div className="admin-category-form-actions">
                <button
                  type="button"
                  className="admin-category-cancel"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-category-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Save Changes"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
