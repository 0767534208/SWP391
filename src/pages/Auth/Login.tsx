import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>Welcome Back!</h2>
          <p>Please sign in to continue</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="Enter your email" 
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
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
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="auth-submit">
            Sign In
          </button>

          <div className="auth-switch">
            <p>Don't have an account yet? <Link to="/auth/register" className="switch-link">Create one</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
