import { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import { getAnalyticsSummary } from "../../services/api";
import RevenueChart from "./RevenueChart";
import TopProductsChart from "./TopProductsChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import "../AdminShared/styles.css";
import "./styles.css";

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  useEffect(() => {
    const loadAnalyticsSummary = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getAnalyticsSummary(token, 30);
        setSummary(response.data);
      } catch (err) {
        setError("Unable to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsSummary();
  }, []);

  return (
    <Layout>
      <div className="admin-page">
        <AdminNav />
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Analytics</h1>
            <p className="admin-page-subtitle">
              Performance metrics and sales insights for your business.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="admin-loading-state">Loading analytics...</div>
        ) : error ? (
          <div className="admin-error-state">{error}</div>
        ) : summary ? (
          <>
            <section className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-label">Total Revenue</div>
                <div className="analytics-value">
                  {currencyFormatter.format(summary.totalRevenue)}
                </div>
                <div className="analytics-meta">
                  {summary.revenueGrowth > 0 ? "📈" : "📉"}{" "}
                  {summary.revenueGrowth}% vs previous period
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-label">Total Orders</div>
                <div className="analytics-value">{summary.totalOrders}</div>
                <div className="analytics-meta">{summary.period}</div>
              </div>

              <div className="analytics-card">
                <div className="analytics-label">Avg Order Value</div>
                <div className="analytics-value">
                  {currencyFormatter.format(summary.averageOrderValue)}
                </div>
                <div className="analytics-meta">Per transaction</div>
              </div>

              <div className="analytics-card">
                <div className="analytics-label">Products Sold</div>
                <div className="analytics-value">
                  {summary.totalProductsSold}
                </div>
                <div className="analytics-meta">Total units</div>
              </div>
            </section>

            <section className="analytics-charts">
              <RevenueChart />
              <TopProductsChart />
              <CategoryBreakdownChart />
            </section>
          </>
        ) : (
          <div className="admin-empty-state">No analytics data available</div>
        )}
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
