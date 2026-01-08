// src/components/Footer.jsx
import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const latitude = 9.923657483161065;
  const longitude = 106.34645555647808;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <footer className="bg-gray-800 text-gray-300 mt-6">
      <div className="container mx-auto px-3 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <div className="text-sm md:text-base">
          <h4 className="text-base md:text-lg font-semibold text-white mb-1">Liên hệ</h4>
          <address className="not-italic space-y-1">
            <p className="flex items-start">
              <MapPin size={16} className="mr-2 text-green-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm md:text-base">TBVTV - Huỳnh Hữu Lộc</span>
            </p>
            <p className="flex items-center">
              <Phone size={16} className="mr-2 text-green-400" aria-hidden="true" />
              <a href="tel:+84378460874" className="hover:text-white transition text-sm md:text-base">0378 460 874</a>
            </p>
            <p className="flex items-center">
              <Mail size={16} className="mr-2 text-green-400" aria-hidden="true" />
              <a href="mailto:info@tbvtv.vn" className="hover:text-white transition text-sm md:text-base">info@tbvtv.vn</a>
            </p>
          </address>
        </div>

        <div className="text-sm md:text-base">
          <h4 className="text-base md:text-lg font-semibold text-white mb-1">Điều hướng</h4>
          <ul className="space-y-1">
            <li><a href="/" className="hover:text-white transition text-sm md:text-base">Trang chủ</a></li>
            <li><a href="/products" className="hover:text-white transition text-sm md:text-base">Sản phẩm</a></li>
            <li><a href="/login" className="hover:text-white transition text-sm md:text-base">Đăng nhập</a></li>
            <li><a href="/chatbot" className="hover:text-white transition text-sm md:text-base">Trợ lý</a></li>
          </ul>
        </div>

        <div className="text-sm md:text-base hidden md:block">
          <h4 className="text-base md:text-lg font-semibold text-white mb-1">Vị trí</h4>
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            <div className="w-full h-28">
              <iframe
                title="Bản đồ vị trí TBVTV"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Bản đồ vị trí TBVTV"
              />
            </div>
            <div className="p-2">
              <p className="text-sm md:text-base text-gray-700 font-medium">TBVTV - Vật tư nông nghiệp</p>
              <p className="text-[13px] md:text-sm text-gray-600 truncate">Nguyễn Thiện Thành - P.Hòa Thuận - T.Vĩnh Long</p>
              <div className="mt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition"
                >
                  Mở Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 py-1 text-center text-sm md:text-base">
        &copy; {new Date().getFullYear()} Đồ án CNTT: Hệ thống TBVTV. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
