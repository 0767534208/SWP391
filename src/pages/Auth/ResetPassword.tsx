/**
 * ResetPassword Component
 * 
 * Component xử lý đặt lại mật khẩu sau khi người dùng nhấn vào link trong email
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services';
import './Auth.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  // State quản lý lỗi validation
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    token: '',
    email: '',
  });
  
  // State quản lý thông tin xác thực và trạng thái
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  /**
   * Parse query parameters khi component được mount
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setErrors(prev => ({...prev, email: 'Email không được cung cấp trong URL'}));
    }
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrors(prev => ({...prev, token: 'Token không được cung cấp trong URL'}));
    }
  }, [location]);

  /**
   * Validate từng trường trong form
   * @param field - Tên trường cần validate
   * @param value - Giá trị của trường
   * @returns Thông báo lỗi nếu có, chuỗi rỗng nếu hợp lệ
   */
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'password':
        if (!value) return 'Mật khẩu không được để trống';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      case 'confirmPassword':
        if (!value) return 'Xác nhận mật khẩu không được để trống';
        if (value !== formData.password) return 'Mật khẩu xác nhận không khớp';
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
      
      // Xử lý đặc biệt cho confirmPassword khi password thay đổi
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: validateField('confirmPassword', formData.confirmPassword)
        }));
      }
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
           formData.password && 
           formData.confirmPassword && 
           email && 
           token;
  };

  /**
   * Xử lý đặt lại mật khẩu
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tất cả các trường
    const newErrors = {
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      token: token ? '' : 'Token không hợp lệ',
      email: email ? '' : 'Email không hợp lệ',
    };
    
    setErrors(newErrors);
    
    // Đánh dấu tất cả các trường đã được tương tác
    setTouched({
      password: true,
      confirmPassword: true,
    });
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authService.resetPassword(email, token, formData.password);
      
      if (response.statusCode === 200) {
        setSuccess('Mật khẩu của bạn đã được đặt lại thành công.');
        // Xóa form
        setFormData({
          password: '',
          confirmPassword: '',
        });
        setTouched({
          password: false,
          confirmPassword: false,
        });
        
        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } else {
        setError('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError('Lỗi: ' + errorMessage);
    } finally {
      setIsLoading(false);
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
          <h2>Đặt lại mật khẩu</h2>
          <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          {(errors.email || errors.token) && (
            <div className="login-error">
              {errors.email || errors.token}
              <p>Vui lòng kiểm tra lại liên kết trong email của bạn.</p>
            </div>
          )}
          
          <div className="login-form-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <input 
              id="password"
              name="password"
              type="password" 
              className={`login-input ${touched.password && errors.password ? 'input-error' : ''}`}
              placeholder="Nhập mật khẩu mới" 
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
          
          <div className="login-form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input 
              id="confirmPassword"
              name="confirmPassword"
              type="password" 
              className={`login-input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Nhập lại mật khẩu mới" 
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              required
              disabled={isLoading}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            <Link to="/auth/login" className="login-register-link">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 