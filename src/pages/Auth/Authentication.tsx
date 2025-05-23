import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

interface AuthenticationProps {
  isOpen: boolean;
  onClose: () => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Sign In</h2>
        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required />
          </div>
          <button type="submit" className="submit-button">Sign In</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/auth/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Authentication; 