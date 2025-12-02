// src/pages/Admin/OrdersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Truck, Eye, Trash2, Loader2 as Loader } from 'lucide-react';
import api from '../../services/api';
import OrderDetailsModal from './Modals/OrderDetailsModal';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

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
    setOrders(res.data);
  } catch (err) {
    console.error('fetchOrders error full:', err);
    console.error('err.response:', err.response);
    console.error('err.response.data:', err.response?.data);
    console.error('err.response.status:', err.response?.status);
    showToast('error', err.response?.data?.message || 'Lỗi tải đơn hàng');
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    if (!confirm(`Đổi trạng thái thành "${status}"?`)) return;
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status });
      showToast('success', 'Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Xóa đơn hàng này vĩnh viễn?')) return;
    try {
      await api.delete(`/orders/admin/${orderId}`);
      showToast('success', 'Đã xóa đơn hàng');
      fetchOrders();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa đơn hàng');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Truck className="w-10 h-10 text-green-600" />
        Quản lý đơn hàng ({orders.length})
      </h2>

      <div className="overflow-x-auto rounded-xl shadow-lg border">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Ngày</th>
                <th className="text-left p-4">Khách hàng</th>
                <th className="text-right p-4">Tổng tiền</th>
                <th className="text-center p-4">Trạng thái</th>
                <th className="text-center p-4">Chi tiết</th>
                <th className="text-center p-4">Hiển thị</th>
                <th className="text-center p-4">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">{o._id.slice(-6)}</td>
                  <td className="p-4">{formatDate(o.orderDate)}</td>
                  <td className="p-4 font-medium">{o.userId?.name || o.userId?.email || 'Khách lẻ'}</td>
                  <td className="p-4 text-right font-bold text-green-600">{formatCurrency(o.totalAmount)}</td>
                  <td className="p-4 text-center">
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o._id, e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedOrder(o)} className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteOrder(o._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl text-white font-bold shadow-2xl transition ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
