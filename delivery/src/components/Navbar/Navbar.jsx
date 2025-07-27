import React from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar({ showLinks }) {
  return (
    <nav className="navbar">
      <img src={logo} alt="Food Delivery Logo" className="navbar-logo-img" />
      {showLinks && (
        <ul className="navbar-menu">
          <li>Status</li>
          <li>Deliveries</li>
          <li>Map</li>
          <li>History</li>
          <li>Wallet</li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar; 