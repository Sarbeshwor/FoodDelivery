import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";



const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setUser } = useContext(StoreContext); 
 


  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name?.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (currState === "Sign Up") {
      try {
        const res = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: name,
            email,
            password,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          // alert("Account created!");
          setCurrState("Login");
        } else {
          // alert(data.message || "Signup failed");
        }
      } catch (err) {
        // alert("Network error: " + err.message);
      }
    } else if (currState === "Login") {
      try {
        const res = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          // toast.success(`Welcome back, ${data.user.username}!`);
          toast.success(`Welcome back, ${data.user.username}!`);
          
          // alert(`Welcome back, ${data.user.username}!`);
          setIsLoggedIn(true);
          setShowLogin(false);
          setUser(data.user); 
        } else {
          // alert(data.message || "Login failed");
        }
      } catch (err) {
        // alert("Network error: " + err.message);
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
          {currState === "Login" ? null : (
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
        <button disabled={isLoggedIn}>
          {isLoggedIn
            ? "Signed In"
            : currState === "Sign Up"
            ? "Create Account"
            : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
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
