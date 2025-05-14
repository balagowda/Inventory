import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("http://localhost:8080/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) navigate("/login");
      })
      .catch((err) => console.error("Logout failed:", err));
  };
  return (
    <nav className="navbar">
      <div className="navbar-brand">Inventory System</div>
      <div className="profile-container">
        <div className="profile-icon">U</div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
