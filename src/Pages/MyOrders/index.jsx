import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../Components/Layout";
import { ShoppingCartContext } from "../../Context";
import OrdersCard from "../../Components/OrdersCard";

function MyOrders() {
  const context = useContext(ShoppingCartContext);
  useEffect(() => {
    if (context.account && context.account._id && context.isUserAuthenticated) {
      const token = localStorage.getItem("token");
      context.fetchUserOrders(context.account._id, token);
    }
  }, [context.account, context.isUserAuthenticated]);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-500 mt-2">
            Track your orders and view details
          </p>
        </div>

        {context.order && context.order.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {context.order.map((order, index) => (
              <Link key={order._id || index} to={`/my-orders/${index}`}>
                <OrdersCard
                  totalPrice={order.totalPrice}
                  totalProducts={order.totalProducts}
                  date={order.date}
                  status={order.status}
                  paymentStatus={order.paymentStatus}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm p-12 text-center text-gray-500">
            <p className="text-lg">No orders yet</p>
            <p className="text-sm mt-2">
              Start shopping to place your first order
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyOrders;
