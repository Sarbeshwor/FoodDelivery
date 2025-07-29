import React, { useContext, useState, useEffect } from "react";
import "./UserDetail.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaSignOutAlt,
  FaEdit,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaTimes,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaSpinner,
  FaBan,
  FaTimesCircle,
} from "react-icons/fa";

const UserDetail = ({ setShowUserDetail }) => {
  const context = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [address, setAddress] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    street: "",
    city: "",
    landmark: "",
    postal_code: "",
    country: "",
    phone: "",
  });

  if (!context) {
    return (
      <div>
        Error: StoreContext not found. Make sure you wrapped your app with
        StoreContextProvider.
      </div>
    );
  }

  const { user, logout } = context;

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoadingOrders(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/user-orders/${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch user address
  const fetchAddress = async () => {
    if (!user?.id) return;

    setLoadingAddress(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/delivery/user/${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setAddress(data);
        setAddressForm(data);
      } else if (response.status === 404) {
        setAddress(null);
      } else {
        toast.error("Failed to fetch address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Error loading address");
    } finally {
      setLoadingAddress(false);
    }
  };

  // Handle address form submission
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/delivery/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...addressForm,
          userid: user.id,
        }),
      });

      if (response.ok) {
        toast.success("Address saved successfully!");
        setShowAddressForm(false);
        fetchAddress(); // Refresh address data
      } else {
        toast.error("Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Error saving address");
    }
  };

  // Handle address form input changes
  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "address") {
      fetchAddress();
    }
  }, [activeTab, user?.id]);

  const handleLogout = () => {
    logout();
    setShowUserDetail(false);
    toast.success("Logged out successfully!");
  };

  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return "Customer";
    return roles
      .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
      .join(", ");
  };

  const getUserInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "accepted":
        return <FaCheckCircle className="status-icon accepted" />;
      case "ready_for_pickup":
        return <FaShoppingBag className="status-icon ready" />;
      case "onitsway":
        return <FaTruck className="status-icon onitsway" />;
      case "delivered":
        return <FaCheckCircle className="status-icon delivered" />;
      case "cancelled":
        return <FaBan className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const formatOrderStatus = (status) => {
    switch (status) {
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "onitsway":
        return "On its Way";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Cancel order function
  const cancelOrder = async (order_item_id) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/order/cancel/${order_item_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            reason: "Customer cancellation",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Order cancelled successfully!");
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Error cancelling order");
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return [
      "pending",
      "accepted",
      "ready_for_pickup",
      "onitsway",
      "delivered",
    ].includes(status);
  };

  return (
    <div className="userdetail-overlay">
      <div className="userdetail-container">
        <div className="userdetail-header">
          <div className="header-content">
            <div className="user-avatar">
              <div className="avatar-circle">
                {getUserInitials(user?.username)}
              </div>
              <div className="user-info">
                <h2>{user ? user.username : "Guest User"}</h2>
                <p className="user-email">
                  {user?.email || "No email provided"}
                </p>
                <span className="user-role">
                  <FaUserTag className="role-icon" />
                  {formatRoles(user?.roles)}
                </span>
              </div>
            </div>
            <button
              className="close-button"
              onClick={() => setShowUserDetail(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="userdetail-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="tab-icon" />
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag className="tab-icon" />
            Orders
          </button>
          <button
            className={`tab-button ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <FaMapMarkerAlt className="tab-icon" />
            Address
          </button>
        </div>

        <div className="userdetail-content">
          {activeTab === "profile" && (
            <div className="profile-tab">
              <div className="profile-section">
                <h3>Account Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FaUser className="info-icon" />
                    <div className="info-details">
                      <label>Username</label>
                      <span>{user?.username || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <div className="info-details">
                      <label>Email</label>
                      <span>{user?.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaUserTag className="info-icon" />
                    <div className="info-details">
                      <label>Account Type</label>
                      <span>{formatRoles(user?.roles)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="edit-profile-btn">
                  <FaEdit className="btn-icon" />
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-tab">
              <div className="orders-section">
                <h3>Order History</h3>
                {loadingOrders ? (
                  <div className="loading-container">
                    <FaSpinner className="loading-spinner" />
                    <p>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="orders-placeholder">
                    <FaShoppingBag className="placeholder-icon" />
                    <p>No orders found</p>
                    <span>Your order history will appear here</span>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.order_item_id} className="order-card">
                        <div className="order-header">
                          <div className="order-image">
                            <img
                              src={order.image}
                              alt={order.item_name}
                              onError={(e) => {
                                e.target.src = "/placeholder-food.png";
                              }}
                            />
                          </div>
                          <div className="order-info">
                            <h4>{order.item_name}</h4>
                            <p className="order-quantity">
                              Quantity: {order.quantity}
                            </p>
                            <p className="order-total">
                              Total: BDT {order.total_amount}
                            </p>
                          </div>
                          <div className="order-status">
                            {getStatusIcon(order.status)}
                            <span className={`status-text ${order.status}`}>
                              {formatOrderStatus(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="order-footer">
                          <div className="order-meta">
                            <span className="order-date">
                              Ordered:{" "}
                              {new Date(order.ordered_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            <span className="order-id">
                              #{order.order_item_id}
                            </span>
                          </div>
                          {canCancelOrder(order.status) && (
                            <div className="order-actions">
                              <button
                                className="cancel-order-btn"
                                onClick={() => cancelOrder(order.order_item_id)}
                                title="Cancel Order"
                              >
                                <FaTimesCircle className="btn-icon" />
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="address-tab">
              <div className="address-section">
                <h3>Delivery Address</h3>
                {loadingAddress ? (
                  <div className="loading-container">
                    <FaSpinner className="loading-spinner" />
                    <p>Loading address...</p>
                  </div>
                ) : !address && !showAddressForm ? (
                  <div className="address-placeholder">
                    <FaMapMarkerAlt className="placeholder-icon" />
                    <p>No delivery address saved</p>
                    <span>Add an address to make ordering easier</span>
                    <button
                      className="add-address-btn"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <FaPlus className="btn-icon" />
                      Add New Address
                    </button>
                  </div>
                ) : address && !showAddressForm ? (
                  <div className="address-display">
                    <div className="address-card">
                      <div className="address-header">
                        <h4>
                          {address.first_name} {address.last_name}
                        </h4>
                        <button
                          className="edit-address-btn"
                          onClick={() => setShowAddressForm(true)}
                        >
                          <FaEdit className="btn-icon" />
                          Edit
                        </button>
                      </div>
                      <div className="address-details">
                        <p>
                          <strong>Street:</strong> {address.street}
                        </p>
                        {address.landmark && (
                          <p>
                            <strong>Landmark:</strong> {address.landmark}
                          </p>
                        )}
                        <p>
                          <strong>City:</strong> {address.city}
                        </p>
                        {address.postal_code && (
                          <p>
                            <strong>Postal Code:</strong> {address.postal_code}
                          </p>
                        )}
                        <p>
                          <strong>Country:</strong> {address.country}
                        </p>
                        <p>
                          <strong>Phone:</strong> {address.phone}
                        </p>
                        {address.email && (
                          <p>
                            <strong>Email:</strong> {address.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="address-form-container">
                    <form
                      onSubmit={handleAddressSubmit}
                      className="address-form"
                    >
                      <div className="form-row">
                        <input
                          type="text"
                          name="first_name"
                          placeholder="First Name*"
                          value={addressForm.first_name}
                          onChange={handleAddressChange}
                          required
                        />
                        <input
                          type="text"
                          name="last_name"
                          placeholder="Last Name*"
                          value={addressForm.last_name}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={addressForm.email}
                        onChange={handleAddressChange}
                      />
                      <input
                        type="text"
                        name="street"
                        placeholder="Street Address*"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        type="text"
                        name="landmark"
                        placeholder="Landmark (optional)"
                        value={addressForm.landmark}
                        onChange={handleAddressChange}
                      />
                      <div className="form-row">
                        <input
                          type="text"
                          name="city"
                          placeholder="City*"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          required
                        />
                        <input
                          type="text"
                          name="postal_code"
                          placeholder="Postal Code"
                          value={addressForm.postal_code}
                          onChange={handleAddressChange}
                        />
                      </div>
                      <input
                        type="text"
                        name="country"
                        placeholder="Country*"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number*"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        required
                      />
                      <div className="form-actions">
                        <button type="submit" className="save-address-btn">
                          Save Address
                        </button>
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => {
                            setShowAddressForm(false);
                            if (address) {
                              setAddressForm(address);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="userdetail-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="btn-icon" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
