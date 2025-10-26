// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
// Import thêm ShoppingBag cho Lịch sử Đơn hàng
import { ShoppingCart, LogOut, User, Lock, Home, Package, ShoppingBag } from 'lucide-react'; 

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const { totalItems } = useCart();

    return (
        <header className="bg-green-700 text-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Logo / Project Name */}
                
                <Link to="/" className="text-6xl font-extrabold tracking-wider hover:text-green-200 transition font-mono">
                    <img 
                        src="img\logo.png" // Thay bằng đường dẫn tới logo của bạn
                        alt="TBVTV Logo"
                        className="h-20 w-auto" // Chiều cao 8 đơn vị (khoảng 32px)
                    />
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <Link to="/" className="flex items-center hover:text-green-200 transition">
                        <Home size={18} className="mr-1" /> Trang chủ
                    </Link>

                    <Link to="/products" className="flex items-center hover:text-green-200 transition">
                        <Package size={18} className="mr-1" /> Sản phẩm
                    </Link>

                    <Link to="/myorders" className="flex items-center hover:text-green-200 transition">
                            <ShoppingBag size={18} className="mr-1"/> Đơn hàng
                    </Link>

                    <Link to="/contact" className="flex items-center hover:text-green-200 transition"> Liên hệ</Link>

                    {isAdmin && (
                        <Link to="/admin" className="flex items-center hover:text-green-200 transition bg-green-800 px-3 py-1 rounded-full">
                            <Lock size={16} className="mr-1" /> Admin
                        </Link>
                    )}
                </nav>

                {/* User Actions */}
                <div className="flex items-center space-x-4">
                    {/* Cart Link */}
                    <Link to="/cart" className="relative p-2 rounded-full hover:bg-green-600 transition">
                        <ShoppingCart size={24} />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold hidden sm:inline">{user.name || user.email}</span>
                            
                            {/* [MỚI] Link Lịch sử Đơn hàng */}
                            
                            
                            <button
                                onClick={logout}
                                className="p-2 rounded-full bg-green-800 hover:bg-green-600 transition"
                                title="Đăng xuất"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center bg-green-600 hover:bg-green-500 px-3 py-2 rounded-full transition">
                            <User size={18} className="mr-1" /> Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
