import React, { createContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({}); // { food_item_id: quantity }
  const [foodList, setFoodList] = useState([]); // food items fetched from backend
  const [kitchenList, setKitchenList] = useState([]); // kitchen owners fetched from backend
  const [selectedKitchen, setSelectedKitchen] = useState(null); // selected kitchen for filtering
  const [foodRatings, setFoodRatings] = useState({}); // { food_id: {average_rating, total_ratings} }
  const [searchQuery, setSearchQuery] = useState(""); // search query for filtering food items

  // Load user from localStorage once on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Persist user changes to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Fetch all food items from backend once on mount
  useEffect(() => {
    fetchFoodItems();
  }, []);

  // Fetch kitchens once on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/kitchens`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setKitchenList(data.kitchens);
        }
      })
      .catch((err) => {
        console.error("Failed to load kitchen list:", err);
      });
  }, []);

  // Function to fetch food items with optional kitchen filtering
  const fetchFoodItems = (kitchenId = null) => {
    const url = kitchenId
      ? `${API_BASE_URL}/api/food?kitchen_id=${kitchenId}`
      : `${API_BASE_URL}/api/food`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setFoodList(data))
      .catch((err) => {
        console.error("Failed to load food list:", err);
      });
  };

  // Function to filter food by kitchen
  const filterByKitchen = (kitchenId) => {
    setSelectedKitchen(kitchenId);
    fetchFoodItems(kitchenId);
  };

  // Show all food items
  const showAllFood = () => {
    setSelectedKitchen(null);
    fetchFoodItems();
  };

  // Fetch ratings whenever foodList changes
  useEffect(() => {
    const fetchRatings = async () => {
      if (foodList.length === 0) return;

      console.log("Fetching ratings for food items...", foodList.length);
      try {
        const ratingsData = {};

        // Fetch ratings for each food item
        for (const food of foodList) {
          console.log(`Fetching ratings for food ID: ${food._id}`);
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/order/food-ratings/${food._id}`
            );
            if (response.ok) {
              const data = await response.json();
              console.log(`Ratings for food ${food._id}:`, data);
              if (data.success) {
                ratingsData[food._id] = {
                  average_rating: data.average_rating,
                  total_ratings: data.total_ratings,
                };
              }
            } else {
              console.error(
                `Failed to fetch ratings for food ${food._id}: ${response.status}`
              );
            }
          } catch (error) {
            console.error(
              `Error fetching ratings for food ${food._id}:`,
              error
            );
          }
        }

        console.log("Final ratings data:", ratingsData);
        setFoodRatings(ratingsData);
      } catch (error) {
        console.error("Error fetching food ratings:", error);
      }
    };

    fetchRatings();
  }, [foodList]);

  // Fetch user's cart items from backend whenever user changes (login/logout)
  useEffect(() => {
    let intervalId;

    const fetchCart = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const cartData = await res.json();
        const cartObj = {};
        cartData.forEach((item) => {
          cartObj[item.food_item_id] = item.quantity;
        });
        setCartItems(cartObj);
      } catch (err) {
        console.error("Failed to load cart from server:", err);
        setCartItems({});
      }
    };

    if (user) {
      fetchCart(); // initial load
      intervalId = setInterval(fetchCart, 1000); // 🕒 refresh every second
    } else {
      setCartItems({});
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // cleanup on logout/unmount
    };
  }, [user]);

  const refreshCartFromServer = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const cartData = await res.json();
      const cartObj = {};
      cartData.forEach((item) => {
        cartObj[item.food_item_id] = item.quantity;
      });
      setCartItems(cartObj);
    } catch (err) {
      console.error("Error refreshing cart from server:", err);
      setCartItems({});
    }
  };

  // Add or increase item quantity in cart and update backend
  const addToCart = async (itemId) => {
    const newQuantity = (cartItems[itemId] || 0) + 1;
    setCartItems((prev) => ({ ...prev, [itemId]: newQuantity }));

    if (!user) return;

    try {
      const res = await fetch("${API_BASE_URL}/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          food_item_id: itemId,
          quantity: newQuantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to update cart on server");
      await refreshCartFromServer();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (itemId) => {
    const currentQty = cartItems[itemId] || 0;
    if (currentQty <= 0) return;

    const newQuantity = currentQty - 1;

    if (newQuantity <= 0) {
      const newCart = { ...cartItems };
      delete newCart[itemId];
      setCartItems(newCart);
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: newQuantity }));
    }

    if (!user) return;

    try {
      const res = await fetch("${API_BASE_URL}/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          food_item_id: itemId,
          quantity: Math.max(newQuantity, 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to update cart on server");
      await refreshCartFromServer(); // 🧠 Sync with backend
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total cart amount using foodList prices and quantities
  const getTotalCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      if (cartItems[id] > 0) {
        const item = foodList.find((f) => String(f._id) === String(id));
        if (item) total += item.price * cartItems[id];
      }
    }
    return total;
  };

  // Logout user and clear cart locally
  const logout = () => {
    setUser(null);
    setCartItems({});
    localStorage.removeItem("user");

    // Clear localStorage from admin and delivery apps by sending messages
    clearCrossAppStorage();
  };

  // Function to clear localStorage from admin and delivery apps
  const clearCrossAppStorage = () => {
    try {
      // Set a logout signal that other apps can detect via storage events
      localStorage.setItem("logout_signal", "true");

      // Remove the signal after a short delay
      setTimeout(() => {
        localStorage.removeItem("logout_signal");
      }, 1000);

      // Send message to admin app (localhost:5173)
      const adminWindow = window.open("", "_blank");
      if (adminWindow) {
        adminWindow.postMessage(
          { type: "LOGOUT_CLEAR_STORAGE" },
          "http://localhost:5173"
        );
        adminWindow.close();
      }

      // Send message to delivery app (localhost:5175)
      const deliveryWindow = window.open("", "_blank");
      if (deliveryWindow) {
        deliveryWindow.postMessage(
          { type: "LOGOUT_CLEAR_STORAGE" },
          "http://localhost:5175"
        );
        deliveryWindow.close();
      }

      // Alternative approach: Use BroadcastChannel for same-origin communication
      if (typeof BroadcastChannel !== "undefined") {
        const logoutChannel = new BroadcastChannel("logout_channel");
        logoutChannel.postMessage({ type: "LOGOUT_CLEAR_STORAGE" });
        logoutChannel.close();
      }
    } catch (error) {
      console.log("Cross-app storage clearing failed:", error);
    }
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        cartItems,
        addToCart,
        removeFromCart,
        setCartItems,
        foodList,
        setFoodList,
        kitchenList,
        selectedKitchen,
        filterByKitchen,
        showAllFood,
        fetchFoodItems,
        foodRatings,
        searchQuery,
        setSearchQuery,
        getTotalCartAmount,
        logout,
        updateUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
