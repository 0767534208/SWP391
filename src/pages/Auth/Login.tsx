import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Here we're simulating authentication logic
    // In a real app, you would make an API call to your backend
    if (email === 'admin@example.com' && password === 'admin123') {
      // Admin login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        role: 'admin',
        name: 'Quản trị viên'
      }));
      navigate('/admin'); // Redirect to admin dashboard
    } else if (email === 'consultant@example.com' && password === 'consultant123') {
      // Consultant login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'consultant');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        role: 'consultant',
        name: 'BS. Nguyễn Văn A',
        title: 'Chuyên gia sức khỏe sinh sản',
        phone: '(+84) 901-234-567',
      }));
      navigate('/consultant/profile'); // Redirect to consultant profile
    } else if (email === 'user@example.com' && password === 'user123') {
      // User login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        role: 'user',
        name: 'Nguyễn Văn B',
        phone: '0123 456 789',
        dob: '01/01/2000',
        address: 'Hà Nội'
      }));
      navigate('/'); // Redirect to home page
      window.location.reload();
    } 
    else if (email && password) {
      // Regular user login - simple validation for demo
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('user', JSON.stringify({ email, role: 'user' }));
      navigate('/'); // Redirect to home page
    } else {
      setError('Thông tin đăng nhập không hợp lệ');
    }
  };

  return (
    <div className="login-page" style={{
      backgroundImage: 'url("/istockphoto.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="login-container">
        <div className="login-header">
          <h2>Đăng nhập</h2>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="login-form-group">
            <label htmlFor="login-email">Email</label>
            <input 
              id="login-email"
              type="email" 
              className="login-input"
              placeholder="Nhập email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <input 
              id="login-password"
              type="password" 
              className="login-input"
              placeholder="Nhập mật khẩu của bạn" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="login-forgot">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="login-submit">
            Đăng nhập
          </button>

          <div className="login-footer">
            <p>
              Bạn chưa có tài khoản?{' '}
              <Link to="/auth/register" className="login-link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="login-note">
        <p>
          Sử dụng các tài khoản sau để đăng nhập:
        </p>
        <ul className="login-accounts">
          <li><strong>Quản trị viên:</strong> admin@example.com / admin123</li>
          <li><strong>Tư vấn viên:</strong> consultant@example.com / consultant123</li>
          <li><strong>Người dùng:</strong> user@example.com / user123</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;