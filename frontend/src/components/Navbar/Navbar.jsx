import React, { useEffect, useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin, setShowUserDetail }) => {
  const [menu, setMenu] = useState("Menu");
  const [userImageUrl, setUserImageUrl] = useState(null);
  const { getTotalCartAmount, user } = useContext(StoreContext);

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
          onClick={() => setMenu("Stories")}
          className={menu === "Stories" ? "active" : ""}
        >
          Stories
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
        <img src={assets.search_icon} alt="search" />
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
