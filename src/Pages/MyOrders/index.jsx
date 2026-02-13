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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="flex items-center justify-center relative w-80 mb-8">
          <h1 className="font-medium text-xl">My Orders</h1>
        </div>
        <div className="flex flex-col items-center">
          {context.order && context.order.length > 0 ? (
            context.order.map((order, index) => (
              <Link key={order._id || index} to={`/my-orders/${index}`}>
                <OrdersCard
                  totalPrice={order.totalPrice}
                  totalProducts={order.totalProducts}
                  date={order.date}
                />
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No orders yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MyOrders;
