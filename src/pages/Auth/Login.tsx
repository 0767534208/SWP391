import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>Sign In</h2>
          <p>Please sign in to continue</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input 
              id="login-email"
              type="email" 
              className="form-input"
              placeholder="Enter your email" 
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
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-submit">
            Sign In
          </button>

          <div className="auth-switch">
            <p>
              Don't have an account?{' '}
              <Link to="/auth/register" className="switch-link">
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;