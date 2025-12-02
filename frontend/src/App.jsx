// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & common components
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import PrivateRoute from './components/PrivateRoute';

// Pages (public)
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// Pages (user-protected)
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// Pages (admin-protected)
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />

          {/* User protected routes (PrivateRoute nhận prop element là Component, không phải JSX) */}
          <Route path="/cart" element={<PrivateRoute element={CartPage} />} />
          <Route path="/myorders" element={<PrivateRoute element={MyOrdersPage} />} />
          <Route path="/order/:id" element={<PrivateRoute element={OrderDetailPage} />} />

          {/* Admin protected route */}
          <Route
            path="/admin"
            element={<PrivateRoute element={AdminDashboard} adminOnly={true} />}
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={<h1 className="text-center text-xl mt-10">404 - Trang không tồn tại</h1>}
          />
        </Routes>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
