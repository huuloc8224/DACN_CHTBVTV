// src/pages/Admin/UsersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Users, Loader2 as Loader } from 'lucide-react';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date.getTime()) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

const UsersPage = () => {
  const [loading, setLoading] = useState(true); 
  const [users, setUsers] = useState([]); 
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/users');
      
      // ĐẢM BẢO users luôn là array
      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data && Array.isArray(res.data.users)) {
        usersData = res.data.users;
      } else if (res.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      setUsers(usersData);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-green-700 mb-8 flex items-center gap-4">
          <Users className="w-12 h-12 text-green-600" />
          Quản lý người dùng
          <span className="text-2xl text-gray-600">({users.length} tài khoản)</span>
        </h2>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader className="w-16 h-16 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600 text-lg">Đang tải danh sách người dùng...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-red-600 text-xl font-medium mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Thử lại
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-600 text-xl">Chưa có người dùng nào trong hệ thống.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="text-left p-6 font-bold">ID</th>
                    <th className="text-left p-6 font-bold">Họ và tên</th>
                    <th className="text-left p-6 font-bold">Email</th>
                    <th className="text-center p-6 font-bold">Vai trò</th>
                    <th className="text-left p-6 font-bold">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-green-50 transition">
                      <td className="p-6 font-mono text-sm text-gray-600">
                        {u._id.slice(-8)}
                      </td>
                      <td className="p-6 font-semibold text-gray-800">
                        {u.name || 'Chưa đặt tên'}
                      </td>
                      <td className="p-6 text-gray-700">{u.email}</td>
                      <td className="p-6 text-center">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;