// frontend/src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader, ArrowLeft, Package, Truck, CreditCard, User,
  CheckCircle2, Clock, XCircle, MapPin, Phone, Calendar,
  AlertCircle, Home, WalletCards, QrCode
} from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCurrentStep = (status) => {
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  return steps.indexOf(status);
};

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, user]);

  // === NÚT THANH TOÁN NGAY – CHỈ HIỆN KHI CHƯA THANH TOÁN + CHUYỂN KHOẢN ===
  const handlePayNow = () => {
    navigate('/transfer-info', {
      state: {
        order: order,
        transferContent: order.transferContent || `DH${order._id.slice(-8).toUpperCase()}`
      }
    });
  };

  const isPendingBankTransfer =
    order?.paymentMethod === 'BankTransfer' &&
    !order?.isPaid &&
    order?.status !== 'Cancelled';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader size={56} className="animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Đang tải chi tiết đơn hàng...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-2xl font-bold text-red-800 mb-2">Không tìm thấy đơn hàng</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Link to="/myorders" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );

  const currentStep = getCurrentStep(order.status);
  const isCancelled = order.status === 'Cancelled';

  // --- Tính toán tiền: subtotal, tax (VAT 5%), shipping, grandTotal
  const subtotal = order.orderItems.reduce((acc, item) => {
    const unit = Number(item.unitPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 0);
    return acc + unit * qty;
  }, 0);

  // Nếu backend đã lưu taxPrice, ưu tiên dùng; nếu không, tính VAT 5%
  const tax = typeof order.taxPrice === 'number' ? order.taxPrice : Math.round(subtotal * 0.05);
  const shipping = typeof order.shippingPrice === 'number' ? order.shippingPrice : 0;
  const grandTotal = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Nút quay lại */}
        <Link to={user?.role === 'admin' ? '/admin/orders' : '/myorders'}
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium mb-6">
          <ArrowLeft size={20} /> Quay lại danh sách đơn hàng
        </Link>

        {/* HEADER + NÚT THANH TOÁN NGAY */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                Đơn hàng <span className="text-green-600 font-mono text-4xl">#{order.orderCode || order._id.slice(-8).toUpperCase()}</span>
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar size={18} /> Đặt vào: <strong>{formatDate(order.orderDate || order.createdAt)}</strong>
              </p>
            </div>

            {/* NÚT THANH TOÁN NGAY – CHỈ KHI CHUYỂN KHOẢN */}
            {isPendingBankTransfer && (
              <button
                onClick={handlePayNow}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full text-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
              >
                <QrCode size={20} />
                Thanh toán ngay
              </button>
            )}

            {/* Trạng thái đơn hàng */}
            <div className={`px-6 py-3 rounded-full font-bold text-lg shadow-lg ${
              isCancelled ? 'bg-red-100 text-red-800' :
              order.isPaid ? 'bg-green-100 text-green-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {isCancelled ? 'ĐÃ HỦY' :
               order.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
            </div>
          </div>

          {/* 3 Ô thông tin gọn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={24} className="text-green-600" />
                <h4 className="font-bold text-gray-800">Địa chỉ nhận hàng</h4>
              </div>
              <p className="text-gray-700 font-medium">{order.recipientName || 'Khách lẻ'}</p>
              <p className="text-gray-700">{order.shippingAddress}</p>
              <p className="flex items-center gap-2 mt-2 text-gray-600">
                <Phone size={16} /> {order.phoneNumber}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <WalletCards size={24} className="text-blue-600" />
                <h4 className="font-bold text-gray-800">Phương thức thanh toán</h4>
              </div>
              <p className="font-semibold text-gray-700">
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
              </p>
              <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${
                order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {order.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </span>
            </div>

            {user?.role === 'admin' && order.userId && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <User size={24} className="text-purple-600" />
                  <h4 className="font-bold text-gray-800">Khách hàng</h4>
                </div>
                <p><strong>{order.userId.name}</strong></p>
                <p className="text-sm text-gray-600">{order.userId.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline hành trình đơn hàng */}
        {!isCancelled && currentStep >= 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-center mb-10 text-gray-800">Hành trình đơn hàng</h3>
            <div className="relative">
              <div className="absolute top-10 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
              <div
                className="absolute top-10 left-0 h-1 bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${(currentStep + 1) * 25}%` }}
              ></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Đặt hàng thành công',    icon: Clock },
                  { label: 'Đang xử lý',             icon: Package },
                  { label: 'Đã giao vận chuyển',      icon: Truck },
                  { label: 'Giao hàng thành công',   icon: CheckCircle2 },
                ].map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all
                      ${index <= currentStep ? 'bg-green-600 text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
                      <step.icon size={32} />
                    </div>
                    <p className={`mt-5 font-bold text-lg ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Danh sách sản phẩm + Tổng tiền (hiển thị VAT) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Package size={32} /> Sản phẩm đã đặt ({order.orderItems.length})
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex gap-5 items-center pb-6 border-b last:border-0">
                <img src={item.image_url || "https://placehold.co/80x80"} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                  <p className="text-gray-600">{item.quantity} × {formatCurrency(item.unitPrice || item.price)}</p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency((item.unitPrice || item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-6 space-y-4 border-t-4 border-green-600">
            <div className="flex justify-between text-lg">
              <span>Tạm tính</span>
              <span className="font-semibold">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>VAT 5%</span>
              <span className="font-semibold">{formatCurrency(tax)}</span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Phí vận chuyển</span>
              <span className="font-semibold text-green-600">{shipping > 0 ? formatCurrency(shipping) : 'Miễn phí'}</span>
            </div>

            <div className="pt-6 border-t-4 border-green-600 flex justify-between text-3xl font-extrabold">
              <span>Tổng cộng</span>
              <span className="text-green-600">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Cảnh báo nếu chưa thanh toán */}
        {isPendingBankTransfer && (
          <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-orange-800 mb-3">
              Đơn hàng đang chờ thanh toán
            </p>
            <p className="text-lg text-orange-700">
              Vui lòng chuyển khoản trong vòng <strong>24 giờ</strong> để tránh bị hủy tự động
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
