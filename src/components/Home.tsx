import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Authentication from './Auth/Authentication';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="home-container">
      <header className="home-header">
        <nav className="home-nav">
          <div className="logo">HealthCare Center</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/booking">Booking</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li>
              <Link to="/auth/login" className="auth-button">
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {showAuth && <Authentication isOpen={showAuth} onClose={() => setShowAuth(false)} />}
      
      <main className="home-main">
        <section className="hero-section">
          <h1>Comprehensive Sexual Health Care</h1>
          <p>Your trusted partner in reproductive and sexual health</p>
          <div className="hero-buttons">
            <Link to="/booking" className="cta-button">Book Consultation</Link>
            <button className="cta-button secondary">STIs Testing</button>
          </div>
        </section>

        <section className="features-section">
          <h2>Our Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Cycle Tracking</h3>
              <p>Monitor menstrual cycles and predict ovulation periods</p>
            </div>
            <div className="feature-card">
              <h3>Online Consultation</h3>
              <p>24/7 access to healthcare professionals</p>
            </div>
            <div className="feature-card">
              <h3>STIs Testing</h3>
              <p>Comprehensive testing services for sexually transmitted infections</p>
            </div>
            <div className="feature-card">
              <h3>Health Advisory</h3>
              <p>Expert guidance on reproductive health concerns</p>
            </div>
          </div>
        </section>

        <section className="blog-preview">
          <h2>Latest Articles</h2>
          <div className="blog-grid">
            <div className="blog-card">
              <img src="/blog-1.jpg" alt="Blog thumbnail" />
              <h3>Sexual Education for Adolescents</h3>
              <p>Understanding effective approaches to sexual education...</p>
            </div>
            <div className="blog-card">
              <img src="/blog-2.jpg" alt="Blog thumbnail" />
              <h3>Understanding Reproductive Health</h3>
              <p>Essential guide to maintaining reproductive wellness...</p>
            </div>
            <div className="blog-card">
              <img src="/blog-3.jpg" alt="Blog thumbnail" />
              <h3>STIs Prevention Guide</h3>
              <p>Learn about prevention methods and early detection...</p>
            </div>
          </div>
        </section>

        <section className="tools-section">
          <h2>Useful Tools</h2>
          <div className="tools-grid">
            <button className="tool-button">Ovulation Calculator</button>
            <button className="tool-button">Ask a Question</button>
            <button className="tool-button">Consultation History</button>
            <button className="tool-button">Test Results</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
