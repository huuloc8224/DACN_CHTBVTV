// src/pages/Admin/StatsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { ListOrdered, Package, UserCheck, Loader2 as Loader } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import api from '../../services/api';

const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;

const StatsPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [topCustomers, setTopCustomers] = useState([]);
  const [minSpend, setMinSpend] = useState(0);

  const [topProducts, setTopProducts] = useState([]);
  const [topLimit, setTopLimit] = useState(10);
  const [topBy, setTopBy] = useState('quantity');
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, customersRes] = await Promise.all([
        api.get('/orders/admin/stats/sales'),
        api.get('/orders/admin/stats/top-customers', { params: { minSpend } })
      ]);
      setStats(salesRes.data);
      setTopCustomers(customersRes.data);
    } catch (err) {
      console.error('Lỗi fetch stats', err);
    } finally {
      setLoading(false);
    }
  }, [minSpend]);

  const fetchTopProducts = useCallback(async () => {
    setLoadingTopProducts(true);
    try {
      const res = await api.get('/orders/admin/stats/top-products', { params: { limit: topLimit, by: topBy } });
      setTopProducts(res.data);
    } catch (err) {
      console.error('Lỗi fetch top products', err);
    } finally {
      setLoadingTopProducts(false);
    }
  }, [topLimit, topBy]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTopProducts(); }, [fetchTopProducts]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader className="w-16 h-16 animate-spin text-green-600 mb-4" />
        <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const monthlyRaw = stats?.monthlySales || [];
  const monthlyMap = {};
  monthlyRaw.forEach(m => {
    const monthKey = m.month ?? m._id ?? m.monthKey ?? '';
    const mm = String(monthKey).slice(5, 7);
    const idx = parseInt(mm, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= 12) {
      monthlyMap[idx] = (monthlyMap[idx] || 0) + (Number(m.totalRevenue ?? m.total ?? m.value) || 0);
    }
  });
  const monthNames = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const monthlyData = monthNames.map((label, i) => ({ month: label, revenue: monthlyMap[i+1] || 0 }));
  const totalRevenue = monthlyData.reduce((s, it) => s + (it.revenue || 0), 0);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: ListOrdered, color: 'from-blue-500 to-indigo-600' },
          { label: 'Sản phẩm', value: stats?.totalProducts || 0, icon: Package, color: 'from-purple-500 to-pink-600' },
          { label: 'Khách hàng', value: stats?.totalUsers || 0, icon: UserCheck, color: 'from-yellow-500 to-orange-600' }
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} text-white p-6 rounded-2xl shadow-xl`}>
            <card.icon className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-lg opacity-90">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border">
        <h3 className="text-2xl font-bold mb-6">Doanh thu theo tháng (năm nay)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${v / 1000000}Tr`} />
            <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')}₫`} />
            <Bar dataKey="revenue" fill="#10b981" radius={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Top sản phẩm bán chạy</h3>
          <div className="flex items-center gap-3">
            <select value={topBy} onChange={e => setTopBy(e.target.value)} className="px-3 py-2 border rounded">
              <option value="quantity">Theo số lượng</option>
              <option value="revenue">Theo doanh thu</option>
            </select>

            <select value={topLimit} onChange={e => setTopLimit(Math.max(1, Number(e.target.value)))} className="px-3 py-2 border rounded w-28">
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>

            <button onClick={fetchTopProducts} className="bg-green-600 text-white px-4 py-2 rounded">Lấy</button>
          </div>
        </div>

        <div className="space-y-4">
          {loadingTopProducts ? (
            <div className="text-center py-8"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
          ) : topProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có dữ liệu sản phẩm bán chạy</p>
          ) : (
            topProducts.map((p, idx) => (
              <div key={p.productId ?? idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img src={p.image_url || '/images/placeholder.jpg'} alt={p.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-500">Mã: {String(p.productId ?? '').slice(0,8) || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {topBy === 'revenue' ? formatCurrency(p.totalRevenue) : `${p.totalQty} sp`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {topBy === 'revenue' ? `${p.totalQty} sp` : formatCurrency(p.totalRevenue)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Top khách hàng thân thiết</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={minSpend}
              onChange={e => setMinSpend(+e.target.value)}
              className="px-4 py-3 border rounded-xl w-48"
              placeholder="Tối thiểu (VNĐ)"
            />
            <button onClick={fetchStats} className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
              Lọc
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {(topCustomers || []).length === 0 ? (
            <p className="text-center text-gray-500 py-12 text-lg">Không có khách hàng nào đạt ngưỡng</p>
          ) : (
            topCustomers.map((c, i) => (
              <div key={c.userId ?? i} className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{c.name}</p>
                    <p className="text-gray-600">{c.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(c.totalSpent)}</p>
                  <p className="text-sm text-gray-500">{c.orderCount} đơn hàng</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
