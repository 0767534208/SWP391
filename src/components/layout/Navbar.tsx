import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

interface UserData {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

const Navbar: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const servicesDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm để cập nhật thông tin người dùng từ localStorage
  const updateUserInfo = () => {
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
  };

  // Cập nhật thông tin người dùng khi component mount
  useEffect(() => {
    updateUserInfo();
  }, []);

  // Cập nhật thông tin người dùng khi route thay đổi
  useEffect(() => {
    updateUserInfo();
  }, [location]);

  // Cập nhật thông tin người dùng khi localStorage thay đổi
  useEffect(() => {
    // Hàm xử lý sự kiện storage
    const handleStorageChange = () => {
      updateUserInfo();
    };

    // Đăng ký sự kiện lắng nghe thay đổi localStorage
    window.addEventListener('storage', handleStorageChange);

    // Tạo một custom event listener để cập nhật navbar từ các component khác
    window.addEventListener('login-state-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login-state-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');
    localStorage.removeItem('AccountID');
    localStorage.removeItem('consultantProfile');
    navigate('/login');
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