import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [todaysSales, setTodaysSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage (set during login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch today's sales data
    fetchTodaysSales();
  }, []);

  const fetchTodaysSales = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const response = await fetch(
        `http://localhost:5000/api/order/sales/today?date=${today}`
      );

      if (response.ok) {
        const data = await response.json();
        setTodaysSales(data.totalSales || 0);
      } else {
        console.error("Failed to fetch today's sales");
      }
    } catch (error) {
      console.error("Error fetching today's sales:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="" />
      <div className="navbar-profile">
        {user && <span className="welcome-text">Welcome, {user.username}</span>}
        <div className="sales-counter">
          <span className="sales-label">Have a good business day.</span>
          
          
        </div>
      </div>
    </div>
  );
};

export default Navbar;
