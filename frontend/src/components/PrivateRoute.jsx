// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element: Element, adminOnly = false }) => {
    const { user, loading, isAdmin } = useAuth();

    // 1. Loading state (Checking authentication status)
    if (loading) {
        return <div className="text-center p-10 text-xl text-blue-500">Đang kiểm tra quyền truy cập...</div>;
    }

    // 2. Not logged in: Redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Logged in but not admin: Show forbidden message if adminOnly is true
    if (adminOnly && !isAdmin) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-center p-10 bg-red-100 rounded-xl shadow-lg border border-red-200">
                    <h2 className="text-3xl font-bold text-red-700 mb-4">403 - Cấm truy cập</h2>
                    <p className="text-lg text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
                    {/* Optionally navigate back or home */}
                    <Navigate to="/" replace /> 
                </div>
            </div>
        );
    }

    // 4. Logged in and authorized: Render the requested component
    return <Element />;
};

export default PrivateRoute;