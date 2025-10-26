// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { RefreshCcw, Filter, Package, Search, Loader } from 'lucide-react';

// [MỚI] Tùy chọn lọc Phân loại
const CATEGORY_OPTIONS = [
    { value: '', label: 'Tất cả Phân loại' }, // Lựa chọn mặc định
    { value: 'thuoc', label: 'Thuốc BVTV' },
    { value: 'phan', label: 'Phân Bón' },
    { value: 'thucan', label: 'Thức Ăn Gia Súc/Gia Cầm' }
];

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // [MỚI] States cho bộ lọc
    const [category, setCategory] = useState(''); // State cho dropdown
    const [search, setSearch] = useState(''); // State cho input tìm kiếm
    const [searchTerm, setSearchTerm] = useState(''); // Giá trị dùng để gửi đi

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // [SỬA LẠI] Gửi các tham số filter lên Backend
            const res = await api.get('/products', {
                params: {
                    category: category || undefined, // Gửi nếu category có giá trị
                    search: searchTerm || undefined // Gửi nếu searchTerm có giá trị
                }
            });
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Không thể tải sản phẩm. Đảm bảo Backend đang chạy.");
        } finally {
            setLoading(false);
        }
    };

    // [SỬA LẠI] Dùng useEffect để tự động gọi API khi filter thay đổi
    useEffect(() => {
        fetchProducts();
    }, [category, searchTerm]); // Tự động gọi lại khi category hoặc searchTerm thay đổi

    // Hàm xử lý khi nhấn nút tìm kiếm
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(search); // Cập nhật searchTerm để trigger useEffect
    };

    // Hàm xử lý khi nhấn nút Tải lại (Reset bộ lọc)
    const handleResetFilters = () => {
        setCategory('');
        setSearch('');
        setSearchTerm('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filter */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-20 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Filter size={20} className="mr-2"/> Bộ lọc</h2>
                
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo tên</label>
                    <div className="flex">
                        <input
                            type="text"
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm tên sản phẩm..."
                            className="w-full p-2 border rounded-l-lg focus:outline-green-500"
                        />
                        <button type="submit" className="bg-green-600 text-white p-2 rounded-r-lg hover:bg-green-700">
                            <Search size={20}/>
                        </button>
                    </div>
                </form>

                {/* Category Filter */}
                <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                    <select 
                        name="category" 
                        id="category" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} // Cập nhật state category
                        className="w-full p-3 border rounded-lg mt-1"
                    >
                        {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                
                <button onClick={handleResetFilters} disabled={loading} className="flex items-center justify-center w-full text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition">
                    <RefreshCcw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Xóa bộ lọc
                </button>
            </div>
            
            {/* Product List */}
            <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><Package size={24} className="mr-2"/> Danh sách Thuốc</h1>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {loading ? (
                    <div className="text-center p-10 text-lg text-gray-500 flex items-center justify-center">
                        <Loader size={24} className="animate-spin mr-2"/> Đang tải sản phẩm...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-xl text-gray-500 mt-10">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;