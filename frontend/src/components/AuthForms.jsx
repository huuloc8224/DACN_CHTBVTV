// frontend/src/components/AuthForms.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthForms = ({ isLoginView, onSwitchView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register, loading, user } = useAuth();
    
    // Nếu đã đăng nhập, không hiển thị form
    if (user) return null;

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

    return (
        <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
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

            <div className="mt-6 text-center">
                <button
                    onClick={onSwitchView}
                    className="text-green-600 hover:text-green-800 font-medium ml-1"
                    disabled={loading}
                >
                    {isLoginView ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
            </div>
        </div>
    );
};

export default AuthForms;