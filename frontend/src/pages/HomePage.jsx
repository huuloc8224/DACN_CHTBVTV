// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Bot, Shield, Truck, HeadphonesIcon, CheckCircle, Search, ShoppingCart, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-700 via-green-700 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="mb-8">
            <Leaf size={100} className="mx-auto text-green-300 animate-pulse drop-shadow-2xl" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
            Bảo Vệ Cây Trồng
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-300">
              Bằng Trí Tuệ Nhân Tạo
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-12 leading-relaxed opacity-90">
            Chẩn đoán sâu bệnh chính xác  • Gợi ý thuốc đặc trị hiệu quả
            <br />
            Giao hàng nhanh toàn quốc • Hỗ trợ kỹ sư nông nghiệp 24/7
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to="/products"
              className="group inline-flex items-center bg-white text-green-700 px-12 py-6 rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 duration-300"
            >
              <Search size={36} className="mr-4 group-hover:translate-x-1 transition" />
              Tìm Thuốc Ngay
              <ArrowRight size={28} className="ml-4 group-hover:translate-x-2 transition" />
            </Link>
          </div>
        </div>


        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" className="w-full">
            <path fill="#f9fafb" d="M0,100 C300,200 600,0 960,100 C1320,200 1440,50 1440,50 L1440,200 L0,200 Z"></path>
          </svg>
        </div>
      </section>
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
              Tại Sao Hàng Ngàn Nhà Nông Tin Tưởng TBVTV?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi kết hợp công nghệ AI tiên tiến với kinh nghiệm thực tiễn đồng áng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: Bot,
                title: "AI Chẩn Đoán Siêu Chính Xác",
                desc: "Nhận diện sâu bệnh với độ chính xác cao",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "Sản Phẩm Chính Hãng 100%",
                desc: "Hợp tác trực tiếp với các hãng thuốc lớn: Syngenta, Bayer, BASF, Corteva...",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Truck,
                title: "Giao Hàng Hỏa Tốc Toàn Quốc",
                desc: "Nội thành 2h • Ngoại tỉnh 1-2 ngày • Miễn phí ship đơn từ 500.000đ",
                gradient: "from-orange-500 to-amber-500"
              },
              {
                icon: HeadphonesIcon,
                title: "Hỗ Trợ Kỹ Thuật 24/7",
                desc: "Đội ngũ kỹ sư nông nghiệp trực tuyến sẵn sàng giải đáp mọi thắc mắc",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-transparent hover:-translate-y-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative p-10 text-center">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center">
            {[
              { number: "50.000+", text: "Nhà nông tin dùng" },
              { number: "20+", text: "Đối tác hãng thuốc lớn" },
              { number: "95%", text: "Độ chính xác AI" },
              { number: "24/7", text: "Hỗ trợ kỹ thuật" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={60} className="text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-4xl font-extrabold text-green-700 mb-2">{stat.number}</p>
                <p className="text-lg text-gray-700 font-medium">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-5xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            Đừng Để Sâu Bệnh Phá Hủy Vụ Mùa Của Bạn
          </h2>
          <p className="text-2xl md:text-3xl mb-12 text-green-100 opacity-90">
            Hành động ngay hôm nay – bảo vệ cây trồng bằng công nghệ hiện đại nhất!
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center bg-white text-green-700 px-16 py-7 rounded-3xl text-3xl font-black hover:shadow-2xl transition-all transform hover:scale-110 duration-300"
            >
              <ShoppingCart size={48} className="mr-4 group-hover:translate-x-1 transition" />
              MUA THUỐC NGAY
            </Link>

          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;