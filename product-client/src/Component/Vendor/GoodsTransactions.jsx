import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../Styles/transaction.css';

const GoodsTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState({});

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch transactions and calculate category subtotals
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/orders/vendor', {
          headers: getAuthHeader(),
        });
        const transactionsData = response.data;
        
        setTransactions(transactionsData);

      } catch (err) {
        setError('Failed to load transactions.');
      }
    };
    fetchTransactions();
  }, []); // <-- Add this line to close useEffect

  // Update transaction status
  const updateStatus = async (transactionId, newStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [transactionId]: true }));

    console.log(newStatus);
    
    try {
      await axios.put(
        `/api/orders/vendorupdate/${transactionId}`,
        newStatus ,
        {
         headers: {
            ...getAuthHeader(),
            "Content-Type": "text/plain"
          }
        }
      );
      
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, status: newStatus } : t
        )
      );
      setError(null);
      console.log('Transaction status updated successfully');
      
    } catch (err) {
      setError('Failed to update transaction status.');
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  // Open invoice modal and fetch order items
  const openInvoiceModal = async (transaction) => {
    console.log(transaction);
    
    setSelectedTransaction(transaction);
    try {
      setOrderItems(transaction.orderItems);
    } catch (err) {
      setError('Failed to load order items.');
    }
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setSelectedTransaction(null);
    setOrderItems([]);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="transaction-container">
      <Navbar />
      <div className="transaction-content">
        <div className="transaction-header">
          <h1 className="transaction-title">Inventory System - Vendor Transactions</h1>
        </div>
        {error && <p className="transaction-error">{error}</p>}
        {transactions.length === 0 && !error && (
          <div className="no-transactions">
            <p>No transactions found</p>
          </div>
        )}
        {transactions.length > 0 && (
          <div className="transaction-table-container">
            <h2 className="transaction-table-title">Sales Transaction List</h2>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>User ID</th>
                  <th>Total Amount</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{formatDate(transaction.orderDate)}</td>
                    <td>
                      <select
                        value={transaction.status}
                        onChange={(e) => updateStatus(transaction.id, e.target.value)}
                        disabled={statusUpdating[transaction.id]}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </td>
                    <td>{transaction.userId}</td>
                    <td>₹{transaction.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        className="invoice-btn"
                        onClick={() => openInvoiceModal(transaction)}
                      >
                        View Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoice Modal */}
        {selectedTransaction && (
          <div className="invoice-modal-overlay">
            <div className="invoice-modal">
              <h2>Sale - Order #{selectedTransaction.id}</h2>
              <div className="invoice-details">
                {/* <p><strong>Date:</strong> {formatDate(selectedTransaction.date)}</p> */}
                <p><strong>User ID:</strong> {selectedTransaction.userId}</p>
                <p><strong>Status:</strong> {selectedTransaction.status}</p>
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
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.goods.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-grand-total">
                <strong>Grand Total:</strong> ₹{selectedTransaction.totalAmount.toFixed(2)}
              </div>
              <div className="modal-actions">
                <button className="close-btn" onClick={closeInvoiceModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
  );
};

export default GoodsTransactions;