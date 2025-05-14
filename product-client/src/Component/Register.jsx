import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/auth.css";

function Register() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    role:"Customer"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify(formData),
      })
        .then((res) => {
          if (res.ok) {
            alert("Registration successful");
            navigator("/login");
          } else {
            alert("Registration failed");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`auth-input ${errors.fullName ? "error" : ""}`}
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
              className={`auth-input ${errors.email ? "error" : ""}`}
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
              className={`auth-input ${errors.phone ? "error" : ""}`}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`auth-input ${errors.username ? "error" : ""}`}
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
              className={`auth-input ${errors.password ? "error" : ""}`}
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
