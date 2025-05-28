import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>HealthCare Center</h2>
          <p>
            Your trusted partner in sexual and reproductive health
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
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/doctors">Our Doctors</Link></li>
            <li><Link to="/blog">Blog & News</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Our Services</h3>
          <ul className="footer-links">
            <li><Link to="/services/consultation">Health Consultation</Link></li>
            <li><Link to="/services/testing">STIs Testing</Link></li>
            <li><Link to="/services/reproductive">Reproductive Health</Link></li>
            <li><Link to="/services/education">Sex Education</Link></li>
            <li><Link to="/services/counseling">Health Counseling</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-contact">
        <div className="contact-container">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <p><FaMapMarkerAlt /> 123 Healthcare Street, Ho Chi Minh City</p>
            <p><FaPhone /> +84 123 456 789</p>
            <p><FaEnvelope /> contact@healthcare.com</p>
            <p><FaClock /> Monday - Friday: 8:00 - 20:00</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 HealthCare Center. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 