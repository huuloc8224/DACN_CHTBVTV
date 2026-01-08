// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMessage(res?.message || 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn.');
    } catch (err) {
      setError(err?.message || 'Gửi yêu cầu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Quên mật khẩu</h2>
        {message && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border rounded mb-4"
          />
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded">
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
