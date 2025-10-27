// frontend/src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
// [SỬA LỖI] Thêm MapPin, PlusCircle (dùng cho PlusAdd), và Loader
import { 
    Trash2, Plus, Minus, ShoppingCart, XCircle, Package, X, 
    CheckCircle, Smartphone, MapPin, PlusCircle as PlusAdd, Loader 
} from 'lucide-react';import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const placeholderImg = "https://placehold.co/100x100/e0f2f1/047857?text=Thuoc";
const STATUS_OPTIONS = ['COD', 'BankTransfer'];

// [MỚI] Component Form Thêm Địa chỉ
const AddAddressForm = ({ onAddressAdded, onCancel }) => {
    const [recipientName, setRecipientName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Gọi API để lưu địa chỉ mới
            const { data: newAddress } = await api.post('/users/addresses', {
                recipientName, phoneNumber, addressLine
            });
            // 2. Trả địa chỉ mới về CartPage để tự động chọn
            onAddressAdded(newAddress); 
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi lưu địa chỉ.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Thêm địa chỉ giao hàng mới</h3>
            <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">Tên người nhận</label>
                <input type="text" name="recipientName" id="recipientName" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full p-2 border rounded-lg mt-1" />
            </div>
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input type="tel" name="phoneNumber" id="phoneNumber" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2 border rounded-lg mt-1" />
            </div>
            <div>
                <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
                <textarea name="addressLine" id="addressLine" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" className="w-full p-2 border rounded-lg mt-1" rows="3"></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Hủy</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Lưu & Chọn</button>
            </div>
        </form>
    );
};

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [checkoutError, setCheckoutError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
// [MỚI] State cho Sổ Địa chỉ
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // [MỚI] Hàm tải Sổ Địa chỉ
    const fetchAddresses = async () => {
        if (!user) return;
        setLoadingAddresses(true);
        try {
            const { data } = await api.get('/users/addresses');
            setSavedAddresses(data);
            // Tự động chọn địa chỉ đầu tiên (nếu có)
            if (data.length > 0) {
                setSelectedAddressId(data[0]._id);
            } else {
                setShowNewAddressForm(true); // Nếu không có địa chỉ, buộc thêm mới
            }
        } catch (error) {
            console.error("Lỗi tải địa chỉ:", error);
            setCheckoutError("Lỗi tải sổ địa chỉ.");
        } finally {
            setLoadingAddresses(false);
        }
    };

    // [MỚI] Mở Modal và tải địa chỉ
    const openCheckout = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để đặt hàng.");
            navigate('/login');
            return;
        }
        setIsModalOpen(true);
        fetchAddresses(); // Tải địa chỉ khi modal mở
    };
    
    // [MỚI] Hàm callback khi thêm địa chỉ mới thành công
    const handleAddressAdded = (newAddress) => {
        setSavedAddresses(prev => [...prev, newAddress]); // Cập nhật UI
        setSelectedAddressId(newAddress._id); // Tự động chọn
        setShowNewAddressForm(false); // Ẩn form thêm mới
    };

    // [SỬA LẠI] Hàm Submit Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        if (isProcessing || cart.length === 0) return;
        
        // [MỚI] Lấy đối tượng địa chỉ đã chọn
        const selectedAddress = savedAddresses.find(addr => addr._id === selectedAddressId);
        if (!selectedAddress) {
            setCheckoutError("Vui lòng chọn hoặc thêm một địa chỉ giao hàng.");
            return;
        }

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
            paymentMethod: paymentMethod, // Phương thức thanh toán
            shippingAddress: selectedAddress // Gửi cả đối tượng địa chỉ
        };

        try {
            // 2. Gọi API POST /api/orders
            const response = await api.post('/orders', orderData);
            
            alert(`Đơn hàng #${response.data._id.substring(0, 8)} đã được tạo thành công!`);
            
            clearCart();
            setIsModalOpen(false);
            navigate('/myorders'); // Chuyển hướng đến Lịch sử đơn hàng

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

            {/* ... (Phần Summary Card) ... */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 h-fit sticky top-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Tóm tắt đơn hàng</h2>
                <div className="space-y-3">
                    <div className="flex justify-between text-lg text-gray-600"><span>Tổng mặt hàng:</span><span>{cart.length}</span></div>
                    <div className="flex justify-between text-lg text-gray-600 border-b pb-3"><span>Tạm tính:</span><span>{totalPrice.toLocaleString('vi-VN')}₫</span></div>
                    <div className="flex justify-between text-2xl font-extrabold text-red-600 pt-2"><span>Thành tiền:</span><span>{totalPrice.toLocaleString('vi-VN')}₫</span></div>
                </div>
                
                <button
                    onClick={openCheckout} // Mở modal
                    disabled={cart.length === 0}
                    className="w-full mt-6 bg-green-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:bg-gray-400"
                >
                    Tiến hành Đặt hàng
                </button>
            </div>

            {/* --- CHECKOUT MODAL (ĐÃ VIẾT LẠI HOÀN TOÀN) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div onSubmit={handleSubmitOrder} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <CheckCircle size={24} className="mr-2 text-green-600"/> Xác nhận Đặt hàng
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24}/></button>
                        </div>

                        {/* Phần Chọn Địa chỉ */}
                        <div className="space-y-4 mt-6">
                            <h3 className="text-lg font-semibold flex items-center"><MapPin size={20} className="mr-2"/> Chọn Địa chỉ Giao hàng</h3>
                            
                            {loadingAddresses ? (
                                <div className="text-center py-4"><Loader size={20} className="animate-spin"/></div>
                            ) : (
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {savedAddresses.map((addr) => (
                                        <label key={addr._id} className={`flex items-start p-4 border rounded-lg cursor-pointer ${selectedAddressId === addr._id ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                                            <input 
                                                type="radio" 
                                                name="address" 
                                                className="mt-1"
                                                checked={selectedAddressId === addr._id}
                                                onChange={() => {
                                                    setSelectedAddressId(addr._id);
                                                    setShowNewAddressForm(false); // Ẩn form nếu đang chọn
                                                }}
                                            />
                                            <div className="ml-3 text-sm">
                                                <p className="font-bold">{addr.recipientName} - {addr.phoneNumber}</p>
                                                <p className="text-gray-600">{addr.addressLine}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Nút Thêm địa chỉ mới */}
                            {!showNewAddressForm && (
                                <button type="button" onClick={() => {
                                    setShowNewAddressForm(true);
                                    setSelectedAddressId(null); // Bỏ chọn địa chỉ cũ
                                }} className="flex items-center text-blue-600 hover:text-blue-800">
                                    <PlusAdd size={18} className="mr-1"/> Thêm địa chỉ mới
                                </button>
                            )}
                            
                            {/* Form Thêm địa chỉ mới (hiện khi nhấn nút) */}
                            {showNewAddressForm && (
                                <AddAddressForm 
                                    onAddressAdded={handleAddressAdded}
                                    onCancel={() => setShowNewAddressForm(false)}
                                />
                            )}
                        </div>
                        
                        {/* Phương thức Thanh toán */}
                        <div className="border-t pt-6 mt-6">
                             <label className="block text-lg font-semibold text-gray-700 mb-2">Phương thức Thanh toán</label>
                             <select 
                                name="paymentMethod" 
                                value={paymentMethod} 
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            >
                                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                                <option value="BankTransfer">Chuyển khoản Ngân hàng</option>
                            </select>
                        </div>
                        
                        {checkoutError && <p className="text-red-500 text-sm mt-4">{checkoutError}</p>}

                        <button
                            type="button"
                            onClick={handleSubmitOrder}
                            disabled={isProcessing || loadingAddresses || !selectedAddressId}
                            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Đang gửi đơn hàng...' : `Xác nhận & Đặt hàng (${totalPrice.toLocaleString('vi-VN')}₫)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage