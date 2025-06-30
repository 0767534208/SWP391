import React, { useState } from 'react';
import { authAPI } from '../../services';

const AuthApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const loginExample = {
    username: "user123",
    password: "Password123!"
  };

  const registerExample = {
    userName: "newuser123",
    email: "newuser@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    name: "New User",
    address: "123 Main St, City",
    phone: "0912345678",
    dateOfBirth: "2000-01-01"
  };

  const verifyOtpExample = {
    email: "user@example.com",
    otp: "123456"
  };

  const forgotPasswordExample = {
    email: "user@example.com"
  };

  const resetPasswordExample = {
    email: "user@example.com",
    token: "reset-token-123456",
    newPassword: "NewPassword123!"
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.login(loginExample.username, loginExample.password);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.register(registerExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.verifyOTP(verifyOtpExample.email, verifyOtpExample.otp);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.forgotPassword(forgotPasswordExample.email);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.resetPassword(
        resetPasswordExample.email,
        resetPasswordExample.token,
        resetPasswordExample.newPassword
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.logout();
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h2>Auth API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Login Example</h3>
          <pre>{JSON.stringify(loginExample, null, 2)}</pre>
          <button onClick={handleLogin} disabled={loading}>
            Test Login
          </button>
        </div>

        <div className="api-example">
          <h3>Register Example</h3>
          <pre>{JSON.stringify(registerExample, null, 2)}</pre>
          <button onClick={handleRegister} disabled={loading}>
            Test Register
          </button>
        </div>

        <div className="api-example">
          <h3>Verify OTP Example</h3>
          <pre>{JSON.stringify(verifyOtpExample, null, 2)}</pre>
          <button onClick={handleVerifyOTP} disabled={loading}>
            Test Verify OTP
          </button>
        </div>

        <div className="api-example">
          <h3>Forgot Password Example</h3>
          <pre>{JSON.stringify(forgotPasswordExample, null, 2)}</pre>
          <button onClick={handleForgotPassword} disabled={loading}>
            Test Forgot Password
          </button>
        </div>

        <div className="api-example">
          <h3>Reset Password Example</h3>
          <pre>{JSON.stringify(resetPasswordExample, null, 2)}</pre>
          <button onClick={handleResetPassword} disabled={loading}>
            Test Reset Password
          </button>
        </div>

        <div className="api-example">
          <h3>Logout</h3>
          <button onClick={handleLogout} disabled={loading}>
            Test Logout
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="error">Error: {error}</div>}
      
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthApiTester; 