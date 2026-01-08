// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages (user-protected)
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';

// Pages (admin)
import AdminDashboard from './pages/Admin/AdminDashboard';

// Chatbot
import ChatPage from './pages/ChatPage';

function App() {
  const location = useLocation();

  const isChatbotRoute = location.pathname === '/chatbot';
  const isCartRoute = location.pathname === '/cart';
  const isProductsRoute = location.pathname.startsWith('/products');

  const hideGlobalElements = isChatbotRoute || isCartRoute || isProductsRoute;

  useEffect(() => {
    if (isChatbotRoute) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isChatbotRoute]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Header */}
      {!isChatbotRoute && <Header />}

      {/* Main */}
      <main className={`flex-1 ${isChatbotRoute ? 'overflow-hidden' : 'overflow-auto'}`}>
        {isChatbotRoute ? (
          <ChatPage />
        ) : (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* User */}
              <Route path="/cart" element={<PrivateRoute element={CartPage} />} />
              <Route path="/myorders" element={<PrivateRoute element={MyOrdersPage} />} />
              <Route path="/order/:id" element={<PrivateRoute element={OrderDetailPage} />} />
              <Route path="/profile" element={<PrivateRoute element={ProfilePage} />} />

              {/* Admin */}
              <Route
                path="/admin/*"
                element={<PrivateRoute element={AdminDashboard} adminOnly />}
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="text-center py-32">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p>Trang không tồn tại</p>
                  </div>
                }
              />
            </Routes>
          </div>
        )}
      </main>

      {/* Footer & Floating chat */}
      {!hideGlobalElements && <Footer />}
      {!hideGlobalElements && <ChatWidget />}
    </div>
  );
}

export default App;
