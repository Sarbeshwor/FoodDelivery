import React, { useState, useEffect, useContext } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { cartItems, getTotalCartAmount, setCartItems } =
    useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get user info from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Get applied coupon from localStorage (set from Cart page)
  const appliedCoupon = JSON.parse(
    localStorage.getItem("appliedCoupon") || "null"
  );

  const [formData, setFormData] = useState({
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

  // Load delivery info only once on mount or when user.id changes
  useEffect(() => {
    if (!user?.id) return;

    async function fetchDeliveryInfo() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/delivery/user/${user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        } else if (res.status === 404) {
          setFormData({
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
        }
      } catch (err) {
        console.error("Failed to fetch delivery info:", err);
      }
    }

    fetchDeliveryInfo();
  }, [user?.id]); // Only re-run if user.id changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate discount amount from applied coupon
  const getDiscountAmount = () => {
    return appliedCoupon ? appliedCoupon.discount_amount : 0;
  };

  // Calculate final total with discount
  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const discount = getDiscountAmount();
    return Math.max(0, subtotal + deliveryFee - discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to place an order.");
      return;
    }

    const items = Object.entries(cartItems)
      .map(([food_item_id, quantity]) => ({
        food_item_id: Number(food_item_id),
        quantity,
      }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      // Save delivery info with userid from localStorage
      await fetch("http://localhost:5000/api/delivery/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userid: user.id }),
      });

      // Prepare order data with coupon information
      const orderData = {
        user_id: user.id,
        items,
        coupon: appliedCoupon
          ? {
              coupon_code: appliedCoupon.coupon_code,
              discount_percent: appliedCoupon.discount_percent,
              discount_amount: appliedCoupon.discount_amount,
            }
          : null,
        total_amount: getFinalTotal(),
      };

      // Place the order
      const res = await fetch("http://localhost:5000/api/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to place order");
        setLoading(false);
        return;
      }

      toast.success("Order placed successfully!");
      setCartItems({}); // clear cart
      // Clear applied coupon from localStorage
      localStorage.removeItem("appliedCoupon");

      // Redirect to home page after successful order
      navigate("/");
    } catch (error) {
      toast.error("Error placing order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            required
            value={formData.first_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            required
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="street"
          placeholder="Street"
          required
          value={formData.street}
          onChange={handleChange}
        />
        <div className="multi-fields">
          <input
            type="text"
            name="city"
            placeholder="City"
            required
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark"
            value={formData.landmark}
            onChange={handleChange}
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            name="postal_code"
            placeholder="Post Code"
            value={formData.postal_code}
            onChange={handleChange}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            required
            value={formData.country}
            onChange={handleChange}
          />
        </div>
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          required
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>BDT {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>BDT {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />

            {/* Coupon Applied From Cart */}
            {appliedCoupon && (
              <div className="cart-total-details discount-row">
                <p>
                  Discount ({appliedCoupon.coupon_code} -
                  {appliedCoupon.discount_percent}%)
                </p>
                <p className="discount-amount">
                  -BDT{" "}
                  {Math.round(
                    (getTotalCartAmount() * appliedCoupon.discount_percent) /
                      100
                  )}
                </p>
              </div>
            )}
            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>BDT {getFinalTotal()}</b>
            </div>
            <hr />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
