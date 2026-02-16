import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../Components/Layout";
import { ShoppingCartContext } from "../../Context";

function OrderDetail() {
  const { index } = useParams();
  const context = useContext(ShoppingCartContext);
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadOrdersIfNeeded = async () => {
      if (context.order && context.order.length > 0) {
        if (isActive) setIsFetching(false);
        return;
      }

      if (!context.isUserAuthenticated) {
        if (isActive) setIsFetching(false);
        return;
      }

      const token = localStorage.getItem("token");
      const storedAccount = localStorage.getItem("account");
      const parsedAccount = storedAccount ? JSON.parse(storedAccount) : null;
      const userId = context?.account?._id || parsedAccount?._id;

      if (userId && token) {
        await context.fetchUserOrders(userId, token);
      }

      if (isActive) setIsFetching(false);
    };

    loadOrdersIfNeeded();

    return () => {
      isActive = false;
    };
  }, [
    context.order,
    context.account?._id,
    context.isUserAuthenticated,
    context.fetchUserOrders,
  ]);

  useEffect(() => {
    if (context.order && context.order.length > 0) {
      const orderIndex = Number(index);
      const selectedOrder = Number.isFinite(orderIndex)
        ? context.order[orderIndex]
        : null;
      setOrder(selectedOrder || null);
    } else {
      setOrder(null);
    }
  }, [context.order, index]);

  if (isFetching) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
          <h1 className="font-medium text-xl mb-4">Order Details</h1>
          <p className="text-gray-500">Loading order...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
          <h1 className="font-medium text-xl mb-4">Order Details</h1>
          <p className="text-gray-500">Order not found.</p>
        </div>
      </Layout>
    );
  }

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const storedAccount = localStorage.getItem("account");
      const parsedAccount = storedAccount ? JSON.parse(storedAccount) : null;
      const userId = context?.account?._id || parsedAccount?._id || "";
      const token = localStorage.getItem("token");

      const query = userId ? `?userId=${userId}` : "";
      const response = await fetch(`/api/order/${order?._id}/invoice${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order?._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      context?.showToast?.("Invoice downloaded successfully", "success");
    } catch (error) {
      console.error("Invoice download error:", error);
      context?.showToast?.("Failed to download invoice", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="flex w-full max-w-2xl items-center justify-between mb-4">
          <h1 className="font-medium text-xl">Order Details</h1>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-gray-400"
          >
            {downloading ? "Downloading..." : "Download Invoice"}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
          <div className="mb-4">
            <span className="font-semibold">Order Date:</span> {order.date}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Total Products:</span>{" "}
            {order.totalProducts}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Total Price:</span> Rs.
            {order.totalPrice}
          </div>
          <h2 className="font-medium text-lg mb-2">Products</h2>
          <ul className="divide-y divide-gray-200">
            {order.products.map((product, idx) => (
              <li
                key={product._id || idx}
                className="py-2 flex items-center gap-4"
              >
                <img
                  src={product.image || product.images}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{product.title}</div>
                  <div className="text-gray-500 text-sm">
                    Rs.{product.price}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default OrderDetail;
