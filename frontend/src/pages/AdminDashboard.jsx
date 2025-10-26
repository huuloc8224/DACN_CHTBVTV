// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    PlusCircle, Database, LayoutDashboard, Package, Users, Truck, 
    Eye, X, Trash2, Image, Tag, Loader, Edit2, XCircle as CloseCircle,
    BarChart2, DollarSign, ListOrdered, UserCheck // [MỚI] Thêm icon Thống kê
} from 'lucide-react';
import api from '../services/api';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
const CATEGORY_OPTIONS = [
    { value: 'thuoc', label: 'Thuốc BVTV' },
    { value: 'phan', label: 'Phân Bón' },
    { value: 'thucan', label: 'Thức Ăn Gia Súc/Gia Cầm' }
];

const getCategoryDisplayName = (code) => {
    switch (code) {
        case 'thuoc': return 'Thuốc BVTV';
        case 'phan': return 'Phân Bón';
        case 'thucan': return 'Thức Ăn Gia Súc/Gia Cầm';
        default: return code;
    }
};

// --- Component Modal Chi tiết Đơn hàng ---
const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Chi tiết Đơn hàng #{order._id.substring(0, 8)}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                <div className="space-y-4 text-sm">
                    {/* User Info */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Thông tin Khách hàng</h3>
                        <p><strong>Tên:</strong> {order.userId?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.userId?.email || 'N/A'}</p>
                        <p><strong>SĐT:</strong> {order.phoneNumber}</p>
                        <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                        <p><strong>Thanh toán:</strong> {order.paymentMethod}</p>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-2">Chi tiết Sản phẩm</h3>
                        <table className="w-full text-left">
                            <thead className="text-gray-500">
                                <tr><th>Sản phẩm</th><th>SL</th><th>Giá/SP</th><th>Tổng</th></tr>
                            </thead>
                            <tbody>
                                {order.orderItems.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2">{item.quantity}</td>
                                        <td className="py-2">{item.unitPrice.toLocaleString('vi-VN')}₫</td>
                                        <td className="py-2">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-xl font-bold text-right pt-4">
                        Tổng cộng: <span className="text-red-600">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Component Chính: AdminDashboard ---
const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('stats'); // [MỚI] Mặc định mở tab Thống kê
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null); // [MỚI] State cho dữ liệu thống kê
    const [loadingData, setLoadingData] = useState(false);

    // States cho Modal chi tiết
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    
    // [MỚI] State để quản lý chế độ Sửa
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    // State cho việc thêm/sửa sản phẩm (imageFile sẽ lưu Base64)
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', active_ingredient: '', stock_quantity: '', 
        imageFile: null, category: 'thuoc'
    });
    const [previewImage, setPreviewImage] = useState(''); 
    
    const placeholderImg = "http://localhost:3001/images/placeholder.jpg";

    // --- Data Fetching ---
