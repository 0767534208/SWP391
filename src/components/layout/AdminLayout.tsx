import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './AdminLayout.css';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    if (userRole !== 'admin') {
      // Xóa thông tin đăng nhập nếu không có quyền
      authService.clearAuthData();
      window.dispatchEvent(new Event('login-state-changed'));
      navigate(ROUTES.AUTH.LOGIN);
    }
  }, [navigate]);

  // Check current path to highlight active menu item
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  return (
    <div className="admin-layout bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar-fixed bg-indigo-900 text-white shadow-lg">
        <div className="admin-sidebar-header flex items-center justify-center h-12 px-2 border-b border-indigo-800">
          <span className="admin-sidebar-title text-xs font-bold tracking-wide">Quản trị hệ thống</span>
        </div>
        
        <nav className="admin-nav py-2">
          <div className="admin-nav-container px-2 space-y-1">
            <Link to="/admin" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/appointments') && !isActive('/admin/consultants') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Trang chủ</span>
            </Link>
            
            <Link to="/admin/users" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Quản lý người dùng</span>
            </Link>

            <Link to="/admin/appointments" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/appointments') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Quản lý lịch hẹn</span>
            </Link>

            <Link to="/admin/consultants" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/consultants') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Quản lý tư vấn viên</span>
            </Link>
          </div>
        </nav>

        <div className="admin-sidebar-footer mt-auto px-2 py-2 border-t border-indigo-800">
          <Link 
            to="/auth/login" 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="admin-nav-link flex items-center px-2 py-1.5 rounded-lg text-indigo-100 hover:bg-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="admin-nav-text text-xs font-medium">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-fixed">
        <header className="admin-header-fixed">
            <div className="flex items-center space-x-3">
              <div className="relative">
              </div>
          </div>
        </header>
        <div className="admin-content">
          <div className="admin-content-container p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;