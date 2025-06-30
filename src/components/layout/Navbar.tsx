import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
    
    if (role) {
      setUserRole(role.toLowerCase());
    } else {
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !(servicesDropdownRef.current as any).contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    }
    if (dropdownOpen || servicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, servicesDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setUserRole(null);
    navigate('/auth/login');
  };

  const handleNavigation = (path: string) => {
    // Force reload when navigating
    window.location.href = path;
  };

  // Check if user should be redirected to their role-specific dashboard
  const handleDashboardNavigation = () => {
    if (userRole) {
      switch (userRole) {
        case 'admin':
          handleNavigation('/admin');
          break;
        case 'manager':
          handleNavigation('/manager');
          break;
        case 'staff':
          handleNavigation('/staff');
          break;
        case 'consultant':
          handleNavigation('/consultant/profile');
          break;
        default:
          handleNavigation('/');
          break;
      }
    } else {
      handleNavigation('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={handleDashboardNavigation}>
          <img src="/logo.png" alt="logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 2 }} />
          <span className="logo-text" style={{ marginLeft: 8 }}>Trung Tâm Sức Khỏe</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-items" style={{ display: 'flex', alignItems: 'center', gap: '3rem', margin: 0 }}>
              {/* Show appropriate navigation based on user role */}
              {userRole === 'admin' ? (
                <li><span className="nav-link" onClick={() => handleNavigation('/admin')}>Trang quản trị</span></li>
              ) : userRole === 'manager' ? (
                <li><span className="nav-link" onClick={() => handleNavigation('/manager')}>Trang quản lý</span></li>
              ) : userRole === 'staff' ? (
                <li><span className="nav-link" onClick={() => handleNavigation('/staff')}>Trang nhân viên</span></li>
              ) : userRole === 'consultant' ? (
                <li><span className="nav-link" onClick={() => handleNavigation('/consultant/profile')}>Trang tư vấn viên</span></li>
              ) : (
                <>
                  <li><span className="nav-link" onClick={() => handleNavigation('/')}>Trang chủ</span></li>
                  <li><span className="nav-link" onClick={() => handleNavigation('/services')}>Dịch vụ</span></li>
                  <li><span className="nav-link" onClick={() => handleNavigation('/cycletracker')}>Theo dõi chu kỳ</span></li>
                  <li><span className="nav-link" onClick={() => handleNavigation('/blogUser')}>Bài viết</span></li>
                  <li><span className="nav-link" onClick={() => handleNavigation('/qna')}>Hỏi đáp</span></li>
                  <li><span className="nav-link" onClick={() => handleNavigation('/contact')}>Liên hệ</span></li>
                </>
              )}
            </ul>
            
            {user ? (
              <div className="user-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                <span className="user-name" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaUserCircle style={{ fontSize: 22, marginRight: 4 }} />
                  {user.name || user.email}
                  <FaChevronDown style={{ fontSize: 16, marginLeft: 4 }} />
                </span>
                {dropdownOpen && (
                  <div className="dropdown-menu" style={{ position: 'absolute', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 4, minWidth: 140, zIndex: 100 }}>
                    <span className="dropdown-item" onClick={() => handleNavigation('/profile')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Xem hồ sơ</span>
                    {userRole === 'admin' && (
                      <span className="dropdown-item" onClick={() => handleNavigation('/admin')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Trang quản trị</span>
                    )}
                    {userRole === 'manager' && (
                      <span className="dropdown-item" onClick={() => handleNavigation('/manager')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Trang quản lý</span>
                    )}
                    {userRole === 'staff' && (
                      <span className="dropdown-item" onClick={() => handleNavigation('/staff')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Trang nhân viên</span>
                    )}
                    {userRole === 'consultant' && (
                      <>
                        <span className="dropdown-item" onClick={() => handleNavigation('/consultant/profile')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Hồ sơ tư vấn viên</span>
                        <span className="dropdown-item" onClick={() => handleNavigation('/consultant/test-results')} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Quản lý kết quả</span>
                      </>
                    )}
                    <div className="dropdown-item" onClick={handleLogout} style={{ display: 'block', padding: '8px 16px', color: '#e53e3e', cursor: 'pointer' }}>Đăng xuất</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons" style={{ display: 'flex', gap: '1rem' }}>
                <span className="auth-button login" onClick={() => handleNavigation('/auth/login')}>Đăng nhập</span>
                <span className="auth-button register" onClick={() => handleNavigation('/auth/register')}>Đăng ký</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;