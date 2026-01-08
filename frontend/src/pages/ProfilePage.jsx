import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Loader
} from 'lucide-react';

/* ================= COMPONENT INPUT ================= */
const InputField = ({ icon, label, ...props }) => (
  <div>
    <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
      <span className="text-green-600">{icon}</span>
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-green-500
      disabled:bg-gray-50 transition"
    />
  </div>
);

/* ================= MAIN PAGE ================= */
const ProfilePage = () => {
  const { user, updateProfile, requestPasswordReset } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  /* ===== Change password ===== */
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(null);

  /* ================= INIT DATA ================= */
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      birthDate: user.birthDate
        ? new Date(user.birthDate).toISOString().slice(0, 10)
        : ''
    });
  }, [user]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccessMsg('Cập nhật thông tin thành công!');
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      birthDate: user.birthDate
        ? new Date(user.birthDate).toISOString().slice(0, 10)
        : ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setGlobalLoading(true);
    try {
      const res = await requestPasswordReset(user.email);
      setSuccessMsg(
        res?.message ||
          'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.'
      );
    } catch {
      setError('Gửi email thất bại.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPwd || !newPwd || !confirmPwd)
      return setPwdError('Vui lòng nhập đầy đủ thông tin.');
    if (newPwd.length < 6)
      return setPwdError('Mật khẩu mới tối thiểu 6 ký tự.');
    if (newPwd !== confirmPwd)
      return setPwdError('Mật khẩu xác nhận không khớp.');

    setPwdLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: currentPwd,
        newPassword: newPwd
      });
      setPwdSuccess(res?.data?.message || 'Đổi mật khẩu thành công.');
      setTimeout(() => setShowChangePwd(false), 1500);
    } catch {
      setPwdError('Đổi mật khẩu thất bại.');
    } finally {
      setPwdLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 h-40 relative">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={60} className="text-gray-400" />
                </div>
              </div>

            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              {user?.name || 'Người dùng'}
            </h2>
            <p className="text-sm text-gray-500">
              Tham gia từ{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="pt-24 pb-10 px-8">

          {/* STATUS */}
          {globalLoading && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded flex gap-2">
              <Loader className="animate-spin" size={18} /> Đang xử lý...
            </div>
          )}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{successMsg}</div>}

          {/* INFO */}
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Thông tin cá nhân
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              icon={<User size={18} />}
              label="Họ và tên"
              name="name"
              value={formData.name}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              icon={<Mail size={18} />}
              label="Email"
              name="email"
              value={formData.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              icon={<Phone size={18} />}
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              icon={<Calendar size={18} />}
              label="Ngày sinh"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl flex gap-2"
                >
                  {saving ? <Loader className="animate-spin" /> : <Save />}
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 px-8 py-3 rounded-xl"
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                >
                  Chỉnh sửa thông tin
                </button>
                <button
                  onClick={handleSendResetEmail}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl"
                >
                  Gửi email đặt lại mật khẩu
                </button>
                <button
                  onClick={() => setShowChangePwd(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
                >
                  Đổi mật khẩu
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL CHANGE PASSWORD ===== */}
      {showChangePwd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>

            {pwdError && <div className="mb-2 p-2 bg-red-50 text-red-700 rounded">{pwdError}</div>}
            {pwdSuccess && <div className="mb-2 p-2 bg-green-50 text-green-700 rounded">{pwdSuccess}</div>}

            <div className="space-y-3">
              <input type="password" placeholder="Mật khẩu hiện tại" value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)} className="w-full px-4 py-2 border rounded" />
              <input type="password" placeholder="Mật khẩu mới" value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)} className="w-full px-4 py-2 border rounded" />
              <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowChangePwd(false)} className="px-4 py-2 bg-gray-200 rounded">
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwdLoading}
                className="px-4 py-2 bg-green-600 text-white rounded flex gap-2"
              >
                {pwdLoading ? <Loader className="animate-spin" size={18} /> : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
