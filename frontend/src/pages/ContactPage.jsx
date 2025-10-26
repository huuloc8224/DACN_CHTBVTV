import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h1 className="text-4xl font-extrabold text-green-700 mb-6">Liên Hệ Với Chúng Tôi</h1>
      <p className="text-lg text-gray-600 mb-8">
        Chúng tôi sẵn lòng hỗ trợ bạn mọi thắc mắc về sản phẩm và dịch vụ tư vấn.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Details */}
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Mail size={24} className="text-blue-500 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Email Hỗ Trợ</h3>
              <p className="text-blue-600">hotro@tbvtv.vn</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Phone size={24} className="text-green-500 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Điện Thoại</h3>
              <p className="text-green-600">0294 382 2253</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Clock size={24} className="text-yellow-500 mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Giờ Làm Việc</h3>
              <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
            </div>
          </div>
        </div>

        {/* Location Map (Dummy) */}
        <div className="bg-gray-200 rounded-lg overflow-hidden">
          <MapPin size={32} className="mx-auto mt-10 text-gray-500"/>
          <p className="p-4 text-center text-gray-600">
            Địa chỉ: Trường Đại học Trà Vinh (TVU), Khoa Nông nghiệp
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
