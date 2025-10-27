import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    PlusCircle, Database, LayoutDashboard, Package, Users, Truck, 
    Eye, X, Trash2, Image, Tag, Loader, Edit2, XCircle as CloseCircle, 
    BarChart2, DollarSign, ListOrdered, UserCheck 
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    PieChart, Pie, Cell, Tooltip as PieTooltip 
} from 'recharts';
import api from '../services/api';
import { Link } from 'react-router-dom'; 

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
const CATEGORY_OPTIONS = [
    { value: 'thuoc', label: 'Thuốc BVTV' },
    { value: 'phan', label: 'Phân Bón' },
    { value: 'thucan', label: 'Thức Ăn Gia Súc/Gia Cầm' }
];


// [MỚI] Thêm hàm helper formatDate (nếu chưa có)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};
// [SỬA LỖI] THÊM KHAI BÁO MÀNG MÀU CHO BIỂU ĐỒ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const getCategoryDisplayName = (code) => {
    switch (code) {
        case 'thuoc': return 'Thuốc BVTV';
        case 'phan': return 'Phân Bón';
        case 'thucan': return 'Thức Ăn Gia Súc/Gia Cầm';
        default: return code || 'Khác';
    }
};

// [MỚI] HÀM TÙY CHỈNH NHÃN CHO BIỂU ĐỒ TRÒN (HIỂN THỊ %)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    // Tính toán vị trí hiển thị nhãn (ở giữa miếng bánh)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Chỉ hiển thị % nếu nó lớn hơn 5% (tránh rối mắt)
    if ((percent * 100) < 5) return null;

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor="middle" 
            dominantBaseline="central"
            className="font-bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
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


