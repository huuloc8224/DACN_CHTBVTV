// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Bot, ShoppingCart, Search } from 'lucide-react';
import Footer from '../components/Footer'; // Import Footer

const HomePage = () => {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-green-100 p-10 sm:p-20 rounded-3xl shadow-xl text-center">
                <Leaf size={64} className="mx-auto text-green-600 mb-4 animate-bounce-slow" />
                <h1 className="text-4xl sm:text-6xl font-extrabold text-green-800 mb-4">
                    Tư Vấn & Bán Thuốc Bảo Vệ Thực Vật
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Chẩn đoán sâu bệnh chính xác bằng AI và cung cấp giải pháp điều trị hiệu quả nhất cho cây trồng của bạn.
                </p>
                <Link 
                    to="/products" 
                    className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg transform hover:scale-105"
                >
                    <Search size={20} className="mr-2" /> Khám phá Sản phẩm
                </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                    <Bot size={48} className="mx-auto text-blue-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Chatbot RAG AI</h3>
                    <p className="text-gray-600">Tư vấn chẩn đoán bệnh cây, sâu hại dựa trên kho tri thức chuyên sâu, cập nhật liên tục.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                    <ShoppingCart size={48} className="mx-auto text-yellow-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Mua Sắm Thuận Tiện</h3>
                    <p className="text-gray-600">Dễ dàng tìm kiếm và mua các loại thuốc BVTV được AI gợi ý trực tiếp.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                    <Leaf size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Sản Phẩm Chất Lượng</h3>
                    <p className="text-gray-600">Chỉ cung cấp các sản phẩm đã được kiểm định và chứng nhận hiệu quả cao.</p>
                </div>
            </div>
            
            {/* Call to Action for Chatbot */}
            <div className="bg-green-500 p-8 rounded-xl text-white text-center shadow-lg">
                <h2 className="text-3xl font-bold mb-4">Bạn đang gặp vấn đề gì với cây trồng?</h2>
                <p className="text-lg mb-6">Sử dụng Chatbot AI để được chẩn đoán ngay lập tức.</p>
                <button 
                    onClick={() => window.scrollTo({ bottom: 0, behavior: 'smooth' })} 
                    className="bg-white text-green-700 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-md"
                >
                    Mở Chatbot Tư Vấn
                </button>
            </div>
            {/* Note: Footer is handled in App.jsx */}
        </div>
    );
};

export default HomePage;
