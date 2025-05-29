import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>Create Account</h2>
          <p>Join us to get started</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="register-fullname">Full Name</label>
            <input 
              id="register-fullname"
              type="text" 
              className="form-input"
              placeholder="Enter your full name" 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input 
              id="register-email"
              type="email" 
              className="form-input"
              placeholder="Enter your email" 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input 
              id="register-password"
              type="password" 
              className="form-input"
              placeholder="Create a password" 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input 
              id="register-confirm"
              type="password" 
              className="form-input"
              placeholder="Confirm your password" 
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Create Account
          </button>

          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <Link to="/auth/login" className="switch-link">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;