// --- [MỚI] Component Modal Lịch sử Đơn hàng của User ---
const UserOrdersModal = ({ userId, userName, onClose }) => {
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                const res = await api.get(`/orders/user/${userId}`);
                setUserOrders(res.data);
            } catch (error) {
                console.error("Lỗi tải đơn hàng của user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserOrders();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Lịch sử Đơn hàng của: {userName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {loading ? (
                    <div className="text-center py-10"><Loader size={24} className="animate-spin"/></div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="py-2 px-4 text-left">ID ĐH</th><th className="py-2 px-4 text-left">Ngày</th><th className="py-2 px-4 text-left">Tổng tiền</th><th className="py-2 px-4 text-left">Trạng thái</th><th className="py-2 px-4 text-left">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userOrders.map(o => (
                                <tr key={o._id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">{o._id.substring(0, 8)}...</td>
                                    <td className="py-2 px-4">{new Date(o.orderDate).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 font-semibold">{o.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td className="py-2 px-4">{o.status}</td>
                                    <td className="py-2 px-4">
                                        <button onClick={() => setSelectedOrder(o)} className="text-blue-600 hover:text-blue-800">
                                            <Eye size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Modal lồng: Hiển thị chi tiết 1 đơn hàng */}
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
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

    // [SỬA LỖI] THÊM 2 DÒNG KHAI BÁO STATE CÒN THIẾU
    const [isUserOrdersModalOpen, setIsUserOrdersModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [topCustomers, setTopCustomers] = useState([]); // [MỚI] State Top Khách hàng
    const [minSpend, setMinSpend] = useState(0); // [MỚI] State cho ngưỡng chi tiêu

    const [loadingData, setLoadingData] = useState(false);

    // States cho Modal chi tiết
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    
    // [MỚI] State để quản lý chế độ Sửa
   const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', active_ingredient: '', stock_quantity: '', 
        imageFile: null, category: 'thuoc'
    });
    const [previewImage, setPreviewImage] = useState(''); 
    const placeholderImg = "http://localhost:3001/images/placeholder.jpg"; 
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    // [SỬA LẠI] fetchData để lấy cả Thống kê
    // [SỬA LẠI] fetchData để lấy cả Thống kê
    const fetchData = async (tab) => {
        setLoadingData(true);
        setStatusMessage({ type: '', message: '' });
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
                const resSales = await api.get('/orders/stats/sales');
                setStats(resSales.data);
                // [MỚI] Gọi API Top Customers
                const resCustomers = await api.get('/orders/stats/top-customers', { params: { minSpend } });
                setTopCustomers(resCustomers.data);
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

    // [MỚI] Hàm fetch Top Customers khi đổi ngưỡng chi tiêu
    const handleFetchTopCustomers = () => {
        // Chỉ fetch lại top customers, không fetch lại sales
        setLoadingData(true);
        api.get('/orders/stats/top-customers', { params: { minSpend } })
            .then(res => setTopCustomers(res.data))
            .catch(err => setStatusMessage({ type: 'error', message: 'Lỗi tải top khách hàng.' }))
            .finally(() => setLoadingData(false));
    };
    
    // [MỚI] Hàm mở modal xem đơn hàng của user
    const openUserOrders = (customer) => {
        setSelectedUser(customer);
        setIsUserOrdersModalOpen(true);
    };

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
        if (!stats) return null;

        // Format data cho biểu đồ
        const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        const monthlyData = monthNames.map((month, index) => ({
            name: month,
            // [SỬA LỖI] Doanh thu này đã được lọc (chỉ 'Delivered') từ Backend
            DoanhThu: stats.monthlySales.find(s => s._id === index + 1)?.totalRevenue || 0 
        }));

        const totalCategoryRevenue = stats.categorySales.reduce((acc, cat) => acc + cat.totalRevenue, 0);
        
        const categoryData = stats.categorySales.map(cat => ({
            name: getCategoryDisplayName(cat._id),
            value: cat.totalRevenue
        }));
        
        const overallTotalRevenue = stats.monthlySales.reduce((acc, curr) => acc + curr.totalRevenue, 0);

        return (
           <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BarChart2 size={24} className="mr-2"/> Tổng quan Bán hàng
                </h2>
                
                {/* Thẻ KIPs [ĐÃ SỬA LỖI] */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg shadow">
                        <DollarSign size={20} className="text-green-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Doanh Thu (Đã giao)</p>
                        <p className="text-2xl font-bold text-green-700">
                            {overallTotalRevenue.toLocaleString('vi-VN')}₫
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow">
                        <ListOrdered size={20} className="text-blue-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Đơn Hàng (Đã giao)</p>
                        {/* Sửa: dùng stats.totalOrders (đã được lọc từ Backend) */}
                        <p className="text-2xl font-bold text-blue-700">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-lg shadow">
                        <Package size={20} className="text-indigo-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Sản Phẩm</p>
                        {/* Sửa: dùng stats.totalProducts */}
                        <p className="text-2xl font-bold text-indigo-700">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow">
                        <UserCheck size={20} className="text-yellow-700" />
                        <p className="text-sm text-gray-600 mt-1">Tổng Khách Hàng</p>
                        {/* Sửa: dùng stats.totalUsers */}
                        <p className="text-2xl font-bold text-yellow-700">{stats.totalUsers}</p>
                    </div>
                </div>

                {/* Biểu đồ Doanh thu theo Tháng */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">Doanh thu theo Tháng (Năm nay)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-inner w-full h-80">
                        <ResponsiveContainer>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${value/1000000}Tr ₫`} />
                                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}₫`} />
                                <Legend />
                                <Bar dataKey="DoanhThu" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Biểu đồ tròn Phân loại */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">Tỷ trọng Doanh thu theo Phân loại</h3>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-inner w-full h-80">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie 
                                        data={categoryData} 
                                        dataKey="value" // Kích thước miếng bánh dựa trên 'value' (tiền)
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100} 
                                        fill="#8884d8" 
                                        labelLine={false} // Tắt đường gạch
                                        label={renderCustomizedLabel} // [SỬA LỖI] Dùng hàm render %
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    {/* [SỬA LỖI] Tooltip (hover) sẽ hiển thị tiền */}
                                    <PieTooltip formatter={(value) => `${value.toLocaleString('vi-VN')}₫`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Khách hàng */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">Top 10 Khách hàng</h3>
                        <div className="flex items-center space-x-2 mb-3">
                            <label htmlFor="minSpend" className="text-sm">Lọc theo chi tiêu tối thiểu:</label>
                            <input 
                                type="number" 
                                id="minSpend"
                                value={minSpend}
                                onChange={(e) => setMinSpend(Number(e.target.value))}
                                className="p-1 border rounded-lg w-28"
                            />
                            <button onClick={handleFetchTopCustomers} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">Lọc</button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-2 h-80 overflow-y-auto">
                            {topCustomers.length === 0 && <p className="text-gray-500">Không có khách hàng nào.</p>}
                            {topCustomers.map((cust, index) => (
                                <div key={cust.userId} className="flex justify-between items-center p-2 rounded bg-white shadow-sm">
                                    <div className="font-medium text-gray-700">
                                        <span className="font-bold">{index + 1}.</span> {cust.name}
                                        <p className="text-xs text-gray-500">{cust.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-green-600 block">{cust.totalSpent.toLocaleString('vi-VN')}₫</span>
                                        <button 
                                            onClick={() => openUserOrders(cust)}
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            ({cust.orderCount} đơn hàng)
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                    <tr>
                        {/* [SỬA LẠI] Thêm cột Ngày đặt */}
                        <th className="py-2 px-4 text-left">ID ĐH</th>
                        <th className="py-2 px-4 text-left">Ngày đặt</th>
                        <th className="py-2 px-4 text-left">Khách hàng</th>
                        <th className="py-2 px-4 text-left">Tổng tiền</th>
                        <th className="py-2 px-4 text-left">Trạng thái</th>
                        <th className="py-2 px-4 text-left">Chi tiết</th>
                        <th className="py-2 px-4 text-left">Thao tác</th>
                        <th className="py-2 px-4 text-left">Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{o._id.substring(0, 6)}...</td>
                            {/* [MỚI] Hiển thị Ngày đặt */}
                            <td className="py-2 px-4">{formatDate(o.orderDate || o.createdAt)}</td>
                            <td className="py-2 px-4 font-medium">{o.userId?.name || o.userId?.email || 'Guest'}</td>
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
                                {/* [SỬA LẠI] Dùng Link thay vì button (nếu OrderDetailsModal đã bị xóa) */}
                                {/* Nếu vẫn dùng Modal, giữ nguyên <button> */}
                                <Link to={`/order/${o._id}`} className="text-blue-600 hover:text-blue-800">
                                    <Eye size={18}/>
                                </Link>
                                {/* <button onClick={() => openOrderDetails(o)} className="text-blue-600 hover:text-blue-800">
                                    <Eye size={18}/>
                                </button> */}
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
            {/* [SỬA LỖI] THÊM KIỂM TRA selectedUser */}
            {isUserOrdersModalOpen && selectedUser && (
                <UserOrdersModal 
                    userId={selectedUser.userId} 
                    userName={selectedUser.name} 
                    onClose={() => setIsUserOrdersModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default AdminDashboard;