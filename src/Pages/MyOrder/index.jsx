import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import { ShoppingCartContext } from "../../Context";
import Layout from "../../Components/Layout";
import OrderCard from "../../Components/OrderCard";

function MyOrder() {
  const context = useContext(ShoppingCartContext);
  const [downloading, setDownloading] = useState(false);
  const currentPath = window.location.pathname;
  let index = currentPath.substring(currentPath.lastIndexOf("/") + 1);
  if (index === "last") index = context.order?.length - 1;

  const currentOrder = context.order?.[index];
  const totalItems = currentOrder?.products.length || 0;
  const totalAmount =
    currentOrder?.products.reduce((sum, product) => sum + product.price, 0) ||
    0;

  console.log("Current Order:", currentOrder);
  console.log("Products in order:", currentOrder?.products);

  const normalizedStatus = (
    currentOrder?.paymentStatus ||
    currentOrder?.status ||
    "pending"
  ).toLowerCase();
  const isPaid = normalizedStatus === "paid" || normalizedStatus === "success";

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const storedAccount = localStorage.getItem("account");
      const parsedAccount = storedAccount ? JSON.parse(storedAccount) : null;
      const userId = context?.account?._id || parsedAccount?._id || "";
      const token = localStorage.getItem("token");

      const query = userId ? `?userId=${userId}` : "";
      const response = await fetch(
        `/api/order/${currentOrder?._id}/invoice${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${currentOrder?._id}.pdf`;
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
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/my-orders">
              <ChevronLeftIcon className="h-6 w-6 text-black cursor-pointer hover:text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {currentOrder?._id || index}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            {downloading ? "Downloading..." : "Invoice"}
          </button>
        </div>

        {/* Status & Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Status
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Date
            </p>
            <p className="font-medium text-gray-900">
              {currentOrder?.date
                ? new Date(currentOrder.date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Items
            </p>
            <p className="font-medium text-gray-900">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="space-y-4">
            {currentOrder?.products?.length ? (
              currentOrder.products.map((product) => (
                <OrderCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  imageUrl={product.image || product.imageUrl}
                  price={product.price}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No products in this order</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            {currentOrder?.address &&
            Object.keys(currentOrder.address).length > 0 ? (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {currentOrder.address.name}
                </p>
                <p>{currentOrder.address.street}</p>
                <p>
                  {currentOrder.address.city}, {currentOrder.address.state}{" "}
                  {currentOrder.address.zip}
                </p>
                <p>{currentOrder.address.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No address provided</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs.{totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs mb-3">
                <span>Base total</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-black to-teal-700 bg-clip-text text-transparent">
                  Rs.{currentOrder?.totalPrice || totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MyOrder;
