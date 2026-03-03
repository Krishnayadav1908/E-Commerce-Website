import { createContext, useState, useEffect } from "react";
import { authApi } from "../services/api";
import {
  getProducts,
  loginUser,
  registerUser,
  getUserProfile,
  verifyEmailOtp,
  resendEmailOtp,
  logoutUser,
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
      const sortedOrders = (response.data || []).slice().sort((a, b) => {
        const aTime = a?.createdAt
          ? new Date(a.createdAt).getTime()
          : a?.date
            ? new Date(a.date).getTime()
            : 0;
        const bTime = b?.createdAt
          ? new Date(b.createdAt).getTime()
          : b?.date
            ? new Date(b.date).getTime()
            : 0;
        return bTime - aTime;
      });
      setOrder(sortedOrders);
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
  const [productsPage, setProductsPage] = useState(1);
  const [productsHasMore, setProductsHasMore] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState(null);
  const [searchByCategory, setSearchByCategory] = useState(null);
  const productsPageSize = 12;

  // User State
  const [account, setAccount] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  const clearSession = () => {
    setIsUserAuthenticated(false);
    setAccount(null);
    setOrder([]);
    setCartProducts([]);
    setCount(0);
    localStorage.setItem("isUserAuthenticated", "false");
    localStorage.removeItem("token");
    localStorage.removeItem("account");
    localStorage.removeItem("order");
    localStorage.removeItem("pendingCart");
  };

  // UI Actions
  const openProductDetail = () => setIsProductDetailOpen(true);
  const closeProductDetail = () => setIsProductDetailOpen(false);
  const openCheckoutSideMenu = () => setIsCheckoutSideMenuOpen(true);
  const closeCheckoutSideMenu = () => setIsCheckoutSideMenuOpen(false);

  // Initialize user session
  useEffect(() => {
    const loadUserSession = async () => {
      const savedAccount = localStorage.getItem("account");
      const savedIsAuth = localStorage.getItem("isUserAuthenticated");
      const savedWishlist = localStorage.getItem("wishlistItems");
      const token = localStorage.getItem("token");

      if (savedAccount && savedIsAuth === "true" && token) {
        try {
          const profileRes = await getUserProfile(token);
          const user = profileRes.data;
          setAccount(user);
          setIsUserAuthenticated(true);
          localStorage.setItem("account", JSON.stringify(user));
        } catch (error) {
          clearSession();
        }
      } else {
        clearSession();
      }

      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }

      setIsLoading(false);
    };

    loadUserSession();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
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

      return { success: true, user };
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

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    clearSession();

    // Close any open modals
    closeProductDetail();
    closeCheckoutSideMenu();
  };

  const buildProductParams = (page) => ({
    page,
    limit: productsPageSize,
    search: searchByTitle?.trim() || undefined,
    category: searchByCategory || undefined,
  });

  const fetchProducts = async ({ page = 1, replace = false } = {}) => {
    if (replace) {
      setItems(null);
    }
    setProductsLoading(true);
    try {
      const response = await getProducts(buildProductParams(page));
      const nextItems = response.data?.items || [];
      setItems((prev) =>
        replace ? nextItems : [...(prev || []), ...nextItems],
      );
      setProductsHasMore(Boolean(response.data?.hasMore));
      setProductsPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (replace) {
        setItems([]);
      } else {
        setItems((prev) => prev || []);
      }
      setProductsHasMore(false);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchMoreProducts = () => {
    if (productsLoading || !productsHasMore) return;
    fetchProducts({ page: productsPage + 1, replace: false });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts({ page: 1, replace: true });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchByTitle, searchByCategory]);

  // Cart methods
  const addToCart = (product) => {
    setCartProducts((prev) => [...prev, product]);
    setCount((prev) => prev + 1);
    openCheckoutSideMenu();
  };

  const removeFromCart = (id) => {
    setCartProducts((prev) => {
      const next = prev.filter((product) => {
        const productId = product?._id || product?.id;
        return productId !== id;
      });
      setCount(next.length);
      return next;
    });
  };

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const productId = product?._id || product?.id;
      if (
        prev.some((item) => {
          const itemId = item?._id || item?.id;
          return itemId === productId;
        })
      ) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) =>
      prev.filter((product) => {
        const productId = product?._id || product?.id;
        return productId !== id;
      }),
    );
  };

  const isInWishlist = (id) =>
    wishlistItems.some((product) => {
      const productId = product?._id || product?.id;
      return productId === id;
    });

  const toggleWishlist = (product) => {
    const productId = product?._id || product?.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
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
    productsHasMore,
    productsLoading,
    fetchMoreProducts,
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
