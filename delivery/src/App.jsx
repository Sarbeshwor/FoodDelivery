import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Slidebar from "./components/Slidebar/Slidebar";
import Login from "./components/Login/Login";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Deliveries from "./pages/Deliveries/Deliveries";
import Revenue from "./pages/Revenue/Revenue";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify user has delivery role
        if (parsedUser.roles && parsedUser.roles.includes("delivery")) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <ToastContainer />
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar user={user} onLogout={handleLogout} />
      <hr />
      <div className="app-content">
        <Slidebar />
        <div className="page-content">
          <Routes>
            {/* <Route path="/add" element={<Add />} /> */}
            <Route path="/list" element={<List />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/orders" element={<Deliveries />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="*" element={<Navigate to="/list" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
