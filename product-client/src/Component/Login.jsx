import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post("http://localhost:8080/api/login", {
      username,
      password,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // If login is successful and token is returned
    if (response.status === 200 && response.data.token) {
      // Store token in localStorage or sessionStorage
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      //console.log(role);
      
      // Redirect to home
      const route = role === "ADMIN" ? "/admin" : role === "CUSTOMER" ? "/home" : "/vendor";
      navigate(route);
    } else {
      setError("Unexpected response from server");
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      setError("Invalid username or password");
    } else {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
  }
};


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            Login
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <Link to="/register" className="auth-link">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
