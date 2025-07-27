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

  const handleCancel = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/order/${id}/status`, {
        status: 'cancelled',
      });
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const handleNextStatus = async (order) => {
    let nextStatus = '';

    switch (order.status) {
      case 'pending':
        nextStatus = 'accepted';
        break;
      case 'accepted':
        nextStatus = 'ready_for_pickup';
        break;
      case 'ready_for_pickup':
        nextStatus = 'delivered';
        break;
      default:
        return;
    }

    try {
      await axios.put(`http://localhost:5000/api/order/${order.order_item_id}/status`, {
        status: nextStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error(`Error updating status to ${nextStatus}:`, err);
    }
  };

  const getNextStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Accept';
      case 'accepted': return 'Ready for Pickup';
      case 'ready_for_pickup': return 'Deliver';
      default: return '';
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
            <p className={`status ${order.status}`}>{order.status.replace(/_/g, ' ')}</p>

            <div className="action-icons">
              {order.status !== 'cancelled' && order.status !== 'delivered' ? (
                <FaCheckCircle
                  className="accept-icon"
                  title={getNextStatusLabel(order.status)}
                  onClick={() => handleNextStatus(order)}
                />
              ) : (
                <span className="info-text">—</span>
              )}

              {order.status === 'pending' && (
                <FaTimesCircle
                  className="cancel-icon"
                  title="Cancel Order"
                  onClick={() => handleCancel(order.order_item_id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
