import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import LoginPopup from './components/LoginPopup/LoginPopup';
import UserDetail from './components/UserDetail/UserDetail';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { StoreProvider } from './components/StoreContext/StoreContext';

// ✅ Import your StoreProvider
// import { StoreProvider } from './components/StoreContext/StoreContext';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);

  return (
    <StoreProvider>
      {showLogin && (
        <LoginPopup
          setShowLogin={setShowLogin}
          setShowUserDetail={setShowUserDetail}
        />
      )}

      {showUserDetail && (
        <UserDetail setShowUserDetail={setShowUserDetail} />
      )}

      <div className="app">
        <Navbar
          setShowLogin={setShowLogin}
          setShowUserDetail={setShowUserDetail}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
        </Routes>
        <Footer />
      </div>
      <ToastContainer />
      </StoreProvider>
    
  );
};

export default App;
