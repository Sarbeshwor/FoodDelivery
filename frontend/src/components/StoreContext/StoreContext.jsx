
import React, { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
        console.log("✅ User restored:", JSON.parse(storedUser));
    }
    else{
        console.log("no user");
    }
  }, []);

  return (
    <StoreContext.Provider value={{ user, setUser }}>
      {children}
    </StoreContext.Provider>
  );
};
