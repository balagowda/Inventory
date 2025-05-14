import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/cart.css'; 
import Navbar from './Navbar';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   // Helper to get the token from local storage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/carts/view', {
          headers: getAuthHeader(),
        });

        setCartItems(response.data.cartItems || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch cart data');
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  // Calculate total price
  const totalPrice = cartItems
    .reduce((total, item) => total + item.product.price * item.quantity, 0)
    .toFixed(2);

   // Update quantity
  const handleQuantityChange = async (cartItemId,product, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity < 1
    try {
      await axios.put(
        `http://localhost:8080/api/carts/update/${cartItemId}`,
        {
          product,
          quantity: newQuantity,
        },
        {
          headers: getAuthHeader(),
        }
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      console.log("Quantity updated successfully");
      
    } catch (err) {
      setError("Failed to update quantity.");
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/carts/delete/${cartItemId}`, {
        headers: getAuthHeader(),
      });
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      console.log("Item removed from cart successfully");
      
    } catch (err) {
      setError("Failed to remove from cart.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!cartItems.length) return <div className="empty-cart">Your cart is empty</div>;

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <div className="cart-total">Total: ₹{totalPrice}</div>
          <a href="/order" className="order-button">
            Order
          </a>
        </div>
        <div className="cart-container">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-row">
              <img
                src={item.product.image || 'https://via.placeholder.com/100'}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-description">
                  {item.product.description || 'No description available'}
                </div>
              </div>
              <div className="cart-item-price-quantity">
                <div className="cart-item-price">₹{item.product.price?.toFixed(2)}</div>
                <div className="cart-item-quantity">
                  Quantity:
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item.id, item.product ,item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item.id, item.product , item.quantity + 1)}
                    disabled={item.quantity >= item.product.stockQuantity}
                  >
                    +
                  </button>
                  <button
                        className="delete-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cart;