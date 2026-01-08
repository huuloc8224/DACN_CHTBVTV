// src/pages/CartPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, X, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const placeholderImg = "https://placehold.co/80x80/e0f2f1/047857?text=Thuoc";

/* ---------------- AddAddressForm ---------------- */
const AddAddressForm = ({ onAddressAdded, onCancel }) => {
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!recipientName || !phoneNumber || !addressLine) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/user/addresses', {
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressLine: addressLine.trim()
      });
      onAddressAdded(data.address);
      setRecipientName('');
      setPhoneNumber('');
      setAddressLine('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu địa chỉ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200">
      <h3 className="text-xl font-bold text-green-700">Thêm địa chỉ giao hàng mới</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
        <input
          required
          value={recipientName}
          onChange={e => setRecipientName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          required
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          placeholder="0909123456"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
        <textarea
          required
          value={addressLine}
          onChange={e => setAddressLine(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          rows="3"
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
        />
      </div>
      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
          Hủy
        </button>
        <button type="submit" disabled={saving} className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
          {saving && <Loader className="animate-spin" size={18} />}
          {saving ? 'Đang lưu...' : 'Lưu & Chọn'}
        </button>
      </div>
    </form>
  );
};

/* ---------------- CartPage component ---------------- */
const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Tính toán giá chính xác từ cart
  const subtotal = cart.reduce((sum, item) => {
    const product = item.product || item;
    const price = product.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shippingFee + tax;

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/user/addresses');
      const addresses = data.addresses || [];
      setSavedAddresses(addresses);
      if (addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr._id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Lỗi fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const openCheckout = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
    fetchAddresses();
  };

  const handleAddressAdded = (newAddress) => {
    setSavedAddresses(prev => [...prev, newAddress]);
    setSelectedAddressId(newAddress._id);
    setShowNewAddressForm(false);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return alert('Giỏ hàng trống!');

    const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) return alert('Vui lòng chọn địa chỉ giao hàng!');

    const orderData = {
      orderItems: cart.map(item => {
        const product = item.product || item;
        return {
          product: product._id,
          quantity: item.quantity,
          unitPrice: product.price,
          name: product.name,
          image_url: product.image_url
        };
      }),
      shippingAddress: selectedAddress.addressLine,
      recipientName: selectedAddress.recipientName,
      phoneNumber: selectedAddress.phoneNumber,
      paymentMethod,
      totalAmount: grandTotal,
      shippingFee,
      tax
    };

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const { data: orderRes } = await api.post('/orders', orderData);

      if (paymentMethod === 'VNPAY') {
        const { data: vnpayRes } = await api.post('/payment/create_payment_url', {
          orderId: orderRes._id,
          amount: grandTotal
        });
        clearCart();
        setIsModalOpen(false);
        window.location.href = vnpayRes.paymentUrl;
        return;
      }

      clearCart();
      setIsModalOpen(false);
      navigate('/myorders');
      alert('Đặt hàng thành công! Cảm ơn bà con đã tin dùng TBVTV 🌾');
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      setCheckoutError(error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Xóa toàn bộ sản phẩm trong giỏ hàng?')) {
      clearCart();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md">
          <ShoppingCart size={100} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Hãy chọn sản phẩm bà con cần nhé!</p>
          <Link to="/products" className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header giỏ hàng */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-green-700">
            Giỏ hàng <span className="text-2xl text-gray-600">({cart.length} sản phẩm)</span>
          </h1>
          <button
            onClick={handleClearCart}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-3"
          >
            <Trash2 size={20} /> Xóa hết giỏ hàng
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => {
              const product = item.product || item;
              const price = product.price || 0;
              const quantity = item.quantity || 1;
              const itemTotal = price * quantity;
              const image = product.image_url || placeholderImg;

              return (
                <div key={item._id || product._id} className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6 border border-gray-100">
                  <img src={image} alt={product.name} className="w-28 h-28 object-cover rounded-xl flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 mt-2">Giá: {price.toLocaleString('vi-VN')}₫</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item._id || product._id, quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id || product._id, quantity + 1)}
                      className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-green-600">
                      {itemTotal.toLocaleString('vi-VN')}₫
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id || product._id)}
                      className="text-red-600 hover:text-red-700 mt-4 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={18} /> Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tóm tắt đơn hàng */}
          <aside className="bg-white rounded-2xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Tóm tắt đơn hàng</h2>

            <div className="space-y-5 text-lg">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-bold">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-bold' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + '₫'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (5%)</span>
                <span>{tax.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="border-t-2 border-gray-300 pt-5 flex justify-between text-2xl font-extrabold text-green-600">
                <span>Tổng cộng</span>
                <span>{grandTotal.toLocaleString('vi-VN')}₫</span>
              </div>

              {subtotal >= 500000 && (
                <p className="text-green-600 font-medium text-center mt-4">
                  🎉 Chúc mừng! Đơn trên 500.000₫ được miễn phí vận chuyển
                </p>
              )}
            </div>

            <button
              onClick={openCheckout}
              className="w-full mt-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 duration-300"
            >
              Tiến hành thanh toán
            </button>
          </aside>
        </div>

        {/* Modal Xác nhận đơn hàng */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <X size={32} />
              </button>

              <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">Xác nhận đơn hàng</h2>

              {loadingAddresses ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin text-green-600 mx-auto" size={48} />
                  <p className="mt-4 text-gray-600">Đang tải địa chỉ...</p>
                </div>
              ) : (
                <>
                  {/* Danh sách sản phẩm trong modal */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm đã chọn ({cart.length})</h3>
                    <div className="space-y-4">
                      {cart.map(item => {
                        const product = item.product || item;
                        const price = product.price || 0;
                        const quantity = item.quantity || 1;
                        const itemTotal = price * quantity;
                        const image = product.image_url || placeholderImg;

                        return (
                          <div key={item._id || product._id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                            <img src={image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{product.name}</h4>
                              <p className="text-gray-600">
                                {quantity} × {price.toLocaleString('vi-VN')}₫ = <span className="font-bold text-green-600">{itemTotal.toLocaleString('vi-VN')}₫</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Địa chỉ giao hàng */}
                  {savedAddresses.length > 0 && !showNewAddressForm && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn địa chỉ giao hàng</h3>
                      <div className="space-y-3">
                        {savedAddresses.map(addr => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedAddressId === addr._id
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <p className="font-bold">{addr.recipientName} - {addr.phoneNumber}</p>
                            <p className="text-gray-600">{addr.addressLine}</p>
                            {addr.isDefault && <span className="text-green-600 text-sm font-medium">★ Mặc định</span>}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                      >
                        <Plus size={20} /> Thêm địa chỉ mới
                      </button>
                    </div>
                  )}

                  {/* Form thêm địa chỉ mới */}
                  {showNewAddressForm && (
                    <AddAddressForm
                      onAddressAdded={handleAddressAdded}
                      onCancel={() => setShowNewAddressForm(false)}
                    />
                  )}

                  {/* Phương thức thanh toán */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`p-5 border-2 rounded-xl cursor-pointer text-center transition-all ${
                        paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                      }`}>
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="hidden" />
                        <p className="font-bold">Thanh toán khi nhận hàng (COD)</p>
                      </label>
                      <label className={`p-5 border-2 rounded-xl cursor-pointer text-center transition-all ${
                        paymentMethod === 'VNPAY' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                      }`}>
                        <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="hidden" />
                        <p className="font-bold">Thanh toán qua VNPAY</p>
                      </label>
                    </div>
                  </div>

                  {/* Tóm tắt giá */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <div className="space-y-4 text-lg">
                      <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span className="font-bold">{subtotal.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí vận chuyển</span>
                        <span className={shippingFee === 0 ? 'text-green-600 font-bold' : ''}>
                          {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + '₫'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (5%)</span>
                        <span>{tax.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-4 flex justify-between text-2xl font-extrabold text-green-600">
                        <span>Tổng cộng</span>
                        <span>{grandTotal.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </div>

                  {checkoutError && <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-6">{checkoutError}</p>}

                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all disabled:opacity-70"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;