
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import { getMyOrders } from "../api/orderApi";
import "./MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <div className="my-orders-status">Loading your orders...</div>;
  }

  if (error) {
    return <div className="my-orders-status my-orders-error">{error}</div>;
  }

  return (
    <main className="my-orders-page">
      <h1>My Orders</h1>
      <p className="my-orders-subtitle">
        View and track your ShopEase purchases.
      </p>

      {orders.length === 0 ? (
        <div className="my-orders-empty">
          <Package size={55} />
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
          <Link to="/">
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <article className="my-order-card" key={order.id}>
              <div className="my-order-header">
                <div>
                  <span>Order Number</span>
                  <strong>{order.order_number}</strong>
                </div>

                <span className={`my-order-status status-${order.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}>
                  {order.status}
                </span>
              </div>

              <div className="my-order-meta">
                <span>
                  Date: {new Date(order.created_at).toLocaleDateString("en-IN")}
                </span>
                <span>Payment: {order.payment_method}</span>
                <span>Payment Status: {order.payment_status}</span>
              </div>

              <div className="my-order-items">
                {order.items?.map((item) => (
                  <div className="my-order-item" key={item.id}>
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} />
                    ) : (
                      <div className="my-order-placeholder">
                        <Package size={25} />
                      </div>
                    )}

                    <div>
                      <strong>{item.product_name}</strong>
                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <strong>
                      ₹{(
                        Number(item.unit_price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="my-order-total">
                <span>Total Amount</span>
                <strong>
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
