import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ShoppingCartContext } from "../../Context";
import { authApi } from "../../services/api";
import OrderCard from "../OrderCard";
import { totalPrice } from "../../utils";
import "./styles.css";
// StripePayment removed

const CheckoutSideMenu = () => {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();

  const handleDelete = (id) => {
    const filteredProducts = context.cartProducts.filter(
      (product) => product.id != id,
    );
    context.setCartProducts(filteredProducts);
  };

  const handleViewCart = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    context.closeCheckoutSideMenu();
    navigate("/cart-summary");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          context.isCheckoutSideMenuOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => context.closeCheckoutSideMenu()}
      />
      <aside
        className={`checkout-side-menu flex flex-col fixed right-0 border border-black rounded-lg bg-white
                w-full sm:w-[360px] h-[calc(100vh-68px)] top-[68px]
                transform transition-transform duration-300 ease-in-out
                ${context.isCheckoutSideMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6">
          <h2 className="font-medium text-xl">My Order</h2>
          <div>
            <XMarkIcon
              className="h-6 w-6 text-black-500 cursor-pointer"
              onClick={() => context.closeCheckoutSideMenu()}
            ></XMarkIcon>
          </div>
        </div>
        {/* Contenedor con scroll para productos */}
        <div className="flex-1 overflow-y-auto px-6">
          {context.cartProducts.map((product) => (
            <OrderCard
              key={product.id}
              id={product.id}
              title={product.title}
              imageUrl={product.image || product.images}
              price={product.price}
              handleDelete={handleDelete}
            />
          ))}
        </div>
        {/* Footer fijo con total y botón */}
        <div className="px-6 py-4 border-t border-gray-200 mt-auto">
          <p className="flex justify-between items-center mb-2">
            <span className="font-light">Total:</span>
            <span className="font-medium text-2xl">
              Rs.{totalPrice(context.cartProducts)}
            </span>
          </p>
          <button
            className="bg-black py-3 text-white w-full rounded-lg"
            onClick={handleViewCart}
          >
            View Cart
          </button>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-4 w-full"
            onClick={async () => {
              if (context.cartProducts.length === 0) {
                alert("Add a product to cart!");
                return;
              }
              if (!context.account || !context.account._id) {
                alert("User not logged in!");
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
                  address: {}, // No address in side menu
                };
                await authApi.post("/order/create", orderData, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                alert("Order placed successfully!");
                await context.fetchUserOrders(context.account._id, token);
                context.setCartProducts([]);
                context.closeCheckoutSideMenu();
              } catch (err) {
                alert(
                  "Order failed: " +
                    (err?.response?.data?.error || err.message),
                );
              }
            }}
          >
            Pay Now
          </button>
        </div>
      </aside>
    </>
  );
};

export default CheckoutSideMenu;
