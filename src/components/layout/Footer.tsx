import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>HealthCare Center</h2>
          <p>
            {t('home.hero.subtitle')}
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>{t('footer.quickLinks')}</h3>
          <ul className="footer-links">
            <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
            <li><Link to="/services">{t('footer.ourServices')}</Link></li>
            <li><Link to="/doctors">{t('footer.ourDoctors')}</Link></li>
            <li><Link to="/blog">{t('footer.blogNews')}</Link></li>
            <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t('footer.services.title')}</h3>
          <ul className="footer-links">
            <li><Link to="/services/consultation">{t('footer.services.consultation')}</Link></li>
            <li><Link to="/services/testing">{t('footer.services.testing')}</Link></li>
            <li><Link to="/services/reproductive">{t('footer.services.reproductive')}</Link></li>
            <li><Link to="/services/education">{t('footer.services.education')}</Link></li>
            <li><Link to="/services/counseling">{t('footer.services.counseling')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-contact">
        <div className="contact-container">
          <h3>{t('footer.contact.title')}</h3>
          <div className="contact-info">
            <p><FaMapMarkerAlt /> {t('footer.contact.address')}</p>
            <p><FaPhone /> {t('footer.contact.phone')}</p>
            <p><FaEnvelope /> {t('footer.contact.email')}</p>
            <p><FaClock /> {t('footer.contact.hours')}</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t('footer.rights')}</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/sitemap">{t('footer.sitemap')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 