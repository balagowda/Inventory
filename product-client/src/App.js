// Importing necessary modules and components
import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Component/Home';
import Login from './Component/Login';
import Register from './Component/Register';
import UserHome from './Component/Customer/UserHome';
import Products from './Component/Customer/Products';
import Cart from './Component/Customer/Cart';
import Orders from './Component/Customer/Orders';
import Address from './Component/Address';
import Payment from './Component/Payment';
import NotFound from './Component/NotFound';
import ProtectedRoute from './Component/ProtectedRoute';
import ProtectedAdminRoute from './Component/Admin/ProctedAdminRoute';
import Admin from './Component/Admin/Admin';
import Inventory from './Component/Admin/Inventory';
import Transaction from './Component/Admin/Transaction';
import Vendor from './Component/Vendor/Vendor';
import Goods from './Component/Vendor/Goods';
import AddProduct from './Component/Vendor/AddProduct';
import GoodsTransactions from './Component/Vendor/GoodsTransactions';
import BuyfromVendors from './Component/Admin/BuyfromVendors';
import UpdateProfile from './Component/UpdateProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
        <Route path="/user/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/user/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/user/order/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
        <Route path="/user/order/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
        <Route path="/admin/inventory" element={<ProtectedAdminRoute><Inventory /></ProtectedAdminRoute>} />
        <Route path="/admin/transaction" element={<ProtectedAdminRoute><Transaction /></ProtectedAdminRoute>} />
        <Route path="/admin/buy" element={<ProtectedAdminRoute><BuyfromVendors /></ProtectedAdminRoute>} />
        <Route path="/vendor" element={<ProtectedRoute><Vendor /></ProtectedRoute>} />
        <Route path="/vendor/goods" element={<ProtectedRoute><Goods /></ProtectedRoute>} />
        <Route path="/vendor/addproduct" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/vendor/transaction" element={<ProtectedRoute><GoodsTransactions /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
