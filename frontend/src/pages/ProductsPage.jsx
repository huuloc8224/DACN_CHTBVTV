// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { RefreshCcw, Filter, Package, Search, Loader, ChevronsUpDown } from 'lucide-react'; // Thêm icon Sắp xếp

// Tùy chọn lọc Phân loại
const CATEGORY_OPTIONS = [
    { value: '', label: 'Tất cả Phân loại' }, 
    { value: 'thuoc', label: 'Thuốc BVTV' },
    { value: 'phan', label: 'Phân Bón' },
    { value: 'thucan', label: 'Thức Ăn' }
];

// [MỚI] Tùy chọn Sắp xếp
const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Mặc định (Tên A-Z)' },
    { value: 'price-asc', label: 'Giá Thấp đến Cao' },
    { value: 'price-desc', label: 'Giá Cao đến Thấp' }
];

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho bộ lọc
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIngredient, setActiveIngredient] = useState(''); 
    const [activeIngredientTerm, setActiveIngredientTerm] = useState('');
    
    // [MỚI] State cho Sắp xếp
    const [sort, setSort] = useState('name-asc'); 

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // [SỬA LẠI] Gửi tất cả tham số filter/sort lên Backend
            const res = await api.get('/products', {
                params: {
                    category: category || undefined, 
                    search: searchTerm || undefined,
                    active_ingredient: activeIngredientTerm || undefined,
                    sort: sort // [MỚI] Gửi tham số sort
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

    // [SỬA LẠI] Dùng useEffect để tự động gọi API khi filter/sort thay đổi
    useEffect(() => {
        fetchProducts();
    }, [category, searchTerm, activeIngredientTerm, sort]); // [MỚI] Thêm 'sort'

    // Hàm xử lý khi nhấn nút tìm kiếm (cho cả 2 ô)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(search); 
        setActiveIngredientTerm(activeIngredient); 
    };

    // Hàm xử lý khi nhấn nút Tải lại (Reset bộ lọc)
    const handleResetFilters = () => {
        setCategory('');
        setSearch('');
        setSearchTerm('');
        setActiveIngredient('');
        setActiveIngredientTerm('');
        setSort('name-asc'); // [MỚI] Reset sort
    };

    return (
        <div className="flex gap-3">

            {/* Sidebar Filter */}
            <div className="w-[225px] bg-white p-4 rounded-xl shadow-md h-fit sticky top-20 border border-gray-100">
    {/* Bộ lọc */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Filter size={20} className="mr-2"/> Bộ lọc</h2>
                
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="space-y-4 mb-4">
                    {/* ... (Search by Name) ... */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo tên</label>
                        <input
                            type="text" id="search" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm tên sản phẩm"
                            className="w-full p-2 border rounded-lg focus:outline-green-500"
                        />
                    </div>
                    
                    {/* ... (Search by Active Ingredient) ... */}
                    <div>
                        <label htmlFor="activeIngredient" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo hoạt chất</label>
                        <input
                            type="text" id="activeIngredient" value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)}
                            placeholder="Tìm hoạt chất"
                            className="w-full p-2 border rounded-lg focus:outline-green-500"
                        />
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 flex items-center justify-center">
                        <Search size={20} className="mr-1"/> Tìm kiếm
                    </button>
                </form>

                {/* Category Filter */}
                <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                    <select 
                        name="category" id="category" value={category} onChange={(e) => setCategory(e.target.value)} 
                        className="w-full p-3 border rounded-lg mt-1"
                    >
                        {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                
                {/* [MỚI] Sort Filter */}
                <div className="mb-4">
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                    <select 
                        name="sort" 
                        id="sort" 
                        value={sort} 
                        onChange={(e) => setSort(e.target.value)} // Cập nhật state sort
                        className="w-full p-3 border rounded-lg mt-1"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                
                <button onClick={handleResetFilters} disabled={loading} className="flex items-center justify-center w-full text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition">
                    <RefreshCcw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> Xóa bộ lọc
                </button>
            </div>
            
            {/* Product List */}
            <div className="flex-1">
                {/* ... (H1) ... */}

                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Package size={22} className="mr-2 text-green-600" /> Danh sách sản phẩm
                </h1>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                {loading ? (
                    <div className="text-center p-10 text-lg text-gray-500 flex items-center justify-center">
                        <Loader size={24} className="animate-spin mr-2"/> Đang tải sản phẩm...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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