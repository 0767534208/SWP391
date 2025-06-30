import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

// Define interface for API response
interface LoginResponse {
  message: string;
  statusCode: number;
  data?: {
    userID: string;
    userName: string;
    email: string;
    name: string;
    address: string;
    phone: string;
    dateOfBirth: string;
    isActive: boolean;
    roles: string[];
    token: string;
    refreshToken: string;
  };
}

const Login = () => {
  const navigate = useNavigate();
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

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    
    if (isLoggedIn && userRole) {
      redirectBasedOnRole(userRole);
    }
  }, []);

  // Function to handle redirection based on role
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'manager':
        navigate('/manager');
        break;
      case 'staff':
        navigate('/staff');
        break;
      case 'consultant':
        navigate('/consultant/profile');
        break;
      default:
        navigate('/');
        break;
    }
  };

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

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Mật khẩu không được để trống';
    }
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  };

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

  const isFormValid = () => {
    return !errors.username && !errors.password && username && password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
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
    setIsLoading(true);

    try {
      // Try using fetch instead of axios
      const response = await fetch('https://ghsmsystemdemopublish.azurewebsites.net/api/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response is successful
      if (data.statusCode === 200 && data.data) {
        const userData = data.data;
        
        // Store the token and user info
        localStorage.setItem('token', userData.token);
        localStorage.setItem('refreshToken', userData.refreshToken);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Get the first role if available
        const role = userData.roles && userData.roles.length > 0 ? userData.roles[0].toLowerCase() : 'user';
        localStorage.setItem('userRole', role);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify({
          id: userData.userID,
          username: userData.userName,
          email: userData.email,
          name: userData.name,
          role: role,
          address: userData.address,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth
        }));

        // Redirect based on user role
        redirectBasedOnRole(role);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Đăng nhập thất bại: ' + err.message);
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
          <h2>Đăng nhập</h2>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
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
            <label className="login-remember">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="login-forgot">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            className="login-submit" 
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
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
    </div>
  );
};

export default Login;