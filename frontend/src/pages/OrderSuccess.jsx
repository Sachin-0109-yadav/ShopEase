
import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="order-success-page">
      <div className="order-success-card">
        <CheckCircle size={65} className="success-icon" />

        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for shopping with ShopEase.
          Your order has been received.
        </p>

        <div className="success-order-number">
          <span>Order Number</span>
          <strong>{order.order_number}</strong>
        </div>

        <div className="success-section">
          <h2><Package size={20} /> Order Details</h2>

          {order.items?.map((item) => (
            <div className="success-item" key={item.id}>
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <strong>
                ₹{(
                  Number(item.unit_price) * item.quantity
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}

          <div className="success-total">
            <span>Total Amount</span>
            <strong>
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="success-section">
          <h2>Delivery Address</h2>
          <p>{order.customer_name}</p>
          <p>{order.phone}</p>
          <p>
            {order.house_number}, {order.street},
            {" "}{order.city}, {order.state} - {order.pin_code}
          </p>
        </div>

        <div className="success-payment">
          Payment Method: <strong>Cash on Delivery</strong>
        </div>

        <div className="success-actions">
          <Link to="/" className="success-shop-button">
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
