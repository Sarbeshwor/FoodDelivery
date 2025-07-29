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

        if (!user || !user.kitchenId) {
          throw new Error("Kitchen ID not found. Please log in again.");
        }

        console.log(
          "Fetching revenue for kitchenId:",
          user.kitchenId,
          "with filter:",
          filter
        );

        const url =
          filter === "all"
            ? `http://localhost:5000/api/order/revenue?kitchenId=${user.kitchenId}`
            : `http://localhost:5000/api/order/revenue?kitchenId=${user.kitchenId}&filter=${filter}`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched revenue data:", data);

        if (data.success) {
          setRevenueData(data.orders);
          setTotalRevenue(data.totalRevenue || 0);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch revenue data:", err);
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
      accepted: "status-accepted",
      ready_for_pickup: "status-ready",
      onitsway: "status-onway",
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
        <h2>Revenue Overview</h2>

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
            <h3>Total Revenue</h3>
            <p className="total-amount">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p className="total-orders">{revenueData.length}</p>
          </div>
          <div className="summary-card">
            <h3>Delivered Orders</h3>
            <p className="delivered-orders">
              {
                revenueData.filter((order) => order.status === "delivered")
                  .length
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
              No orders found for the selected time period:{" "}
              <strong>{getFilterDisplayName(filter)}</strong>
            </p>
            <p>Try selecting a different time period or check back later.</p>
          </div>
        ) : (
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((order) => (
                <tr key={order.order_item_id}>
                  <td>#{order.order_item_id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.item_name}</td>
                  <td>{order.quantity}</td>
                  <td>{formatCurrency(order.price)}</td>
                  <td className="total-amount-cell">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.ordered_at).toLocaleDateString()}</td>
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
