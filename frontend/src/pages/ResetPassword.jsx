// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { token: rawToken } = useParams();
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const navigate = useNavigate();
  const { resetPassword, saveToken } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Nếu token không tồn tại, hiển thị lỗi thay vì redirect ngay
  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu lại email đặt lại mật khẩu.');
      setChecking(false);
      return;
    }
    setChecking(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu lại email đặt lại mật khẩu.');
      return;
    }

    setLoading(true);
    try {
  
      const res = await resetPassword(token, password);
      saveToken(null);
      localStorage.removeItem('user_data');

      setMessage(res?.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {

      setError(err?.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Đặt lại mật khẩu</h2>

        {checking && <div className="mb-4 p-3">Đang kiểm tra token...</div>}

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
            {message}
            <div className="mt-3">
              <button onClick={() => navigate('/login')} className="px-4 py-2 bg-green-600 text-white rounded">
                Đến trang đăng nhập
              </button>
            </div>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">{error}</div>}

        {!message && !checking && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full px-4 py-3 border rounded mb-3"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className="w-full px-4 py-3 border rounded mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
