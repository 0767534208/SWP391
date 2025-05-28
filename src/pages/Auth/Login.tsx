import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Here we're simulating authentication logic
    // In a real app, you would make an API call to your backend
    if (email === 'admin@example.com' && password === 'admin123') {
      // Admin login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
      navigate('/admin'); // Redirect to admin dashboard
    } else if (email && password) {
      // Regular user login - simple validation for demo
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('user', JSON.stringify({ email, role: 'user' }));
      navigate('/'); // Redirect to home page
    } else {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>Login</h2>
          <p>Please login to continue</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input 
              id="login-email"
              type="email" 
              className="form-input"
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input 
              id="login-password"
              type="password" 
              className="form-input"
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="auth-submit">
            Login
          </button>

          <div className="auth-switch">
            <p>
              Don't have an account?{' '}
              <Link to="/auth/register" className="switch-link">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="auth-note">
        <p className="text-sm text-white">
          Use <strong>admin@example.com</strong> / <strong>admin123</strong> to access admin privileges
        </p>
      </div>
    </div>
  );
};

export default Login;