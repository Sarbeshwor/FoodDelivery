import React, { useEffect, useState, useContext } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';  // adjust path as needed

const Cart = () => {
  const { user } = useContext(StoreContext);   // get user from context
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setCartData([]); // clear cart if no user logged in
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
        console.log("Cart API response:", response.data);
        setCartData(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [user]);

  const removeFromCart = async (cart_item_id) => {
  try {
    const res = await axios.delete(`http://localhost:5000/api/cart/delete/${cart_item_id}`);
    console.log("Deleted response:", res.data);
    setCartData(prev => prev.filter(item => item.cart_item_id !== cart_item_id));
  } catch (error) {
    console.error("Error removing item:", error.response?.data || error.message);
  }
};


  const getTotalCartAmount = () => {
    return cartData.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (!user) {
    return <p>Please log in to see your cart.</p>;
  }

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {cartData.map((item) => (
          <div key={item.cart_item_id}>
            <div className='cart-items-title cart-items-item'>
              <img src={item.image} alt="" />
              <p>{item.name}</p>
              <p>BDT{item.price}</p>
              <p>{item.quantity}</p>
              <p>BDT{item.price * item.quantity}</p>
              <p onClick={() => removeFromCart(item.cart_item_id)} className='cross'>x</p>
            </div>
            <hr />
          </div>
        ))}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>BDT {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>BDT {getTotalCartAmount() === 0 ? 0 : 60}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>BDT {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 60}</b>
            </div>
            <hr />
          </div>
          <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a coupon, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='coupon' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
