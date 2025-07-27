import React from 'react';
import './ProfilePopup.css';

const ProfilePopup = ({ user, onClose, onLogout }) => {
  return (
    <div className="profile-popup-overlay">
      <div className="profile-popup-container">
        <div className="profile-popup-header">
          <h2>{user ? `Welcome, ${user.username}` : 'User Details'}</h2>
          <span className="profile-popup-close" onClick={onClose}>&times;</span>
        </div>
        <div className="profile-popup-details">
          <div><b>Name:</b> {user?.name}</div>
          <div><b>Phone:</b> {user?.phone}</div>
          <div><b>Email:</b> {user?.email}</div>
          <div><b>Vehicle:</b> {user?.vehicle}</div>
          <div><b>Username:</b> {user?.username}</div>
        </div>
        <button className="profile-popup-logout" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfilePopup; 