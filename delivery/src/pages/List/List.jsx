import React, { useState, useEffect } from "react";
import "./List.css";
import {
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaTimes,
  FaUser,
  FaUtensils,
  FaWeight,
} from "react-icons/fa";

const AcceptedOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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

      // Fetch detailed order information with delivery location
      const ordersWithDetails = await Promise.all(
        data.orders.map(async (order) => {
          try {
            const detailResponse = await fetch(
              `http://localhost:5000/api/order/delivery-details/${order.order_item_id}`
            );
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return { ...order, deliveryDetails: detailData };
            }
            return order;
          } catch (err) {
            console.error("Error fetching order details:", err);
            return order;
          }
        })
      );

      setOrders(ordersWithDetails);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedOrders();

    // Set up live updating - poll every 5 seconds
    const interval = setInterval(() => {
      if (isLiveUpdating) {
        fetchAcceptedOrders();
      }
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  const handleMarkOnItsWay = async (orderId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const deliveryUserId = user?.id;

    if (!deliveryUserId) {
      toast.error("User not logged in or not a delivery person.");
      // alert("User not logged in or not a delivery person.");
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
        toast.success("Delivery accepted successfully!");
      }
    } catch (err) {
      console.error("Error marking order on its way:", err);
      toast.error("Could not mark order as on its way.");
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading available deliveries...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>Error: {error}</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="empty-container">
        <div className="empty-icon">📦</div>
        <h3>No Deliveries Ready</h3>
        <p>Check back later for new delivery opportunities</p>
      </div>
    );

  return (
    <div className="list-container">
      <div className="list-header">
        <div className="header-main">
          <h2>
            <FaTruck className="header-icon" /> Available Deliveries
          </h2>
          <p className="header-subtitle">
            Click on any delivery to view full details
          </p>
        </div>
        <div className="live-update-controls">
          <div className="live-status">
            <span
              className={`live-indicator ${
                isLiveUpdating ? "active" : "inactive"
              }`}
            ></span>
            <span>Live Updates: {isLiveUpdating ? "ON" : "OFF"}</span>
          </div>
          <button
            className="toggle-live-btn"
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
          >
            {isLiveUpdating ? "Pause" : "Resume"}
          </button>
          <span className="last-updated">
            Last: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="orders-grid">
        {orders.map((order, index) => (
          <div
            key={index}
            className="order-card"
            onClick={() => handleOrderClick(order)}
          >
            <div className="order-image-container">
              <img className="order-image" src={order.image} alt="food" />
              <div className="order-status">
                <span className="status-badge ready">Ready for Pickup</span>
              </div>
            </div>

            <div className="order-content">
              <div className="order-main-info">
                <h3 className="item-name">{order.item_name}</h3>
                <div className="order-meta">
                  <span className="customer-info">
                    <FaUser className="meta-icon" />
                    {order.customer_name}
                  </span>
                  <span className="quantity-info">
                    <FaWeight className="meta-icon" />
                    Qty: {order.quantity}
                  </span>
                </div>
              </div>

              <div className="order-time">
                <FaClock className="time-icon" />
                <span>Ordered: {formatTime(order.ordered_at)}</span>
              </div>
            </div>

            <div className="order-actions">
              <button
                className="accept-delivery-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkOnItsWay(order.order_item_id);
                }}
                disabled={order.status === "onitsway"}
                title="Accept this delivery"
              >
                <FaTruck className="btn-icon" />
                {order.status === "onitsway" ? "Accepted" : "Accept Delivery"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Popup */}
      {showPopup && selectedOrder && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Delivery Details</h3>
              <button className="close-btn" onClick={closePopup}>
                <FaTimes />
              </button>
            </div>

            <div className="popup-body">
              <div className="delivery-item-section">
                <div className="item-image-large">
                  <img
                    src={selectedOrder.image}
                    alt={selectedOrder.item_name}
                  />
                </div>
                <div className="item-details">
                  <h4>
                    <FaUtensils className="section-icon" /> Order Information
                  </h4>
                  <div className="detail-row">
                    <span className="label">Item:</span>
                    <span className="value">{selectedOrder.item_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{selectedOrder.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ordered:</span>
                    <span className="value">
                      {new Date(selectedOrder.ordered_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="customer-section">
                <h4>
                  <FaUser className="section-icon" /> Customer Information
                </h4>
                <div className="detail-row">
                  <span className="label">Name:</span>
                  <span className="value">{selectedOrder.customer_name}</span>
                </div>
                {selectedOrder.deliveryDetails?.phone && (
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value phone-number">
                      <FaPhone className="phone-icon" />
                      {selectedOrder.deliveryDetails.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="location-section">
                <h4>
                  <FaMapMarkerAlt className="section-icon" /> Delivery Location
                </h4>
                {selectedOrder.deliveryDetails ? (
                  <div className="location-details">
                    <div className="detail-row">
                      <span className="label">Street:</span>
                      <span className="value">
                        {selectedOrder.deliveryDetails.street}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">City:</span>
                      <span className="value">
                        {selectedOrder.deliveryDetails.city}
                      </span>
                    </div>
                    {selectedOrder.deliveryDetails.landmark && (
                      <div className="detail-row">
                        <span className="label">Landmark:</span>
                        <span className="value">
                          {selectedOrder.deliveryDetails.landmark}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Postal Code:</span>
                      <span className="value">
                        {selectedOrder.deliveryDetails.postal_code}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Country:</span>
                      <span className="value">
                        {selectedOrder.deliveryDetails.country}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="no-location">Delivery location not available</p>
                )}
              </div>
            </div>

            <div className="popup-footer">
              <button
                className="popup-accept-btn"
                onClick={() => {
                  handleMarkOnItsWay(selectedOrder.order_item_id);
                  closePopup();
                }}
                disabled={selectedOrder.status === "onitsway"}
              >
                <FaTruck className="btn-icon" />
                {selectedOrder.status === "onitsway"
                  ? "Already Accepted"
                  : "Accept Delivery"}
              </button>
              <button className="popup-cancel-btn" onClick={closePopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedOrdersList;
