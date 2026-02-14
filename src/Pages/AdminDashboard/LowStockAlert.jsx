import { useEffect, useState } from "react";
import { getLowStockProducts } from "../../services/api";

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLowStockProducts = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getLowStockProducts(token, 10);
        setLowStockProducts(response.data || []);
      } catch (err) {
        setError("Unable to load low stock products");
      } finally {
        setIsLoading(false);
      }
    };

    loadLowStockProducts();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: "16px", textAlign: "center" }}>Loading...</div>
    );
  }

  if (error) {
    return <div style={{ padding: "16px", color: "#dc2626" }}>{error}</div>;
  }

  return (
    <div
      style={{
        background: "#fff5f5",
        border: "1px solid #feb2b2",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          color: "#742a2a",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        ⚠️ Low Stock Alert ({lowStockProducts.length})
      </h3>
      {lowStockProducts.length === 0 ? (
        <p style={{ margin: "0", color: "#92400e" }}>
          All products have sufficient stock!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {lowStockProducts.map((product) => (
            <div
              key={product._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #fed7d7",
              }}
            >
              <div>
                <div style={{ fontWeight: "500", color: "#742a2a" }}>
                  {product.title}
                </div>
                <div style={{ fontSize: "12px", color: "#92400e" }}>
                  Category: {product.category}
                </div>
              </div>
              <div
                style={{
                  background: "#fecaca",
                  color: "#742a2a",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  fontSize: "12px",
                }}
              >
                {product.stock} left
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
