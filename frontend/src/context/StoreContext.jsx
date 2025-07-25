import React, { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({}); // { food_item_id: quantity }
  const [foodList, setFoodList] = useState([]);   // food items fetched from backend

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
    fetch("http://localhost:5000/api/food")
      .then(res => res.json())
      .then(data => setFoodList(data))
      .catch(err => {
        console.error("Failed to load food list:", err);
      });
  }, []);

  // Fetch user's cart items from backend whenever user changes (login/logout)
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/cart/${user.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch cart");
          return res.json();
        })
        .then(cartData => {
          const cartObj = {};
          cartData.forEach(item => {
            cartObj[item.food_item_id] = item.quantity;
          });
          setCartItems(cartObj);
        })
        .catch(err => {
          console.error("Failed to load cart from server:", err);
          setCartItems({});
        });
    } else {
      setCartItems({});
    }
  }, [user]);

  // Add or increase item quantity in cart and update backend
  const addToCart = async (itemId) => {
    const newQuantity = (cartItems[itemId] || 0) + 1;
    setCartItems(prev => ({ ...prev, [itemId]: newQuantity }));

    if (!user) return; // optionally handle guest users

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          food_item_id: itemId,
          quantity: newQuantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to update cart on server");
    } catch (err) {
      console.error(err);
    }
  };

  // Remove or decrease item quantity in cart and update backend
  const removeFromCart = async (itemId) => {
    const currentQty = cartItems[itemId] || 0;
    if (currentQty <= 0) return;

    const newQuantity = currentQty - 1;
    if (newQuantity <= 0) {
      const newCart = { ...cartItems };
      delete newCart[itemId];
      setCartItems(newCart);
    } else {
      setCartItems(prev => ({ ...prev, [itemId]: newQuantity }));
    }

    if (!user) return;

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          food_item_id: itemId,
          quantity: Math.max(newQuantity, 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to update cart on server");
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total cart amount using foodList prices and quantities
  const getTotalCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      if (cartItems[id] > 0) {
        const item = foodList.find(f => String(f._id) === String(id));
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
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        cartItems,
        addToCart,
        removeFromCart,
        foodList,
        setFoodList,
        getTotalCartAmount,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
