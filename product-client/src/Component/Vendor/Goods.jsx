import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "../../Styles/inventory.css"; 

const Goods = () => {
  const [products, setProducts] = useState([]); // Product list from backend
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // For modal
  const [formData, setFormData] = useState({}); // Form data for editing
  const [formErrors, setFormErrors] = useState({}); // Validation errors

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  //console.log(products);
  
  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/goods/catalog", {
          headers: getAuthHeader(),
        });
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products.");
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  // Open modal with prefilled product data
  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      productStatus: product.goodsStatus,
      imageUrl: product.imageUrl,
    });
    setFormErrors({});
  };

  // Close modal
  const closeUpdateModal = () => {
    setSelectedProduct(null);
    setFormData({});
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be a positive number";
    }

    if (!formData.stockQuantity || formData.stockQuantity < 0) {
      errors.stockQuantity = "Stock quantity must be a non-negative number";
    }

    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }

    if (!formData.productStatus) {
      errors.status = "Status is required";
    }

    if (!formData.imageUrl.trim()) {
      errors.imageUrl = "Image URL is required";
    }
    // } else if (!/^https?:\/\/.*\$/.test(formData.imagUrl)) {
    //   errors.imageUrl = "Please provide a valid image URL (png, jpg, jpeg, gif)";
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update product
  const updateProduct = async () => {
    if (!validateForm()) return;

    try {
      const updatedProduct = {
        ...selectedProduct,
        ...formData,
      };
      
      await axios.put(`/api/goods/update/${selectedProduct.id}`, updatedProduct, {
        headers: getAuthHeader(),
      });

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
      );
      closeUpdateModal();
      console.log("Product updated successfully");
      
      setError(null);
    } catch (err) {
      setError("Failed to update product.");
    }
  };

  return (
    <div className="products-container">
      <Navbar />
      <div className="products-content">
        <div className="products-header">
          <div className="title-wrapper">
            <h1 className="products-title">Vendor Goods</h1>
          </div>
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
            <p>No such goods found</p>
          </div>
        )}
        {filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={product.imageUrl}
                  alt={product.goods_name}
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
                  <button
                    className="add-to-cart-btn update-prod-btn"
                    onClick={() => openUpdateModal(product)}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        {selectedProduct && (
          <div className="update-modal-overlay">
            <div className="update-modal">
              <h2>Update Product</h2>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <p className="error-text">{formErrors.name}</p>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? 'input-error' : ''}
                />
                {formErrors.description && <p className="error-text">{formErrors.description}</p>}
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={formErrors.price ? 'input-error' : ''}
                />
                {formErrors.price && <p className="error-text">{formErrors.price}</p>}
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className={formErrors.stockQuantity ? 'input-error' : ''}
                />
                {formErrors.stockQuantity && <p className="error-text">{formErrors.stockQuantity}</p>}
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={formErrors.category ? 'input-error' : ''}
                />
                {formErrors.category && <p className="error-text">{formErrors.category}</p>}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="productStatus"
                  value={formData.productStatus}
                  onChange={handleInputChange}
                  className={formErrors.status ? 'input-error' : ''}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OUTOFSTOCK">Out of Stock</option>
                  <option value="BLOCK">Block</option>
                </select>
                {formErrors.status && <p className="error-text">{formErrors.status}</p>}
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={formErrors.imageUrl ? 'input-error' : ''}
                />
                {formErrors.imageUrl && <p className="error-text">{formErrors.imageUrl}</p>}
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeUpdateModal}>
                  Cancel
                </button>
                <button className="update-btn" onClick={updateProduct}>
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goods;