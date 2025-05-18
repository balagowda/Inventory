import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../Styles/byvendor.css';

const BuyfromVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantityErrors, setQuantityErrors] = useState({});

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/getvendors', {
          headers: getAuthHeader(),
        });
        setVendors(response.data);
        setApiError(null);
      } catch (err) {
        setApiError('Failed to load vendors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleVendorChange = async (e) => {
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);
    setSelectedProducts({});
    setQuantityErrors({});
    setApiError(null);

    if (vendorId) {
      try {
        setLoading(true);
        const response = await axios.get(`/api/goods/vendor/${vendorId}`, {
          headers: getAuthHeader(),
        });
        setProducts(response.data);
      } catch (err) {
        setApiError('Failed to load products for the selected vendor.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    } else {
      setProducts([]);
    }
  };

  const handleProductSelect = (productId, stockQuantity) => {
    setSelectedProducts((prev) => {
      if (prev[productId]) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { quantity: 1, stockQuantity } };
    });
    setQuantityErrors((prev) => ({ ...prev, [productId]: null }));
  };

  const handleQuantityChange = (productId, value, stockQuantity) => {
    const quantity = parseInt(value, 10);
    let error = null;

    if (isNaN(quantity) || quantity <= 0) {
      error = 'Quantity must be greater than 0';
    } else if (quantity > stockQuantity) {
      error = `Quantity cannot exceed stock (${stockQuantity})`;
    }

    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: { quantity: value, stockQuantity },
    }));
    setQuantityErrors((prev) => ({ ...prev, [productId]: error }));
  };

  const handleBuy = async () => {
    const hasValidSelection = Object.entries(selectedProducts).some(
      ([productId, { quantity }]) =>
        !quantityErrors[productId] && parseInt(quantity, 10) > 0
    );

    if (!hasValidSelection) {
      setApiError('Please select at least one product with a valid quantity.');
      return;
    }

    const orderItems = Object.entries(selectedProducts)
      .filter(([_, { quantity }]) => parseInt(quantity, 10) > 0 && !quantityErrors[_.productId])
      .map(([productId, { quantity }]) => ({
        productId: parseInt(productId, 10),
        quantity: parseInt(quantity, 10),
      }));

    try {
      setLoading(true);
     const response =  await axios.post(
        `/api/orders/buyorder/${selectedVendorId}`,
        orderItems ,
        { headers: getAuthHeader() }
      );
      console.log(response.data);
      
      setSelectedProducts({});
      setQuantityErrors({});
      setApiError(null);
      alert('Order placed successfully!');
    } catch (err) {
      setApiError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBuyButtonVisible = Object.keys(selectedProducts).some(
    (productId) =>
      parseInt(selectedProducts[productId].quantity, 10) > 0 &&
      !quantityErrors[productId]
  );

  return (
    <div className="buy-vendor-container">
      <Navbar />
      <div className="buy-vendor-content">
        <div className="buy-vendor-header">
          <h1 className="buy-vendor-title">Inventory System - Buy from Vendor</h1>
        </div>

        <div className="vendor-selection-section">
          <div className="form-group">
            <label htmlFor="vendor">Select Vendor</label>
            <select
              id="vendor"
              value={selectedVendorId}
              onChange={handleVendorChange}
              className="vendor-select"
              disabled={loading}
            >
              <option value="">Choose a Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="loading-text">Loading...</p>}

        {products.length > 0 && (
          <div className="products-list">
            <h2 className="products-title">Vendor Products</h2>
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price (₹)</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selectedProducts[product.id]}
                          onChange={() => handleProductSelect(product.id, product.stockQuantity)}
                          disabled={product.stockQuantity === 0}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>
                        {product.description.substring(0, 50) +
                          (product.description.length > 50 ? '...' : '')}
                      </td>
                      <td>{product.price.toFixed(2)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.category}</td>
                      <td>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-image"
                        />
                      </td>
                      <td>{product.goodsStatus}</td>
                      <td>
                        {selectedProducts[product.id] && (
                          <div className="quantity-input">
                            <input
                              type="number"
                              min="1"
                              max={product.stockQuantity}
                              value={selectedProducts[product.id].quantity || ''}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  e.target.value,
                                  product.stockQuantity
                                )
                              }
                              className={quantityErrors[product.id] ? 'input-error' : ''}
                            />
                            {quantityErrors[product.id] && (
                              <p className="error-text">{quantityErrors[product.id]}</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isBuyButtonVisible && (
              <button className="buy-btn" onClick={handleBuy} disabled={loading}>
                Buy
              </button>
            )}
          </div>
        )}

        {apiError && <p className="api-error">{apiError}</p>}
      </div>
    </div>
  );
};

export default BuyfromVendors;