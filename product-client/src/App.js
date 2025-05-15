// Importing necessary modules and components
import React from 'react';
import Home from './Component/Home';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Component/Login';
import Register from './Component/Register';
import UserHome from './Component/UserHome';
import Products from './Component/Products';
import Cart from './Component/Cart';
import Orders from './Component/Orders';
import Address from './Component/Address';
import Payment from './Component/Payment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/address" element={<Address />} />
        <Route path="/order/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
