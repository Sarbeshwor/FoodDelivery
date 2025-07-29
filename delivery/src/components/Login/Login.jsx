import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        const roles = data.user.roles;

        // Check if user is a delivery person
        if (!roles.includes("delivery")) {
          toast.error(
            "Access denied. Only delivery personnel can access this app."
          );
          return;
        }

        const userToStore = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          roles,
        };

        localStorage.setItem("user", JSON.stringify(userToStore));
        toast.success(`Welcome back, ${data.user.username}!`);
        onLoginSuccess(userToStore);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Delivery Portal Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
