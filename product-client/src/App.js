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
import ProtectedRoute from './Component/ProtectedRoute';
import NotFound from './Component/NotFound';
import Admin from './Component/Admin';
import Inventory from './Component/Inventory';
import Transaction from './Component/Transaction';
import ProtectedAdminRoute from './Component/ProctedAdminRoute';
import Vendor from './Component/Vendor';
import Goods from './Component/Goods';
import AddProduct from './Component/AddProduct';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
        <Route path="/order/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
        <Route path="/inventory" element={<ProtectedAdminRoute><Inventory /></ProtectedAdminRoute>} />
        <Route path="/transaction" element={<ProtectedAdminRoute><Transaction /></ProtectedAdminRoute>} />
        <Route path="/vendor" element={<Vendor />} />
        <Route path="/vendor/goods" element={<Goods />} />
        <Route path="/vendor/add" element={<AddProduct />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
