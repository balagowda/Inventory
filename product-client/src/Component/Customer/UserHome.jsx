import React from 'react';
import '../../Styles/userhome.css';
import Navbar from '../Navbar';
import { Link } from "react-router-dom";

function UserHome() {
  return (
    <div className="user-home-container">
      <Navbar />
      <div className="main-content">
        <h1 className="welcome-title">Welcome Back!</h1>
        <p className="welcome-message">
          Explore the products available Buy and manage your orders with ease.
        </p>
        <div className="action-cards">
          <Link to="/user/products" className="action-card">
            <h3 className="action-card-title">View Products</h3>
            <p className="action-card-description">Find and order the products that you want.</p>
          </Link>
          <Link to="/user/cart" className="action-card">
            <h3 className="action-card-title">View Cart</h3>
           <p className="action-card-description">View Your cart items</p>
          </Link>
          <Link to="/user/orders" className="action-card">
            <h3 className="action-card-title">Your Orders</h3>
            <p className="action-card-description">Track your order statuses.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
  export default UserHome;