import React, { useEffect, useState } from "react";
import "./Revenue.css";

const Revenue = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
          throw new Error("User ID not found. Please log in again.");
        }

        console.log(
          "Fetching revenue for delivery user:",
          user.id,
          "with filter:",
          filter
        );

        const url =
          filter === "all"
            ? `http://localhost:5000/api/deliveries/revenue?delivery_user_id=${user.id}`
            : `http://localhost:5000/api/deliveries/revenue?delivery_user_id=${user.id}&filter=${filter}`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched delivery revenue data:", data);

        if (data.success) {
          // Filter only delivered items for revenue calculation
          const deliveredItems = data.deliveries.filter(
            (delivery) => delivery.status === "delivered"
          );
          const successfulRevenue = deliveredItems.reduce(
            (sum, delivery) => sum + (parseInt(delivery.deliveryprice) || 0),
            0
          );

          setRevenueData(data.deliveries); // Show all deliveries in table
          setTotalRevenue(successfulRevenue); // Only count delivered items in revenue
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch delivery revenue data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [filter]);

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  const handleFilterChange = (newFilter) => {
    setLoading(true);
    setFilter(newFilter);
  };

  const getFilterDisplayName = (filterValue) => {
    switch (filterValue) {
      case "all":
        return "All Time";
      case "past24hrs":
        return "Past 24 Hours";
      case "thisMonth":
        return "This Month";
      case "pastMonth":
        return "Past Month";
      case "thisWeek":
        return "This Week";
      default:
        return "All Time";
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      assigned: "status-assigned",
      picked_up: "status-picked",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ""}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading revenue data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="revenue-container">
      <div className="revenue-header">
        <h2>Delivery Revenue Overview</h2>

        <div className="filter-container">
          <label htmlFor="filter-select">Filter by:</label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="past24hrs">Past 24 Hours</option>
            <option value="thisMonth">This Month</option>
            <option value="pastMonth">Past Month</option>
            <option value="thisWeek">This Week</option>
          </select>
          <span className="filter-indicator">
            Showing: <strong>{getFilterDisplayName(filter)}</strong>
          </span>
        </div>

        <div className="revenue-summary">
          <div className="summary-card">
            <h3>Total Earnings (Delivered Only)</h3>
            <p className="total-amount">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Deliveries</h3>
            <p className="total-orders">{revenueData.length}</p>
          </div>
          <div className="summary-card">
            <h3>Completed Deliveries</h3>
            <p className="delivered-orders">
              {
                revenueData.filter(
                  (delivery) => delivery.status === "delivered"
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="revenue-table-container">
        {revenueData.length === 0 ? (
          <div className="empty-state">
            <h3>No data found</h3>
            <p>
              No deliveries found for the selected time period:{" "}
              <strong>{getFilterDisplayName(filter)}</strong>
            </p>
            <p>Try selecting a different time period or check back later.</p>
          </div>
        ) : (
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order Item ID</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Delivery Price</th>
                <th>Status</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((delivery) => (
                <tr key={delivery.id}>
                  <td>#{delivery.id}</td>
                  <td>#{delivery.order_item_id}</td>
                  <td>{delivery.customer_name || "N/A"}</td>
                  <td>{delivery.item_name || "N/A"}</td>
                  <td
                    className={`total-amount-cell ${
                      delivery.status === "delivered"
                        ? "revenue-counted"
                        : "revenue-not-counted"
                    }`}
                  >
                    {delivery.status === "delivered" ? (
                      formatCurrency(delivery.deliveryprice)
                    ) : (
                      <span className="not-counted">
                        ₳{delivery.deliveryprice}{" "}
                      </span>
                    )}
                  </td>
                  <td>{getStatusBadge(delivery.status || "assigned")}</td>
                  <td>{new Date(delivery.assigned_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Revenue;
