// frontend/src/components/ProductCard.jsx
import React, { useRef } from 'react';
import { ShoppingCart, Package, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const imgRef = useRef(null);

  const stock = product.stock_quantity ?? 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      alert('Sản phẩm đã hết hàng!');
      return;
    }

    addToCart(product);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all border flex flex-col h-full">
      {/* IMAGE */}
      <div className="relative bg-gray-50 p-5">
        <img
          ref={imgRef}
          src={product.image_url || 'https://placehold.co/300x300?text=SP'}
          alt={product.name}
          className="w-full h-44 object-contain mx-auto group-hover:scale-110 transition"
        />

        {stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Hết hàng</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 line-clamp-2 text-lg">
          {product.name}
        </h3>

        {/* HOẠT CHẤT – ĐÚNG SCHEMA */}
        {product.activeIngredients?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Tag size={14} className="text-green-600" />
            <span className="line-clamp-1">
              {product.activeIngredients.slice(0, 2).join(', ')}
              {product.activeIngredients.length > 2 && '…'}
            </span>
          </div>
        )}

        {/* TỒN KHO */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Package size={14} />
          {stock > 0 ? (
            <span>
              Còn{' '}
              <strong className={stock <= 30 ? 'text-red-600' : 'text-green-600'}>
                {stock}
              </strong>
            </span>
          ) : (
            <span className="text-red-600 font-medium">Hết hàng</span>
          )}
        </div>

        {/* PRICE + BUTTON */}
        <div className="mt-auto pt-4 space-y-3">
          <div className="text-2xl font-extrabold text-green-600">
            {product.price.toLocaleString('vi-VN')}đ
          </div>

          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
              stock === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <ShoppingCart size={20} />
            {stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
