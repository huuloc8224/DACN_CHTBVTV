// src/pages/Admin/modals/UserOrdersModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Loader2 as Loader } from 'lucide-react';
import api from '../../../services/api';
import OrderDetailsModal from '../Modals/OrderDetailsModal';

const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

const UserOrdersModal = ({ userId, userName, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/admin/user/${userId}`)
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Lịch sử đơn hàng – {userName}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
          </div>
          <div className="p-8">
            {loading ? (
              <div className="text-center py-20"><Loader className="w-12 h-12 animate-spin mx-auto text-green-600" /></div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-lg">Chưa có đơn hàng nào</p>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xl">#{order._id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium mt-2 inline-block ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  );
};

export default UserOrdersModal;
