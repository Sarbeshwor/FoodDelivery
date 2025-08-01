import React, { useContext, useState, useEffect } from "react";
import "./UserDetail.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";
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
  FaStar,
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

  // New states for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRatingOrder, setCurrentRatingOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  if (!context) {
    return (
      <div>
        Error: StoreContext not found. Make sure you wrapped your app with
        StoreContextProvider.
      </div>
    );
  }

  const { user, logout, updateUser } = context;

  // Initialize profile form when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const formData = new FormData();

      // Add form fields
      if (profileForm.username.trim()) {
        formData.append("username", profileForm.username.trim());
      }
      if (profileForm.email.trim()) {
        formData.append("email", profileForm.email.trim());
      }
      if (profileForm.phone.trim()) {
        formData.append("phone", profileForm.phone.trim());
      }

      // Add image if selected
      if (profileImage) {
        formData.append("image", profileImage);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/user/${user.id}/profile`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update user context if updateUser function exists
        if (updateUser) {
          updateUser(data.user);
        }

        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
        setProfileImage(null);
        setPreviewImage(null);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Cancel profile editing
  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfileImage(null);
    setPreviewImage(null);
  };

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoadingOrders(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/user-orders/${user.id}`
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
        `${API_BASE_URL}/api/delivery/user/${user.id}`
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
      const response = await fetch("${API_BASE_URL}/api/delivery/save", {
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
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/cancel/${order_item_id}`,
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
    return ["pending", "accepted", "ready_for_pickup", "onitsway"].includes(
      status
    );
  };

  // Open rating modal
  const openRatingModal = (order) => {
    setCurrentRatingOrder(order);
    setRating(order.rating || 0);
    setHoverRating(0);
    setShowRatingModal(true);
  };

  // Close rating modal
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setCurrentRatingOrder(null);
    setRating(0);
    setHoverRating(0);
  };

  // Submit rating
  const submitRating = async () => {
    if (!currentRatingOrder || rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await fetch("${API_BASE_URL}/api/order/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_item_id: currentRatingOrder.order_item_id,
          user_id: user.id,
          food_id: currentRatingOrder.food_item_id,
          rating: rating,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Rating submitted successfully!");
        closeRatingModal();
        fetchOrders(); // Refresh orders to show updated rating
      } else {
        toast.error(data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error submitting rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Check if order can be rated
  const canRateOrder = (order) => {
    return order.status === "delivered" && !order.rating;
  };

  // Render star rating component
  const renderStarRating = (
    currentRating,
    isInteractive = false,
    size = "normal"
  ) => {
    const stars = [];
    const starCount = 5;

    for (let i = 1; i <= starCount; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`rating-star ${size} ${
            i <= (isInteractive ? hoverRating || rating : currentRating)
              ? "filled"
              : "empty"
          }`}
          onClick={isInteractive ? () => setRating(i) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(i) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        />
      );
    }

    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="userdetail-overlay">
      <div className="userdetail-container">
        <div className="userdetail-header">
          <div className="header-content">
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.image_url ? (
                  <img
                    src={user.image_url}
                    alt={user.username || "User"}
                    className="avatar-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="avatar-initials"
                  style={{ display: user?.image_url ? "none" : "flex" }}
                >
                  {getUserInitials(user?.username)}
                </div>
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
              {!isEditingProfile ? (
                <>
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
                      {user?.phone && (
                        <div className="info-item">
                          <FaEnvelope className="info-icon" />
                          <div className="info-details">
                            <label>Phone</label>
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button
                      className="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <FaEdit className="btn-icon" />
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                <div className="profile-edit-section">
                  <h3>Edit Profile</h3>
                  <form
                    onSubmit={handleProfileSubmit}
                    className="profile-edit-form"
                  >
                    <div className="profile-image-upload">
                      <div className="image-preview">
                        <div className="current-image">
                          {previewImage ? (
                            <img src={previewImage} alt="Preview" />
                          ) : user?.image_url ? (
                            <img src={user.image_url} alt="Current profile" />
                          ) : (
                            <div className="avatar-circle large">
                              {getUserInitials(user?.username)}
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="profile-image"
                          className="image-upload-btn"
                        >
                          <FaEdit className="btn-icon" />
                          Change Photo
                        </label>
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          hidden
                        />
                      </div>
                    </div>

                    <div className="form-fields">
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          placeholder="Enter username"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          placeholder="Enter email"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="save-profile-btn"
                        disabled={updatingProfile}
                      >
                        {updatingProfile ? (
                          <>
                            <FaSpinner className="btn-icon spinning" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="btn-icon" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={cancelProfileEdit}
                        disabled={updatingProfile}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
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

                          {/* Rating section for delivered orders */}
                          {order.status === "delivered" && (
                            <div className="order-rating">
                              {order.rating ? (
                                <div className="rating-display">
                                  <span className="rating-label">
                                    Your rating:
                                  </span>
                                  {renderStarRating(
                                    order.rating,
                                    false,
                                    "small"
                                  )}
                                </div>
                              ) : (
                                <button
                                  className="rate-order-btn"
                                  onClick={() => openRatingModal(order)}
                                  title="Rate this order"
                                >
                                  <FaStar className="btn-icon" />
                                  Rate Order
                                </button>
                              )}
                            </div>
                          )}

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

      {/* Rating Modal */}
      {showRatingModal && currentRatingOrder && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <div className="rating-modal-header">
              <h3>Rate Your Order</h3>
              <button
                className="modal-close-btn"
                onClick={closeRatingModal}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="rating-modal-content">
              <div className="order-item-info">
                <img
                  src={currentRatingOrder.image}
                  alt={currentRatingOrder.item_name}
                  className="modal-order-image"
                  onError={(e) => {
                    e.target.src = "/placeholder-food.png";
                  }}
                />
                <div className="modal-order-details">
                  <h4>{currentRatingOrder.item_name}</h4>
                  <p>Quantity: {currentRatingOrder.quantity}</p>
                  <p>Total: BDT {currentRatingOrder.total_amount}</p>
                </div>
              </div>

              <div className="rating-section">
                <p className="rating-instruction">
                  How would you rate this order?
                </p>
                {renderStarRating(rating, true, "large")}
                <div className="rating-labels">
                  <span className="rating-text">
                    {rating === 0 && "Select a rating"}
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                </div>
              </div>

              <div className="rating-modal-actions">
                <button
                  className="submit-rating-btn"
                  onClick={submitRating}
                  disabled={rating === 0 || submittingRating}
                >
                  {submittingRating ? (
                    <>
                      <FaSpinner className="btn-icon spinning" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaStar className="btn-icon" />
                      Submit Rating
                    </>
                  )}
                </button>
                <button
                  className="cancel-rating-btn"
                  onClick={closeRatingModal}
                  disabled={submittingRating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
