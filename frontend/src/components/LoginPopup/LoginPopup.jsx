import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const { setUser } = useContext(StoreContext);

  const [isKitchenOwner, setIsKitchenOwner] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name?.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (currState === "Sign Up") {
      try {
        
        const type = isKitchenOwner ? "kitchen" : "normal";

        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: name,
            email,
            password,
            type, // backend expects 'type' key
          }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Account created successfully!");
          setCurrState("Login");
          setIsKitchenOwner(false);
        } else {
          toast.error(data.message || "Signup failed");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      }
    } else if (currState === "Login") {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          const roles = data.user.roles;

          const userToStore = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            roles,
          };

         

          toast.success(`Welcome back, ${data.user.username}!`);
         
         
          setShowLogin(false);

          // Redirect
          if (roles.includes("admin") || roles.includes("kitchen")) {
             userToStore.kitchenId = data.user.kitchenId;
             localStorage.setItem("user", JSON.stringify(userToStore));
            window.location.href = "http://localhost:5174/list"; // admin/kitchen portal
          } else {
            setUser(userToStore);
            localStorage.setItem("user", JSON.stringify(userToStore));
            window.location.reload(); // stay in frontend
          }
        }
      } catch (err) {
        toast.error("Network error");
      }
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input type="text" name="name" placeholder="Your Name" required />
          )}
          <input type="email" name="email" placeholder="Your Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>

        {currState === "Sign Up" && (
          <div className="kitchen-owner-checkbox">
            <input
              type="checkbox"
              id="kitchenOwner"
              checked={isKitchenOwner}
              onChange={() => setIsKitchenOwner(!isKitchenOwner)}
            />
            <label htmlFor="kitchenOwner">Sign up as kitchen owner</label>
          </div>
        )}

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
