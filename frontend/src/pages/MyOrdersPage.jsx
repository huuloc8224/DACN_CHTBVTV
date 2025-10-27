// frontend/src/pages/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import api from '../services/api';
import { Package, XCircle, RefreshCcw, Loader, Eye } from 'lucide-react'; // Import Eye

// Hàm helper (Nếu bạn chưa có, hãy thêm vào đầu file)
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


const MyOrdersPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const fetchMyOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/orders/myorders');
            setOrders(res.data);
        } catch (err) {
            setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchMyOrders();
        } else if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);


    const handleCancelOrder = async (orderId) => {
        const orderToCancel = orders.find(o => o._id === orderId);
        if (!orderToCancel || orderToCancel.status !== 'Pending') {
            setStatusMessage('Chỉ được phép hủy đơn hàng đang ở trạng thái "Pending".');
            return;
        }

        if (window.confirm(`XÁC NHẬN HỦY: Bạn có chắc chắn muốn hủy đơn hàng ${orderId.substring(0, 8)}...?`)) {
            try {
                const res = await api.put(`/orders/cancel/${orderId}`);
                setStatusMessage(`Đơn hàng ${orderId.substring(0, 8)}... đã được hủy thành công!`);
                fetchMyOrders(); 
            } catch (err) {
                setStatusMessage(`Lỗi hủy đơn: ${err.response?.data?.message || 'Lỗi kết nối.'}`);
            }
        }
    };

    if (authLoading || loading) return (
        <div className="text-center p-10 flex items-center justify-center text-xl text-gray-500">
            <Loader size={24} className="animate-spin mr-2"/>Đang tải đơn hàng...
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Package size={28} className="mr-3"/> Lịch Sử Mua Hàng Của Tôi
            </h1>
            
            {statusMessage && (
                <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">{statusMessage}</div>
            )}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="py-3 px-4 text-left">ID Đơn hàng</th>
                            <th className="py-3 px-4 text-left">Ngày đặt</th> {/* [MỚI] Thêm cột Ngày đặt */}
                            <th className="py-3 px-4 text-left">Tổng tiền</th>
                            <th className="py-3 px-4 text-left">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Chi tiết</th>
                            <th className="py-3 px-4 text-center">Hủy đơn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" className="py-4 text-center text-gray-500">Bạn chưa có đơn hàng nào.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{order._id.substring(0, 8)}...</td>
                                    {/* [MỚI] Hiển thị orderDate (hoặc createdAt) */}
                                    <td className="py-3 px-4">{formatDate(order.orderDate || order.createdAt)}</td>
                                    <td className="py-3 px-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            order.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                                            order.status === 'Cancelled' ? 'bg-red-200 text-red-800' : 
                                            order.status === 'Shipped' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Link 
                                            to={`/order/${order._id}`} 
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} className="inline"/>
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button 
                                            onClick={() => handleCancelOrder(order._id)}
                                            disabled={order.status !== 'Pending'}
                                            className={`text-red-500 hover:text-red-700 transition font-medium text-sm ${order.status !== 'Pending' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        >
                                            <XCircle size={18} className="inline"/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyOrdersPage;