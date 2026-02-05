import { createContext, useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { loginUser, registerUser } from "../services/api";

export const ShoppingCartContext = createContext();

export const ShoppingCartProvider = ({ children }) => {
  // Cart State
  const [count, setCount] = useState(0);
  const [cartProducts, setCartProducts] = useState([]);
  const [order, setOrder] = useState([]);

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
      const savedOrder = localStorage.getItem("order");

      if (savedAccount && savedIsAuth === "true") {
        setAccount(JSON.parse(savedAccount));
        setIsUserAuthenticated(true);
      }

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }

      setIsLoading(false);
    };

    loadUserSession();
  }, []);

  // Save order to localStorage when it changes
  useEffect(() => {
    if (order.length > 0) {
      localStorage.setItem("order", JSON.stringify(order));
    }
  }, [order]);

  // Authentication methods(B)
  const handleSignIn = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isUserAuthenticated", "true");
      setAccount({ email });
      setIsUserAuthenticated(true);

      // Load pending cart from localStorage if exists
      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        setCartProducts(JSON.parse(pendingCart));
        localStorage.removeItem("pendingCart");
      }

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };
  // Authentication methods(B)
  const handleSignUp = async (name, email, password) => {
    try {
      const response = await registerUser(name, email, password);
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isUserAuthenticated", "true");
      setAccount({ email, name });
      setIsUserAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
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
        const response = await api.get("/products");
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
    isUserAuthenticated,
    handleSignIn,
    handleSignUp,
    handleSignOut,
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
};
