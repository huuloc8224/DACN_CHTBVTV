import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, PlusCircle, Edit2, Trash2,
  Image, Tag, Database, Loader2 as Loader
} from 'lucide-react';
import api from '../../services/api';

const CATEGORY_OPTIONS = [
  { value: 'thuoc', label: 'Thuốc BVTV' },
  { value: 'phan', label: 'Phân Bón' },
  { value: 'thucan', label: 'Thức Ăn Chăn Nuôi' }
];

const formatCurrency = (v) =>
  `${Number(v || 0).toLocaleString('vi-VN')}₫`;

const getCategoryName = (code) =>
  CATEGORY_OPTIONS.find(c => c.value === code)?.label || code;

const ProductsPage = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    active_ingredient: '',
    category: 'thuoc',
    treats: '',
    imageFile: null
  });

  const [previewImg, setPreviewImg] = useState('');

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(p => ({ ...p, imageFile: reader.result }));
      setPreviewImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      active_ingredient: '',
      category: 'thuoc',
      treats: '',
      imageFile: null
    });
    setPreviewImg('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && !formData.imageFile) {
      showToast('error', 'Vui lòng chọn hình ảnh');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      stock_quantity: Number(formData.stock_quantity) || 0,
      treats: formData.treats
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean),
      imageData: formData.imageFile
    };

    try {
      if (isEditing) {
        await api.put(`/products/${editingId}`, payload);
        showToast('success', 'Cập nhật sản phẩm thành công');
      } else {
        await api.post('/products', payload);
        showToast('success', 'Thêm sản phẩm mới thành công');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const startEdit = (p) => {
    setIsEditing(true);
    setEditingId(p._id);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock_quantity: p.stock_quantity,
      active_ingredient: p.active_ingredient || '',
      category: p.category,
      treats: (p.treats || []).join(', '),
      imageFile: null
    });
    setPreviewImg(p.image_url ? `http://localhost:3001${p.image_url}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!confirm('Xóa sản phẩm này vĩnh viễn?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('success', 'Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      showToast('error', 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="space-y-12">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 rounded-xl">
          <Package className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold">
          {isEditing ? 'Chỉnh sửa sản phẩm' : 'Quản lý sản phẩm'}
        </h1>
      </div>

      {/* ===== FORM ===== */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Phân loại</label>
            <select
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-green-500"
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Tên sản phẩm</label>
            <input
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-green-500"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Hoạt chất</label>
            <input
              className="w-full rounded-xl border px-4 py-3"
              value={formData.active_ingredient}
              onChange={e => setFormData(p => ({ ...p, active_ingredient: e.target.value }))}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold flex items-center gap-2">
              <Image className="w-4 h-4" /> Hình ảnh
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold flex items-center gap-2">
            <Tag className="w-4 h-4" /> Bệnh đặc trị
          </label>
          <input
            placeholder="đạo ôn, thán thư, cháy lá"
            className="w-full rounded-xl border px-4 py-3"
            value={formData.treats}
            onChange={e => setFormData(p => ({ ...p, treats: e.target.value }))}
          />
        </div>

        <div className="grid md:grid-cols-4 gap-6 items-center">
          <input
            className="rounded-xl border px-4 py-3"
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
          />
          <input
            className="rounded-xl border px-4 py-3"
            type="number"
            placeholder="Tồn kho"
            value={formData.stock_quantity}
            onChange={e => setFormData(p => ({ ...p, stock_quantity: e.target.value }))}
          />

          <div className="md:col-span-2">
            {previewImg ? (
              <img src={previewImg} className="w-32 h-32 object-cover rounded-xl border" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Mô tả chi tiết"
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
        />

        <div className="flex gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <PlusCircle /> {isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-8 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 font-bold flex items-center gap-2">
          <Database /> Danh sách sản phẩm ({products.length})
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Tên</th>
                <th className="p-4">Loại</th>
                <th className="p-4">Bệnh trị</th>
                <th className="p-4 text-right">Giá</th>
                <th className="p-4 text-center">Sửa</th>
                <th className="p-4 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-center">{getCategoryName(p.category)}</td>
                  <td className="p-4 text-xs text-gray-600">{(p.treats || []).join(', ')}</td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(p.price)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast.show && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl text-white font-bold shadow-xl
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
