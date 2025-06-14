import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate if email matches confirmEmail
    if (formData.email !== formData.confirmEmail) {
      alert('Email và xác nhận email không khớp!');
      return;
    }
    // Store registration data and proceed to OTP verification
    localStorage.setItem('pendingRegistration', JSON.stringify(formData));
    navigate('/auth/verify-otp');
  };

  return (
    <div className="register-page" style={{
      backgroundImage: 'url("/png.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="register-container">
        <div className="register-header">
          <h2>Tạo tài khoản</h2>
          <p>Hãy tham gia với chúng tôi</p>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="register-input"
              placeholder="Nhập họ và tên của bạn"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="register-input"
              placeholder="Nhập địa chỉ email của bạn"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmEmail">Xác nhận email</label>
            <input
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              className="register-input"
              placeholder="Xác nhận địa chỉ email của bạn"
              value={formData.confirmEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              className="register-input"
              placeholder="Tạo mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-submit">
            Tiếp tục
          </button>
        </form>

        <div className="register-footer">
          <p>
            Bạn đã có tài khoản?{' '}
            <Link to="/auth/login" className="register-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;