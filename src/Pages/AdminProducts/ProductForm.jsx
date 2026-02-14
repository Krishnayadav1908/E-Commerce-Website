import { useState } from "react";

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    product || {
      id: "",
      title: "",
      price: "",
      category: "",
      image: "",
      stock: "0",
      description: "",
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.95)",
        borderRadius: "16px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
        {product ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <input
            type="number"
            name="id"
            placeholder="Product ID"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={!!product}
            style={{
              padding: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: "8px",
            }}
          />
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: "8px",
            }}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            style={{
              padding: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: "8px",
            }}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: "8px",
            }}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            style={{
              padding: "10px",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: "8px",
            }}
          />
        </div>

        <textarea
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          required
          rows="2"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid rgba(148,163,184,0.4)",
            borderRadius: "8px",
            marginTop: "12px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid rgba(148,163,184,0.4)",
            borderRadius: "8px",
            marginTop: "12px",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : product ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              background: "#e2e8f0",
              color: "#0f172a",
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
