import React, { useEffect, useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin, setShowUserDetail }) => {
  const [menu, setMenu] = useState("Menu");
  const [userImageUrl, setUserImageUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { getTotalCartAmount, user, setSearchQuery } = useContext(StoreContext);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && user) {
      axios
        .get(`http://localhost:5000/api/user/${userId}`)
        .then((res) => {
          console.log("Fetched image_url:", res.data.image_url);

          setUserImageUrl(res.data.image_url);
        })
        .catch((err) => {
          console.error("Failed to fetch user image:", err);
          // Set a default image if the API call fails
          setUserImageUrl(null);
        });
    } else {
      setUserImageUrl(null);
    }
  }, [user]);

  // Handle search functionality
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(searchTerm);
    }
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setSearchTerm("");
      if (setSearchQuery) {
        setSearchQuery("");
      }
    }
  };
  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("Menu")}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("About us")}
          className={menu === "About us" ? "active" : ""}
        >
          About us
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact us")}
          className={menu === "Contact us" ? "active" : ""}
        >
          Contact us
        </a>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search">
          {showSearchInput && (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
              />
            </form>
          )}
          <img
            src={assets.search_icon}
            alt="search"
            className="search-icon"
            onClick={toggleSearchInput}
          />
        </div>
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="cart" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {user ? (
          <img
            src={userImageUrl || assets.profile_icon}
            alt="user"
            className="user_img"
            onClick={() => setShowUserDetail(true)}
            onError={(e) => {
              e.target.src = assets.profile_icon;
            }}
          />
        ) : (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
