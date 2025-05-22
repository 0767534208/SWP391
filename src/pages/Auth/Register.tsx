import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>Create New Account</h2>
          <p>Join us to get started</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Enter your full name" 
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
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
              placeholder="Create a password" 
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="Confirm your password" 
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Create Account
          </button>
        </form>

        <div className="auth-switch">
          <span>Already have an account? </span>
          <Link to="/auth/login" className="switch-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
