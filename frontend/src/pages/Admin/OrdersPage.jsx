// src/pages/Admin/OrdersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Truck, Eye, Trash2, Loader2 as Loader } from 'lucide-react';
import api from '../../services/api';
import OrderDetailsModal from './Modals/OrderDetailsModal';

const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date.getTime()) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

// Bản dịch trạng thái sang tiếng Việt
const STATUS_TRANSLATIONS = {
  Pending: 'Chờ xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy'
};

// Màu sắc badge cho từng trạng thái
const STATUS_COLORS = {
  Pending: 'bg-yellow-200 text-yellow-900',
  Shipped: 'bg-blue-200 text-blue-900',
  Delivered: 'bg-green-200 text-green-900',
  Cancelled: 'bg-red-200 text-red-900'
};

// Dropdown options
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Shipped', label: 'Đang giao' },
  { value: 'Delivered', label: 'Đã giao' },
  { value: 'Cancelled', label: 'Đã hủy' }
];

const OrdersPage = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
      showToast('error', err.response?.data?.message || 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    if (!confirm(`Đổi trạng thái thành "${STATUS_TRANSLATIONS[status]}"?`)) return;
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status });
      showToast('success', 'Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Xóa đơn hàng này vĩnh viễn? Không thể khôi phục!')) return;
    try {
      await api.delete(`/orders/admin/${orderId}`);
      showToast('success', 'Đã xóa đơn hàng');
      fetchOrders();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa đơn hàng');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="px-6 py-8">
          <h2 className="text-4xl font-extrabold text-green-700 mb-8 flex items-center gap-4">
            <Truck className="w-12 h-12 text-green-600" />
            Quản lý đơn hàng
            <span className="text-2xl text-gray-600">({orders.length} đơn)</span>
          </h2>
        </div>

        <div className="w-full px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader className="w-16 h-16 animate-spin text-green-600 mb-4" />
                <p className="text-xl text-gray-600">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center">
                <Truck className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <p className="text-xl text-gray-600">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <tr>
                      <th className="text-left p-6 font-bold">ID ĐƠN</th>
                      <th className="text-left p-6 font-bold">NGÀY ĐẶT</th>
                      <th className="text-left p-6 font-bold">KHÁCH HÀNG</th>
                      <th className="text-right p-6 font-bold">TỔNG TIỀN</th>
                      <th className="text-center p-6 font-bold">TRẠNG THÁI</th>
                      <th className="text-center p-6 font-bold">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-green-50 transition">
                        <td className="p-6 font-mono text-sm text-gray-600">
                          {o._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-6 text-gray-700">{formatDate(o.orderDate || o.createdAt)}</td>
                        <td className="p-6 font-semibold text-gray-800">
                          {o.userId?.name || o.recipientName || 'Khách lẻ'}
                          <br />
                          <span className="text-sm text-gray-500">{o.userId?.email || o.phoneNumber}</span>
                        </td>
                        <td className="p-6 text-right font-bold text-green-600 text-xl">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="p-6 text-center">
                          <div className="relative inline-block">
                            <div
                              className={`px-6 py-3 rounded-full text-sm font-bold ${STATUS_COLORS[o.status] || 'bg-gray-200 text-gray-800'}`}
                            >
                              {STATUS_TRANSLATIONS[o.status] || o.status}
                            </div>

                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          {/* 2 nút cách nhau khoảng nhỏ đẹp (gap-3 thay vì space-y-3) */}
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                              title="Xem chi tiết đơn hàng"
                            >
                              <Eye size={20} />
                              Chi tiết
                            </button>

                            <button
                              onClick={() => deleteOrder(o._id)}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 size={20} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* Toast thông báo */}
        {toast.show && (
          <div
            className={`fixed top-6 right-6 z-50 px-8 py-4 rounded-2xl text-white font-bold shadow-2xl transition-transform animate-pulse ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;