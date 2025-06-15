import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    // Check if there's pending registration
    const pendingRegistration = localStorage.getItem('pendingRegistration');
    if (!pendingRegistration) {
      navigate('/auth/register');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Vui lòng nhập đầy đủ mã OTP!');
      return;
    }

    // Here you would typically verify the OTP with your backend
    console.log('Verifying OTP:', otpValue);
    
    // For demo purposes, we'll just proceed to login
    localStorage.removeItem('pendingRegistration');
    navigate('/auth/login');
  };

  const handleResendOTP = () => {
    setTimer(60);
    setIsResendDisabled(true);
    // Here you would typically call your backend to resend OTP
    console.log('Resending OTP...');
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
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="register-submit">
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP; 