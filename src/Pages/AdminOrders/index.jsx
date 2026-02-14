import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "../../services/api";
import "../AdminShared/styles.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [updatingPaymentId, setUpdatingPaymentId] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getAdminOrders(token);
        setOrders(response.data || []);
      } catch (err) {
        setError("Unable to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      const order = orders.find((item) => item._id === orderId);
      const previousStatus = order?.status || "pending";
      if (previousStatus === status) {
        return;
      }

      const confirmed = window.confirm(
        `Change order status from ${previousStatus} to ${status}?`,
      );
      if (!confirmed) {
        return;
      }

      setUpdatingOrderId(orderId);
      setError("");
      const token = localStorage.getItem("token");
      const response = await updateAdminOrderStatus(token, orderId, status);
      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
    } catch (err) {
      setError("Unable to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      const order = orders.find((item) => item._id === orderId);
      const previousStatus = order?.paymentStatus || "pending";
      if (previousStatus === paymentStatus) {
        return;
      }

      const confirmed = window.confirm(
        `Change payment status from ${previousStatus} to ${paymentStatus}?`,
      );
      if (!confirmed) {
        return;
      }

      setUpdatingPaymentId(orderId);
      setError("");
      const token = localStorage.getItem("token");
      const response = await updateAdminPaymentStatus(
        token,
        orderId,
        paymentStatus,
      );
      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
    } catch (err) {
      setError("Unable to update payment status.");
    } finally {
      setUpdatingPaymentId("");
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const term = search.toLowerCase();
    return orders.filter((order) => {
      const userName = order.userId?.name || "";
      const userEmail = order.userId?.email || "";
      return (
        order._id?.toLowerCase().includes(term) ||
        userName.toLowerCase().includes(term) ||
        userEmail.toLowerCase().includes(term) ||
        order.status?.toLowerCase().includes(term) ||
        order.paymentStatus?.toLowerCase().includes(term) ||
        order.paymentRef?.toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  return (
    <Layout>
      <div className="admin-page">
        <AdminNav />
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-subtitle">
              Review and monitor purchase activity.
            </p>
          </div>
          <input
            className="admin-search"
            placeholder="Search by order id, user, status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>

        {isLoading ? (
          <div className="admin-loading-state">Loading orders...</div>
        ) : (
          <>
            {error && <div className="admin-error-state">{error}</div>}
            {filteredOrders.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>User</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Txn</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div>#{order._id.slice(-6)}</div>
                        <div className="admin-row-muted">{order._id}</div>
                      </td>
                      <td>
                        <div>{order.userId?.name || "Guest"}</div>
                        <div className="admin-row-muted">
                          {order.userId?.email || "-"}
                        </div>
                      </td>
                      <td>
                        <div>
                          {order.totalProducts || order.products?.length || 0}
                        </div>
                      </td>
                      <td>
                        <div>{order.totalPrice}</div>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={order.paymentStatus || "pending"}
                          disabled={updatingPaymentId === order._id}
                          onChange={(event) =>
                            handlePaymentStatusChange(
                              order._id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <div>{order.paymentRef || "-"}</div>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={order.status || "pending"}
                          disabled={updatingOrderId === order._id}
                          onChange={(event) =>
                            handleStatusChange(order._id, event.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div>{order.date || "-"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No orders found.</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
