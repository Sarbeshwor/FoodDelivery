import React, { useState, useEffect } from "react";
import "./Coupons.css";
import { toast } from "react-toastify";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    coupon_code: "",
    discount_percent: "",
    valid_from: "",
    valid_until: "",
    usage_limit: "",
  });

  // Get kitchen ID from localStorage (assuming it's stored during login)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const kitchenId = user.kitchenId;

  useEffect(() => {
    if (kitchenId) {
      fetchCoupons();
    } else {
      toast.error("Kitchen ID not found. Please login again.");
      setLoading(false);
    }
  }, [kitchenId]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/coupons?kitchenId=${kitchenId}`
      );
      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.message || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kitchenId) {
      toast.error("Kitchen ID not found");
      return;
    }

    const submitData = {
      ...formData,
      kitchen_id: kitchenId,
      discount_percent: parseInt(formData.discount_percent),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
    };

    try {
      const url = editingCoupon
        ? `http://localhost:5000/api/coupons/${editingCoupon.id}`
        : "http://localhost:5000/api/coupons";

      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
        resetForm();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Error saving coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      coupon_code: coupon.coupon_code,
      discount_percent: coupon.discount_percent.toString(),
      valid_from: new Date(coupon.valid_from).toISOString().slice(0, 16),
      valid_until: new Date(coupon.valid_until).toISOString().slice(0, 16),
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/coupons/${couponId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Error deleting coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      coupon_code: "",
      discount_percent: "",
      valid_from: "",
      valid_until: "",
      usage_limit: "",
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (validFrom, validUntil) => {
    const now = new Date();
    return new Date(validFrom) <= now && new Date(validUntil) >= now;
  };

  const getStatusBadge = (coupon) => {
    if (isExpired(coupon.valid_until)) {
      return <span className="status-badge expired">Expired</span>;
    } else if (isActive(coupon.valid_from, coupon.valid_until)) {
      return <span className="status-badge active">Active</span>;
    } else {
      return <span className="status-badge upcoming">Upcoming</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading coupons...</div>;
  }

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <h2>Manage Coupons</h2>
        <button
          className="add-coupon-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add New Coupon"}
        </button>
      </div>

      {showForm && (
        <div className="coupon-form-container">
          <h3>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
          <form onSubmit={handleSubmit} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="coupon_code">Coupon Code *</label>
                <input
                  type="text"
                  id="coupon_code"
                  name="coupon_code"
                  value={formData.coupon_code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE20"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discount_percent">Discount Percentage *</label>
                <input
                  type="number"
                  id="discount_percent"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  placeholder="e.g., 20"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="valid_from">Valid From *</label>
                <input
                  type="datetime-local"
                  id="valid_from"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="valid_until">Valid Until *</label>
                <input
                  type="datetime-local"
                  id="valid_until"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usage_limit">Usage Limit (Optional)</label>
                <input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupons-list">
        {coupons.length === 0 ? (
          <div className="no-coupons">
            <p>
              No coupons found. Create your first coupon to attract customers!
            </p>
          </div>
        ) : (
          <div className="coupons-table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Code</div>
                <div className="table-cell">Discount</div>
                <div className="table-cell">Valid From</div>
                <div className="table-cell">Valid Until</div>
                <div className="table-cell">Usage Limit</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Actions</div>
              </div>
            </div>
            <div className="table-body">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="table-row">
                  <div className="table-cell">
                    <span className="coupon-code">{coupon.coupon_code}</span>
                  </div>
                  <div className="table-cell">
                    <span className="discount">{coupon.discount_percent}%</span>
                  </div>
                  <div className="table-cell">
                    {new Date(coupon.valid_from).toLocaleDateString()}
                  </div>
                  <div className="table-cell">
                    {new Date(coupon.valid_until).toLocaleDateString()}
                  </div>
                  <div className="table-cell">
                    {coupon.usage_limit || "Unlimited"}
                  </div>
                  <div className="table-cell">{getStatusBadge(coupon)}</div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(coupon)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
