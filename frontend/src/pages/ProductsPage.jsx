// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Package, Loader, X, Leaf } from 'lucide-react';
import { Link } from "react-router-dom";
const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả Phân loại' },
  { value: 'thuoc', label: 'Thuốc BVTV' },
  { value: 'phan', label: 'Phân Bón' },
  { value: 'thucan', label: 'Thức Ăn Chăn Nuôi' }
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên A → Z' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'newest', label: 'Mới nhất' }
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [activeIngredientTerm, setActiveIngredientTerm] = useState('');
  const [sort, setSort] = useState('name-asc');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      if (activeIngredientTerm) params.append('active_ingredient', activeIngredientTerm);
      if (sort) params.append('sort', sort);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, searchTerm, activeIngredientTerm, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(search.trim());
    setActiveIngredientTerm(activeIngredient.trim());
  };

  const handleReset = () => {
    setCategory('');
    setSearch('');
    setSearchTerm('');
    setActiveIngredient('');
    setActiveIngredientTerm('');
    setSort('name-asc');
  };

  const hasFilter = category || searchTerm || activeIngredientTerm;

  return (
    <>


      {/* 2 VÙNG CUỘN RIÊNG BIỆT */}
      <div className="bg-gray-50 py-1">
        <div className="max-w-screen-2xl mx-auto px-1">

          {/* HEIGHT CỐ ĐỊNH ĐỂ CUỘN */}
          <div className="flex gap-8 h-[calc(100vh-160px)]">

            {/* BỘ LỌC CUỘN RIÊNG */}
            <aside className="hidden lg:block w-80 flex-shrink-0 overflow-y-auto pr-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border">

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Filter className="text-green-600" size={28} />
                    Bộ Lọc Tìm Kiếm
                  </h2>
                  {hasFilter && (
                    <button onClick={handleReset} className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  
                  {/* Tên sản phẩm */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nhập tên thuốc, phân bón..."
                        className="w-full pl-12 pr-10 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                      {search && (
                        <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <X className="text-gray-500 hover:text-gray-700" size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hoạt chất */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hoạt chất chính</label>
                    <input
                      type="text"
                      value={activeIngredient}
                      onChange={(e) => setActiveIngredient(e.target.value)}
                      placeholder="VD: Abamectin, Glyphosate..."
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg flex items-center justify-center gap-3"
                  >
                    <Search size={24} />
                    Tìm Kiếm Ngay
                  </button>
                </form>

                <hr className="my-8 border-gray-200" />

                {/* Phân loại */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Phân loại sản phẩm</h3>
                  <div className="space-y-3">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          category === cat.value
                            ? 'bg-green-50 border-green-500 text-green-700 font-bold'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mr-4 text-green-600"
                        />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="my-8 border-gray-200" />

                {/* Sắp xếp */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Sắp xếp theo</h3>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </aside>

            {/* DANH SÁCH SẢN PHẨM CUỘN RIÊNG */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* HEADER */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-4 tracking-tight">
                    <Leaf className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                    Danh Mục Sản Phẩm
                </h2>
              {hasFilter && (
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-5 mb-8 text-blue-800 font-medium flex justify-between items-center">
                  <span>
                    Tìm thấy <strong>{products.length}</strong> sản phẩm
                  </span>
                  <button onClick={handleReset} className="text-blue-600 hover:underline">
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-32">
                  <Loader className="animate-spin text-green-600 mx-auto mb-6" size={64} />
                  <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-2xl shadow-xl">
                  <Package className="mx-auto text-gray-300 mb-6" size={120} />
                  <h3 className="text-3xl font-bold text-gray-700 mb-3">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500 text-lg">Thử thay đổi từ khóa hoặc bộ lọc</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">


                  {products.map((product) => (
                    <Link key={product._id} to={`/products/${product._id}`}>
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
