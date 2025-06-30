import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './ConsultantLayout.css';

const ConsultantLayout = () => {
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
    <div className="consultant-layout bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="consultant-sidebar-fixed bg-indigo-900 text-white shadow-lg">
        <div className="consultant-sidebar-header flex items-center justify-center h-12 px-2 border-b border-indigo-800">
          <span className="consultant-sidebar-title text-xs font-bold tracking-wide">Bác sĩ tư vấn</span>
        </div>
        
        <nav className="consultant-nav py-2">
          <div className="consultant-nav-container px-2 space-y-1">
            <Link to="/consultant/dashboard" className={`consultant-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/consultant/dashboard') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="consultant-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="consultant-nav-text text-xs font-medium">Trang chủ</span>
            </Link>
            
            <Link to="/consultant/profile" className={`consultant-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/consultant/profile') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="consultant-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="consultant-nav-text text-xs font-medium">Hồ sơ</span>
            </Link>
            
            <Link to="/consultant/appointments" className={`consultant-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/consultant/appointments') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="consultant-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="consultant-nav-text text-xs font-medium">Cuộc hẹn</span>
            </Link>

            <Link to="/consultant/test-results" className={`consultant-nav-link flex items-center px-2 py-1.5 rounded-lg transition-colors ${isActive('/consultant/test-results') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="consultant-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="consultant-nav-text text-xs font-medium">Kết quả xét nghiệm</span>
            </Link>
          </div>
        </nav>

        <div className="consultant-sidebar-footer mt-auto px-2 py-2 border-t border-indigo-800">
          <Link 
            to="/auth/login" 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="consultant-nav-link flex items-center px-2 py-1.5 rounded-lg text-indigo-100 hover:bg-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="consultant-sidebar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="consultant-nav-text text-xs font-medium">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="consultant-main-fixed">
        <header className="consultant-header-fixed">
            <div className="flex items-center space-x-3">
              <div className="relative">
              </div>
          </div>
        </header>
        <div className="consultant-content">
          <div className="consultant-content-container p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultantLayout; 