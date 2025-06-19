import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './StaffLayout.css';

const StaffLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="staff-layout bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="staff-sidebar-fixed bg-indigo-900 text-white shadow-lg">
        <div className="staff-sidebar-header flex items-center justify-center h-12 px-2 border-b border-indigo-800">
          <span className="staff-sidebar-title text-xs font-bold tracking-wide">Nhân viên y tế</span>
        </div>
        
        <nav className="staff-nav py-2">
          <div className="staff-nav-container px-2 space-y-1">
            <Link to="/staff" className={`staff-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/staff') && !isActive('/staff/appointments') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="staff-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="staff-nav-text text-xs font-medium">Tổng quan</span>
            </Link>
            
            <Link to="/staff/appointments" className={`staff-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/staff/appointments') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="staff-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="staff-nav-text text-xs font-medium">Quản lý lịch hẹn</span>
            </Link>
          </div>
        </nav>

        <div className="staff-sidebar-footer mt-auto px-2 py-2 border-t border-indigo-800">
          <Link 
            to="/auth/login" 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="staff-nav-link flex items-center px-2 py-1.5 rounded-lg text-indigo-100 hover:bg-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="staff-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="staff-nav-text text-xs font-medium">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="staff-main-fixed">
        <header className="staff-header-fixed">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="staff-user-info">
                <span className="staff-user-name">Nhân viên y tế</span>
              </div>
            </div>
          </div>
        </header>
        <div className="staff-content">
          <div className="staff-content-container p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout; 