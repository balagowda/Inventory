import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Navbar from './Navbar';
import '../Styles/transaction.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const chartRef = useRef(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch transactions and calculate category subtotals
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/orders/catalog', {
          headers: getAuthHeader(),
        });
        const transactionsData = response.data;
        setTransactions(transactionsData);

        // Calculate subtotals by category
        const categoryMap = {};
        transactionsData.forEach((transaction) => {
          transaction.orderItems.forEach((item) => {
            const category = item.product.category || 'Unknown';
            const subtotal = item.total || item.quantity * item.unitPrice;
            categoryMap[category] = (categoryMap[category] || 0) + subtotal;
          });
        });

        // Prepare pie chart data
        const labels = Object.keys(categoryMap);
        const data = Object.values(categoryMap);
        const colors = [
          '#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd',
          '#1e40af', '#1e3a8a', '#dbeafe', '#bfdbfe', '#eff6ff'
        ].slice(0, labels.length);

        setCategoryData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('fa', 'ff')),
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        setError('Failed to load transactions.');
      }
    };
    fetchTransactions();

    // Cleanup chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  // Update transaction status
  const updateStatus = async (transactionId, newStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [transactionId]: true }));

    console.log(newStatus);
    
    try {
      await axios.put(
        `http://localhost:8080/api/orders/update/${transactionId}`,
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

  // Pie chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left',
        labels: {
          font: { size: 16, family: 'Inter' },
          color: '#1f2937',
           padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 15,
        callbacks: {
          label: (context) => `₹${context.parsed.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="transaction-container">
      <Navbar />
      <div className="transaction-content">
        <div className="transaction-header">
          <h1 className="transaction-title">Inventory System - Transactions</h1>
        </div>
        {categoryData.labels.length > 0 && (
          <div className="pie-chart-container">
            <h2 className="pie-chart-title">Sales by Product Category</h2>
            <div className="pie-chart-wrapper">
              <Pie
                data={categoryData}
                options={chartOptions}
                ref={(el) => {
                  if (el && el.chartInstance) {
                    chartRef.current = el.chartInstance;
                  }
                }}
              />
            </div>
          </div>
        )}
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
                      <td>{item.product.name}</td>
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

export default Transaction;