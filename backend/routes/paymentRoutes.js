// backend/routes/paymentRoutes.js – ĐÃ CHUYỂN SANG require ĐỂ CHẠY NGAY
const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// === CẤU HÌNH VNPAY CỦA BẠN (CHÍNH CHỦ) ===
const vnp_TmnCode = "MY8BV9XD";
const vnp_HashSecret = "26SYVEW3NOIRBVEM5VCEUYWB46OGZRYU";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

// URL trả về sau khi thanh toán (tùy môi trường)
const vnp_ReturnUrl = process.env.FRONTEND_URL
  ? `${process.env.FRONTEND_URL}/payment-success`
  : "http://localhost:5173/payment-success";

// 1. TẠO URL THANH TOÁN VNPAY
router.post('/create_payment_url', protect, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: amount * 100, // VNPAY dùng "xu"
      vnp_CreateDate: new Date().toISOString().slice(0, 19).replace(/[-T:]/g, ''),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: '250000',
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_TxnRef: orderId.toString(),
    };

    // Tạo chữ ký
    let signData = Object.keys(vnp_Params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
      .join('&');

    let hmac = crypto.createHmac('sha512', vnp_HashSecret);
    let vnp_SecureHash = hmac.update(signData).digest('hex');
    vnp_Params['vnp_SecureHash'] = vnp_SecureHash;

    const paymentUrl = `${vnp_Url}?${new URLSearchParams(vnp_Params).toString()}`;
    res.json({ paymentUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tạo URL thanh toán' });
  }
});

// 2. NHẬN CALLBACK TỪ VNPAY (IPN) – TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
router.get('/vnpay_ipn', async (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  let signData = Object.keys(vnp_Params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
    .join('&');

  let hmac = crypto.createHmac('sha512', vnp_HashSecret);
  let signed = hmac.update(signData).digest('hex');

  if (secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00') {
    const orderId = vnp_Params['vnp_TxnRef'];
    try {
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: vnp_Params['vnp_TransactionNo'],
          status: 'COMPLETED',
          method: 'VNPAY'
        }
      });
      console.log(`ĐƠN HÀNG ${orderId} ĐÃ THANH TOÁN THÀNH CÔNG QUA VNPAY`);
    } catch (err) {
      console.error('Lỗi cập nhật đơn hàng:', err);
    }
  }

  res.status(200).json({ RspCode: '00', Message: 'success' });
});

module.exports = router;