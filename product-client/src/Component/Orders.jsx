import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import '../Styles/order.css'; 
import axios from 'axios';

const Order = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
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

  const filteredOrders = orders.filter(order =>
    order.orderItems.some(item =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="orders-list">
            {filteredOrders.map((order) =>
              order.orderItems.map((item) => (
                <div key={item.id} className="order-row">
                  <div className="order-left">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="product-image"
                    />
                    <div className="order-details">
                      <span className="product-name">{item.product.name}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Unit Price: ₹{item.unitPrice.toFixed(2)}</span>
                      <span>Ordered On: {new Date(order.orderDate).toLocaleDateString()}</span>
                      <span>Status: {order.status}</span>
                    </div>
                  </div>
                  <div className="order-right">
                    <span className="total-price">
                      Subtotal: ₹{item.subTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Order;
