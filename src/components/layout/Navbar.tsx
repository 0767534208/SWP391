import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
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
    setUser(null);
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 2 }} />
          <span className="logo-text" style={{ marginLeft: 8 }}>Trung Tâm Sức Khỏe</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-items" style={{ display: 'flex', alignItems: 'center', gap: '3rem', margin: 0 }}>
              <li><Link to="/" className="nav-link">Trang chủ</Link></li>
              <li><Link to="/services" className="nav-link">Dịch vụ</Link></li>
              <li><Link to="/cycletracker" className="nav-link">Theo dõi chu kỳ</Link></li>
              <li><Link to="/blogUser" className="nav-link">Bài viết</Link></li>
              <li><Link to="/qna" className="nav-link">Hỏi đáp</Link></li>
              <li><Link to="/contact" className="nav-link">Liên hệ</Link></li>
            </ul>
            <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user ? (
                <div className="user-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                  <span className="user-name" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaUserCircle style={{ fontSize: 22, marginRight: 4 }} />
                    {user.name || user.email}
                    <FaChevronDown style={{ fontSize: 16, marginLeft: 4 }} />
                  </span>
                  {dropdownOpen && (
                    <div className="dropdown-menu" style={{ position: 'absolute', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 4, minWidth: 140, zIndex: 100 }}>
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Xem hồ sơ</Link>
                      {localStorage.getItem('userRole') === 'consultant' && (
                        <>
                          <Link to="/consultant/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Hồ sơ tư vấn viên</Link>
                          <Link to="/consultant/test-results" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Quản lý kết quả</Link>
                        </>
                      )}
                      {localStorage.getItem('userRole') === 'admin' && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}>Quản lý hệ thống</Link>
                      )}
                      <div className="dropdown-item" onClick={handleLogout} style={{ display: 'block', padding: '8px 16px', color: '#e53e3e', cursor: 'pointer' }}>Đăng xuất</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons" style={{ display: 'flex', gap: '1rem' }}>
                  <Link to="/auth/login" className="auth-button login">Đăng nhập</Link>
                  <Link to="/auth/register" className="auth-button register">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;