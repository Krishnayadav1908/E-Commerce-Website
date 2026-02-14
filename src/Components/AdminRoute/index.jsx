import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShoppingCartContext } from "../../Context";

const AdminRoute = ({ children }) => {
  const { isUserAuthenticated, isLoading, account } =
    useContext(ShoppingCartContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isUserAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (account?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
