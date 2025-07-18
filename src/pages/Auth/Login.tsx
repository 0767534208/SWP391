/**
 * Login Component
 * 
 * Component xử lý đăng nhập người dùng và điều hướng dựa trên vai trò
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services';
import { ROUTES, USER_ROLES } from '../../config/constants';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Kiểm tra nếu người dùng đã đăng nhập
  useEffect(() => {
    // Hiển thị thông báo thành công nếu vừa xác thực OTP
    const state = location.state as { verified?: boolean } | undefined;
    if (state?.verified) {
      setSuccessMessage('Xác thực email thành công! Vui lòng đăng nhập.');
    }

    if (authService.isLoggedIn()) {
      const userRole = authService.getUserRole()?.toLowerCase();
      
      if (userRole) {
        redirectBasedOnRole(userRole);
      }
    }
  }, [location.state]);

  // Hàm điều hướng dựa trên vai trò người dùng
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        navigate(ROUTES.ADMIN.DASHBOARD);
        break;
      case USER_ROLES.MANAGER:
        navigate(ROUTES.MANAGER.DASHBOARD);
        break;
      case USER_ROLES.STAFF:
        navigate(ROUTES.STAFF.DASHBOARD);
        break;
      case USER_ROLES.CONSULTANT:
        navigate(ROUTES.CONSULTANT.PROFILE);
        break;
      default:
        navigate(ROUTES.HOME);
        break;
    }
  };

  // Validate tên đăng nhập
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return 'Tên đăng nhập không được để trống';
    }
    if (value.length < 3) {
      return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (/\s/.test(value)) {
      return 'Tên đăng nhập không được chứa khoảng trắng';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Tên đăng nhập chỉ được chứa chữ cái không dấu, số và dấu gạch dưới';
    }
    return '';
  };

  // Validate mật khẩu
  const validatePassword = (value: string) => {
    if (!value) {
      return 'Mật khẩu không được để trống';
    }
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  };

  // Xử lý khi người dùng rời khỏi trường nhập liệu
  const handleBlur = (field: 'username' | 'password') => {
    setTouched({
      ...touched,
      [field]: true
    });

    if (field === 'username') {
      setErrors({
        ...errors,
        username: validateUsername(username)
      });
    } else if (field === 'password') {
      setErrors({
        ...errors,
        password: validatePassword(password)
      });
    }
  };

  // Xử lý thay đổi tên đăng nhập
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      setErrors({
        ...errors,
        username: validateUsername(value)
      });
    }
  };

  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors({
        ...errors,
        password: validatePassword(value)
      });
    }
  };

  // Kiểm tra form có hợp lệ không
  const isFormValid = () => {
    return !errors.username && !errors.password && username && password;
  };

  // Xử lý đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tất cả các trường
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    
    setErrors({
      username: usernameError,
      password: passwordError
    });
    
    setTouched({
      username: true,
      password: true
    });
    
    if (usernameError || passwordError) {
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Gọi service xác thực
      const response = await authService.login(username, password);
      
      // Kiểm tra kết quả
      if (response.statusCode === 200 && response.data) {
        // Service đã xử lý lưu token và thông tin người dùng
        
        // Thông báo thay đổi trạng thái đăng nhập để cập nhật Navbar
        window.dispatchEvent(new Event('login-state-changed'));
        
        // Điều hướng dựa trên vai trò
        const role = authService.getUserRole() || USER_ROLES.USER;
        redirectBasedOnRole(role);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError('Đăng nhập thất bại: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Use the authService to clear all authentication data
    authService.clearAuthData();
    
    // Dispatch event to update UI
    window.dispatchEvent(new Event('login-state-changed'));
    
    // Redirect to login page
    navigate(ROUTES.AUTH.LOGIN);
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
          {successMessage && <div className="login-success">{successMessage}</div>}
          
          <div className="login-form-group">
            <label htmlFor="login-username">Tên đăng nhập</label>
            <input 
              id="login-username"
              type="text" 
              className={`login-input ${touched.username && errors.username ? 'input-error' : ''}`}
              placeholder="Nhập tên đăng nhập của bạn" 
              value={username}
              onChange={handleUsernameChange}
              onBlur={() => handleBlur('username')}
              required
              disabled={isLoading}
            />
            {touched.username && errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>
          
          <div className="login-form-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <input 
              id="login-password"
              type="password" 
              className={`login-input ${touched.password && errors.password ? 'input-error' : ''}`}
              placeholder="Nhập mật khẩu của bạn" 
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              required
              disabled={isLoading}
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>
          
          <div className="login-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="forgot-password">Quên mật khẩu?</Link>
          </div>
          
          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Bạn chưa có tài khoản?{' '}
            <Link to={ROUTES.AUTH.REGISTER} className="login-register-link">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;