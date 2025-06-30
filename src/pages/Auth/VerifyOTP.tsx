/**
 * VerifyOTP Component
 * 
 * Component xử lý xác thực OTP sau khi đăng ký
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { STORAGE_KEYS, ROUTES } from '../../config/constants';
import './Auth.css';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's pending registration
    const pendingRegistration = localStorage.getItem(STORAGE_KEYS.PENDING_REGISTRATION);
    if (!pendingRegistration) {
      navigate(ROUTES.AUTH.REGISTER);
      return;
    }

    try {
      const registrationData = JSON.parse(pendingRegistration);
      if (registrationData && registrationData.email) {
        setEmail(registrationData.email);
      } else {
        navigate(ROUTES.AUTH.REGISTER);
        return;
      }
    } catch (_) {
      // Nếu có lỗi khi parse JSON, điều hướng về trang đăng ký
      navigate(ROUTES.AUTH.REGISTER);
      return;
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setIsResendDisabled(false);
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Focus previous input on backspace
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP!');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Verifying OTP for email:', email, 'OTP:', otpValue);
      console.log('API endpoint will be:', `/account/confirmation/${encodeURIComponent(email)}/${otpValue}`);
      
      const response = await authService.verifyOTP(email, otpValue);
      
      console.log('OTP verification response:', response);
      
      if (response.statusCode === 200) {
        localStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);
        navigate(ROUTES.AUTH.LOGIN, { state: { verified: true } });
      } else {
        setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      let errorMessage = 'Đã xảy ra lỗi không xác định';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Kiểm tra các lỗi cụ thể
        if (err.message.includes('405')) {
          errorMessage = 'Phương thức không được hỗ trợ. Vui lòng liên hệ quản trị viên.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Mã OTP không tồn tại hoặc đã hết hạn.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Mã OTP không hợp lệ.';
        }
      }
      
      setError('Lỗi: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(60);
    setIsResendDisabled(true);
    setError('');
    
    try {
      // Trong thực tế, bạn cần gọi API để gửi lại OTP
      // Đây là nơi bạn sẽ gọi API resendOTP của bạn
      // await authService.resendOTP(email);
      console.log('Resending OTP to:', email);
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError('Không thể gửi lại mã: ' + errorMessage);
    }
  };

  return (
    <div className="register-page" style={{
      backgroundImage: 'url("/istockphoto-otp.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="register-container">
        <div className="register-header">
          <h2>Xác thực Email</h2>
          <p>Nhập mã OTP đã được gửi đến email của bạn</p>
          {email && <p className="email-info">{email}</p>}
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                required
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="resend-section">
            {timer > 0 ? (
              <p>Gửi lại mã sau {timer} giây</p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="resend-button"
                disabled={isResendDisabled}
              >
                Gửi lại mã
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="register-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP; 