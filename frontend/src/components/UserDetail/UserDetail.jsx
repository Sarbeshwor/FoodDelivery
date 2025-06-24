import React, { useContext } from "react";
import "./UserDetail.css";
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
        <h2>{user ? `Welcome, ${user.username}` : "User Details"}</h2>
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
