import { useContext } from "react";
import {
  PlusIcon,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { ShoppingCartContext } from "../../Context";
import { useToast } from "../Toast";

const Card = ({ data }) => {
  const context = useContext(ShoppingCartContext);
  const { addToast } = useToast();

  const showProduct = () => {
    context.openProductDetail();
    context.setProductToShow(data);
  };

  const addProductsToCart = (event, productData) => {
    event.stopPropagation();
    if (productData?.stock === 0) {
      addToast({
        title: "Out of stock",
        message: "This item is currently unavailable.",
        variant: "warning",
      });
      return;
    }
    context.setCartProducts([...context.cartProducts, productData]);
    context.setCount(context.count + 1);
    context.openCheckoutSideMenu();
    context.closeProductDetail();
    addToast({
      title: "Added to cart",
      message: productData?.title || "Item added to your cart.",
      variant: "success",
    });
  };

  const toggleWishlist = (event, productData) => {
    event.stopPropagation();
    context.toggleWishlist(productData);
  };

  return (
    <div
      className="group bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-gray-100 hover:border-teal-200"
      onClick={showProduct}
    >
      {/* Image */}
      <figure className="relative h-56 w-full overflow-hidden rounded-t-2xl bg-gray-100">
        <span className="absolute bottom-3 left-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          {data.category}
        </span>

        {typeof data?.stock === "number" && (
          <span
            className={`absolute top-3 right-14 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
              data.stock === 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {data.stock === 0 ? "Out of stock" : "In stock"}
          </span>
        )}

        <img
          src={data.image}
          alt={data.title}
          loading="lazy"
          decoding="async"
          width={320}
          height={224}
          onError={(e) => {
            // Hide broken image and show gray background instead
            e.target.style.display = "none";
            e.target.parentElement.style.backgroundColor = "#e5e7eb";
          }}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <button
          className="absolute top-3 left-3 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-teal-700 hover:scale-110 hover:bg-white transition-all duration-300 shadow-lg"
          onClick={(event) => toggleWishlist(event, data)}
        >
          {context.isInWishlist(data.id) ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIconOutline className="h-5 w-5" />
          )}
        </button>

        <button
          className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-black to-teal-900 text-white hover:scale-110 hover:from-teal-600 hover:to-teal-500 transition-all duration-300 shadow-lg"
          onClick={(event) => addProductsToCart(event, data)}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </figure>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {data.title}
        </h3>

        <p className="text-lg font-bold bg-gradient-to-r from-black to-teal-700 bg-clip-text text-transparent">
          Rs.{data.price}
        </p>
      </div>
    </div>
  );
};

export default Card;
