import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../Styles/addproduct.css';

const Add = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    imageUrl: '',
    goodsStatus: 'AVAILABLE',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const categories = ['Electronics', 'Audio', 'Footwear', 'Stationery', 'Kitchenware'];
  const goodsStatus = ['AVAILABLE', 'OUTOFSTOCK'];

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length > 100) newErrors.name = 'Name must be 100 characters or less';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length > 500) newErrors.description = 'Description must be 500 characters or less';
    
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    
    if (!formData.stockQuantity || formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock quantity must be non-negative';
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    
    if (!formData.goodsStatus) newErrors.productStatus = 'Product status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const product = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
      };
      if (editingIndex !== null) {
        setProducts((prev) => prev.map((p, i) => (i === editingIndex ? product : p)));
      } else {
        setProducts((prev) => [...prev, product]);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
      imageUrl: '',
      goodsStatus: 'AVAILABLE',
    });
    setErrors({});
    setShowModal(false);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    const product = products[index];
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      category: product.category,
      goodsStatus: product.goodsStatus,
      imageUrl: product.imageUrl,
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleRemove = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    try {
        //console.log('Publishing products:', products);
      await axios.post('/api/goods/add', products, {
        headers: getAuthHeader(),
      });
      setProducts([]);
      setApiError(null);
      alert('Products published successfully!');
    } catch (err) {
      setApiError('Failed to publish products. Please try again.');
    }
  };

  return (
    <div className="add-container">
      <Navbar />
      <div className="add-content">
        <div className="add-header">
          <h1 className="add-title">Inventory System - Add Products</h1>
        </div>

        <div className="add-product-section">
          <button
            className="add-product-btn"
            onClick={() => setShowModal(true)}
            title="Add Product"
          >
            <svg
              className="add-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Product
          </button>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editingIndex !== null ? 'Update Product' : 'Add Product'}</h2>
                <form className="add-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={errors.description ? 'input-error' : ''}
                    />
                    {errors.description && <p className="error-text">{errors.description}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price (₹)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className={errors.price ? 'input-error' : ''}
                    />
                    {errors.price && <p className="error-text">{errors.price}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className={errors.stockQuantity ? 'input-error' : ''}
                    />
                    {errors.stockQuantity && <p className="error-text">{errors.stockQuantity}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={errors.category ? 'input-error' : ''}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="error-text">{errors.category}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className={errors.imageUrl ? 'input-error' : ''}
                    />
                    {errors.imageUrl && <p className="error-text">{errors.imageUrl}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="productStatus">Product Status</label>
                    <select
                      id="productStatus"
                      name="goodsStatus"
                      value={formData.goodsStatus}
                      onChange={handleInputChange}
                      className={errors.productStatus ? 'input-error' : ''}
                    >
                      {goodsStatus.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {errors.productStatus && <p className="error-text">{errors.productStatus}</p>}
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="submit-btn">
                      {editingIndex !== null ? 'Update Product' : 'Add Product'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="products-list">
            <h2 className="products-title">Added Products</h2>
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price (₹)</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '')}</td>
                      <td>{product.price.toFixed(2)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.category}</td>
                      <td>
                        <img src={product.imageUrl} alt={product.name} className="product-image-add" />
                      </td>
                      <td>{product.goodsStatus}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(index)}>
                          Edit
                        </button>
                        <button className="remove-btn" onClick={() => handleRemove(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="publish-btn" onClick={handlePublish}>
              Publish Products
            </button>
          </div>
        )}

        {apiError && <p className="api-error">{apiError}</p>}
      </div>
    </div>
  );
};

export default Add;