import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">{t('brand.name')}</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Navigation links */}
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-items">
            <li><Link to="/" className="nav-link">{t('nav.home')}</Link></li>
            <li>
              <Link to="/services" className="nav-link">
                {t('nav.services')}
              </Link>
            </li>
            <li><Link to="/blog" className="nav-link">{t('nav.blog')}</Link></li>
            <li><Link to="/booking" className="nav-link">{t('nav.booking')}</Link></li>
            <li><Link to="/contact" className="nav-link">{t('nav.contact')}</Link></li>
          </ul>

          <div className="nav-right">
            <LanguageSwitcher />
            <div className="auth-buttons">
              <Link to="/auth/login" className="auth-button login">{t('auth.signIn')}</Link>
              <Link to="/auth/register" className="auth-button register">{t('auth.register')}</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 