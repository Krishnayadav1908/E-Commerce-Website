import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCategoryBreakdown } from "../../services/api";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const CategoryBreakdownChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategoryBreakdown = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getCategoryBreakdown(token);
        // Transform data for pie chart
        const transformed = (response.data || []).map((item) => ({
          name: item._id || "Unknown",
          value: item.totalRevenue,
          units: item.totalSold,
        }));
        setData(transformed);
      } catch (err) {
        setError("Unable to load category breakdown");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryBreakdown();
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
        Sales by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${value}`}
            contentStyle={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdownChart;
