import { useContext, useState } from "react";
import { ShoppingCartContext } from "../../Context";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { totalPrice } from "../../utils";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import api, { authApi } from "../../services/api";
import { useToast } from "../../Components/Toast";
const CheckoutPage = () => {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [upiRef, setUpiRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const upiId = import.meta.env.VITE_UPI_ID || "krishcart@upi";

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[calc(100vh-80px)] py-10 px-4 bg-gray-50">
        <div className="flex items-center w-full max-w-5xl mb-8">
          <button
            className="mr-4"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeftIcon className="h-6 w-6 text-black cursor-pointer" />
          </button>
          <h1 className="font-semibold text-2xl md:text-3xl">Checkout</h1>
        </div>
        {/* Main content side by side on desktop */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
          {/* Cart Summary (read-only) */}
          <div className="md:w-2/3 bg-white rounded-lg shadow p-6 flex flex-col mb-8 md:mb-0">
            <h2 className="font-medium text-lg mb-4">Your Items</h2>
            <div className="flex flex-col gap-4">
              {context.cartProducts.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Your cart is empty.
                </div>
              ) : (
                context.cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.title}</div>
                      <div className="text-gray-500 text-sm">
                        Rs.{product.price}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <span className="font-semibold text-xl">
                Total: Rs.{totalPrice(context.cartProducts)}
              </span>
            </div>
          </div>
          {/* Address & Payment Section */}
          <div className="md:w-1/3 bg-white rounded-lg shadow p-6 flex flex-col gap-6 min-w-[300px]">
            <h2 className="font-medium text-lg mb-2">Shipping Address</h2>
            <form className="flex flex-col gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Street"
                required
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="State"
                required
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="ZIP"
                required
                value={address.zip}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    zip: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Phone"
                value={address.phone}
                required
                onChange={(e) =>
                  setAddress({
                    ...address,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                className="border p-2 rounded"
              />
            </form>
            <h2 className="font-medium text-lg mb-2">Payment (UPI)</h2>
            <div className="text-sm text-gray-600">
              Pay to <span className="font-semibold text-black">{upiId}</span>
              <div className="text-xs text-gray-500">
                Click Pay Now to complete payment and place your order.
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
              <p className="text-[11px] font-semibold uppercase text-gray-400">
                Order summary
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-gray-700">
                  {address.name || "Name"}
                  {address.city ? `, ${address.city}` : ""}
                </p>
                <p className="text-gray-500">
                  {address.street || "Street"}
                  {address.state ? `, ${address.state}` : ""}
                  {address.zip ? ` ${address.zip}` : ""}
                </p>
                <p className="text-gray-500">{address.phone || "Phone"}</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Payment</span>
                  <span className="font-semibold text-gray-800">UPI</span>
                </div>
              </div>
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !address.name ||
                !address.street ||
                !address.city ||
                !address.state ||
                !address.zip ||
                !address.phone
              }
              onClick={async () => {
                if (context.cartProducts.length === 0) {
                  addToast({
                    title: "Cart is empty",
                    message: "Add at least one product before checkout.",
                    variant: "warning",
                  });
                  return;
                }
                if (!context.account || !context.account._id) {
                  addToast({
                    title: "Sign in required",
                    message: "Please sign in to place your order.",
                    variant: "error",
                  });
                  return;
                }
                try {
                  const token = localStorage.getItem("token");
                  const orderData = {
                    userId: context.account._id,
                    products: context.cartProducts,
                    totalPrice: totalPrice(context.cartProducts),
                    totalProducts: context.cartProducts.length,
                    date: new Date().toLocaleString(),
                    address,
                    paymentMethod: "upi",
                    paymentStatus: "paid",
                    paymentRef: upiRef,
                    paymentNotes: paymentNote,
                  };
                  await authApi.post("/order/create", orderData, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  addToast({
                    title: "Payment successful",
                    message: "Your order has been placed.",
                    variant: "success",
                  });
                  context.fetchUserOrders(context.account._id, token);
                  context.setCartProducts([]);
                } catch (err) {
                  addToast({
                    title: "Order failed",
                    message: err?.response?.data?.error || err.message,
                    variant: "error",
                  });
                }
              }}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
