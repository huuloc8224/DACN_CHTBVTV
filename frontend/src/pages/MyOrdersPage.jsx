// frontend/src/pages/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Package, Eye, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const STATUS_TABS = [
    { key: 'all',        label: 'Tất cả',          count: 0 },
    { key: 'Pending',    label: 'Chờ xử lý',       color: 'yellow' },
    { key: 'Shipped',    label: 'Đã giao vận chuyển', color: 'purple' },
    { key: 'Delivered',  label: 'Đã giao hàng',    color: 'green' },
    { key: 'Cancelled',  label: 'Đã hủy',          color: 'red' },
];

const getStatusInfo = (status) => {
    const map = {
        Pending:    { label: 'Chờ xử lý',       color: 'yellow' },
        Shipped:    { label: 'Đã giao vận chuyển', color: 'purple' },
        Delivered:  { label: 'Đã giao hàng',    color: 'green' },
        Cancelled:  { label: 'Đã hủy',          color: 'red' },
    };
    return map[status] || { label: status, color: 'gray' };
};

const MyOrdersPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchOrders = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/orders/myorders');
            const data = res.data || [];
            setOrders(data);
            filterOrders(data, activeTab);
            setMessage({ text: '', type: '' });
        } catch (err) {
            setMessage({ text: 'Không tải được đơn hàng.', type: 'error' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterOrders = (orderList, tab) => {
        if (tab === 'all') {
            setFilteredOrders(orderList);
        } else {
            setFilteredOrders(orderList.filter(o => o.status === tab));
        }
        setActiveTab(tab);
    };

    useEffect(() => {
        if (!authLoading && user) fetchOrders();
        else if (!authLoading && !user) navigate('/login');
    }, [authLoading, user, navigate]);

    const handleCancelOrder = async (orderId) => {
        const order = orders.find(o => o._id === orderId);
        if (order.status !== 'Pending') {
            setMessage({ text: 'Chỉ hủy được đơn hàng đang "Chờ xử lý".', type: 'error' });
            return;
        }
        if (!window.confirm(`Hủy đơn hàng ${orderId.slice(-8).toUpperCase()}?`)) return;

        try {
            await api.put(`/orders/cancel/${orderId}`);
            setMessage({ text: 'Hủy đơn hàng thành công!', type: 'success' });
            fetchOrders();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Hủy thất bại!', type: 'error' });
        }
    };

    // Tính số lượng từng trạng thái
    const stats = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.all = orders.length;
        return acc;
    }, { all: orders.length });

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader size={48} className="animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3">
                        <Package size={40} className="text-green-600" />
                        Lịch Sử Mua Hàng
                    </h1>
                    <button
                        onClick={fetchOrders}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition shadow-lg"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                {/* THÊM SLIDEBAR FILTER TRẠNG THÁI – SIÊU ĐẸP */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-3 pb-2 min-w-max">
                        {STATUS_TABS.map(tab => {
                            const count = stats[tab.key] || 0;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => filterOrders(orders, tab.key)}
                                    className={`relative px-6 py-4 rounded-xl font-semibold transition-all shadow-md whitespace-nowrap
                                        ${isActive 
                                            ? 'bg-green-600 text-white scale-105 shadow-xl' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold
                                            ${isActive ? 'bg-white text-green-600' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Thông báo */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-md ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        <AlertCircle size={24} />
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                {/* Bảng đơn hàng */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20">
                            <Package size={80} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-xl text-gray-500">
                                {activeTab === 'all' ? 'Bạn chưa có đơn hàng nào' : `Không có đơn hàng ${STATUS_TABS.find(t => t.key === activeTab)?.label.toLowerCase()}`}
                            </p>
                            {activeTab === 'all' && (
                                <Link to="/products" className="mt-6 inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold">
                                    Tiếp tục mua sắm
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                    <tr>
                                        <th className="py-5 px-6 text-left font-semibold">Mã đơn</th>
                                        <th className="py-5 px-6 text-left font-semibold">Ngày đặt</th>
                                        <th className="py-5 px-6 text-left font-semibold">Tổng tiền</th>
                                        <th className="py-5 px-6 text-left font-semibold">Trạng thái</th>
                                        <th className="py-5 px-6 text-center font-semibold">Chi tiết</th>
                                        <th className="py-5 px-6 text-center font-semibold">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50 transition">
                                                <td className="py-5 px-6 font-mono text-sm">{order._id.slice(-8).toUpperCase()}</td>
                                                <td className="py-5 px-6 text-gray-600">{formatDate(order.orderDate || order.createdAt)}</td>
                                                <td className="py-5 px-6 font-bold text-green-600 text-lg">{formatCurrency(order.totalAmount)}</td>
                                                <td className="py-5 px-6">
                                                    <span className={`px-4 py-2 rounded-full text-xs font-bold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Link to={`/order/${order._id}`} className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2">
                                                        <Eye size={20} /> Xem
                                                    </Link>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    {order.status === 'Pending' ? (
                                                        <button onClick={() => handleCancelOrder(order._id)} className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2 mx-auto">
                                                            <XCircle size={20} /> Hủy đơn
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;