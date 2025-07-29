import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = ({ user, onLogout }) => {
  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="" />
      <div className="navbar-right">
        {user && (
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
        <img className="profile" src={assets.profile_image} alt="" />
      </div>
    </div>
  );
};

export default Navbar;
