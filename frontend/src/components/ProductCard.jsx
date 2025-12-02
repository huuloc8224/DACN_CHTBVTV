// frontend/src/components/ProductCard.jsx
import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        
    };

    // ĐÂY LÀ DÒNG DUY NHẤT CẦN SỬA – ĐÚNG VỚI DB CỦA BẠN
    const stock = product.stock_quantity ?? 0;

    return (
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="relative overflow-hidden bg-gray-50 p-6">
                <img
                    src={product.image_url || "https://placehold.co/300x300/e0f2f1/047857?text=Thuốc"}
                    alt={product.name}
                    className="w-full h-48 object-contain mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                {stock > 0 && stock <= 20 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        Chỉ còn {stock}
                    </span>
                )}

                {stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-65 flex items-center justify-center z-10">
                        <span className="text-white font-bold text-xl">Hết hàng</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {product.active_ingredient && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                        {product.active_ingredient}
                    </p>
                )}

                {stock > 0 ? (
                    <div className="flex items-center gap-1 text-sm mt-3">
                        <Package size={15} className="text-gray-400" />
                        <span className="text-gray-600">
                            Còn:{' '}
                            <strong className={stock <= 30 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                {stock.toLocaleString('vi-VN')}
                            </strong>
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-sm mt-3 text-red-600 font-medium">
                        <Package size={15} /> Hết hàng
                    </div>
                )}

                <div className="mt-auto space-y-3 pt-4">
                    <div className="text-2xl font-extrabold text-green-600">
                        {product.price.toLocaleString('vi-VN')}đ
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg ${
                            stock === 0
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        }`}
                    >
                        <ShoppingCart size={22} />
                        {stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;