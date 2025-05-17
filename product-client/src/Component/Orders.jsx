import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import '../Styles/order.css';
import axios from 'axios';

const Order = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/orders/all', {
          headers: getAuthHeader(),
        });

        if (response.status !== 200) {
          throw new Error('Failed to fetch orders');
        }

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const formattedDate = new Date(order.orderDate).toLocaleDateString();
    return (
      order.orderItems.some((item) =>
        item.product.name.toLowerCase().includes(searchLower)
      ) || formattedDate.includes(searchLower)
    );
  });

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const showInvoice = (orderId) => {
    setInvoiceOrderId(orderId);
  };

  const closeInvoice = () => {
    setInvoiceOrderId(null);
  };

  const calculateOrderTotal = (order) => {
    return order.orderItems
      .reduce((total, item) => total + item.subTotal, 0)
      .toFixed(2);
  };

  return (
    <div className="order-container">
      <div className="navbar-container">
        <Navbar />
      </div>
      {loading ? (
        <div className="no-orders">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">No Orders Yet</div>
      ) : (
        <>
          <h1 className="orders-title">Your Orders</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by product or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-row">
                <div className="order-content">
                  <div
                    className={`order-left ${expandedOrder === order.id ? 'hidden' : ''}`}
                  >
                    <div className="order-images">
                      {order.orderItems.map((item) => (
                        <img
                          key={item.id}
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="product-image-order"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="order-right">
                    <div className="order-details">
                      <span>Ordered On: {new Date(order.orderDate).toLocaleDateString()}</span>
                      <span>Status: {order.status}</span>
                      <span className="total-price">Total: ₹{calculateOrderTotal(order)}</span>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpand(order.id)}
                      aria-label={expandedOrder === order.id ? 'Collapse order' : 'Expand order'}
                    >
                      <span
                        className={`chevron ${expandedOrder === order.id ? 'chevron-up' : 'chevron-down'}`}
                      />
                    </button>
                    <button
                      className="invoice-btn"
                      onClick={() => showInvoice(order.id)}
                      aria-label="View invoice"
                    >
                      Invoice
                    </button>
                  </div>
                </div>
                {expandedOrder === order.id && (
                  <div className="order-items-details">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="product-image-order"
                        />
                        <div className="item-details">
                          <span className="product-name">{item.product.name}</span>
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit Price: ₹{item.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="item-subtotal">
                          <span>Subtotal: ₹{item.subTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {invoiceOrderId && (
            <div className="invoice-overlay">
              <div className="invoice-container">
                {orders
                  .filter((order) => order.id === invoiceOrderId)
                  .map((order) => (
                    <div key={order.id} className="invoice-content">
                      <h2 className="invoice-title">Inventory System</h2>
                      <h3 className="invoice-subtitle">Bill</h3>
                      <div className="invoice-details">
                        <p>Ordered On: {new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <table className="invoice-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.product.name}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.unitPrice.toFixed(2)}</td>
                              <td>₹{item.subTotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="invoice-grand-total">
                        <p>Grand Total: ₹{calculateOrderTotal(order)}</p>
                      </div>
                      <button className="invoice-close-btn" onClick={closeInvoice}>
                        Close
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Order;