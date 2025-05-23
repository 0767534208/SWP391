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
            <label>{t('auth.fullName')}</label>
            <input 
              type="text" 
              className="form-input"
              placeholder={t('auth.enterFullName')} 
              required
            />
          </div>

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
              placeholder={t('auth.createPassword')} 
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.confirmPassword')}</label>
            <input 
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
          <span>{t('auth.haveAccount')} </span>
          <Link to="/auth/login" className="switch-link">{t('auth.signIn')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
