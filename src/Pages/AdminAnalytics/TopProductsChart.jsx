import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getTopProducts } from "../../services/api";

const TopProductsChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getTopProducts(token, 10);
        setData(response.data || []);
      } catch (err) {
        setError("Unable to load top products");
      } finally {
        setIsLoading(false);
      }
    };

    loadTopProducts();
  }, []);

  if (isLoading) return <div style={{ padding: "20px" }}>Loading chart...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "#dc2626" }}>{error}</div>;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
        Top 10 Products by Sales
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#64748b" />
          <YAxis
            dataKey="title"
            type="category"
            width={150}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="totalSold" fill="#10b981" name="Units Sold" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
