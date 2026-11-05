
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";

import {
  getWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
} from "../api/wishlistApi";

import "./Wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyItem, setBusyItem] = useState(null);

  const loadWishlist = async () => {
    try {
      setError("");
      const data = await getWishlist();
      setItems(data.items || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      setBusyItem(itemId);
      setMessage("");
      setError("");

      const data = await removeFromWishlist(itemId);
      setItems(data.items || []);
      setMessage("Product removed from wishlist.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to remove this product."
      );
    } finally {
      setBusyItem(null);
    }
  };

  const handleMoveToCart = async (itemId) => {
    try {
      setBusyItem(itemId);
      setMessage("");
      setError("");

      const data = await moveWishlistItemToCart(itemId);
      setItems(data.items || []);
      setMessage("Product successfully moved to your cart.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to move this product to cart."
      );
    } finally {
      setBusyItem(null);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-status">
        Loading your wishlist...
      </div>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-heading">
        <div>
          <span className="wishlist-label">YOUR COLLECTION</span>
          <h1><Heart size={27} /> My Wishlist</h1>
          <p>Keep the products you love in one place.</p>
        </div>

        <span className="wishlist-count">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {message && (
        <div className="wishlist-success">{message}</div>
      )}

      {error && (
        <div className="wishlist-error">{error}</div>
      )}

      {items.length === 0 ? (
        <section className="wishlist-empty">
          <Heart size={55} />
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <Link to="/" className="wishlist-shop-button">
            <ShoppingBag size={18} />
            Explore Products
          </Link>
        </section>
      ) : (
        <section className="wishlist-grid">
          {items.map((item) => {
            const product = item.product;
            const price = Number(
              product.discount_price ?? product.price
            );

            return (
              <article className="wishlist-card" key={item.id}>
                <div className="wishlist-image">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                    />
                  ) : (
                    <ShoppingBag size={40} />
                  )}
                </div>

                <div className="wishlist-details">
                  <h3>{product.name}</h3>

                  <strong>
                    ₹{price.toLocaleString("en-IN")}
                  </strong>

                  <p className={
                    product.stock_quantity > 0
                      ? "wishlist-in-stock"
                      : "wishlist-out-stock"
                  }>
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} available`
                      : "Out of stock"}
                  </p>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="wishlist-cart-button"
                      onClick={() => handleMoveToCart(item.id)}
                      disabled={
                        busyItem === item.id ||
                        product.stock_quantity <= 0
                      }
                    >
                      <ShoppingCart size={16} />
                      Move to Cart
                    </button>

                    <button
                      type="button"
                      className="wishlist-remove-button"
                      onClick={() => handleRemove(item.id)}
                      disabled={busyItem === item.id}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
