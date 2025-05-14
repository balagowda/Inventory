import "../Styles/products.css"; 
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar"; 

const Products = () => {
  const [products, setProducts] = useState([]); // Product list from backend
  const [cart, setCart] = useState([]); // Cart state as an array of cart items
  const [error, setError] = useState(null);

  // Helper to get the token from local storage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/products/catalog", {
          headers: getAuthHeader(),
        });
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products.");
      }
    };
    fetchProducts();
  }, []);

  // Fetch user's cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/carts/view", {
          headers: getAuthHeader(),
        });

        // Set only the cartItems array
        setCart(response.data.cartItems);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setError("Failed to load cart.");
      }
    };
    fetchCart();
  }, []);
  

  // Add to cart
  const addToCart = async (product) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/carts/add",
        {
          product,
          quantity: 1,
        },
        {
          headers: getAuthHeader(),
        }
      );

      // Append the new cart item to the cart state
      setCart((prev) => [...prev, response.data]);
    } catch (err) {
      setError("Failed to add to cart.");
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId,product, newQuantity) => {
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
      setCart((prev) =>
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
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      console.log("Item removed from cart successfully");
      
    } catch (err) {
      setError("Failed to remove from cart.");
    }
  };

  // Helper to check if a product is in the cart
  const getCartItemForProduct = (productId) => {
    return cart.find((item) => item.product.id === productId);
  };

  return (
    <div className="products-container">
      <Navbar />
      <div className="products-content">
        <h1 className="products-title">Products</h1>
        {error && <p className="product-error">{error}</p>}
        <div className="products-grid">
          {products.map((product) => {
            const cartItem = getCartItemForProduct(product.id);
            return (
              <div key={product.id} className="product-card">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = " "; // Fallback image
                  }}
                />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                <p className="product-stock">
                  Stock: {product.stockQuantity} units
                </p>
                <div className="product-actions">
                  {cartItem ? (
                    <div className="cart-controls">
                      <button
                        className="delete-btn"
                        onClick={() => removeFromCart(cartItem.id)}
                      >
                        🗑️
                      </button>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.id, product, cartItem.quantity - 1)
                          }
                          disabled={cartItem.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{cartItem.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.id, product, cartItem.quantity + 1)
                          }
                          disabled={cartItem.quantity >= product.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity === 0}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Products;