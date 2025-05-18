import React from 'react';
import Navbar from '../Navbar';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="user-home-container">
      <Navbar />
      <div className="main-content">
        <h1 className="welcome-title">Admin Page</h1>
        <p className="welcome-message">
          Take control of your inventory with our cutting-edge management tools. Explore the features below to get started.
        </p>
        <div className="action-cards">
          <Link to="/admin/inventory" className="action-card">
            <h3 className="action-card-title">View Inventory</h3>
            <p className="action-card-description">View and manage the inventory products.</p>
          </Link>
          <Link to="/admin/buy" className="action-card">
            <h3 className="action-card-title">Buy From Vendors</h3>
           <p className="action-card-description">Get product from vendors</p>
          </Link>
          <Link to="/admin/transaction" className="action-card">
            <h3 className="action-card-title">View Transactions</h3>
            <p className="action-card-description">Track your inventory transaction statuses.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Admin;