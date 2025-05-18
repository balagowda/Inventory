import "../../Styles/products.css"; 
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar"; 
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]); // Product list from backend
  const [cart, setCart] = useState([]); // Cart state as an array of cart items
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to get the token from local storage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products/catalog", {
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
        const response = await axios.get("/api/carts/view", {
          headers: getAuthHeader(),
        });

        // Set only the cartItems array
        setCart(response.data.cartItems||[]);
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
    await axios.post(
      "/api/carts/add",
      {
        product,
        quantity: 1,
      },
      {
        headers: getAuthHeader(),
      }
    );

    // Re-fetch cart to get updated list
    const cartResponse = await axios.get("/api/carts/view", {
      headers: getAuthHeader(),
    });
    setCart(cartResponse.data.cartItems);
  } catch (err) {
    setError("Failed to add to cart.");
  }
};

  // Update quantity
  const updateQuantity = async (cartItemId,product, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity < 1
    try {
      await axios.put(
        `/api/carts/update/${cartItemId}`,
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
      await axios.delete(`/api/carts/delete/${cartItemId}`, {
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
    return cart.find((item) => item.product?.id === productId);
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="products-container">
      <Navbar />
      <div className="products-content">
        <div className="products-header">
          <div className="title-wrapper">
            <h1 className="products-title">Products</h1>
          </div>
          <Link to="/user/cart" className="cart-link-btn">
            View Cart
          </Link>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by product name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {error && <p className="product-error">{error}</p>}
        {filteredProducts.length === 0 && !error && (
          <div className="no-products">
            <p>No such product found</p>
          </div>
        )}
        {filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const cartItem = getCartItemForProduct(product.id);
              return (
                <div key={product.id} className="product-card">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRue2sWNCwaJd-yZ4TzMKHsNRqoDIQwz3azYA&s";
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
        )}
      </div>
    </div>
  );
};

export default Products;