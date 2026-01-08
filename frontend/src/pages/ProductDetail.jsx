// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { PlusCircle, Leaf, Tag, Zap, ChevronLeft, Loader } from 'lucide-react';

const getCategoryDisplayName = (code) => {
  if (code === 'thuoc') return 'Thuốc BVTV';
  if (code === 'phan') return 'Phân bón';
  if (code === 'thucan') return 'Thức ăn chăn nuôi';
  return code;
};

const placeholderImg = 'http://localhost:3001/images/placeholder.jpg';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock_quantity <= 0) return;
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader className="animate-spin mr-2" /> Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;
  }

  const imageUrl = product.image_url
    ? `http://localhost:3001${product.image_url}`
    : placeholderImg;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <Link to="/products" className="flex items-center text-blue-600 mb-6">
        <ChevronLeft size={18} className="mr-1" /> Quay lại danh sách
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div>
          <img
            ref={imgRef}
            src={imageUrl}
            alt={product.name}
            className="w-full max-h-96 object-contain bg-gray-100 rounded-xl"
            onError={(e) => (e.target.src = placeholderImg)}
          />
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
            {product.name}
          </h1>

          {/* HOẠT CHẤT – ĐÂY LÀ CHỖ QUAN TRỌNG */}
          {product.activeIngredients?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Tag size={18} className="text-green-600" />
              {product.activeIngredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          <div className="text-4xl font-extrabold text-red-600 mb-5">
            {product.price.toLocaleString('vi-VN')}₫
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <Zap size={18} />
              Tồn kho:{' '}
              <strong className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} sản phẩm`
                  : 'Hết hàng'}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <Leaf size={18} className="text-green-600" />
              Phân loại: {getCategoryDisplayName(product.category)}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className={`w-full py-4 rounded-full text-lg font-bold transition ${
              product.stock_quantity > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <PlusCircle size={22} className="inline mr-2" />
            {product.stock_quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-bold mb-3">Mô tả & hướng dẫn</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {product.description || 'Chưa có mô tả.'}
        </p>
      </div>
    </div>
  );
};

export default ProductDetail;
