// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  LogOut, 
  Lock, 
  Home, 
  Package, 
  ShoppingBag, 
  Menu,
  X,
  User
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Avatar URL (nếu có), fallback là icon User
  const avatarUrl = user?.avatar || null;

  return (
    <header className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white shadow-2xl sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo + Tên */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <img 
                src="/images/logo.png" 
                alt="TBVTV Logo" 
                className="h-16 w-auto rounded-full border-4 border-white shadow-xl transition-transform group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none">TBVTV</h1>
              <p className="text-xs font-bold tracking-widest text-green-100">
                VẬT TƯ NÔNG NGHIỆP CHUYÊN NGHIỆP
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 text-lg font-semibold hover:text-green-100 transition group">
              <Home size={22} className="group-hover:scale-110 transition" />
              <span>Trang chủ</span>
            </Link>

            <Link to="/products" className="flex items-center space-x-2 text-lg font-semibold hover:text-green-100 transition group">
              <Package size={22} className="group-hover:scale-110 transition" />
              <span>Sản phẩm</span>
            </Link>

            <Link to="/myorders" className="flex items-center space-x-2 text-lg font-semibold hover:text-green-100 transition group">
              <ShoppingBag size={22} className="group-hover:scale-110 transition" />
              <span>Đơn hàng</span>
            </Link>

            <Link to="/chatbot" className="flex items-center space-x-2 text-lg font-semibold hover:text-green-100 transition group">
              
              <span>Tư vấn AI</span>
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 bg-yellow-500 text-green-900 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition shadow-lg"
              >
                <Lock size={20} />
                <span>QUẢN TRỊ</span>
              </Link>
            )}
          </nav>

          {/* Right side: Cart, Avatar (link to profile), Logout, Mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Giỏ hàng */}
            <Link 
              to="/cart" 
              className="relative p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition backdrop-blur-sm group"
            >
              <ShoppingCart size={28} className="text-white group-hover:scale-110 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-bounce shadow-lg">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Người dùng đã đăng nhập: Avatar (link to /profile) + Đăng xuất */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Avatar – click vào chuyển đến trang hồ sơ */}
                <Link to="/profile" className="block">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg hover:border-green-300 transition">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-500 flex items-center justify-center">
                        <User size={28} className="text-white" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Nút đăng xuất */}
                <button 
                  onClick={logout} 
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition shadow-lg"
                  title="Đăng xuất"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              /* Chưa đăng nhập */
              <Link 
                to="/login" 
                className="bg-white text-green-700 px-6 py-3 rounded-full font-bold text-lg hover:bg-green-50 transition shadow-lg flex items-center space-x-2"
              >
                <User size={22} />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Nút menu mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-green-800 border-t-4 border-green-500">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <Link to="/" className="block text-xl font-bold hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/products" className="block text-xl font-bold hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Sản phẩm
            </Link>
            <Link to="/myorders" className="block text-xl font-bold hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Đơn hàng
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="block text-xl font-bold bg-yellow-500 text-green-900 py-4 rounded-xl text-center" 
                onClick={() => setMobileMenuOpen(false)}
              >
                QUẢN TRỊ VIÊN
              </Link>
            )}
            {user ? (
              <>
                <Link to="/MyprofilePage" className="block text-xl font-bold hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
                  Hồ sơ cá nhân
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full text-left text-xl font-bold text-red-300 hover:text-red-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-xl font-bold hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;