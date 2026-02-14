import { useRoutes, BrowserRouter } from "react-router-dom";
import { ShoppingCartProvider } from "../../Context";
import Home from "../Home";
import MyAccount from "../MyAccount";
import MyOrder from "../MyOrder";
import OrderDetail from "../OrderDetail";
import MyOrders from "../MyOrders";
import Wishlist from "../Wishlist";
import NotFound from "../NotFound";
import SignIn from "../SignIn";
import SignUp from "../SignUp";
import Navbar from "../../Components/Navbar";
import CheckoutSideMenu from "../../Components/CheckoutSideMenu";
import ProtectedRoute from "../../Components/ProtectedRoute";
import CartSummary from "../../Components/CartSummary";
import CheckoutPage from "../Checkout";
import AdminDashboard from "../AdminDashboard";
import AdminOrders from "../AdminOrders";
import AdminUsers from "../AdminUsers";
import AdminProducts from "../AdminProducts";
import AdminAudit from "../AdminAudit";
import AdminAnalytics from "../AdminAnalytics";
import AdminRoute from "../../Components/AdminRoute";
import "./App.css";

const AppRoutes = () => {
  let routes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/clothes", element: <Home /> },
    { path: "/electronics", element: <Home /> },
    { path: "/furnitures", element: <Home /> },
    { path: "/toys", element: <Home /> },
    { path: "/others", element: <Home /> },
    { path: "/cart-summary", element: <CartSummary /> },
    { path: "/checkout", element: <CheckoutPage /> },
    {
      path: "/admin",
      element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/orders",
      element: (
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/products",
      element: (
        <AdminRoute>
          <AdminProducts />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/audit",
      element: (
        <AdminRoute>
          <AdminAudit />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/analytics",
      element: (
        <AdminRoute>
          <AdminAnalytics />
        </AdminRoute>
      ),
    },
    {
      path: "/my-account",
      element: (
        <ProtectedRoute>
          <MyAccount />
        </ProtectedRoute>
      ),
    },
    {
      path: "/my-order",
      element: (
        <ProtectedRoute>
          <MyOrder />
        </ProtectedRoute>
      ),
    },
    {
      path: "/my-orders",
      element: (
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
      ),
    },
    {
      path: "/wishlist",
      element: (
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
      ),
    },
    {
      path: "/my-orders/last",
      element: (
        <ProtectedRoute>
          <MyOrder />
        </ProtectedRoute>
      ),
    },
    {
      path: "/my-orders/:index",
      element: (
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      ),
    },
    { path: "/sign-in", element: <SignIn /> },
    { path: "/sign-up", element: <SignUp /> },
    { path: "/*", element: <NotFound /> },
  ]);
  return routes;
};

const App = () => {
  return (
    <ShoppingCartProvider>
      <BrowserRouter>
        <AppRoutes />
        <Navbar />
        <CheckoutSideMenu />
      </BrowserRouter>
    </ShoppingCartProvider>
  );
};

export default App;
