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
        <NavLink to="/orders" className="slidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/revenue" className="slidebar-option">
          <img src={assets.salary} alt="" />
          <p>Revenue</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Slidebar;
