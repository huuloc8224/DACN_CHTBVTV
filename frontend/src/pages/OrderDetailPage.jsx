// frontend/src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, AlertTriangle, ArrowLeft, Package, User, Truck, CreditCard } from 'lucide-react';

// Hàm helper để format tiền tệ
const formatCurrency = (amount) => {
    // [SỬA LỖI] Thêm '|| 0' để đảm bảo không bao giờ format giá trị NaN/undefined
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

// Hàm helper để format ngày
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const OrderDetailPage = () => {
const { id: orderId } = useParams(); 
    const { user } = useAuth();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return; 

        const fetchOrder = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user]);

   if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader size={32} className="animate-spin text-green-600" />
                <span className="ml-3 text-lg text-gray-600">Đang tải chi tiết đơn hàng...</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-6 bg-red-100 text-red-700 rounded-lg shadow-md flex items-center">
                <AlertTriangle size={24} className="mr-3" />
                <span>{error}</span>
            </div>
        );
    }
    if (!order) {
        return <div className="text-center text-xl text-gray-500">Không tìm thấy đơn hàng.</div>;
    }
    // [SỬA LỖI] Tính toán Tạm tính (itemsPrice)
    // Phải dùng 'unitPrice' (từ Schema) thay vì 'price'
    const itemsPrice = order.orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link 
                to={user.role === 'admin' ? '/admin' : '/myorders'} 
                className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
            >
                <ArrowLeft size={18} className="mr-1" />
                Quay lại {user.role === 'admin' ? 'Dashboard' : 'Danh sách Đơn hàng'}
            </Link>

            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
                Chi tiết Đơn hàng <span className="text-green-600">#{order._id.substring(0, 8)}...</span>
            </h1>
            
            {/* [SỬA LỖI] Hiển thị createdAt hoặc orderDate */}
            <p className="text-gray-500 mb-6">
                Đặt ngày: {formatDate(order.orderDate || order.createdAt)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Cột Thông tin Khách hàng & Giao hàng */}
                <div className="md:col-span-2 space-y-6">
                    {/* Thông tin Giao hàng */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Truck size={22} className="mr-2 text-green-600" /> Thông tin Giao hàng
                        </h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Địa chỉ: </strong>{order.shippingAddress}</p>
                            <p><strong>SĐT: </strong>{order.phoneNumber}</p>
                            <div className="pt-2">
                                {order.status === 'Delivered' ? (
                                    <span className="py-1 px-3 bg-green-100 text-green-700 rounded-full font-medium">
                                        Đã giao hàng
                                    </span>
                                ) : order.status === 'Shipped' ? (
                                    <span className="py-1 px-3 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        Đang vận chuyển
                                    </span>
                                ) : order.status === 'Cancelled' ? (
                                     <span className="py-1 px-3 bg-red-100 text-red-700 rounded-full font-medium">
                                        Đã hủy
                                    </span>
                                ) : (
                                    <span className="py-1 px-3 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                        Đang chờ xử lý
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin Thanh toán */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <CreditCard size={22} className="mr-2 text-green-600" /> Thanh toán
                        </h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Phương thức: </strong>{order.paymentMethod}</p>
                            <div className="pt-2">
                                {/* Giả sử bạn chưa có logic isPaid, chúng ta sẽ dựa vào status */}
                                {order.status === 'Delivered' ? (
                                    <span className="py-1 px-3 bg-green-100 text-green-700 rounded-full font-medium">
                                        Đã thanh toán (Giả định)
                                    </span>
                                ) : (
                                    <span className="py-1 px-3 bg-red-100 text-red-700 rounded-full font-medium">
                                        Chưa thanh toán
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin Khách hàng (Admin mới thấy) */}
                    {user.role === 'admin' && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <User size={22} className="mr-2 text-green-600" /> Khách hàng
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Tên: </strong>{order.userId.name}</p>
                                <p><strong>Email: </strong>{order.userId.email}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cột Tóm tắt Đơn hàng [ĐÃ SỬA LỖI NAN] */}
                <div className="md:col-span-1 bg-gray-50 p-6 rounded-xl shadow-inner border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Tóm tắt Đơn hàng</h2>
                    <div className="space-y-4">
                        {/* Danh sách sản phẩm */}
                        {order.orderItems.map((item) => (
                            <div key={item.productId || item._id} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {item.quantity} x {formatCurrency(item.unitPrice)}
                                    </p>
                                </div>
                                <p className="font-medium text-gray-700">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                </p>
                            </div>
                        ))}

                        {/* Tính toán tiền */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Phí giao hàng:</span>
                                <span>{formatCurrency(order.shippingPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Thuế (VAT):</span>
                                <span>{formatCurrency(order.taxPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900 mt-2 pt-2 border-t">
                                <span>Tổng cộng:</span>
                                <span className="text-green-700">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;