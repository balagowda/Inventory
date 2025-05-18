import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; 
import '../Styles/payment.css'; 
import axios from 'axios';

const Payment = () => {
  const { state } = useLocation();
  const { totalAmount, orderId } = state || { totalAmount: 0, orderId: null };
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const type = {
    credit: 'CREDIT_CARD',
    debit: 'DEBIT_CARD',
    upi: 'UPI', 
  }

  const navigator = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber))
        errors.cardNumber = 'Valid 16-digit card number is required';
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate))
        errors.expiryDate = 'Valid expiry date (MM/YY) is required';
      if (!formData.cvv || !/^\d{3}$/.test(formData.cvv))
        errors.cvv = 'Valid 3-digit CVV is required';
      if (!formData.cardholderName) errors.cardholderName = 'Cardholder name is required';
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId || !/.+@.+/.test(formData.upiId))
        errors.upiId = 'Valid UPI ID is required';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    //console.log(orderId, paymentMethod);
    
    try {
      const paymentType = type[paymentMethod];
      const response = await axios.post(
        `/api/payments/process/${orderId}`,
        paymentType,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "text/plain"
          }
        }
    );

      if (!response || response.status !== 201) {
        throw new Error('Failed to process payment');
      }
      
      alert('Payment successful!'); 
      navigator("/home");
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="payment-container">
      <div className="navbar-container">
        <Navbar />
      </div>
      <h1 className="payment-title">Payment</h1>
      <div className="total-amount">
        Total Amount: ₹{totalAmount.toFixed(2)}
      </div>
      <div className="payment-methods">
        <h2 className="methods-title">Select Payment Method</h2>
        <div className="method-options">
          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              checked={paymentMethod === 'credit'}
              onChange={() => setPaymentMethod('credit')}
            />
            Credit Card
          </label>
          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="debit"
              checked={paymentMethod === 'debit'}
              onChange={() => setPaymentMethod('debit')}
            />
            Debit Card
          </label>
          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
            />
            UPI
          </label>
        </div>
      </div>
      <div className="payment-form-container">
        {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className={formErrors.cardNumber ? 'error' : ''}
              />
              {formErrors.cardNumber && (
                <span className="error-text">{formErrors.cardNumber}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className={formErrors.expiryDate ? 'error' : ''}
              />
              {formErrors.expiryDate && (
                <span className="error-text">{formErrors.expiryDate}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className={formErrors.cvv ? 'error' : ''}
              />
              {formErrors.cvv && <span className="error-text">{formErrors.cvv}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={formErrors.cardholderName ? 'error' : ''}
              />
              {formErrors.cardholderName && (
                <span className="error-text">{formErrors.cardholderName}</span>
              )}
            </div>
          </div>
        )}
        {paymentMethod === 'upi' && (
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="upiId">UPI ID</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="example@upi"
                className={formErrors.upiId ? 'error' : ''}
              />
              {formErrors.upiId && <span className="error-text">{formErrors.upiId}</span>}
            </div>
          </div>
        )}
        <button className="confirm-payment-btn" onClick={handlePayment}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default Payment;