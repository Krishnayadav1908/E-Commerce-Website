import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getRevenueTrend } from "../../services/api";

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRevenueTrend = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getRevenueTrend(token, 30);
        setData(response.data || []);
      } catch (err) {
        setError("Unable to load revenue trend");
      } finally {
        setIsLoading(false);
      }
    };

    loadRevenueTrend();
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
        Revenue Trend (30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="_id" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
            formatter={(value) => `₹${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
