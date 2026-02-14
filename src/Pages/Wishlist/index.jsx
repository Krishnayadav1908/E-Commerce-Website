import { useContext } from "react";
import Layout from "../../Components/Layout";
import Card from "../../Components/Card";
import { ShoppingCartContext } from "../../Context";

const Wishlist = () => {
  const context = useContext(ShoppingCartContext);

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
              <Card key={item.id} data={item} />
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
