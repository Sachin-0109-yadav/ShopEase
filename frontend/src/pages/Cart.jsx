
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  LoaderCircle,
} from "lucide-react";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cartApi";

import "./Cart.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    total_items: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setError("");
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your shopping cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    if (
      newQuantity < 1 ||
      newQuantity > item.product.stock_quantity
    ) {
      return;
    }

    try {
      setBusyItem(item.id);
      setError("");
      setMessage("");

      const updatedCart = await updateCartItem(
        item.id,
        newQuantity
      );

      setCart(updatedCart);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update quantity."
      );
    } finally {
      setBusyItem(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setBusyItem(itemId);
      setError("");
      setMessage("");

      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
      setMessage("Product removed from your cart.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to remove product."
      );
    } finally {
      setBusyItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const updatedCart = await clearCart();
      setCart(updatedCart);
      setMessage("Your cart has been cleared.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to clear your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <LoaderCircle className="cart-spinner" size={32} />
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-heading">
          <div>
            <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
            <h1>Shopping Cart</h1>
            <p>{cart.total_items} item(s) in your cart</p>
          </div>

          <ShoppingBag size={38} />
        </div>

        {error && (
          <div className="cart-message cart-error">
            {error}
          </div>
        )}

        {message && (
          <div className="cart-message cart-success">
            {message}
          </div>
        )}

        {cart.items.length === 0 ? (
          <section className="cart-empty">
            <ShoppingCart size={65} />
            <h2>Your cart is empty</h2>
            <p>
              Looks like you haven't added any products yet.
            </p>

            <Link to="/" className="cart-shop-button">
              Continue Shopping
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-heading">
                <h2>Your Items</h2>

                <button
                  className="cart-clear-button"
                  onClick={handleClearCart}
                  disabled={busyItem !== null}
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>

              {cart.items.map((item) => {
                const product = item.product;
                const unitPrice =
                  product.discount_price ?? product.price;

                return (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-product-image">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                        />
                      ) : (
                        <ShoppingBag size={35} />
                      )}
                    </div>

                    <div className="cart-product-details">
                      <h3>{product.name}</h3>

                      <p className="cart-product-price">
                        {formatPrice(unitPrice)}
                      </p>

                      {Number(product.discount_price) > 0 && (
                        <p className="cart-original-price">
                          {formatPrice(product.price)}
                        </p>
                      )}

                      <p className="cart-stock">
                        {product.stock_quantity} available
                      </p>

                      <div className="cart-quantity">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            busyItem !== null ||
                            item.quantity <= 1
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            busyItem !== null ||
                            item.quantity >=
                              product.stock_quantity
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <strong>
                        {formatPrice(item.line_total)}
                      </strong>

                      <button
                        className="cart-remove-button"
                        onClick={() => handleRemove(item.id)}
                        disabled={busyItem !== null}
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{cart.total_items}</span>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>Free</span>
              </div>

              <div className="cart-summary-total">
                <span>Subtotal</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
                disabled={cart.items.length === 0}
              >
                Proceed to Checkout
              </button>

              <Link to="/" className="cart-continue-link">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
