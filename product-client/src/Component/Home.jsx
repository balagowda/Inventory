import { Link } from "react-router-dom";
import React from "react";
import "../Styles/home.css"; 

function Home() {
    return (
      <div className="home-container">
        <h1 className="home-title">Welcome to Inventory System</h1>
        <p className="home-description">
          Manage your inventory efficiently and effortlessly
        </p>
        <div className="home-buttons">
          <Link to="/register" className="home-button home-button-primary">
            Register
          </Link>
          <Link to="/login" className="home-button home-button-secondary">
            Login
          </Link>
        </div>
      </div>
    );
  }

export default Home;