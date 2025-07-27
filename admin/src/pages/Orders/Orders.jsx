import React, { useEffect, useState } from 'react';
import './Orders.css';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const kitchenId = user?.kitchenId || user?.userid;

      if (!kitchenId) return;

      const res = await axios.get(`http://localhost:5000/api/order?kitchenId=${kitchenId}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        console.error(res.data.message);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/order/${id}/status`, {
        status: 'accepted',
      });
      fetchOrders(); // Refresh after update
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/order/${id}/status`, {
        status: 'cancelled',
      });
      fetchOrders(); // Refresh after update
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  return (
    <div className="orders-container">
      <p className="orders-title">Orders</p>
      <div className="orders-table">
        <div className="orders-table-format title">
          <b>Image</b>
          <b>Item</b>
          <b>Customer</b>
          <b>Quantity</b>
          <b>Status</b>
          <b>Action</b>
        </div>

        {orders.map((order) => (
          <div className="orders-table-format" key={order.order_item_id}>
            <img className="order-img" src={order.image} alt={order.item_name} />
            <p>{order.item_name}</p>
            <p>{order.customer_name}</p>
            <p>{order.quantity}</p>
            <p className={`status ${order.status}`}>{order.status}</p>
            <div className="action-icons">
              {order.status === 'pending' ? (
                <>
                  <FaCheckCircle
                    className="accept-icon"
                    title="Accept Order"
                    onClick={() => handleAccept(order.order_item_id)}
                  />
                  <FaTimesCircle
                    className="cancel-icon"
                    title="Cancel Order"
                    onClick={() => handleCancel(order.order_item_id)}
                  />
                </>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
