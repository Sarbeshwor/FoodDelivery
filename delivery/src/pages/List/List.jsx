import React, { useState, useEffect } from "react";
import "./List.css";

const AcceptedOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcceptedOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/order/ready_for_pickup"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data.success)
          throw new Error(data.message || "Failed to load orders");

        setOrders(data.orders);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedOrders();
  }, []);

  const handleMarkOnItsWay = async (orderId) => {
    // Debug: Log localStorage contents
    console.log("localStorage contents:", localStorage);
    console.log("user item:", localStorage.getItem("user"));

    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Parsed user:", user);

    const deliveryUserId = user?.id;
    console.log("Delivery user ID:", deliveryUserId);

    if (!deliveryUserId) {
      alert("User not logged in or not a delivery person.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/order/onitsway/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_user_id: deliveryUserId }),
        }
      );

      if (!response.ok) throw new Error("Failed to update order status");

      const data = await response.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.order_item_id === orderId
              ? { ...order, status: "onitsway" }
              : order
          )
        );
      }
    } catch (err) {
      console.error("Error marking order on its way:", err);
      alert("Could not mark order as on its way.");
    }
  };

  if (loading) return <div className="loading">Loading accepted orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (orders.length === 0) return <div>No Deliveries Ready Yet</div>;

  return (
    <div className="list add flex-col">
      <p>Accepted Orders</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Item</b>
          <b>Customer</b>
          <b>Quantity</b>
          <b>Action</b>
        </div>
        {orders.map((order, index) => (
          <div key={index} className="list-table-format">
            <img className="imgs" src={order.image} alt="food" />
            <p>{order.item_name}</p>
            <p>{order.customer_name}</p>
            <p>{order.quantity}</p>
            <button
              className="tick-btn"
              onClick={() => handleMarkOnItsWay(order.order_item_id)}
              disabled={order.status === "onitsway"}
              title="Mark as on its way"
            >
              Accept Delivery
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcceptedOrdersList;
