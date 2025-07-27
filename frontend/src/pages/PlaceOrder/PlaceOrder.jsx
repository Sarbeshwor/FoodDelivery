import React, { useContext, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const { user, cartItems, foodList, getTotalCartAmount, setCartItems } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place an order.');
      return;
    }

    const items = Object.entries(cartItems).map(([food_item_id, quantity]) => ({
      food_item_id: Number(food_item_id),
      quantity,
    })).filter(item => item.quantity > 0);

    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/order/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
      toast.error(data.message || 'Failed to place order');
        setLoading(false);
        return;
      }

      toast.success('Order placed successfully!');
      setCartItems({}); // clear cart locally

      // Optional: redirect or reset form here

    } catch (error) {
      toast.error('Error placing order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        {/* Delivery info inputs */}
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" placeholder='First Name' required />
          <input type="text" placeholder='Last Name' required />
        </div>
        <input type="email" placeholder='Email Address' required />
        <input type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input type="text" placeholder='City' required />
          <input type="text" placeholder='Thana' required />
        </div>
        <div className="multi-fields">
          <input type="text" placeholder='Post Code' required />
          <input type="text" placeholder='Country' required />
        </div>
        <input type="tel" placeholder='Phone' required />
      </div>

      <div className="place-order-right">
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
              <p>BDT {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>BDT {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
            <hr />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Placing Order...' : 'PROCEED TO PAYMENT'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
