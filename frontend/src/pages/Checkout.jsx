
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../api/orderApi";
import { getCart } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: user?.full_name || "",
    phone: user?.phone || "",
    house_number: "",
    street: "",
    city: "",
    state: "",
    pin_code: "",
    payment_method: "COD",
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "phone") {
      setForm((previous) => ({
        ...previous,
        phone: value.replace(/\D/g, "").slice(0, 15),
      }));
      return;
    }

    if (name === "pin_code") {
      setForm((previous) => ({
        ...previous,
        pin_code: value.replace(/\D/g, "").slice(0, 6),
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (placing) return;

    setError("");

    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      return;
    }

    if (form.customer_name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(form.phone)) {
      setError("Please enter a valid phone number with 10 to 15 digits.");
      return;
    }

    if (!form.house_number.trim()) {
      setError("Please enter your house or flat number.");
      return;
    }

    if (form.street.trim().length < 2) {
      setError("Please enter a valid street or locality.");
      return;
    }

    if (form.city.trim().length < 2) {
      setError("Please enter a valid city.");
      return;
    }

    if (form.state.trim().length < 2) {
      setError("Please enter a valid state.");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pin_code)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (form.payment_method !== "COD") {
      setError("Only Cash on Delivery is currently supported.");
      return;
    }

    try {
      setPlacing(true);

      const orderData = {
        customer_name: form.customer_name.trim(),
        phone: form.phone,
        house_number: form.house_number.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pin_code: form.pin_code,
        payment_method: "COD",
      };

      const order = await placeOrder(orderData);

      navigate("/order-success", {
        state: { order },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-status">
        Loading checkout...
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="checkout-status">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      <p className="checkout-subtitle">
        Enter your delivery details to place your order.
      </p>

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>Delivery Address</h2>

          <label htmlFor="customer_name">Full Name</label>
          <input
            id="customer_name"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            maxLength={15}
            inputMode="numeric"
            autoComplete="tel"
          />

          <label htmlFor="house_number">House / Flat Number</label>
          <input
            id="house_number"
            name="house_number"
            value={form.house_number}
            onChange={handleChange}
            required
            maxLength={100}
            autoComplete="address-line1"
          />

          <label htmlFor="street">Street / Locality</label>
          <input
            id="street"
            name="street"
            value={form.street}
            onChange={handleChange}
            required
            maxLength={200}
            autoComplete="address-line2"
          />

          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            maxLength={100}
            autoComplete="address-level2"
          />

          <label htmlFor="state">State</label>
          <input
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            maxLength={100}
            autoComplete="address-level1"
          />

          <label htmlFor="pin_code">PIN Code</label>
          <input
            id="pin_code"
            name="pin_code"
            value={form.pin_code}
            onChange={handleChange}
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="postal-code"
            title="Enter a valid 6-digit PIN code"
          />

          <h2>Payment Method</h2>

          <div className="checkout-payment-option">
            <input
              id="payment_cod"
              type="radio"
              name="payment_method"
              value="COD"
              checked={form.payment_method === "COD"}
              onChange={handleChange}
            />
            <label htmlFor="payment_cod">
              Cash on Delivery (COD)
            </label>
          </div>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={placing}
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <section className="checkout-summary">
          <h2>Order Summary</h2>

          {cart.items.map((item) => (
            <div className="checkout-item" key={item.id}>
              <div>
                <strong>{item.product.name}</strong>
                <p>Quantity: {item.quantity}</p>
              </div>

              <span>
                ₹{Number(item.line_total).toLocaleString("en-IN")}
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <span>Subtotal</span>
            <strong>
              ₹{Number(cart.subtotal).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="checkout-total">
            <span>Delivery</span>
            <strong>FREE</strong>
          </div>

          <div className="checkout-grand-total">
            <span>Total</span>
            <strong>
              ₹{Number(cart.subtotal).toLocaleString("en-IN")}
            </strong>
          </div>

          <p className="checkout-cod-note">
            Payment will be collected when your order is delivered.
          </p>
        </section>
      </div>
    </main>
  );
}
