// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx'; //
import ChatWidget from './components/ChatWidget';


import HomePage from './pages/HomePage'; 
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/myorders" element={<PrivateRoute element={MyOrdersPage} />} />
          {/* Protected Routes */}
          <Route path="/cart" element={<PrivateRoute element={CartPage} />} />
          <Route path="/admin" element={<PrivateRoute element={AdminDashboard} adminOnly={true} />} />
          
          <Route path="*" element={<h1 className="text-center text-xl mt-10">404 - Trang không tồn tại</h1>} />
          {/* [MỚI] Route Lịch sử đơn hàng (Yêu cầu đăng nhập) */}

          {/* [MỚI] Route Chi tiết đơn hàng (Yêu cầu đăng nhập) */}
          <Route path="/order/:id" element={<PrivateRoute element={OrderDetailPage} />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget /> {/* [MỚI] Thêm ChatWidget */}
    </div>
  );
}

export default App;