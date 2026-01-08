// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, loading, user, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);
  const [forgotError, setForgotError] = useState(null);

  // Nếu người dùng đã đăng nhập, chuyển hướng đi
  if (user) {
    navigate('/products', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenForgot = () => {
    setForgotEmail('');
    setForgotMessage(null);
    setForgotError(null);
    setShowForgot(true);
  };

  const handleSendForgot = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Vui lòng nhập email hợp lệ.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await requestPasswordReset(forgotEmail);
      setForgotMessage(res?.message || 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.');
    } catch (err) {
      setForgotError(err?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Tên của bạn"
                required={!isLoginView}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="user@tbvtv.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold 
              ${loading ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}
            `}
          >
            {loading ? 'Đang xử lý...' : isLoginView ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-4 flex justify-between items-center text-sm">
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-green-600 hover:text-green-800 font-medium"
            disabled={loading}
          >
            {isLoginView ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>

          {isLoginView && (
            <button
              onClick={handleOpenForgot}
              className="text-gray-600 hover:text-gray-800 underline"
              disabled={loading}
            >
              Quên mật khẩu?
            </button>
          )}
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Quên mật khẩu</h3>

            {forgotMessage && (
              <div className="mb-3 p-3 bg-green-50 text-green-800 rounded">
                {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div className="mb-3 p-3 bg-red-50 text-red-800 rounded">
                {forgotError}
              </div>
            )}

            {!forgotMessage && (
              <form onSubmit={handleSendForgot} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhập email của bạn</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                    disabled={forgotLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            )}

            {forgotMessage && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
