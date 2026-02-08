import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { ShoppingCartContext } from "../../Context";
import OrderCard from "../OrderCard";
import { totalPrice } from "../../utils";
import Layout from "../Layout";
import StripePayment from "../StripePayment/stripepayment";

const CartSummary = () => {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[calc(100vh-80px)] py-10 px-4 bg-gray-50">
        {/* Header */}
        <div className="flex items-center w-full max-w-5xl mb-8">
          <button
            className="mr-4"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeftIcon className="h-6 w-6 text-black cursor-pointer" />
          </button>
          <h1 className="font-semibold text-2xl md:text-3xl">Cart Summary</h1>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col">
            <h2 className="font-medium text-lg mb-4">Your Items</h2>
            <div className="flex flex-col gap-4">
              {context.cartProducts.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Your cart is empty.
                </div>
              ) : (
                context.cartProducts.map((product) => (
                  <OrderCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    imageUrl={product.image}
                    price={product.price}
                  />
                ))
              )}
            </div>
          </div>

          {/* Checkout Section */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-6 min-w-[300px]">
            <div>
              <h2 className="font-medium text-lg mb-2">Order Summary</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="font-light">Total:</span>
                <span className="font-semibold text-xl">
                  Rs.{totalPrice(context.cartProducts)}
                </span>
              </div>
            </div>
            {context.isUserAuthenticated ? (
              <button
                className="bg-black py-3 text-white w-full rounded-lg mb-2 hover:bg-gray-900 transition"
                onClick={() => navigate("/checkout")}
              >
                Pay Now
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  className="bg-black py-3 text-white w-full rounded-lg"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign In
                </button>
                <button
                  className="bg-white py-3 text-black border border-black w-full rounded-lg"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartSummary;
