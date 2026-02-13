import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShoppingCartContext } from "../../Context";

const ProtectedRoute = ({ children }) => {
  const { isUserAuthenticated, isLoading } = useContext(ShoppingCartContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isUserAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
};

export default ProtectedRoute;
