import React, { useEffect, useState, useContext } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const Cart = () => {
  const { user } = useContext(StoreContext);
  const [cartData, setCartData] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setCartData([]); // clear cart if no user logged in
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cart/${user.id}`
        );
        console.log("Cart API response:", response.data);
        setCartData(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [user]);

  const removeFromCart = async (cart_item_id) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/delete/${cart_item_id}`
      );
      console.log("Deleted response:", res.data);
      setCartData((prev) =>
        prev.filter((item) => item.cart_item_id !== cart_item_id)
      );
    } catch (error) {
      console.error(
        "Error removing item:",
        error.response?.data || error.message
      );
    }
  };

  // Function to apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (cartData.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setCouponLoading(true);

    try {
      // Get the first item to find kitchen ID
      const firstItem = cartData[0];
      const response = await fetch(`http://localhost:5000/api/food`);
      const foodItems = await response.json();
      const foodItem = foodItems.find(
        (item) => item._id == firstItem.food_item_id
      );

      if (!foodItem || !foodItem.kitchen_id) {
        toast.error("Unable to determine kitchen for coupon validation");
        setCouponLoading(false);
        return;
      }

      // Validate coupon
      const couponResponse = await fetch(
        `http://localhost:5000/api/coupons/validate/${couponCode}?kitchenId=${foodItem.kitchen_id}`
      );
      const couponData = await couponResponse.json();

      if (couponData.success) {
        setAppliedCoupon(couponData.coupon);
        toast.success(
          `Coupon applied! ${couponData.coupon.discount_percent}% discount`
        );
      } else {
        toast.error(couponData.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Error validating coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Function to remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getTotalCartAmount();
    return Math.round((subtotal * appliedCoupon.discount_percent) / 100);
  };

  // Calculate final total with discount
  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 60;
    const discount = getDiscountAmount();
    return Math.max(0, subtotal + deliveryFee - discount);
  };

  const getTotalCartAmount = () => {
    return cartData.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (!user) {
    return <p>Please log in to see your cart.</p>;
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {cartData.map((item) => (
          <div key={item.cart_item_id}>
            <div className="cart-items-title cart-items-item">
              <img src={item.image} alt="" />
              <p>{item.name}</p>
              <p>BDT{item.price}</p>
              <p>{item.quantity}</p>
              <p>BDT{item.price * item.quantity}</p>
              <p
                onClick={() => removeFromCart(item.cart_item_id)}
                className="cross"
              >
                x
              </p>
            </div>
            <hr />
          </div>
        ))}
      </div>

      <div className="cart-bottom">
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
              <p>BDT {getTotalCartAmount() === 0 ? 0 : 60}</p>
            </div>
            <hr />

            {/* Show discount if coupon is applied */}
            {appliedCoupon && (
              <>
                <div className="cart-total-details discount-row">
                  <p>Discount ({appliedCoupon.discount_percent}%)</p>
                  <p className="discount-amount">-BDT {getDiscountAmount()}</p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>
              <b>BDT {getFinalTotal()}</b>
            </div>
            <hr />
          </div>
          <button
            onClick={() => {
              // Store coupon data in localStorage for PlaceOrder page
              if (appliedCoupon) {
                localStorage.setItem(
                  "appliedCoupon",
                  JSON.stringify({
                    ...appliedCoupon,
                    discount_amount: getDiscountAmount(),
                  })
                );
              } else {
                localStorage.removeItem("appliedCoupon");
              }
              navigate("/order");
            }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            {!appliedCoupon ? (
              <>
                <p>If you have a coupon, enter it here</p>
                <div className="cart-promocode-input">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponLoading}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "Validating..." : "Apply"}
                  </button>
                </div>
              </>
            ) : (
              <div className="applied-coupon-display">
                <p>Coupon Applied</p>
                <div className="coupon-details">
                  <span className="coupon-code-display">
                    {appliedCoupon.coupon_code}
                  </span>
                  <span className="coupon-discount-display">
                    {appliedCoupon.discount_percent}% OFF
                  </span>
                  <button
                    className="remove-coupon-btn"
                    onClick={removeCoupon}
                    title="Remove coupon"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
