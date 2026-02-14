import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import {
  getAdminStats,
  getAdminUsers,
  getAdminProducts,
} from "../../services/api";
import LowStockAlert from "./LowStockAlert";
import "../AdminShared/styles.css";
import "./styles.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
    [],
  );

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const [statsRes, usersRes, productsRes] = await Promise.all([
          getAdminStats(token),
          getAdminUsers(token),
          getAdminProducts(token),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        setError("Unable to load admin dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const topUsers = users.slice(0, 5);
  const topProducts = products.slice(0, 5);

  return (
    <Layout>
      <div className="admin-shell">
        <AdminNav />
        <section className="admin-hero">
          <div className="admin-hero-content">
            <span className="admin-chip">ADMIN CONSOLE</span>
            <h1 className="admin-title">Control Room</h1>
            <p className="admin-subtitle">
              Track sales, manage inventory, and monitor growth in real time.
            </p>
          </div>
          <div className="admin-hero-panel">
            <div className="admin-hero-metric">
              <span className="admin-label">Total Revenue</span>
              <span className="admin-value">
                {currencyFormatter.format(stats?.totalRevenue || 0)}
              </span>
            </div>
            <div className="admin-hero-metric">
              <span className="admin-label">Total Orders</span>
              <span className="admin-value">{stats?.ordersCount || 0}</span>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="admin-panel admin-loading">Loading dashboard...</div>
        ) : error ? (
          <div className="admin-panel admin-error">{error}</div>
        ) : (
          <>
            <LowStockAlert />

            <section className="admin-grid">
              <div className="admin-panel">
                <p className="admin-label">Users</p>
                <h3 className="admin-stat">{stats?.usersCount || 0}</h3>
                <p className="admin-muted">Active accounts onboarded</p>
              </div>
              <div className="admin-panel">
                <p className="admin-label">Orders</p>
                <h3 className="admin-stat">{stats?.ordersCount || 0}</h3>
                <p className="admin-muted">Orders processed to date</p>
              </div>
              <div className="admin-panel">
                <p className="admin-label">Products</p>
                <h3 className="admin-stat">{stats?.productsCount || 0}</h3>
                <p className="admin-muted">Live items in catalog</p>
              </div>
              <div className="admin-panel">
                <p className="admin-label">Revenue</p>
                <h3 className="admin-stat">
                  {currencyFormatter.format(stats?.totalRevenue || 0)}
                </h3>
                <p className="admin-muted">All time gross sales</p>
              </div>
            </section>

            <section className="admin-panels">
              <div className="admin-panel admin-table">
                <div className="admin-table-header">
                  <div>
                    <h2 className="admin-section-title">Recent Orders</h2>
                    <p className="admin-muted">Last 5 purchases</p>
                  </div>
                </div>
                <div className="admin-table-body">
                  {stats?.recentOrders?.length ? (
                    stats.recentOrders.map((order) => (
                      <div key={order._id} className="admin-row">
                        <div>
                          <p className="admin-row-title">
                            #{order._id.slice(-6)}
                          </p>
                          <p className="admin-muted">
                            {order.userId?.name || "Guest"}
                          </p>
                        </div>
                        <div>
                          <p className="admin-row-title">
                            {currencyFormatter.format(order.totalPrice || 0)}
                          </p>
                          <p className="admin-muted">{order.status}</p>
                        </div>
                        <div className="admin-row-date">{order.date}</div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-empty">No recent orders yet.</div>
                  )}
                </div>
              </div>

              <div className="admin-panel admin-side">
                <div className="admin-side-block">
                  <h2 className="admin-section-title">Top Users</h2>
                  <div className="admin-list">
                    {topUsers.length ? (
                      topUsers.map((user) => (
                        <div key={user._id} className="admin-list-item">
                          <div>
                            <p className="admin-row-title">{user.name}</p>
                            <p className="admin-muted">{user.email}</p>
                          </div>
                          <span className="admin-pill">{user.role}</span>
                        </div>
                      ))
                    ) : (
                      <div className="admin-empty">No users found.</div>
                    )}
                  </div>
                </div>

                <div className="admin-side-block">
                  <h2 className="admin-section-title">Inventory Pulse</h2>
                  <div className="admin-list">
                    {topProducts.length ? (
                      topProducts.map((product) => (
                        <div
                          key={product._id || product.id}
                          className="admin-list-item"
                        >
                          <div>
                            <p className="admin-row-title">{product.title}</p>
                            <p className="admin-muted">{product.category}</p>
                          </div>
                          <span className="admin-pill">
                            {currencyFormatter.format(product.price || 0)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="admin-empty">No products found.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
