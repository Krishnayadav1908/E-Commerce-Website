import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../../services/api";
import ProductForm from "./ProductForm";
import "../AdminShared/styles.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { status: "Out of Stock", color: "#ef4444", bg: "#fee2e2" };
    if (stock < 10)
      return { status: "Low Stock", color: "#ea580c", bg: "#ffedd5" };
    return { status: "In Stock", color: "#16a34a", bg: "#dcfce7" };
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await getAdminProducts(token);
      setProducts(response.data || []);
    } catch (err) {
      setError("Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (formData) => {
    try {
      setIsSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await createAdminProduct(token, {
        ...formData,
        id: Number(formData.id),
        price: Number(formData.price),
        stock: Number(formData.stock || 0),
      });
      setProducts((prev) => [response.data, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      setIsSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await updateAdminProduct(token, editingProduct._id, {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        stock: Number(formData.stock || 0),
        description: formData.description,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? response.data : p)),
      );
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setError("");
      const token = localStorage.getItem("token");
      await deleteAdminProduct(token, productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter((product) => {
      return (
        product.title?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        String(product.price || "").includes(term)
      );
    });
  }, [products, search]);

  return (
    <Layout>
      <div className="admin-page">
        <AdminNav />
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Products</h1>
            <p className="admin-page-subtitle">
              Monitor catalog inventory and pricing.
            </p>
          </div>
          <input
            className="admin-search"
            placeholder="Search by title, category, price"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>

        <div style={{ marginBottom: "20px" }}>
          {showForm ? (
            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "10px 20px",
                background: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              + Add Product
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="admin-loading-state">Loading products...</div>
        ) : (
          <>
            {error && <div className="admin-error-state">{error}</div>}
            {filteredProducts.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id || product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="admin-product-image"
                          />
                          <div>
                            <div>{product.title}</div>
                            <div className="admin-row-muted">
                              {product.description?.slice(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{product.category}</div>
                      </td>
                      <td>
                        <div>₹{product.price}</div>
                      </td>
                      <td>
                        <div>
                          {(() => {
                            const stockStatus = getStockStatus(product.stock);
                            return (
                              <div
                                style={{
                                  background: stockStatus.bg,
                                  color: stockStatus.color,
                                  padding: "4px 12px",
                                  borderRadius: "4px",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {stockStatus.status} ({product.stock})
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id || product.id)
                            }
                            style={{
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No products found.</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminProducts;
