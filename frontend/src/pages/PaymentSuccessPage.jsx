import React from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
        <CheckCircle size={120} className="mx-auto text-green-600 mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold text-green-700 mb-4">THANH TOÁN THÀNH CÔNG!</h1>
        <p className="text-xl text-gray-700 mb-8">
          Cảm ơn bạn đã tin tưởng <strong className="text-green-600">TBVTV</strong>
        </p>
        <Link to="/myorders" className="bg-blue-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 inline-flex items-center gap-3">
          <Home size={28} /> Xem đơn hàng của tôi
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;