// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, X, PlusCircle as PlusAdd, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const placeholderImg = "https://placehold.co/80x80/e0f2f1/047857?text=Thuoc";

const AddAddressForm = ({ onAddressAdded, onCancel }) => {
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: newAddress } = await api.post('/users/addresses', {
        recipientName,
        phoneNumber,
        addressLine
      });
      onAddressAdded(newAddress);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu địa chỉ.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-green-700">Thêm địa chỉ giao hàng</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
        <input required value={recipientName} onChange={e => setRecipientName(e.target.value)}
               className="w-full p-2 border rounded-md" placeholder="Nguyễn Văn A"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
               className="w-full p-2 border rounded-md" placeholder="0909123456"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
        <textarea required value={addressLine} onChange={e => setAddressLine(e.target.value)}
                  className="w-full p-2 border rounded-md" rows="3"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"/>
      </div>
      {error && <p className="text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Lưu & Chọn</button>
      </div>
    </form>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
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

  // Subtotal, VAT 5% and grand total
  const subtotal = totalPrice || 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  useEffect(() => {
    // optional debug
  }, [savedAddresses, selectedAddressId]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/users/addresses');
      setSavedAddresses(data || []);
      if (data?.length > 0) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr._id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Lỗi fetch addresses:', error);
      alert("Không tải được danh sách địa chỉ");
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
    if (!user) return navigate('/login');
    if (cart.length === 0) return alert('Giỏ hàng trống!');

    const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) return alert('Vui lòng chọn địa chỉ giao hàng!');

    // Build order payload: include unitPrice snapshot to be safe
    const orderData = {
      orderItems: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.price ?? 0,
        name: item.name,
        image_url: item.image_url
      })),
      shippingAddress: selectedAddress.addressLine,
      recipientName: selectedAddress.recipientName,
      phoneNumber: selectedAddress.phoneNumber,
      paymentMethod
    };

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const { data: orderRes } = await api.post('/orders', orderData);

      // If VNPAY, backend returns payment url and totalAmount
      if (paymentMethod === 'VNPAY') {
        const { data: vnpayRes } = await api.post('/payment/create_payment_url', {
          orderId: orderRes._id,
          amount: orderRes.totalAmount
        });
        clearCart();
        setIsModalOpen(false);
        window.location.href = vnpayRes.paymentUrl;
        return;
      }

      // COD
      clearCart();
      setIsModalOpen(false);
      navigate('/myorders');
      alert('Đặt hàng thành công!');
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      setCheckoutError(error.response?.data?.message || error.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    const ok = window.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng không?');
    if (ok) clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md">
          <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6"/>
          <h2 className="text-3xl font-bold mb-4 text-gray-700">Giỏ hàng trống</h2>
          <p className="text-base text-gray-600 mb-6">Hãy chọn sản phẩm bạn cần nhé!</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:shadow-md transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Giỏ hàng của bạn <span className="text-base text-gray-600">({cart.length} sản phẩm)</span></h1>
          <div className="flex items-center gap-3">
            <button onClick={handleClearCart} className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition flex items-center gap-2">
              <Trash2 size={16}/> Xóa hết
            </button>
            <Link to="/products" className="px-3 py-2 bg-white rounded-md text-sm hover:shadow-sm">Tiếp tục mua sắm</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 border">
                <img src={item.image_url || placeholderImg} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Giá: {(item.unitPrice ?? item.price ?? 0).toLocaleString('vi-VN')}₫</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}
                          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">
                    <Minus size={16}/>
                  </button>
                  <span className="text-lg font-bold w-10 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
                    <Plus size={16}/>
                  </button>
                </div>

                <div className="text-right w-36">
                  <p className="text-lg font-bold text-green-600">{((item.unitPrice ?? item.price ?? 0) * item.quantity).toLocaleString('vi-VN')}₫</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-600 hover:text-red-800 mt-2 text-sm flex items-center gap-2 justify-end">
                    <Trash2 size={14}/> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-white p-4 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <strong>{subtotal.toLocaleString('vi-VN')}₫</strong>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT 5%</span>
                <span>{tax.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Tổng cộng</span>
                <span>{grandTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button
              onClick={openCheckout}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-green-700"
            >
              Tiến hành thanh toán
            </button>
          </aside>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-4 text-green-700">Thanh toán</h2>

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader size={36} className="animate-spin text-green-600" />
                </div>
              ) : (
                <>
                  {savedAddresses.length === 0 && !showNewAddressForm && (
                    <p className="text-red-600 mb-4">Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
                  )}

                  {showNewAddressForm && (
                    <AddAddressForm
                      onAddressAdded={handleAddressAdded}
                      onCancel={() => setShowNewAddressForm(false)}
                    />
                  )}

                  {savedAddresses.length > 0 && !showNewAddressForm && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-blue-600">Chọn địa chỉ giao hàng</h3>
                      {savedAddresses.map(addr => (
                        <div key={addr._id}
                             onClick={() => setSelectedAddressId(addr._id)}
                             className={`p-3 border rounded-md cursor-pointer ${selectedAddressId === addr._id ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                          <p className="font-medium">{addr.recipientName} - {addr.phoneNumber}</p>
                          <p className="text-sm text-gray-600">{addr.addressLine}</p>
                          {addr.isDefault && <span className="text-sm text-green-600 font-medium">Mặc định</span>}
                        </div>
                      ))}

                      <button onClick={() => setShowNewAddressForm(true)} className="flex items-center gap-2 text-green-600 mt-2">
                        <PlusAdd size={16} /> Thêm địa chỉ mới
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">Phương thức thanh toán</h3>
                    <div className="flex gap-3">
                      <label className={`p-2 border rounded-md cursor-pointer ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'}
                               onChange={() => setPaymentMethod('COD')} className="hidden" />
                        <span>COD</span>
                      </label>
                      <label className={`p-2 border rounded-md cursor-pointer ${paymentMethod === 'VNPAY' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                        <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'}
                               onChange={() => setPaymentMethod('VNPAY')} className="hidden" />
                        <span>VNPay</span>
                      </label>
                    </div>
                  </div>

                  {/* Show VAT and totals inside modal as well */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}₫</span></div>
                    <div className="flex justify-between text-sm"><span>VAT 5%</span><span>{tax.toLocaleString('vi-VN')}₫</span></div>
                    <div className="flex justify-between text-lg font-bold mt-2"><span>Tổng</span><span>{grandTotal.toLocaleString('vi-VN')}₫</span></div>
                  </div>

                  {checkoutError && <p className="text-red-600 mt-3">{checkoutError}</p>}

                  <button onClick={handleSubmitOrder}
                          disabled={isProcessing}
                          className="w-full mt-6 bg-green-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-green-700">
                    {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
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
