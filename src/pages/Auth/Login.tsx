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
    } else if (email === 'user@example.com' && password === 'user123') {
      // User login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        role: 'user',
        name: 'User Demo',
        phone: '0123 456 789',
        dob: '01/01/2000',
        address: 'Hà Nội'
      }));
      navigate('/'); // Redirect to home page
      window.location.reload();
    } 
    else if (email && password) {
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Login</h2>
          <p>Please login to continue</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="login-form-group">
            <label htmlFor="login-email">Email</label>
            <input 
              id="login-email"
              type="email" 
              className="login-input"
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Password</label>
            <input 
              id="login-password"
              type="password" 
              className="login-input"
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>

          <button type="submit" className="login-submit">
            Login
          </button>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/auth/register" className="login-link">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="login-note">
        <p>
          Use <strong>role@example.com</strong> / <strong>rolerole123</strong> to access each role privileges
        </p>
      </div>
    </div>
  );
};

export default Login;