// src/pages/Admin/modals/OrderDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date.getTime()) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

// Bản dịch trạng thái sang tiếng Việt + màu sắc
const STATUS_TRANSLATIONS = {
  Pending: 'Chờ xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy'
};

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Tính lại tổng tiền từ orderItems – đảm bảo chính xác dù backend gửi sai
  const calculatedTotal = order.orderItems.reduce((sum, item) => {
    // Lấy giá từ nhiều nguồn có thể (backend có thể gửi unitPrice, price, hoặc trong product object)
    const price = item.unitPrice || item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-3xl font-black">
            Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Thông tin khách hàng & đơn hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin khách hàng */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-indigo-700 mb-6">
                Thông tin khách hàng
              </h3>
              <div className="space-y-4 text-lg text-gray-700">
                <p><span className="font-bold">Tên:</span> {order.recipientName || order.userId?.name || 'Khách lẻ'}</p>
                <p><span className="font-bold">Email:</span> {order.userId?.email || 'Chưa có'}</p>
                <p><span className="font-bold">SĐT:</span> {order.phoneNumber || 'Chưa có'}</p>
                <p><span className="font-bold">Địa chỉ giao:</span> {order.shippingAddress || 'Chưa có'}</p>
                <p><span className="font-bold">Phương thức TT:</span> 
                  <span className="ml-2 font-bold text-green-600">
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPAY'}
                  </span>
                </p>
              </div>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-green-700 mb-6">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-4 text-lg text-gray-700">
                <p><span className="font-bold">Ngày đặt:</span> {formatDate(order.orderDate || order.createdAt)}</p>
                <p><span className="font-bold">Trạng thái:</span>
                  <span className={`ml-3 inline-block px-5 py-2 rounded-full text-sm font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_TRANSLATIONS[order.status] || order.status}
                  </span>
                </p>
                <p><span className="font-bold">Mã đơn hàng:</span> <span className="font-mono text-sm">{order._id}</span></p>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm – HIỂN THỊ GIÁ CHÍNH XÁC */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Danh sách sản phẩm</h3>
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="text-left p-6 font-bold">SẢN PHẨM</th>
                    <th className="text-center p-6 font-bold">SỐ LƯỢNG</th>
                    <th className="text-right p-6 font-bold">ĐƠN GIÁ</th>
                    <th className="text-right p-6 font-bold">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.orderItems.map((item, i) => {
                    // Lấy giá an toàn từ nhiều nguồn có thể
                    const unitPrice = item.unitPrice || item.price || item.product?.price || 0;
                    const quantity = item.quantity || 1;
                    const itemTotal = unitPrice * quantity;

                    return (
                      <tr key={i} className="hover:bg-green-50 transition">
                        <td className="p-6 font-medium text-gray-800">
                          {item.name || item.product?.name || 'Sản phẩm không xác định'}
                        </td>
                        <td className="p-6 text-center font-bold text-xl text-gray-800">{quantity}</td>
                        <td className="p-6 text-right text-lg text-gray-700">
                          {formatCurrency(unitPrice)}
                        </td>
                        <td className="p-6 text-right font-bold text-green-600 text-xl">
                          {formatCurrency(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <td colSpan="3" className="text-right p-8 text-2xl font-extrabold text-gray-800">
                      TỔNG CỘNG
                    </td>
                    <td className="text-right p-8 text-3xl font-extrabold text-green-600">
                      {formatCurrency(order.totalAmount || calculatedTotal)}
                    </td>
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