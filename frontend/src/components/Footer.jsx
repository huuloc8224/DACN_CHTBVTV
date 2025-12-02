
import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300 mt-12 shadow-inner">
            <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Liên hệ</h3>
                    <p className="flex items-start mb-2">
                        <MapPin size={20} className="mr-3 mt-1 text-green-400 flex-shrink-0" />
                        <span>Huỳnh Hữu Lộc</span>
                    </p>
                    <p className="flex items-center mb-2">
                        <Phone size={20} className="mr-3 text-green-400" />
                        <span>0378460874</span>
                    </p>
                    <p className="flex items-center">
                        <Mail size={20} className="mr-3 text-green-400" />
                        <span>info@tbvtv.vn</span>
                    </p>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Điều hướng</h3>
                    <ul className="space-y-2">
                        <li><a href="/" className="hover:text-white transition">Trang chủ</a></li>
                        <li><a href="/products" className="hover:text-white transition">Sản phẩm</a></li>
                        <li><a href="/login" className="hover:text-white transition">Đăng nhập</a></li>
                        <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                    </ul>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">Nhận thông tin</h3>
                    <p className="text-sm mb-4">Đăng ký để nhận các thông tin mới nhất về sâu bệnh và thuốc đặc trị.</p>
                    <form className="flex">
                        <input 
                            type="email" 
                            placeholder="Email của bạn" 
                            className="p-3 rounded-l-lg w-full text-gray-900 focus:outline-none"
                        />
                        <button 
                            type="submit" 
                            className="bg-green-600 p-3 rounded-r-lg hover:bg-green-700 transition font-semibold"
                        >
                            Gửi
                        </button>
                    </form>
                </div>
            </div>
            <div className="bg-gray-900 p-4 text-center text-sm">
                &copy; {new Date().getFullYear()} Đồ án CNTT: Hệ thống TBVTV. Mọi quyền được bảo lưu.
            </div>
        </footer>
    );
};

export default Footer;
