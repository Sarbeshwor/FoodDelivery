import React from "react";
import "./Slidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Slidebar = () => {
  return (
    <div className="slidebar">
      <div className="slidebar-options">
        <NavLink to="/list" className="slidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to="/deliveries" className="slidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>My Deliveries</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Slidebar;
