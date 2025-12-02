// src/pages/Admin/UsersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Users, Loader2 as Loader } from 'lucide-react';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return isNaN(date) ? 'Lỗi ngày' : date.toLocaleDateString('vi-VN');
};

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Users className="w-10 h-10 text-green-600" />
        Danh sách khách hàng ({users.length})
      </h2>

      <div className="overflow-x-auto rounded-xl shadow-lg border">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Tên</th>
                <th className="text-left p-4">Email</th>
                <th className="text-center p-4">Vai trò</th>
                <th className="text-left p-4">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">{u._id.slice(-6)}</td>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
