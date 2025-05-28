import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <main className="home-main">
      <section className="hero-section">
        <h1>Comprehensive Reproductive Healthcare</h1>
        <p>Your trusted partner in sexual and reproductive health</p>
        <div className="hero-buttons">
          <Link to="/booking" className="cta-button">Book Appointment</Link>
          <button className="cta-button secondary">STIs Testing</button>
        </div>
      </section>

      <section className="features-section">
        <h2>Our Services</h2>
        <div className="features-grid">
          <Link to="/cycleTracker" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-card service-card">
              <h3>Cycle Tracker</h3>
              <p>Track your menstrual cycle and predict ovulation periods</p>
            </div>
          </Link>
          <div className="feature-card">
            <h3>Online Consultation</h3>
            <p>Access healthcare professionals 24/7</p>
          </div>
          <div className="feature-card">
            <h3>STIs Testing</h3>
            <p>Comprehensive testing services for sexually transmitted infections</p>
          </div>
          <div className="feature-card">
            <h3>Health Counseling</h3>
            <p>Expert guidance on reproductive health issues</p>
          </div>
        </div>
      </section>

      <section className="blog-preview">
        <h2>Latest Articles</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src="/blog-1.png" alt="Sex Education for Teenagers" />
            <h3>Sex Education for Teenagers</h3>
            <p>Understanding effective approaches to sex education...</p>
          </div>
          <div className="blog-card">
            <img src="/blog-2.png" alt="Understanding Reproductive Health" />
            <h3>Understanding Reproductive Health</h3>
            <p>Essential guide to maintaining reproductive health and making informed healthcare decisions...</p>
          </div>
          <div className="blog-card">
            <img src="/blog-3.png" alt="STIs Prevention Guide" />
            <h3>STIs Prevention Guide</h3>
            <p>Learn about prevention methods and early detection of sexually transmitted infections...</p>
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
  );
};

export default Home; 