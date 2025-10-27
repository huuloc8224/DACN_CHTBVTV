// frontend/src/components/ProductCard.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { PlusCircle, Zap } from 'lucide-react'; // Import Zap (icon tồn kho)
import { Link } from 'react-router-dom';

const placeholderImg = "http://localhost:3001/images/placeholder.jpg"; 

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const id = product._id || product.id; 

    const imageUrl = product.image_url 
        ? `http://localhost:3001${product.image_url}` 
        : placeholderImg;

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
            <Link to={`/products/${id}`} className="block">
                <img 
                    src={product.image_url || placeholderImg} 
                    alt={product.name} 
                    className="w-full h-64 object-contain p-4 rounded-t-xl hover:opacity-90 transition bg-gray-100" // [ĐÃ SỬA]
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
            </Link>
            <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                    <Link to={`/products/${id}`} className="hover:text-green-600">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3">{product.active_ingredient || "..."}</p>

                    {/* [MỚI] Hiển thị tồn kho */}
                    <div className={`flex items-center text-sm ${product.stock_quantity > 0 ? 'text-gray-600' : 'text-red-500 font-medium'}`}>
                        <Zap size={14} className="mr-1" />
                        {product.stock_quantity > 0 ? `Còn hàng: ${product.stock_quantity}` : 'Hết hàng'}
                    </div>

                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-extrabold text-green-600">
                        {product.price ? parseFloat(product.price).toLocaleString('vi-VN') : 0}₫
                    </span>
                    <button
                        onClick={() => addToCart(product)}
                        // [MỚI] Vô hiệu hóa nút nếu hết hàng
                        disabled={product.stock_quantity === 0}
                        className={`flex items-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition shadow-md ${
                            product.stock_quantity === 0 ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''
                        }`}
                        title="Thêm vào giỏ hàng"
                    >
                        <PlusCircle size={20} className="mr-1" /> Mua
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;