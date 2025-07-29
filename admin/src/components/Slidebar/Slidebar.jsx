import React from "react";
import "./Slidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Slidebar = () => {
  return (
    <div className="slidebar">
      <div className="slidebar-options">
        <NavLink to="/add" className="slidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/list" className="slidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/orders" className="slidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/coupons" className="slidebar-option">
          <img src={assets.coupon_icon} alt="" />
          <p>Coupons</p>
        </NavLink>
        <NavLink to="/revenue" className="slidebar-option">
          <img src={assets.income_icon} alt="" />
          <p>Revenue</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Slidebar;
