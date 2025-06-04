import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const location = useLocation();

  // Check current path to highlight active menu item
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="manager-layout bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="manager-sidebar-fixed bg-indigo-900 text-white shadow-lg">
        <div className="manager-sidebar-header flex items-center justify-center h-12 px-2 border-b border-indigo-800">
          <span className="manager-sidebar-title text-xs font-bold tracking-wide">Quản lý hệ thống</span>
        </div>
        
        <nav className="manager-nav py-2">
          <div className="manager-nav-container px-2 space-y-1">
            <Link to="/manager" className={`manager-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/manager') && !isActive('/manager/services') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="manager-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="manager-nav-text text-xs font-medium">Trang chủ</span>
            </Link>
            
            <Link to="/manager/services" className={`manager-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/manager/services') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="manager-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="manager-nav-text text-xs font-medium">Quản lý dịch vụ</span>
            </Link>
          </div>
        </nav>

        <div className="manager-sidebar-footer mt-auto px-2 py-2 border-t border-indigo-800">
          <Link to="/" className="manager-nav-link flex items-center px-2 py-1.5 rounded-lg text-indigo-100 hover:bg-indigo-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="manager-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="manager-nav-text text-xs font-medium">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="manager-main-fixed">
        <header className="manager-header-fixed">
            <div className="flex items-center space-x-3">
              <div className="relative">
              </div>
          </div>
        </header>
        <div className="manager-content">
          <div className="manager-content-container p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout; 