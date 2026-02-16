import {
  XMarkIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useContext } from "react";
import { ShoppingCartContext } from "../../Context";
import { useToast } from "../Toast";

const ProductDetail = () => {
  const context = useContext(ShoppingCartContext);
  const product = context.productToShow;
  const { addToast } = useToast();

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-full w-[420px] bg-gradient-to-b from-white to-gray-50 shadow-2xl rounded-l-3xl transform transition-transform duration-300 ${
        context.isProductDetailOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-black to-teal-700 bg-clip-text text-transparent">
          Product Details
        </h2>
        <button
          onClick={context.closeProductDetail}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-black" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 gap-5 overflow-y-auto h-[calc(100%-80px)]">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-100">
          <img
            className="w-full h-64 object-cover"
            src={product?.image}
            alt={product?.title}
          />
          <span className="absolute top-3 left-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            {product?.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900">{product?.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} className="h-4 w-4 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-500">(4.8) • 120 reviews</span>
        </div>

        {/* Price */}
        <p className="text-3xl font-bold bg-gradient-to-r from-black to-teal-700 bg-clip-text text-transparent">
          Rs.{product?.price}
        </p>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Description</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product?.description ||
              `Experience premium quality with our ${product?.title}. Crafted with attention to detail and designed for modern lifestyles. This product combines style, durability, and functionality to meet your everyday needs.`}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Highlights</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Premium quality materials
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Fast delivery available
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Easy returns within 30 days
            </li>
          </ul>
        </div>

        {/* Add to Cart Button */}
        <button
          className="mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-black to-teal-900 text-white py-4 rounded-full font-semibold hover:from-teal-600 hover:to-teal-500 hover:scale-[1.02] transition-all duration-300 shadow-lg"
          onClick={() => {
            if (product?.stock === 0) {
              addToast({
                title: "Out of stock",
                message: "This item is currently unavailable.",
                variant: "warning",
              });
              return;
            }
            context.setCartProducts([...context.cartProducts, product]);
            context.setCount(context.count + 1);
            context.openCheckoutSideMenu();
            context.closeProductDetail();
            addToast({
              title: "Added to cart",
              message: product?.title || "Item added to your cart.",
              variant: "success",
            });
          }}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Add to Cart
        </button>
      </div>
    </aside>
  );
};

export default ProductDetail;
