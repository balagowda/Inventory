import React from 'react';
import '../Styles/userhome.css';
import Navbar from './Navbar';
import { Link } from "react-router-dom";

function UserHome() {
  return (
    <div className="user-home-container">
      <Navbar />
      <div className="main-content">
        <h1 className="welcome-title">Welcome Back!</h1>
        <p className="welcome-message">
          Take control of your inventory with our cutting-edge management tools. Explore the features below to get started.
        </p>
        <div className="action-cards">
          <Link to="/products" className="action-card">
            <h3 className="action-card-title">View Inventory</h3>
            <p className="action-card-description">Check your current stock levels and details.</p>
          </Link>
          <Link to="/cart" className="action-card">
            <h3 className="action-card-title">View Cart</h3>
           <p className="action-card-description">View Your cart items</p>
          </Link>
          <Link to="/orders" className="action-card">
            <h3 className="action-card-title">Manage Orders</h3>
            <p className="action-card-description">Track and update your order statuses.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
  export default UserHome;