import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">HealthCare Center</span>
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
        <ul className="nav-items">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li>
            <Link to="/services" className="nav-link">
              Services
            </Link>
          </li>
          <li><Link to="/blog" className="nav-link">Blog</Link></li>
          <li><Link to="/booking" className="nav-link">Book Appointment</Link></li>
          <li><Link to="/contact" className="nav-link">Contact</Link></li>
        </ul>

        <div className="nav-right">
          <div className="auth-buttons">
            <Link to="/auth/login" className="auth-button login">Sign In</Link>
            <Link to="/auth/register" className="auth-button register">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 