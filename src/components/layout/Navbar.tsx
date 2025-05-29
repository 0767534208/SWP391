import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img 
                        src="/logo.png" 
                        alt="Healthcare Logo" 
                        className="navbar-logo-img"
                    />
                    <span className="navbar-brand">HealthCare</span>
                </Link>
                <div className="navbar-menu">
                    <Link to="/blog" className="nav-link">Blog</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/cycle-tracker" className="nav-link">Cycle Tracker</Link>
                    <Link to="/booking" className="nav-link">Book Appointment</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 