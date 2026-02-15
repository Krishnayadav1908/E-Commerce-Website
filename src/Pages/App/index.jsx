import { Suspense, lazy } from "react";
import { useRoutes, BrowserRouter } from "react-router-dom";
import { ShoppingCartProvider } from "../../Context";
import Navbar from "../../Components/Navbar";
import CheckoutSideMenu from "../../Components/CheckoutSideMenu";
import ProtectedRoute from "../../Components/ProtectedRoute";
import AdminRoute from "../../Components/AdminRoute";
import "./App.css";

const Home = lazy(() => import("../Home"));
const MyAccount = lazy(() => import("../MyAccount"));
const MyOrder = lazy(() => import("../MyOrder"));
const OrderDetail = lazy(() => import("../OrderDetail"));
const MyOrders = lazy(() => import("../MyOrders"));
const Wishlist = lazy(() => import("../Wishlist"));
const NotFound = lazy(() => import("../NotFound"));
const SignIn = lazy(() => import("../SignIn"));
const SignUp = lazy(() => import("../SignUp"));
const CartSummary = lazy(() => import("../../Components/CartSummary"));
const CheckoutPage = lazy(() => import("../Checkout"));
const AdminDashboard = lazy(() => import("../AdminDashboard"));
const AdminOrders = lazy(() => import("../AdminOrders"));
const AdminUsers = lazy(() => import("../AdminUsers"));
const AdminProducts = lazy(() => import("../AdminProducts"));
const AdminAudit = lazy(() => import("../AdminAudit"));
const AdminAnalytics = lazy(() => import("../AdminAnalytics"));
const Performance = lazy(() => import("../Performance"));

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
    { path: "/performance", element: <Performance /> },
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
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center text-gray-500">
              Loading...
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
        <Navbar />
        <CheckoutSideMenu />
      </BrowserRouter>
    </ShoppingCartProvider>
  );
};

export default App;
