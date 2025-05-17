import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const Vendor = () => {  
  return (
    <div className="user-home-container">
      <Navbar />
      <div className="main-content">
        <h1 className="welcome-title">Vendors Page</h1>
        <p className="welcome-message">
          Take control of your products with our cutting-edge management tools. Explore the features now.
        </p>
        <div className="action-cards">
          <Link to="/vendor/goods" className="action-card">
            <h3 className="action-card-title">View Goods</h3>
            <p className="action-card-description">View and manage the inventory products.</p>
          </Link>
          <Link to="/vendor/add" className="action-card">
            <h3 className="action-card-title">Add Goods</h3>
           <p className="action-card-description">Add more products to sell</p>
          </Link>
          <Link to="/vendor/transaction" className="action-card">
            <h3 className="action-card-title">View Transactions</h3>
            <p className="action-card-description">Track your order transaction statuses.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Vendor;