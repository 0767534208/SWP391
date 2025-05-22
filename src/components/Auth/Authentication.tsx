import React, { useState } from 'react';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const Authentication = ({ isOpen, onClose }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form className="auth-form">
          {!isLogin && (
            <input type="text" placeholder="Full Name" required />
          )}
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          {!isLogin && (
            <input type="password" placeholder="Confirm Password" required />
          )}
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Authentication;
