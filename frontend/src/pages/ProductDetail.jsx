import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { PlusCircle, Leaf, Tag, Zap, ChevronLeft, Loader } from 'lucide-react';

// [THÊM LẠI] Các tùy chọn Phân loại
const CATEGORY_OPTIONS = [
    { value: 'thuoc', label: 'Thuốc BVTV' },
    { value: 'phan', label: 'Phân Bón' },
    { value: 'thucan', label: 'Thức Ăn Gia Súc/Gia Cầm' }
];

// [THÊM LẠI] Hàm chuyển đổi tên code
const getCategoryDisplayName = (code) => {
    switch (code) {
        case 'thuoc': return 'Thuốc BVTV';
        case 'phan': return 'Phân Bón';
        case 'thucan': return 'Thức Ăn Gia Súc/Gia Cầm';
        default: return code;
    }
};

const placeholderImg = "http://localhost:3001/images/placeholder.jpg"; 

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/products/${id}`); 
                setProduct(response.data);
            } catch (err) {
                setError("Không tìm thấy sản phẩm này hoặc Backend đang gặp lỗi.");
                console.error("Error fetching product detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product.stock_quantity <= 0) {
            alert("Sản phẩm đã hết hàng!");
            return;
        }
        addToCart(product);
    };

    if (loading) return (
        <div className="text-center p-10 flex items-center justify-center text-xl text-gray-500">
            <Loader size={24} className="animate-spin mr-2"/>Đang tải chi tiết sản phẩm...
        </div>
    );
    
    if (error) return <div className="p-6 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    if (!product) return <div className="text-center p-10 text-xl text-gray-500">Không tìm thấy sản phẩm.</div>;

    const imageUrl = product.image_url 
        ? `http://localhost:3001${product.image_url}` 
        : placeholderImg;

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
            <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium">
                <ChevronLeft size={20} className="mr-1"/> Quay lại danh sách
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Image Section */}
                <div>
                    <img 
                    src={product.image_url || placeholderImg} 
                    alt={product.name} 
                    className="w-50 h-full object-contain p-4 rounded-t-xl hover:opacity-90 transition bg-gray-100" // [ĐÃ SỬA]
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}                    />
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-3">{product.name}</h1>
                    
                    <div className="flex items-center space-x-2 text-xl text-green-600 mb-4 font-semibold">
                        <Tag size={20}/>
                        <span>{product.active_ingredient || "Hoạt chất chính: Đa năng"}</span>
                    </div>

                    <div className="text-4xl font-extrabold text-red-600 mb-6">
                        {parseFloat(product.price).toLocaleString('vi-VN')}₫
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className={`flex items-center ${product.stock_quantity > 0 ? 'text-gray-700' : 'text-red-500 font-medium'}`}>
                            <Zap size={20} className="mr-2" />
                            <span>Tồn kho: {product.stock_quantity > 0 ? `${product.stock_quantity} sản phẩm` : 'Đã hết hàng'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Leaf size={20} className="mr-2 text-green-500"/>
                            {/* [SỬA LỖI] Gọi hàm đã được thêm */}
                            <span>Phân loại: {getCategoryDisplayName(product.category)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity <= 0}
                        className={`w-full flex items-center justify-center py-3 rounded-full text-lg font-semibold transition shadow-lg ${
                            product.stock_quantity > 0 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <PlusCircle size={24} className="mr-2" /> 
                        {product.stock_quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="mt-10 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mô tả và Hướng dẫn sử dụng</h2>
                <p className="text-gray-600 whitespace-pre-line">{product.description || "Chưa có mô tả."}</p>
            </div>
        </div>
    );
};

export default ProductDetail;