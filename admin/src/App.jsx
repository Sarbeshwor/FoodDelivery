import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Slidebar from "./components/Slidebar/Slidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Revenue from "./pages/Revenue/Revenue";
import Coupons from "./pages/Coupons/Coupons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // Check if user has kitchen role
        if (parsedUser.roles && parsedUser.roles.includes("kitchen")) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        🔄 Loading admin panel...
      </div>
    );
  }

  // Redirect to access denied page if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/access-denied.html";
    return null;
  }

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Slidebar />
        <div className="page-content">
          <Routes>
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="*" element={<Navigate to="/add" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
