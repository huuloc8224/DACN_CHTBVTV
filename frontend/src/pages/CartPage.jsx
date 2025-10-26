// frontend/src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, XCircle, Package, X, CheckCircle, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const placeholderImg = "https://placehold.co/100x100/e0f2f1/047857?text=Thuoc";
const STATUS_OPTIONS = ['COD', 'BankTransfer'];

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [checkoutError, setCheckoutError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State cho Form Checkout
    const [shippingInfo, setShippingInfo] = useState({
        shippingAddress: user?.shippingAddress || '',
        phoneNumber: user?.phoneNumber || '',
        paymentMethod: 'COD' 
    });

    const handleInputChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        if (isProcessing || cart.length === 0) return;

        setIsProcessing(true);
        setCheckoutError('');

        // 1. Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            orderItems: cart.map(item => ({
                productId: item._id, 
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price
            })),
            totalAmount: totalPrice,
            ...shippingInfo, // Gửi địa chỉ, SĐT, phương thức thanh toán
        };

        try {
            // 2. Gọi API POST /api/orders
            const response = await api.post('/orders', orderData);
            
            alert(`Đơn hàng #${response.data._id.substring(0, 8)} đã được tạo thành công!`);
            
            // 3. Xóa giỏ hàng và chuyển hướng
            clearCart();
            setIsModalOpen(false);
            navigate('/admin'); // Chuyển hướng đến Dashboard để Admin xem đơn hàng

        } catch (error) {
            console.error("Lỗi đặt hàng:", error.response?.data?.message || error.message);
            setCheckoutError(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng kiểm tra console.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center p-16 bg-white rounded-xl shadow-lg border border-gray-100">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4"/>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng của bạn đang trống</h2>
                <Link to="/products" className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition">
                    Khám phá Sản phẩm
                </Link>
            </div>
        );
    }
    
    const openCheckout = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để đặt hàng.");
            navigate('/login');
            return;
        }
        setIsModalOpen(true);
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
                {/* ... (Render Items) ... */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                    <Package size={28} className="mr-2"/> Giỏ hàng của bạn
                    <span className="ml-4 text-lg font-normal text-gray-500">({cart.length} mặt hàng)</span>
                </h1>
                
                {cart.map(item => (
                    <div key={item._id} className="flex items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 transition duration-150 hover:shadow-lg">
                        <img src={item.image_url || placeholderImg} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4"/>
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">Hoạt chất: {item.active_ingredient || "Đa năng"}</p>
                        </div>
                        <div className="flex items-center space-x-2 mx-4">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 border rounded-full hover:bg-gray-100 disabled:opacity-50" disabled={item.quantity === 1}><Minus size={16}/></button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 border rounded-full hover:bg-gray-100"><Plus size={16}/></button>
                        </div>
                        <div className="text-right ml-auto">
                            <span className="block text-xl font-bold text-green-600">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                            <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 mt-1 flex items-center justify-end text-sm">
                                <Trash2 size={16} className="mr-1"/> Xóa
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={clearCart} className="flex items-center text-red-500 hover:text-red-700 font-medium mt-4 transition">
                    <XCircle size={20} className="mr-1"/> Xóa toàn bộ giỏ hàng
                </button>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 h-fit sticky top-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Tóm tắt đơn hàng</h2>
                <div className="space-y-3">
                    {/* ... (Pricing Details) ... */}
                    <div className="flex justify-between text-lg text-gray-600"><span>Tổng mặt hàng:</span><span>{cart.length}</span></div>
                    <div className="flex justify-between text-lg text-gray-600 border-b pb-3"><span>Tạm tính:</span><span>{totalPrice.toLocaleString('vi-VN')}₫</span></div>
                    <div className="flex justify-between text-2xl font-extrabold text-red-600 pt-2"><span>Thành tiền:</span><span>{totalPrice.toLocaleString('vi-VN')}₫</span></div>
                </div>
                
                <button
                    onClick={openCheckout} // Mở modal thay vì gọi API trực tiếp
                    disabled={cart.length === 0}
                    className="w-full mt-6 bg-green-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:bg-gray-400"
                >
                    Tiến hành Đặt hàng
                </button>
            </div>

            {/* --- CHECKOUT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <form onSubmit={handleSubmitOrder} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg space-y-6">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <CheckCircle size={24} className="mr-2 text-green-600"/> Xác nhận Đặt hàng
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24}/></button>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-lg font-semibold">Tổng cộng: <span className="text-red-600 ml-2">{totalPrice.toLocaleString('vi-VN')}₫</span></p>
                            <p className="text-sm text-gray-600">Giao tới: {shippingInfo.shippingAddress || '[Địa chỉ chưa nhập]'}</p>
                        </div>

                        {/* Input Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Giao hàng</label>
                            <textarea 
                                name="shippingAddress"
                                value={shippingInfo.shippingAddress}
                                onChange={handleInputChange}
                                required
                                placeholder="Số nhà, đường, xã/phường, tỉnh/thành phố"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="flex items-center">
                                <Smartphone size={16} className="mr-1"/> Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={shippingInfo.phoneNumber}
                                onChange={handleInputChange}
                                required
                                placeholder="090 123 4567"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức Thanh toán</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" name="paymentMethod" value="COD" checked={shippingInfo.paymentMethod === 'COD'} onChange={handleInputChange} className="mr-2 text-blue-600"/>
                                    Thanh toán khi nhận hàng (COD)
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="paymentMethod" value="BankTransfer" checked={shippingInfo.paymentMethod === 'BankTransfer'} onChange={handleInputChange} className="mr-2 text-blue-600"/>
                                    Chuyển khoản Ngân hàng
                                </label>
                            </div>
                        </div>

                        {checkoutError && <p className="text-red-500 text-sm">{checkoutError}</p>}

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Đang gửi đơn hàng...' : 'Xác nhận & Thanh toán'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CartPage;