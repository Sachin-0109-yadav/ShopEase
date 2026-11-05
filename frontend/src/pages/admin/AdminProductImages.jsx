import "./AdminProductImages.css";
import { useState } from "react";
import {
  uploadProductImage,
  setPrimaryProductImage,
  deleteProductImage,
} from "../../api/adminApi";

const API_BASE_URL = "http://localhost:8000";

export default function AdminProductImages({
  product,
  onClose,
  onUpdated,
}) {
  const [images, setImages] = useState(product.images || []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url}`;
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await uploadProductImage(
        product.id,
        selectedFile,
        altText,
        isPrimary
      );

      setSelectedFile(null);
      setAltText("");
      setIsPrimary(false);

      const updatedProduct = await onUpdated();
      setImages(updatedProduct?.images || []);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Image upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      setLoading(true);
      setError("");

      await setPrimaryProductImage(product.id, imageId);

      const updatedProduct = await onUpdated();
      setImages(updatedProduct?.images || []);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not update primary image."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      await deleteProductImage(product.id, imageId);

      const updatedProduct = await onUpdated();
      setImages(updatedProduct?.images || []);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not delete image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-image-manager">
      <div className="admin-image-manager-header">
        <div>
          <h2>Manage Product Images</h2>
          <p>{product.name}</p>
        </div>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {error && (
        <div className="admin-image-error">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="admin-image-upload-form">
        <h3>Upload New Image</h3>

        <label>Select image</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) =>
            setSelectedFile(event.target.files?.[0] || null)
          }
        />

        <label>Image description</label>
        <input
          type="text"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Example: Front view of product"
        />

        <label className="admin-primary-checkbox">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(event) => setIsPrimary(event.target.checked)}
          />
          Set as primary image
        </label>

        <button type="submit" disabled={loading || !selectedFile}>
          {loading ? "Please wait..." : "Upload Image"}
        </button>
      </form>

      <div className="admin-existing-images">
        <h3>Existing Images ({images.length})</h3>

        {images.length === 0 ? (
          <p>No images uploaded for this product yet.</p>
        ) : (
          <div className="admin-image-grid">
            {images.map((image) => (
              <div className="admin-image-card" key={image.id}>
                <img
                  src={getImageUrl(image.image_url)}
                  alt={image.alt_text || product.name}
                />

                {image.is_primary && (
                  <span className="admin-primary-badge">
                    Primary
                  </span>
                )}

                <p>{image.alt_text || "Product image"}</p>

                {!image.is_primary && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSetPrimary(image.id)}
                  >
                    Set Primary
                  </button>
                )}

                <button
                  type="button"
                  className="admin-image-delete"
                  disabled={loading}
                  onClick={() => handleDelete(image.id)}
                >
                  Delete Image
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
