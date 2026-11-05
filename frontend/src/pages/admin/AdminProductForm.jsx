
import { useEffect, useState } from "react";
import { getCategories } from "../../api/productApi";

export default function AdminProductForm({
  onSubmit,
  onCancel,
  initialData = null,
}) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brand: "",
    category_id: "",
    price: "",
    discount_price: "",
    stock_quantity: "0",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Unable to load categories.");
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        category_id: String(initialData.category_id || ""),
        price: String(initialData.price ?? ""),
        discount_price:
          initialData.discount_price == null
            ? ""
            : String(initialData.discount_price),
        stock_quantity: String(initialData.stock_quantity ?? 0),
        is_active: initialData.is_active,
        is_featured: initialData.is_featured,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;

    setForm((previous) => ({
      ...previous,
      name,
      slug: name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (
      form.discount_price &&
      Number(form.discount_price) >= Number(form.price)
    ) {
      setError("Discount price must be lower than regular price.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      brand: form.brand.trim() || null,
      category_id: Number(form.category_id),
      price: Number(form.price),
      discount_price: form.discount_price
        ? Number(form.discount_price)
        : null,
      stock_quantity: Number(form.stock_quantity),
      is_active: form.is_active,
      is_featured: form.is_featured,
    };

    onSubmit(productData);
  };

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Product" : "Add New Product"}</h2>

      {error && <p className="admin-form-error">{error}</p>}

      <label>Product Name *</label>
      <input
        name="name"
        value={form.name}
        onChange={handleNameChange}
        minLength="2"
        maxLength="200"
        required
      />

      <label>Product Slug *</label>
      <input
        name="slug"
        value={form.slug}
        onChange={handleChange}
        minLength="2"
        maxLength="220"
        required
      />

      <label>Description *</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        minLength="5"
        rows="4"
        required
      />

      <label>Brand</label>
      <input
        name="brand"
        value={form.brand}
        onChange={handleChange}
      />

      <label>Category *</label>
      <select
        name="category_id"
        value={form.category_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <label>Regular Price (₹) *</label>
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        min="0.01"
        step="0.01"
        required
      />

      <label>Discount Price (₹)</label>
      <input
        type="number"
        name="discount_price"
        value={form.discount_price}
        onChange={handleChange}
        min="0.01"
        step="0.01"
      />

      <label>Stock Quantity *</label>
      <input
        type="number"
        name="stock_quantity"
        value={form.stock_quantity}
        onChange={handleChange}
        min="0"
        step="1"
        required
      />

      <div className="admin-form-checkboxes">
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active Product
        </label>

        <label>
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
          />
          Featured Product
        </label>
      </div>

      <div className="admin-form-actions">
        <button type="submit">
          {initialData ? "Update Product" : "Save Product"}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
