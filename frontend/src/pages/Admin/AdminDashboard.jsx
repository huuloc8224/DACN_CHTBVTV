// src/pages/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Truck,
  Users,
  AlertCircle
} from 'lucide-react';

// Import các trang con (đảm bảo các file này tồn tại)
import AdminStatsPage from './StatsPage';

import AdminProductsPage from './ProductsPage';

import AdminOrdersPage from './OrdersPage';

import AdminUsersPage from './UsersPage';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  // Chặn truy cập nếu không phải admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-2xl shadow-2xl">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600 text-lg">
            Bạn không có quyền truy cập trang quản trị.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'stats', label: 'Thống kê', icon: BarChart3 },
    { key: 'products', label: 'Sản phẩm', icon: Package },
    { key: 'orders', label: 'Đơn hàng', icon: Truck },
    { key: 'users', label: 'Khách hàng', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-10 flex items-center gap-4">
          <LayoutDashboard className="w-14 h-14 text-green-600" />
          Bảng Điều Khiển Quản Trị
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-3 px-10 py-6 text-lg font-semibold transition-all ${
                  activeTab === t.key
                    ? 'text-green-600 bg-green-50 border-b-4 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <t.icon className="w-6 h-6" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Nội dung theo tab */}
          <div className="p-8">
            {activeTab === 'stats' && <AdminStatsPage />}
            {activeTab === 'products' && <AdminProductsPage />}
            {activeTab === 'orders' && <AdminOrdersPage />}
            {activeTab === 'users' && <AdminUsersPage />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
