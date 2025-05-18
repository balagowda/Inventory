import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/auth.css";
import axios from "axios";

function Register() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    role: "Customer"
  });
  const [errors, setErrors] = React.useState({});
  const navigator = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // FullName validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits and start with 6-9";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase, one lowercase, and one special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  //console.log("Form data:", formData);
  
  if (validateForm()) {
    
    try {
      const response = await axios.post("/api/register", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200 || response.status === 201) {
        alert("Registration successful");
        navigator("/login");
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Registration failed");
    }
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-selection">
            <label className="role-label">
              <input
                type="radio"
                name="role"
                value="Customer"
                checked={formData.role === "Customer"}
                onChange={handleChange}
              />
              Customer
            </label>
            <label className="role-label">
              <input
                type="radio"
                name="role"
                value="Vendor"
                checked={formData.role === "Vendor"}
                onChange={handleChange}
              />
              Vendor
            </label>
          </div>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`auth-input ${errors.fullName ? "error-auth" : ""}`}
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="error-message">{errors.fullName}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`auth-input ${errors.email ? "error-auth" : ""}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone number"
              className={`auth-input ${errors.phoneNumber ? "error-auth" : ""}`}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
          </div>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`auth-input ${errors.username ? "error-auth" : ""}`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`auth-input ${errors.password ? "error-auth" : ""}`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>
          <button type="submit" className="auth-button">
            Register
          </button>
        </form>
        <Link to="/login" className="auth-link">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

export default Register;