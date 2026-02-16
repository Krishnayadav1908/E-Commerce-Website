import { useContext } from "react";
import Layout from "../../Components/Layout";
import Card from "../../Components/Card";
import { ShoppingCartContext } from "../../Context";
import { useToast } from "../../Components/Toast";

const Wishlist = () => {
  const context = useContext(ShoppingCartContext);
  const { addToast } = useToast();

  const handleMoveToCart = (item) => {
    const itemKey = item?._id || item?.id;
    if (item?.stock === 0) {
      addToast({
        title: "Out of stock",
        message: "This item is currently unavailable.",
        variant: "warning",
      });
      return;
    }
    const alreadyInCart = context.cartProducts.some(
      (product) => (product?._id || product?.id) === itemKey,
    );
    if (!alreadyInCart) {
      context.addToCart(item);
    }
    context.removeFromWishlist(itemKey);
    addToast({
      title: alreadyInCart ? "Already in cart" : "Moved to cart",
      message: item?.title || "Item added to your cart.",
      variant: alreadyInCart ? "info" : "success",
    });
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Wishlist</h1>
          <p className="text-sm text-gray-500 mt-2">
            Products you saved for later.
          </p>
        </div>

        {context.wishlistItems?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {context.wishlistItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <Card data={item} />
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Move to cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm p-10 text-center text-gray-500">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
