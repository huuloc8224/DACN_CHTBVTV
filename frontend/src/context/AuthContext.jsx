// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user_data');

      if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
          } else {
            setUser(null);
            saveToken(null);
            localStorage.removeItem('user_data');
          }
        } catch (err) {
          console.warn('Could not refresh user:', err?.response?.data || err?.message || err);
          setUser(null);
          saveToken(null);
          localStorage.removeItem('user_data');
        }
      }

      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAxiosError = (err, fallbackMessage) => {
    // Extract meaningful message from axios error
    const serverMessage = err?.response?.data?.message;
    const status = err?.response?.status;
    console.error('API error', { status, serverMessage, err });
    return serverMessage || fallbackMessage || 'Có lỗi xảy ra.';
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      // Expect server to return { success, user, token }
      const token = res?.data?.token;
      const userFromServer = res?.data?.user || null;

      if (!token) throw new Error('Không nhận được token từ server.');

      saveToken(token);

      if (userFromServer) {
        setUser(userFromServer);
        localStorage.setItem('user_data', JSON.stringify(userFromServer));
      } else {
        // fallback: fetch /auth/me
        const me = await api.get('/auth/me');
        setUser(me.data.user);
        localStorage.setItem('user_data', JSON.stringify(me.data.user));
      }

      navigate('/products');
      return { success: true };
    } catch (err) {
      const message = handleAxiosError(err, 'Đăng nhập thất bại.');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res?.data?.token;
      const userFromServer = res?.data?.user || null;

      if (!token) throw new Error('Không nhận được token từ server.');

      saveToken(token);

      if (userFromServer) {
        setUser(userFromServer);
        localStorage.setItem('user_data', JSON.stringify(userFromServer));
      } else {
        const me = await api.get('/auth/me');
        setUser(me.data.user);
        localStorage.setItem('user_data', JSON.stringify(me.data.user));
      }

      navigate('/products');
      return { success: true };
    } catch (err) {
      const message = handleAxiosError(err, 'Đăng ký thất bại.');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    saveToken(null);
    localStorage.removeItem('user_data');
    setUser(null);
    navigate('/login');
  };

  const updateProfile = async (payload) => {
    if (!localStorage.getItem('token')) throw new Error('Unauthorized');

    const body = {};
    Object.keys(payload || {}).forEach((k) => {
      const v = payload[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') body[k] = v;
    });

    try {
      const res = await api.patch('/user/profile', body);
      if (res.status >= 200 && res.status < 300) {
        const data = res.data;
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user_data', JSON.stringify(data.user));
        } else {
          try {
            const me = await api.get('/auth/me');
            setUser(me.data.user);
            localStorage.setItem('user_data', JSON.stringify(me.data.user));
          } catch (e) {
            console.warn('Could not refresh user after update:', e?.response?.data || e?.message || e);
          }
        }
        return res.data;
      } else {
        const msg = res.data?.message || `Lỗi ${res.status}`;
        throw new Error(msg);
      }
    } catch (err) {
      const message = handleAxiosError(err, 'Cập nhật thất bại.');
      throw new Error(message);
    }
  };

  const requestPasswordReset = async (email) => {
    if (!email) throw new Error('Vui lòng nhập email.');
    try {
      const res = await api.post('/auth/forgot', { email });
      return res.data;
    } catch (err) {
      const message = handleAxiosError(err, 'Gửi yêu cầu thất bại.');
      throw new Error(message);
    }
  };

  const resetPassword = async (token, newPassword) => {
    if (!token) throw new Error('Token không hợp lệ.');
    if (!newPassword || newPassword.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    try {
      const res = await api.post(`/auth/reset/${token}`, { password: newPassword });
      return res.data;
    } catch (err) {
      const message = handleAxiosError(err, 'Đặt lại mật khẩu thất bại.');
      throw new Error(message);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        register,
        isAdmin,
        updateProfile,
        saveToken,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
