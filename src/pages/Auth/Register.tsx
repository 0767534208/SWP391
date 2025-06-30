import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Họ và tên không được để trống';
        if (value.length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
        return '';
      case 'username':
        if (!value.trim()) return 'Tên đăng nhập không được để trống';
        if (value.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
        if (/\s/.test(value)) return 'Tên đăng nhập không được chứa khoảng trắng';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Tên đăng nhập chỉ được chứa chữ cái không dấu, số và dấu gạch dưới';
        return '';
      case 'email':
        if (!value.trim()) return 'Email không được để trống';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
        return '';
      case 'password':
        if (!value) return 'Mật khẩu không được để trống';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, formData[field])
    }));
  };

  const isFormValid = () => {
    return !Object.values(errors).some(error => error) && 
           Object.keys(formData).every(key => formData[key as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    
    setErrors(newErrors);
    
    // Mark all fields as touched
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true
    });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API to register the user
      const response = await authAPI.register({
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data && response.data.success) {
        // Store registration data and proceed to OTP verification
        localStorage.setItem('pendingRegistration', JSON.stringify({
          email: formData.email,
          username: formData.username,
          name: formData.fullName
        }));
        navigate('/auth/verify-otp');
      } else {
        setError('Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
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
          {error && <div className="login-error">{error}</div>}
          
          <div className="register-form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={`register-input ${touched.fullName && errors.fullName ? 'input-error' : ''}`}
              placeholder="Nhập họ và tên của bạn"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              required
              disabled={isLoading}
            />
            {touched.fullName && errors.fullName && (
              <div className="field-error">{errors.fullName}</div>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`register-input ${touched.username && errors.username ? 'input-error' : ''}`}
              placeholder="Nhập tên đăng nhập của bạn"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => handleBlur('username')}
              required
              disabled={isLoading}
            />
            {touched.username && errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`register-input ${touched.email && errors.email ? 'input-error' : ''}`}
              placeholder="Nhập địa chỉ email của bạn"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              disabled={isLoading}
            />
            {touched.email && errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`register-input ${touched.password && errors.password ? 'input-error' : ''}`}
              placeholder="Tạo mật khẩu"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
              disabled={isLoading}
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="register-submit" 
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
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