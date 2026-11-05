
import { useEffect, useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../../api/axios";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../api/adminApi";

import "./AdminOrders.css";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setError("");
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId);

    if (!order || order.status === newStatus) return;

    if (
      order.status === "Cancelled" ||
      order.status === "Delivered"
    ) {
      setError(
        "Cancelled or delivered orders cannot be changed."
      );
      return;
    }

    try {
      setUpdatingOrder(orderId);
      setError("");
      setSuccess("");

      const updatedOrder = await updateAdminOrderStatus(
        orderId,
        newStatus
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.id === orderId ? updatedOrder : item
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      setSuccess(
        `Order ${updatedOrder.order_number} updated to ${newStatus}.`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchText) ||
      order.customer_name?.toLowerCase().includes(searchText) ||
      order.email?.toLowerCase().includes(searchText) ||
      order.phone?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusClass = (status) =>
    `admin-order-status status-${status
      .toLowerCase()
      .replaceAll(" ", "-")}`;

  if (loading) {
    return (
      <div className="admin-orders-loading">
        Loading customer orders...
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-page-heading admin-orders-heading">
        <div>
          <h1>Order Management</h1>
          <p>View and manage all customer orders.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchOrders}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">{error}</div>
      )}

      {success && (
        <div className="admin-success">{success}</div>
      )}

      <div className="admin-order-summary">
        <div>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <span>Pending Orders</span>
          <strong>
            {orders.filter((o) => o.status === "Pending").length}
          </strong>
        </div>

        <div>
          <span>Delivered Orders</span>
          <strong>
            {orders.filter((o) => o.status === "Delivered").length}
          </strong>
        </div>

        <div>
          <span>Cancelled Orders</span>
          <strong>
            {orders.filter((o) => o.status === "Cancelled").length}
          </strong>
        </div>
      </div>

      <div className="admin-order-toolbar">
        <div className="admin-order-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search order number, customer, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <p className="admin-order-results">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      <div className="admin-orders-table-wrapper">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-orders-empty">
                  <Package size={30} />
                  <p>No orders found.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const locked =
                  order.status === "Delivered" ||
                  order.status === "Cancelled";

                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>

                    <td>
                      <div className="admin-order-customer">
                        <strong>{order.customer_name}</strong>
                        <small>{order.email}</small>
                      </div>
                    </td>

                    <td>{formatDate(order.created_at)}</td>

                    <td>
                      <strong>
                        {formatPrice(order.total_amount)}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-payment-label">
                        {order.payment_method}
                      </span>
                      <small className="admin-payment-status">
                        {order.payment_status}
                      </small>
                    </td>

                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="admin-order-status-select"
                        value={order.status}
                        disabled={
                          locked || updatingOrder === order.id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value
                          )
                        }
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        className="admin-view-order-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-modal admin-order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-order-modal-header">
              <div>
                <h2>Order Details</h2>
                <p>{selectedOrder.order_number}</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={21} />
              </button>
            </div>

            <div className="admin-order-detail-grid">
              <div>
                <h3>Customer</h3>
                <p>{selectedOrder.customer_name}</p>
                <p>{selectedOrder.email}</p>
                <p>{selectedOrder.phone}</p>
              </div>

              <div>
                <h3>Delivery Address</h3>
                <p>{selectedOrder.house_number}, {selectedOrder.street}</p>
                <p>
                  {selectedOrder.city}, {selectedOrder.state}
                </p>
                <p>PIN: {selectedOrder.pin_code}</p>
              </div>

              <div>
                <h3>Payment</h3>
                <p>Method: {selectedOrder.payment_method}</p>
                <p>Status: {selectedOrder.payment_status}</p>
              </div>

              <div>
                <h3>Order Status</h3>
                <span className={getStatusClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </span>
                <p>{formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>

            <h3 className="admin-order-items-heading">
              Ordered Products
            </h3>

            <div className="admin-order-items">
              {selectedOrder.items?.map((item) => (
                <div
                  className="admin-order-item"
                  key={item.id}
                >
                  {item.product_image ? (
                    <img
                      src={
                        item.product_image.startsWith("http")
                          ? item.product_image
                          : `${API_BASE_URL}${item.product_image}`
                      }
                      alt={item.product_name}
                    />
                  ) : (
                    <div className="admin-order-item-placeholder">
                      <Package size={24} />
                    </div>
                  )}

                  <div className="admin-order-item-info">
                    <strong>{item.product_name}</strong>
                    <span>Quantity: {item.quantity}</span>
                    <span>
                      Unit Price: {formatPrice(item.unit_price)}
                    </span>
                  </div>

                  <strong>
                    {formatPrice(
                      Number(item.unit_price) * item.quantity
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="admin-order-total">
              <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
              <p>
                Delivery: {formatPrice(selectedOrder.delivery_charge)}
              </p>
              <p>
                Discount: {formatPrice(selectedOrder.discount_amount)}
              </p>
              <h3>
                Total: {formatPrice(selectedOrder.total_amount)}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
