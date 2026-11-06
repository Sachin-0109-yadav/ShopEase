
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  LoaderCircle,
  ArrowLeft,
  ShieldCheck,
  Truck,
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
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setError("");
      const data = await getCart();

      setCart({
        items: data.items || [],
        subtotal: Number(data.subtotal || 0),
        total_items: Number(data.total_items || 0),
      });
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
          "Unable to update product quantity."
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
    if (
      !window.confirm(
        "Are you sure you want to clear your shopping cart?"
      )
    ) {
      return;
    }

    try {
      setClearing(true);
      setError("");
      setMessage("");

      const updatedCart = await clearCart();

      setCart(updatedCart);
      setMessage("Your shopping cart has been cleared.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to clear your cart."
      );
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <LoaderCircle
          className="cart-spinner"
          size={35}
        />
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">

        {/* Page Heading */}
        <div className="cart-heading">
          <div>
            <p className="cart-eyebrow">
              YOUR SHOPPING BAG
            </p>

            <h1>Shopping Cart</h1>

            <p>
              {cart.total_items} item(s) in your cart
            </p>
          </div>

          <ShoppingBag size={38} />
        </div>

        {/* Messages */}
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

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <section className="cart-empty">
            <ShoppingCart size={65} />

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added any
              products yet.
            </p>

            <Link
              to="/"
              className="cart-shop-button"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
          </section>
        ) : (

          <div className="cart-layout">

            {/* Cart Products */}
            <section className="cart-items-section">

              <div className="cart-items-heading">
                <h2>Your Items</h2>

                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={handleClearCart}
                  disabled={
                    busyItem !== null || clearing
                  }
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>

              {cart.items.map((item) => {
                const product = item.product;

                const unitPrice =
                  product.discount_price ??
                  product.price;

                const isBusy = busyItem === item.id;

                return (
                  <article
                    className="cart-item"
                    key={item.id}
                  >

                    {/* Product Image */}
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

                    {/* Product Details */}
                    <div className="cart-product-details">

                      <h3>{product.name}</h3>

                      <p className="cart-product-price">
                        {formatPrice(unitPrice)}
                      </p>

                      {product.discount_price != null &&
                        Number(product.discount_price) > 0 && (
                          <p className="cart-original-price">
                            {formatPrice(product.price)}
                          </p>
                        )}

                      <p className="cart-stock">
                        {product.stock_quantity} available
                      </p>

                      {/* Quantity Controls */}
                      <div className="cart-quantity">

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            busyItem !== null ||
                            clearing ||
                            item.quantity <= 1
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            busyItem !== null ||
                            clearing ||
                            item.quantity >=
                              product.stock_quantity
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>

                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="cart-item-right">

                      <strong>
                        {formatPrice(item.line_total)}
                      </strong>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() =>
                          handleRemove(item.id)
                        }
                        disabled={
                          busyItem !== null || clearing
                        }
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>

                      {isBusy && (
                        <span className="cart-item-updating">
                          Updating...
                        </span>
                      )}

                    </div>
                  </article>
                );
              })}

              <Link
                to="/"
                className="cart-back-shopping"
              >
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>

            </section>

            {/* Order Summary */}
            <aside className="cart-summary">

              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{cart.total_items}</span>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>
                  {formatPrice(cart.subtotal)}
                </span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span className="cart-free">
                  FREE
                </span>
              </div>

              <div className="cart-summary-total">
                <span>Total Amount</span>

                <strong>
                  {formatPrice(cart.subtotal)}
                </strong>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
                disabled={
                  cart.items.length === 0 ||
                  clearing ||
                  busyItem !== null
                }
              >
                Proceed to Checkout
              </button>

              <div className="cart-trust-info">

                <div>
                  <ShieldCheck size={19} />
                  <span>Secure Checkout</span>
                </div>

                <div>
                  <Truck size={19} />
                  <span>Free Delivery</span>
                </div>

              </div>

            </aside>
          </div>
        )}

      </div>
    </main>
  );
}
