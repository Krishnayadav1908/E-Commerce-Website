import { useContext } from "react";
import { ShoppingCartContext } from "../../Context";
import { useNavigate } from "react-router-dom";
import StripePayment from "../../Components/StripePayment/stripepayment";
import Layout from "../../Components/Layout";
import { totalPrice } from "../../utils";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

const CheckoutPage = () => {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();

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
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Summary (read-only) */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col">
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
          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-6 min-w-[300px]">
            <h2 className="font-medium text-lg mb-2">Payment</h2>
            <StripePayment amount={totalPrice(context.cartProducts)} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
