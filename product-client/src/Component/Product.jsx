import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; // Assuming Navbar is a separate component

const Product = ({ products, error }) => {
  // State to track items in the cart (product ID and quantity)
  const [cartItems, setCartItems] = useState({});

  // Function to add item to cart
  const addToCart = async (productId) => {
    try {
      // Send POST request to backend to add or update cart
      const response = await axios.post('http://localhost:8080/api/cart/add', {
        productId,
        quantity: 1, // Default quantity when adding to cart
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Assuming JWT authentication
      });

      // Update local cart state
      setCartItems((prev) => ({
        ...prev,
        [productId]: { quantity: prev[productId]?.quantity || 1 },
      }));
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  // Function to update quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    try {
      // Send PUT request to backend to update cart quantity
      await axios.put('http://localhost:8080/api/cart/update', {
        productId,
        quantity: newQuantity,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Update local cart state
      setCartItems((prev) => ({
        ...prev,
        [productId]: { quantity: newQuantity },
      }));
    } catch (err) {
      console.error('Error updating cart:', err);
      alert('Failed to update cart. Please try again.');
    }
  };

  // Function to remove item from cart
  const removeFromCart = async (productId) => {
    try {
      // Send DELETE request to backend to remove item from cart
      await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Update local cart state
      setCartItems((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  return (
    <div className="products-container">
      <Navbar />
      <div className="products-content">
        <h1 className="products-title">Products</h1>
        {error && <p className="product-error">{error}</p>}
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src =
                    "data:image/jpeg;base64,/9j/..."; // Your fallback image
                }}
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">₹{product.price.toFixed(2)}</p>
              <p className="product-stock">
                Stock: {product.stockQuantity} units
              </p>
              <div className="cart-controls">
                {cartItems[product.id] ? (
                  <div className="cart-item-controls">
                    <button
                      className="delete-btn"
                      onClick={() => removeFromCart(product.id)}
                    >
                      🗑️
                    </button>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(product.id, cartItems[product.id].quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="quantity">{cartItems[product.id].quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateQuantity(product.id, cartItems[product.id].quantity + 1)
                        }
                        disabled={cartItems[product.id].quantity >= product.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stockQuantity === 0}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;