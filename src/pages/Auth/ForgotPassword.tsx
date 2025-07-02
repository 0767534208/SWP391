/**
 * ForgotPassword Component
 * 
 * Component xử lý yêu cầu đặt lại mật khẩu thông qua email
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  /**
   * Validate email
   * @param value - Giá trị email cần kiểm tra
   * @returns Thông báo lỗi nếu có, chuỗi rỗng nếu hợp lệ
   */
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email không được để trống';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  /**
   * Xử lý thay đổi email
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
  };

  /**
   * Xử lý khi người dùng rời khỏi trường nhập liệu
   */
  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  /**
   * Xử lý gửi yêu cầu đặt lại mật khẩu
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    setError(emailError);
    setTouched(true);
    
    if (emailError) {
      return;
    }
    
    setIsLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.statusCode === 200) {
        setSuccess('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
        setEmail('');
        setTouched(false);
      } else {
        setError('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
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
          <h2>Quên mật khẩu</h2>
          <p>Nhập email của bạn để đặt lại mật khẩu</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          
          <div className="login-form-group">
            <label htmlFor="forgot-email">Email</label>
            <input 
              id="forgot-email"
              type="email" 
              className={`login-input ${touched && error ? 'input-error' : ''}`}
              placeholder="Nhập email của bạn" 
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              required
              disabled={isLoading}
            />
            {touched && error && (
              <div className="field-error">{error}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
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

export default ForgotPassword; 