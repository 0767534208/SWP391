import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Register = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <h2>{t('auth.createAccount')}</h2>
          <p>{t('auth.joinUs')}</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="register-fullname">{t('auth.fullName')}</label>
            <input 
              id="register-fullname"
              type="text" 
              className="form-input"
              placeholder={t('auth.enterFullName')} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">{t('auth.email')}</label>
            <input 
              id="register-email"
              type="email" 
              className="form-input"
              placeholder={t('auth.enterEmail')} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">{t('auth.password')}</label>
            <input 
              id="register-password"
              type="password" 
              className="form-input"
              placeholder={t('auth.createPassword')} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">{t('auth.confirmPassword')}</label>
            <input 
              id="register-confirm"
              type="password" 
              className="form-input"
              placeholder={t('auth.confirmPasswordPlaceholder')} 
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            {t('auth.createAccount')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {t('auth.haveAccount')}{' '}
            <Link to="/auth/login" className="switch-link">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;