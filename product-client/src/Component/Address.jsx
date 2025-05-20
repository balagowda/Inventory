import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../Styles/address.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Helper to get the token from local storage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          "/api/address/catalog",
          {
            headers: getAuthHeader(),
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch addresses");
        }

        const data = response.data || [];
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }

    try {
      const response = await axios.post(
        "/api/orders/add",
        selectedAddress,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json", 
          },
        }
      );
      if (response.status !== 201) {
        throw new Error("Failed to place order");
      }

      const orderData = await response.data;
      // Redirect to payment page with total amount
      navigate("/user/order/payment", { state: { totalAmount:orderData.totalAmount, orderId:orderData.id } });
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.street) errors.street = "Street is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.postalCode) errors.postalCode = "Postal Code is required";
    if (!formData.country) errors.country = "Country is required";
    return errors;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.post(
        "/api/address/add",
        {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        {
          headers: getAuthHeader(),
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to add address");
      }

      const newAddress = await response.data;
      setAddresses([...addresses, newAddress]);
      setFormData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
      setFormErrors({});
      setShowForm(false);
      setSelectedAddress(newAddress.id);
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  return (
    <div className="address-container">
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="address-header">
        <h1 className="address-title">Select Address</h1>
        <button className="place-order-btn" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="no-address">
          <button className="add-address-btn" onClick={() => setShowForm(true)}>
            Add New Address
          </button>
        </div>
      ) : (
        <div className="address-content">
          {!showForm && (
            <div className="address-list">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`address-item ${
                    selectedAddress === address.id ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === address.id}
                    onChange={() => setSelectedAddress(address.id)}
                    className="address-radio"
                  />
                  <div className="address-details">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              ))}
              <button
                className="add-address-btn"
                onClick={() => setShowForm(true)}
              >
                Add New Address
              </button>
            </div>
          )}
          {showForm && (
            <div className="address-form-container">
              <h2 className="form-title">Add New Address</h2>
              <div className="address-form">
                <div className="form-group">
                  <label htmlFor="street">Street</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={formErrors.street ? "error" : ""}
                  />
                  {formErrors.street && (
                    <span className="error-text">{formErrors.street}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? "error" : ""}
                  />
                  {formErrors.city && (
                    <span className="error-text">{formErrors.city}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={formErrors.state ? "error" : ""}
                  />
                  {formErrors.state && (
                    <span className="error-text">{formErrors.state}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={formErrors.postalCode ? "error" : ""}
                  />
                  {formErrors.postalCode && (
                    <span className="error-text">{formErrors.postalCode}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={formErrors.country ? "error" : ""}
                  />
                  {formErrors.country && (
                    <span className="error-text">{formErrors.country}</span>
                  )}
                </div>
                <div className="form-actions">
                  <button className="submit-btn" onClick={handleAddAddress}>
                    Save Address
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Address;
