import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../Components/Layout";
import { ShoppingCartContext } from "../../Context";

function OrderDetail() {
  const { index } = useParams();
  const context = useContext(ShoppingCartContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (context.order && context.order.length > 0) {
      setOrder(context.order[index]);
    }
  }, [context.order, index]);

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

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <h1 className="font-medium text-xl mb-4">Order Details</h1>
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
