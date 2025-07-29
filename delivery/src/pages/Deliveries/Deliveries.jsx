import React, { useEffect, useState } from "react";
import "./Deliveries.css";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDeliveries = async (userId) => {
    if (!userId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/order/my-deliveries/${userId}`
      );
      if (res.data.success) {
        setDeliveries(res.data.deliveries);
        setLastUpdated(new Date());
        console.log("Deliveries updated:", res.data.deliveries);
      } else {
        console.log("API returned error:", res.data.message);
        setError(res.data.message || "Failed to fetch deliveries");
      }
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Error fetching deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored user:", storedUser);
    setUser(storedUser);

    if (storedUser?.id) {
      fetchDeliveries(storedUser.id);

      // Set up live updating - poll every 5 seconds
      const interval = setInterval(() => {
        if (isLiveUpdating) {
          fetchDeliveries(storedUser.id);
        }
      }, 5000);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    } else {
      console.log("No user found in localStorage");
      setError("User not logged in");
      setLoading(false);
    }
  }, [isLiveUpdating]);

  const markAsDelivered = async (order_item_id) => {
    try {
      // Call backend to update status
      const response = await axios.put(
        `http://localhost:5000/api/order/${order_item_id}/status`,
        { status: "delivered" }
      );

      if (response.data.success) {
        // Update frontend state only if backend call succeeds
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) =>
            delivery.order_item_id === order_item_id
              ? { ...delivery, status: "delivered" }
              : delivery
          )
        );
        toast.success("Delivery marked as completed!");
      } else {
        toast.error("Failed to update delivery status");
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Error updating delivery status");
    }
  };

  const cancelDelivery = async (order_item_id) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this delivery? The order will be returned to the kitchen."
      )
    ) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/order/delivery-cancel/${order_item_id}`,
        {
          delivery_user_id: user.id,
          reason: "Delivery cancelled by delivery person",
        }
      );

      if (response.data.success) {
        // Remove from deliveries list as it's returned to kitchen
        setDeliveries((prevDeliveries) =>
          prevDeliveries.filter(
            (delivery) => delivery.order_item_id !== order_item_id
          )
        );
        toast.success("Delivery cancelled and returned to kitchen!");
      } else {
        toast.error(response.data.message || "Failed to cancel delivery");
      }
    } catch (error) {
      console.error("Error cancelling delivery:", error);
      toast.error("Error cancelling delivery");
    }
  };

  if (loading) {
    return (
      <div className="deliveries-container">
        <h2>My Deliveries</h2>
        <p>Loading deliveries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deliveries-container">
        <h2>My Deliveries</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="deliveries-container">
      <div className="deliveries-header">
        <h2>My Deliveries</h2>
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
      {deliveries.length === 0 ? (
        <p>No deliveries assigned.</p>
      ) : (
        <table className="deliveries-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Quantity</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Assigned At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td data-label="Food">
                  <div className="food-info">
                    <img
                      src={d.image}
                      alt={d.item_name}
                      className="food-image"
                      onError={(e) => {
                        e.target.src = "/placeholder-food.png";
                      }}
                    />
                    <span>{d.item_name}</span>
                  </div>
                </td>
                <td data-label="Quantity">{d.quantity}</td>
                <td data-label="Customer">
                  {d.customer_full_name || d.customer_name}
                </td>
                <td data-label="Location">
                  {d.street && (
                    <div>
                      {d.street}
                      {d.city && `, ${d.city}`}
                      {d.zipcode && ` ${d.zipcode}`}
                    </div>
                  )}
                </td>
                <td data-label="Phone">{d.phone || "N/A"}</td>
                <td data-label="Status">
                  <span className={`status-badge ${d.status}`}>
                    {d.status === "onitsway" ? "On its way" : d.status}
                  </span>
                </td>
                <td data-label="Assigned At">
                  {new Date(d.assigned_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td data-label="Action">
                  {d.status === "onitsway" ? (
                    <div className="action-buttons">
                      <button
                        className="deliver-btn"
                        onClick={() => markAsDelivered(d.order_item_id)}
                      >
                        Mark as Delivered{" "}
                        <FaCheckCircle style={{ marginLeft: "5px" }} />
                      </button>
                      <button
                        className="cancel-delivery-btn"
                        onClick={() => cancelDelivery(d.order_item_id)}
                        title="Cancel delivery and return to kitchen"
                      >
                        Cancel <FaTimesCircle style={{ marginLeft: "5px" }} />
                      </button>
                    </div>
                  ) : d.status === "delivered" ? (
                    <span className="delivered-text">Delivered</span>
                  ) : (
                    <span className="status-info">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Deliveries;
