// src/pages/Admin/modals/OrderDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Đơn hàng #{order._id.slice(-8)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-4 text-indigo-700">Thông tin khách hàng</h3>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-medium">Tên:</span> {order.userId?.name || 'Khách lẻ'}</p>
                <p><span className="font-medium">Email:</span> {order.userId?.email || 'N/A'}</p>
                <p><span className="font-medium">SĐT:</span> {order.phoneNumber || 'Chưa có'}</p>
                <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddress}</p>
                <p><span className="font-medium">Thanh toán:</span> <span className="font-bold text-green-600">{order.paymentMethod}</span></p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-4 text-green-700">Thông tin đơn hàng</h3>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-medium">Ngày đặt:</span> {formatDate(order.orderDate)}</p>
                <p><span className="font-medium">Trạng thái:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{order.status}</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Danh sách sản phẩm</h3>
            <div className="border rounded-xl overflow-hidden shadow">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-medium">Sản phẩm</th>
                    <th className="text-center p-4">SL</th>
                    <th className="text-right p-4">Đơn giá</th>
                    <th className="text-right p-4 font-bold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="text-center p-4">{item.quantity}</td>
                      <td className="text-right p-4">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right p-4 font-bold text-green-600">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50 font-bold text-xl">
                    <td colSpan="3" className="text-right p-5">TỔNG CỘNG</td>
                    <td className="text-right p-5 text-green-600">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