// [SỬA LẠI] fetchData để lấy cả Thống kê
    const fetchData = async (tab) => {
        setLoadingData(true);
        try {
            if (tab === 'products') {
                const res = await api.get('/products');
                setProducts(res.data);
            } else if (tab === 'orders') {
                const res = await api.get('/orders');
                setOrders(res.data);
            } else if (tab === 'users') {
                const res = await api.get('/auth/users');
                setUsers(res.data);
            } else if (tab === 'stats') {
                // [MỚI] Gọi API thống kê
                const res = await api.get('/orders/stats');
                setStats(res.data);
            }
        } catch (error) {
            console.error(`Error fetching ${tab}:`, error);
            setStatusMessage({ type: 'error', message: `Lỗi tải dữ liệu ${tab}: ${error.response?.data?.message || error.message}` });
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData(activeTab);
        }
    }, [activeTab, user]);

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    // --- Product Handlers ---
// --- Product Handlers (Sửa logic Base64) ---
    const handleChangeProduct = (e) => {
        const { name, value, files } = e.target;

        if (name === 'imageFile' && files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct(prev => ({ ...prev, imageFile: reader.result })); // LƯU BASE64
                setPreviewImage(reader.result); 
            };
            reader.readAsDataURL(file); 
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // [SỬA LẠI] Đổi tên thành handleSaveProduct
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        
        // 1. Chuẩn bị đối tượng JSON
        const dataToSend = {
            name: newProduct.name,
            description: newProduct.description,
            price: (parseFloat(newProduct.price) || 0), 
            stock_quantity: (parseInt(newProduct.stock_quantity) || 0),
            active_ingredient: newProduct.active_ingredient,
            category: newProduct.category,
        };

        // 2. Chỉ gửi 'imageData' NẾU có file mới (imageFile là chuỗi Base64)
        if (newProduct.imageFile && typeof newProduct.imageFile === 'string') {
            dataToSend.imageData = newProduct.imageFile;
        }

        try {
            if (isEditing) {
                // CHẾ ĐỘ SỬA: Gọi API PUT
                setStatusMessage({ type: 'loading', message: 'Đang cập nhật sản phẩm...' });
                await api.put(`/products/${currentProductId}`, dataToSend); // Gửi JSON
                setStatusMessage({ type: 'success', message: `Đã cập nhật sản phẩm thành công!` });
            } else {
                // CHẾ ĐỘ THÊM: Gọi API POST
                if (!dataToSend.imageData) {
                     setStatusMessage({ type: 'error', message: 'Vui lòng chọn hình ảnh sản phẩm.' });
                     return;
                }
                setStatusMessage({ type: 'loading', message: 'Đang tạo sản phẩm...' });
                await api.post('/products', dataToSend); // Gửi JSON
                setStatusMessage({ type: 'success', message: `Đã tạo sản phẩm thành công!` });
            }
            
            resetForm();
            fetchData('products'); 

        } catch (error) {
            setStatusMessage({ type: 'error', message: `Lỗi: ${error.response?.data?.message || 'Không thể thực hiện.'}` });
        }
    };
    
   // [MỚI] Hàm reset form
    const resetForm = () => {
        setNewProduct({ name: '', description: '', price: '', active_ingredient: '', stock_quantity: '', imageFile: null, category: 'thuoc' });
        setPreviewImage('');
        setIsEditing(false);
        setCurrentProductId(null);
    };

    // [MỚI] Hàm xử lý khi nhấn nút "Sửa"
    const handleEditClick = (product) => {
        setIsEditing(true); 
        setCurrentProductId(product._id);
        
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            active_ingredient: product.active_ingredient,
            stock_quantity: product.stock_quantity,
            category: product.category,
            imageFile: null // Quan trọng: Đặt là null, không phải Base64
        });
        // Hiển thị ảnh cũ (Fix lỗi Two-Server)
        setPreviewImage(`http://localhost:3001${product.image_url}`); 
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Order Handlers (Giữ nguyên) ---
    const handleDeleteOrder = async (orderId) => {
        if (!confirm(`XÁC NHẬN: Bạn có chắc chắn muốn xóa đơn hàng ${orderId.substring(0, 8)}... vĩnh viễn?`)) return;

        try {
            await api.delete(`/orders/${orderId}`);
            setStatusMessage({ type: 'success', message: `Đã xóa đơn hàng ${orderId.substring(0, 8)}... thành công!` });
            fetchData('orders'); 
        } catch (error) {
            setStatusMessage({ type: 'error', message: `Lỗi xóa đơn hàng: ${error.response?.data?.message || 'Không thể xóa đơn hàng.'}` });
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        if (!confirm(`Xác nhận đổi trạng thái đơn hàng ${orderId.substring(0, 8)}... thành ${newStatus}?`)) return;

        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setStatusMessage({ type: 'success', message: `Cập nhật trạng thái thành ${newStatus} thành công!` });
            fetchData('orders');
        } catch (error) {
            setStatusMessage({ type: 'error', message: `Lỗi cập nhật trạng thái. Vui lòng kiểm tra log Backend.` });
        }
    };

    // [MỚI] HÀM XÓA SẢN PHẨM
    const handleDeleteProduct = async (productId) => {
        if (!confirm(`XÁC NHẬN: Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?`)) return;

        try {
            setStatusMessage({ type: 'loading', message: 'Đang xóa sản phẩm...' });
            // API DELETE /api/products/:id
            await api.delete(`/products/${productId}`);
            setStatusMessage({ type: 'success', message: `Đã xóa sản phẩm thành công!` });
            fetchData('products'); // Tải lại danh sách
        } catch (error) {
            setStatusMessage({ type: 'error', message: `Lỗi xóa sản phẩm: ${error.response?.data?.message || 'Không thể xóa.'}` });
        }
    };

    // --- Render Tabs (Đã Fix Whitespace & Accessibility) ---

