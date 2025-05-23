import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>{t('auth.signIn')}</h2>
          <p>{t('auth.pleaseSignIn')}</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input 
              type="email" 
              className="form-input"
              placeholder={t('auth.enterEmail')} 
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input 
              type="password" 
              className="form-input"
              placeholder={t('auth.enterPassword')} 
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <a href="#" className="forgot-password">{t('auth.forgotPassword')}</a>
          </div>

          <button type="submit" className="auth-submit">
            {t('auth.signIn')}
          </button>

          <div className="auth-switch">
            <p>{t('auth.noAccount')} <Link to="/auth/register" className="switch-link">{t('auth.createAccount')}</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
