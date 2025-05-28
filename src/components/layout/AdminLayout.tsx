import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../../assets/admin.css';
import '../../layouts/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  // Check current path to highlight active menu item
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar-fixed bg-indigo-900 text-white shadow-lg">
        <div className="admin-sidebar-header flex items-center justify-center h-12 px-2 border-b border-indigo-800">
          <span className="admin-sidebar-title text-xs font-bold tracking-wide">HSSC Admin</span>
        </div>
        
        <nav className="admin-nav py-2">
          <div className="admin-nav-container px-2 space-y-1">
            <Link to="/admin" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/appointments') && !isActive('/admin/tests') && !isActive('/admin/consultants') && !isActive('/admin/blog') && !isActive('/admin/reports') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Dashboard</span>
            </Link>
            
            <Link to="/admin/users" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Users</span>
            </Link>

            <Link to="/admin/appointments" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/appointments') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Appointments</span>
            </Link>

            <Link to="/admin/tests" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/tests') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm.293 7.707a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                <path d="M10 4a1 1 0 00-1 1v6a1 1 0 002 0V5a1 1 0 00-1-1z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Test Results</span>
            </Link>

            <Link to="/admin/consultants" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/consultants') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Specialists</span>
            </Link>

            <Link to="/admin/blog" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/blog') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Blog</span>
            </Link>

            <Link to="/admin/reports" className={`admin-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/admin/reports') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="admin-nav-text text-xs font-medium">Reports</span>
            </Link>
          </div>
        </nav>

        <div className="admin-sidebar-footer mt-auto px-2 py-2 border-t border-indigo-800">
          <Link to="/" className="admin-nav-link flex items-center px-2 py-1.5 rounded-lg text-indigo-100 hover:bg-indigo-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="admin-nav-text text-xs font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-fixed">
        <header className="admin-header-fixed">
          <div className="admin-header-container h-full flex justify-between items-center px-4">
            <h1 className="admin-header-title text-sm font-semibold text-gray-800">HSSC Admin</h1>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon-sm text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-5 h-5 bg-indigo-700 rounded-full flex items-center justify-center text-white font-medium mr-2 text-xs">                  Admin
                </div>
              </div>
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