// [MỚI] Hàm Render Tab Thống kê
    const renderStatsTab = () => {
        if (!stats) return <div className="text-center p-4">Đang tải thống kê...</div>;

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BarChart2 size={24} className="mr-2"/> Tổng quan Bán hàng
                </h2>
                
                {/* Thẻ KIPs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg shadow">
                        <DollarSign size={20} className="text-green-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Doanh Thu</p>
                        <p className="text-2xl font-bold text-green-700">
                            {stats.totalRevenue.toLocaleString('vi-VN')}₫
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow">
                        <ListOrdered size={20} className="text-blue-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Đơn Hàng</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-lg shadow">
                        <Package size={20} className="text-indigo-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Sản Phẩm</p>
                        <p className="text-2xl font-bold text-indigo-700">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow">
                        <UserCheck size={20} className="text-yellow-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Khách Hàng</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.totalUsers}</p>
                    </div>
                </div>

                {/* Top Sản phẩm Bán chạy */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">Top 5 Sản phẩm Bán chạy</h3>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                        <ul className="space-y-2">
                            {stats.topSellingProducts.map((product, index) => (
                                <li key={index} className="flex justify-between items-center p-2 rounded bg-white shadow-sm">
                                    <span className="font-medium text-gray-700">{product._id}</span>
                                    <span className="font-bold text-green-600">{product.totalQuantitySold} đã bán</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    const renderProductsTab = () => (
        <div className="space-y-6">
            {/* [SỬA LẠI] Tiêu đề form động */}
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Package size={24} className="mr-2"/> {isEditing ? `Đang sửa sản phẩm (ID: ${currentProductId ? currentProductId.substring(0,6) : ''}...)` : 'Thêm Sản phẩm Mới'}
            </h2>
            
            <form onSubmit={handleSaveProduct} className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-4">
                
                {/* DÒNG 1: Phân loại */}
                <div className="flex space-x-4">
                    <div className="w-1/3">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Phân loại</label>
                        <select 
                            name="category" 
                            id="category" 
                            value={newProduct.category} 
                            onChange={handleChangeProduct} 
                            required 
                            className="w-full p-3 border rounded-lg mt-1"
                        >
                            {CATEGORY_OPTIONS.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Input Tên Sản phẩm */}
                    <div className="w-2/3">
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Tên Sản phẩm</label>
                        <input type="text" name="name" id="productName" value={newProduct.name} onChange={handleChangeProduct} placeholder="Tên sản phẩm" required className="w-full p-3 border rounded-lg mt-1" autoComplete="off"/>
                    </div>
                </div>
                
                {/* DÒNG 2: Hoạt chất và Ảnh */}
                <div className="flex space-x-4">
                    <div className="w-2/3">
                        <label htmlFor="activeIngredient" className="block text-sm font-medium text-gray-700">Hoạt chất chính</label>
                        <input type="text" name="active_ingredient" id="activeIngredient" value={newProduct.active_ingredient} onChange={handleChangeProduct} placeholder="Hoạt chất chính" className="w-full p-3 border rounded-lg mt-1" autoComplete="off"/>
                    </div>
                    <div className="w-1/3">
                        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 flex items-center">
                            <Image size={16} className="mr-1"/> {isEditing ? "Chọn ảnh mới (Nếu cần)" : "Chọn Ảnh"}
                        </label>
                        {/* [SỬA LẠI] Không bắt buộc 'required' khi đang sửa */}
                        <input type="file" name="imageFile" id="imageUpload" onChange={handleChangeProduct} accept="image/jpeg,image/png" className="w-full p-2 border rounded-lg mt-1 text-sm bg-white" required={!isEditing}/>
                    </div>
                </div>
                
                {/* DÒNG 3: Giá, Tồn kho, Preview */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Giá (VND)</label>
                        <input type="number" name="price" id="productPrice" value={newProduct.price} onChange={handleChangeProduct} placeholder="Giá" required className="w-full p-3 border rounded-lg mt-1" min="0" autoComplete="off"/>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Tồn kho</label>
                        <input type="number" name="stock_quantity" id="stockQuantity" value={newProduct.stock_quantity} onChange={handleChangeProduct} placeholder="Tồn kho" required className="w-full p-3 border rounded-lg mt-1" min="0" autoComplete="off"/>
                    </div>
                    {/* Ảnh Preview */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Xem trước ảnh</label>
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-1 border"/>
                        ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mt-1"><Tag size={20}/></div>
                        )}
                    </div>
                </div>
                
                {/* DÒNG 4: Mô tả */}
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea name="description" id="productDescription" value={newProduct.description} onChange={handleChangeProduct} placeholder="Mô tả chi tiết và cách sử dụng" rows="4" className="w-full p-3 border rounded-lg" required autoComplete="off"></textarea>
                
                {/* [SỬA LẠI] Nút động */}
                <div className="flex space-x-4">
                    <button type="submit" disabled={statusMessage.type === 'loading'} className="w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400">
                        <PlusCircle size={20} className="mr-2"/> {isEditing ? "Lưu thay đổi" : "Thêm Sản phẩm"}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="w-1/3 flex items-center justify-center bg-gray-400 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition">
                            <CloseCircle size={20} className="mr-2"/> Hủy Sửa
                        </button>
                    )}
                </div>
            </form>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center pt-4"><Database size={24} className="mr-2"/> Danh sách Sản phẩm ({products.length})</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100 border-b">
                    {/* [SỬA LẠI] Thêm cột Xóa */}
                    <tr>
                        <th className="py-2 px-4 text-left">ID</th><th className="py-2 px-4 text-left">Hình ảnh</th><th className="py-2 px-4 text-left">Tên</th><th className="py-2 px-4 text-left">Phân loại</th><th className="py-2 px-4 text-left">Giá</th><th className="py-2 px-4 text-left">Tồn kho</th><th className="py-2 px-4 text-left">Sửa</th><th className="py-2 px-4 text-left">Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{p._id.substring(0, 6)}...</td><td className="py-2 px-4"><img src={`http://localhost:3001${p.image_url}`} alt={p.name} className="w-12 h-12 object-cover rounded-md" onError={(e) => { e.target.src = placeholderImg }}/></td>
                            <td className="py-2 px-4 font-medium">{p.name}</td><td className="py-2 px-4">{getCategoryDisplayName(p.category)}</td><td className="py-2 px-4">{p.price.toLocaleString('vi-VN')}₫</td><td className="py-2 px-4">{p.stock_quantity}</td>
                            <td className="py-2 px-4">
                                <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:text-blue-800">
                                    <Edit2 size={18}/>
                                </button>
                            </td>
                            {/* [MỚI] Nút Xóa */}
                            <td className="py-2 px-4">
                                <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const renderOrdersTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Truck size={24} className="mr-2"/> Quản lý Đơn hàng ({orders.length})</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100 border-b">
                    <tr><th className="py-2 px-4 text-left">ID ĐH</th><th className="py-2 px-4 text-left">Khách hàng</th><th className="py-2 px-4 text-left">Tổng tiền</th><th className="py-2 px-4 text-left">Trạng thái</th><th className="py-2 px-4 text-left">Chi tiết</th><th className="py-2 px-4 text-left">Thao tác</th><th className="py-2 px-4 text-left">Xóa</th></tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{o._id.substring(0, 6)}...</td><td className="py-2 px-4 font-medium">{o.userId?.name || o.userId?.email || 'Guest'}</td>
                            <td className="py-2 px-4 font-semibold">{o.totalAmount.toLocaleString('vi-VN')}₫</td>
                            <td className="py-2 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    o.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                                    o.status === 'Shipped' ? 'bg-blue-200 text-blue-800' :
                                    o.status === 'Cancelled' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                }`}>
                                    {o.status}
                                </span>
                            </td>
                            <td className="py-2 px-4">
                                <button onClick={() => openOrderDetails(o)} className="text-blue-600 hover:text-blue-800">
                                    <Eye size={18}/>
                                </button>
                            </td>
                            <td className="py-2 px-4">
                                <select 
                                    value={o.status} 
                                    onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                    className="p-1 border rounded-lg text-sm bg-white"
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </td>
                            <td className="py-2 px-4">
                                <button onClick={() => handleDeleteOrder(o._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderUsersTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Users size={24} className="mr-2"/> Danh sách Khách hàng ({users.length})</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100 border-b">
                    <tr><th className="py-2 px-4 text-left">ID</th><th className="py-2 px-4 text-left">Tên</th><th className="py-2 px-4 text-left">Email</th><th className="py-2 px-4 text-left">Vai trò</th><th className="py-2 px-4 text-left">Đăng ký</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{u._id.substring(0, 6)}...</td><td className="py-2 px-4 font-medium">{u.name}</td><td className="py-2 px-4">{u.email}</td><td className="py-2 px-4 uppercase">{u.role}</td><td className="py-2 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
                <LayoutDashboard size={32} className="mr-3"/> Bảng điều khiển Quản trị
            </h1>
            
            {/* [SỬA LẠI] Tab Navigation */}
            <div className="flex border-b border-gray-200">
                {/* Thêm tab 'stats' */}
                {['stats', 'products', 'orders', 'users'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-6 text-lg font-medium transition duration-200 ${
                            activeTab === tab 
                            ? 'border-b-4 border-green-600 text-green-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {/* Hiển thị tên tiếng Việt */}
                        {tab === 'stats' ? 'Thống kê' : tab === 'products' ? 'Sản phẩm' : tab === 'orders' ? 'Đơn hàng' : 'Khách hàng'}
                    </button>
                ))}
            </div>

            {/* Status Message Area */}
            {statusMessage.message && (
                <div className={`p-4 rounded-lg flex items-center ${
                    statusMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                    statusMessage.type === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {statusMessage.message}
                </div>
            )}

            {/* [SỬA LẠI] Tab Content */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                {loadingData ? (
                    <div className="text-center py-10 text-xl text-gray-500 flex items-center justify-center">
                        <Loader size={24} className="animate-spin mr-2"/> Đang tải dữ liệu...
                    </div>
                ) : (
                    <>
                        {activeTab === 'stats' && renderStatsTab()} {/* Thêm render stats */}
                        {activeTab === 'products' && renderProductsTab()}
                        {activeTab === 'orders' && renderOrdersTab()}
                        {activeTab === 'users' && renderUsersTab()}
                    </>
                )}
            </div>
            
            {/* Order Detail Modal */}
            {isDetailModalOpen && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setIsDetailModalOpen(false)} />
            )}
        </div>
    );
};

export default AdminDashboard;