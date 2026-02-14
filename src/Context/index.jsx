import { createContext, useState, useEffect, useMemo } from "react";
import api, { authApi } from "../services/api";
import {
  loginUser,
  registerUser,
  getUserProfile,
  verifyEmailOtp,
  resendEmailOtp,
} from "../services/api";

export const ShoppingCartContext = createContext();

export const ShoppingCartProvider = ({ children }) => {
  // Cart State (already declared at the top, remove duplicate)

  // Fetch user orders from backend (now has access to setOrder)
  const fetchUserOrders = async (userId, token) => {
    try {
      const response = await authApi.get(`/order/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching user orders:", error);
    }
  };
  // Cart State
  const [count, setCount] = useState(0);
  const [cartProducts, setCartProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // UI State
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isCheckoutSideMenuOpen, setIsCheckoutSideMenuOpen] = useState(false);
  const [productToShow, setProductToShow] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Products State
  const [items, setItems] = useState(null);
  const [filteredItems, setFilteredItems] = useState(null);
  const [searchByTitle, setSearchByTitle] = useState(null);
  const [searchByCategory, setSearchByCategory] = useState(null);

  // User State
  const [account, setAccount] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // UI Actions
  const openProductDetail = () => setIsProductDetailOpen(true);
  const closeProductDetail = () => setIsProductDetailOpen(false);
  const openCheckoutSideMenu = () => setIsCheckoutSideMenuOpen(true);
  const closeCheckoutSideMenu = () => setIsCheckoutSideMenuOpen(false);

  // Initialize user session
  useEffect(() => {
    const loadUserSession = () => {
      const savedAccount = localStorage.getItem("account");
      const savedIsAuth = localStorage.getItem("isUserAuthenticated");
      const savedWishlist = localStorage.getItem("wishlistItems");

      if (savedAccount && savedIsAuth === "true") {
        setAccount(JSON.parse(savedAccount));
        setIsUserAuthenticated(true);
      }

      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }

      setIsLoading(false);
    };

    loadUserSession();
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // No localStorage for orders: always use backend

  // Authentication methods(B)
  const handleSignIn = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isUserAuthenticated", "true");

      // Fetch user profile (with _id)
      const profileRes = await getUserProfile(token);
      const user = profileRes.data;
      setAccount(user);
      localStorage.setItem("account", JSON.stringify(user));
      setIsUserAuthenticated(true);

      // Clear previous orders from local state and localStorage
      setOrder([]);
      localStorage.removeItem("order");

      // Load pending cart from localStorage if exists
      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        setCartProducts(JSON.parse(pendingCart));
        localStorage.removeItem("pendingCart");
      }

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error?.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };
  // Authentication methods(B)
  const handleSignUp = async (name, email, password) => {
    try {
      const response = await registerUser(name, email, password);
      return {
        success: true,
        requiresOtp: response.data?.requiresOtp,
        email: response.data?.email || email,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error?.response?.data?.message || "Registration failed";
      return { success: false, message };
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      const response = await verifyEmailOtp(email, otp);
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isUserAuthenticated", "true");

      const profileRes = await getUserProfile(token);
      const user = profileRes.data;
      setAccount(user);
      localStorage.setItem("account", JSON.stringify(user));
      setIsUserAuthenticated(true);

      setOrder([]);
      localStorage.removeItem("order");

      return { success: true };
    } catch (error) {
      console.error("OTP verification failed:", error);
      const message =
        error?.response?.data?.message || "OTP verification failed";
      const retryAfterSeconds = error?.response?.data?.retryAfterSeconds;
      return { success: false, message, retryAfterSeconds };
    }
  };

  const handleResendOtp = async (email) => {
    try {
      await resendEmailOtp(email);
      return { success: true };
    } catch (error) {
      console.error("Resend OTP failed:", error);
      const message = error?.response?.data?.message || "Resend OTP failed";
      const retryAfterSeconds = error?.response?.data?.retryAfterSeconds;
      return { success: false, message, retryAfterSeconds };
    }
  };

  const handleSignOut = () => {
    // Clear user session
    setIsUserAuthenticated(false);
    setAccount(null);

    // Clear cart and orders
    setCartProducts([]);
    setCount(0);

    // Clear localStorage
    localStorage.setItem("isUserAuthenticated", "false");
    localStorage.removeItem("pendingCart");

    // Close any open modals
    closeProductDetail();
    closeCheckoutSideMenu();
  };

  // Fetch products using Axios + JSON Server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setItems([]);
      }
    };

    fetchProducts();
  }, []);

  // Memoized filter functions
  const filteredItemsByTitle = useMemo(() => {
    if (!searchByTitle || !items) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchByTitle.toLowerCase()),
    );
  }, [items, searchByTitle]);

  const filteredItemsByCategory = useMemo(() => {
    if (!searchByCategory || !items) return filteredItemsByTitle;
    return filteredItemsByTitle?.filter((item) =>
      item.category.toLowerCase().includes(searchByCategory.toLowerCase()),
    );
  }, [filteredItemsByTitle, searchByCategory]);

  // Update filtered items when filters change
  useEffect(() => {
    setFilteredItems(filteredItemsByCategory);
  }, [filteredItemsByCategory]);

  // Cart methods
  const addToCart = (product) => {
    setCartProducts((prev) => [...prev, product]);
    setCount((prev) => prev + 1);
    openCheckoutSideMenu();
  };

  const removeFromCart = (id) => {
    setCartProducts((prev) => prev.filter((product) => product.id !== id));
    setCount((prev) => prev - 1);
  };

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((product) => product.id !== id));
  };

  const isInWishlist = (id) =>
    wishlistItems.some((product) => product.id === id);

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const contextValue = {
    // Cart
    count,
    setCount,
    cartProducts,
    setCartProducts,
    addToCart,
    removeFromCart,
    order,
    setOrder,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,

    // UI
    isProductDetailOpen,
    openProductDetail,
    closeProductDetail,
    isCheckoutSideMenuOpen,
    openCheckoutSideMenu,
    closeCheckoutSideMenu,
    productToShow,
    setProductToShow,
    isLoading,

    // Products
    items,
    filteredItems,
    searchByTitle,
    setSearchByTitle,
    searchByCategory,
    setSearchByCategory,

    // User
    account,
    setAccount,
    isUserAuthenticated,
    handleSignIn,
    handleSignUp,
    handleVerifyOtp,
    handleResendOtp,
    handleSignOut,
    fetchUserOrders,
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
};
