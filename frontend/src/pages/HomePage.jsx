import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Bot, ShoppingCart, Search, CheckCircle, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <>
            {/* HERO SECTION - SIÊU ĐẸP */}
            <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center">
                    <div className="flex justify-center mb-6">
                        <Leaf size={80} className="text-green-300 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                        Bảo Vệ Cây Trồng Thông Minh
                        <br />
                        <span className="text-green-300">Bằng Công Nghệ AI</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100  max-w-4xl mx-auto leading-relaxed">
                        Chẩn đoán sâu bệnh chính xác • Gợi ý thuốc đặc trị hiệu quả cao
                    </p>
                    <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed"> 
                        Giao hàng nhanh toàn quốc • Hỗ trợ kỹ thuật 24/7
                    </p>                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-10">
                        <Link
                            to="/products"
                            className="group inline-flex items-center bg-white text-green-700 px-10 py-5 rounded-full text-xl font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-2xl"
                        >
                            <Search size={28} className="mr-3 group-hover:translate-x-1 transition" />
                            Tìm Thuốc Ngay
                        </Link>
                        <Link
                            to="/chatbot"
                            className="inline-flex items-center bg-green-500 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl border-2 border-white"
                        >
                            <Bot size={28} className="mr-3" />
                            Tư Vấn AI Miễn Phí
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES - 4 Ô VUÔNG SIÊU CHUYÊN NGHIỆP */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                            Tại Sao Hàng Ngàn Nhà Nông Tin Dùng
                        </h2>
                        <p className="text-xl text-gray-600">Chúng tôi mang đến giải pháp toàn diện cho cây trồng của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Bot, title: "AI Chẩn Đoán Thông Minh", desc: "Nhận diện hơn 200 loại sâu bệnh chỉ trong vài giây", color: "blue" },
                            { icon: Shield, title: "Sản Phẩm Chính Hãng 100%", desc: "Cam kết thuốc thật, nguồn gốc rõ ràng từ các hãng lớn", color: "green" },
                            { icon: Truck, title: "Giao Hàng Siêu Tốc", desc: "Hỏa tốc 2h nội thành • Toàn quốc 1-3 ngày", color: "yellow" },
                            { icon: HeadphonesIcon, title: "Hỗ Trợ Kỹ Thuật 24/7", desc: "Kỹ sư nông nghiệp trực tuyến hỗ trợ mọi lúc", color: "purple" }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-500 hover:-translate-y-3">
                                <div className={`inline-flex p-4 rounded-full bg-${item.color}-100 text-${item.color}-600 mb-6 group-hover:scale-110 transition`}>
                                    <item.icon size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST BADGES */}
            <section className="py-16 bg-white border-t border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 items-center">
                        {[
                            "Đã phục vụ 50.000+ nông dân",
                            "Hợp tác với 20+ hãng thuốc lớn",
                            "Chứng nhận từ Bộ Nông Nghiệp",
                            "Được yêu thích trên toàn quốc"
                        ].map((text, i) => (
                            <div key={i} className="text-center">
                                <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                                <p className="text-lg font-semibold text-gray-700">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                        Sẵn Sàng Bảo Vệ Vụ Mùa Của Bạn?
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 text-green-100">
                        Đừng để sâu bệnh làm hỏng công sức cả năm trời. Hãy hành động ngay hôm nay!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center bg-white text-green-700 px-12 py-5 rounded-full text-2xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
                        >
                            <ShoppingCart size={36} className="mr-3" />
                            Mua Thuốc Ngay
                        </Link>
                        <button className="inline-flex items-center justify-center bg-transparent border-4 border-white text-white px-12 py-5 rounded-full text-2xl font-bold hover:bg-white hover:text-green-700 transition-all">
                            <Bot size={36} className="mr-3" />
                            Tư Vấn AI Miễn Phí
                        </button>
                    </div>
                </div>
            </section>

        </>
    );
};

export default HomePage;