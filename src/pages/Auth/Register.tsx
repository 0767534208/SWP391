/**
 * Register Component
 * 
 * Component xử lý đăng ký người dùng mới và điều hướng đến xác thực OTP
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { ROUTES } from '../../config/constants';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    dateOfBirth: ''
  });
  
  // State quản lý lỗi validation
  const [errors, setErrors] = useState({
    username: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    dateOfBirth: ''
  });
  
  // State theo dõi các trường đã được tương tác
  const [touched, setTouched] = useState({
    username: false,
    name: false,
    email: false,
    address: false,
    phone: false,
    password: false,
    dateOfBirth: false
  });
  
  // State quản lý thông báo lỗi chung và trạng thái loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate từng trường trong form
   * @param field - Tên trường cần validate
   * @param value - Giá trị của trường
   * @returns Thông báo lỗi nếu có, chuỗi rỗng nếu hợp lệ
   */
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
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
      case 'address':
        if (!value.trim()) return 'Địa chỉ không được để trống';
        return '';
      case 'phone':
        if (!value.trim()) return 'Số điện thoại không được để trống';
        if (!/^\d+$/.test(value)) return 'Số điện thoại chỉ được chứa số';
        return '';
      case 'password':
        if (!value) return 'Mật khẩu không được để trống';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      case 'dateOfBirth':
        if (!value) return 'Ngày sinh không được để trống';
        return '';
      default:
        return '';
    }
  };

  /**
   * Xử lý thay đổi giá trị trong form
   */
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

  /**
   * Xử lý khi người dùng rời khỏi trường nhập liệu
   */
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

  /**
   * Kiểm tra form có hợp lệ không
   */
  const isFormValid = () => {
    return !Object.values(errors).some(error => error) && 
           Object.keys(formData).every(key => formData[key as keyof typeof formData]);
  };

  /**
   * Xử lý đăng ký
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate tất cả các trường
    const newErrors = {
      username: validateField('username', formData.username),
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      address: validateField('address', formData.address),
      phone: validateField('phone', formData.phone),
      password: validateField('password', formData.password),
      dateOfBirth: validateField('dateOfBirth', formData.dateOfBirth),
    };
    
    setErrors(newErrors);
    
    // Đánh dấu tất cả các trường đã được tương tác
    setTouched({
      username: true,
      name: true,
      email: true,
      address: true,
      phone: true,
      password: true,
      dateOfBirth: true
    });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format ngày tháng cho API
      const formattedDateOfBirth = new Date(formData.dateOfBirth).toISOString();
      
      // Log dữ liệu gửi đi để debug
      const requestData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formattedDateOfBirth
      };
      
      console.log('Sending registration data:', requestData);
      
      // Gọi API đăng ký
      const response = await authService.register(requestData);
      
      console.log('Registration response:', response);
      
      if (response && response.statusCode === 200) {
        // Lưu thông tin đăng ký và chuyển đến trang xác thực OTP
        localStorage.setItem('pendingRegistration', JSON.stringify({
          email: formData.email,
          username: formData.username,
          name: formData.name
        }));
        navigate(ROUTES.AUTH.VERIFY_OTP);
      } else {
        const errorMsg = response?.message || 'Đăng ký không thành công. Vui lòng thử lại.';
        console.error('Registration failed with response:', response);
        setError(errorMsg);
      }
    } catch (err: unknown) {
      console.error('Registration error details:', err);
      
      // Parse lỗi chi tiết từ API response
      let errorMessage = 'Đăng ký không thành công. Vui lòng thử lại sau.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Kiểm tra nếu là lỗi network
        if (err.message.includes('fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        }
        // Kiểm tra nếu là lỗi CORS
        else if (err.message.includes('CORS')) {
          errorMessage = 'Lỗi CORS. Vui lòng liên hệ quản trị viên.';
        }
        // Kiểm tra các lỗi API cụ thể
        else if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu gửi không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        }
        else if (err.message.includes('409')) {
          errorMessage = 'Tên đăng nhập hoặc email đã được sử dụng.';
        }
        else if (err.message.includes('500')) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
      }
      
      setError(errorMessage);
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
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`register-input ${touched.name && errors.name ? 'input-error' : ''}`}
              placeholder="Nhập họ tên đầy đủ của bạn"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              required
              disabled={isLoading}
            />
            {touched.name && errors.name && (
              <div className="field-error">{errors.name}</div>
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
            <label htmlFor="address">Địa chỉ</label>
            <input
              type="text"
              id="address"
              name="address"
              className={`register-input ${touched.address && errors.address ? 'input-error' : ''}`}
              placeholder="Nhập địa chỉ của bạn"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur('address')}
              required
              disabled={isLoading}
            />
            {touched.address && errors.address && (
              <div className="field-error">{errors.address}</div>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`register-input ${touched.phone && errors.phone ? 'input-error' : ''}`}
              placeholder="Nhập số điện thoại của bạn"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              required
              disabled={isLoading}
            />
            {touched.phone && errors.phone && (
              <div className="field-error">{errors.phone}</div>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              className={`register-input ${touched.dateOfBirth && errors.dateOfBirth ? 'input-error' : ''}`}
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={() => handleBlur('dateOfBirth')}
              required
              disabled={isLoading}
            />
            {touched.dateOfBirth && errors.dateOfBirth && (
              <div className="field-error">{errors.dateOfBirth}</div>
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
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Bạn đã có tài khoản?{' '}
            <Link to={ROUTES.AUTH.LOGIN} className="register-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;