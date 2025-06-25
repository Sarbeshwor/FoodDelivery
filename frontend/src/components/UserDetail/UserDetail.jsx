import React, { useContext } from "react";
import "./UserDetail.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const UserDetail = ({ setShowUserDetail }) => {
  const { user, setUser } = useContext(StoreContext);

  const handleLogout = () => {
    setUser(null);
    setShowUserDetail(false);
    toast.success("Logged out successfully!");
  };

  return (
    <div className="userdetail">
      <div className="userdetail-container">
        <div className="userdetail_header">
          <h2>{user ? `Welcome, ${user.username}` : "User Details"}</h2>
          <img onClick={()=>setShowUserDetail(false)} src={assets.cross_icon} alt="close"/>
        </div>
        <div className="profile_view">
          <button className="profile_button">View Profile</button>
        </div>
        <div className="logout">
          <button className="logout_button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
