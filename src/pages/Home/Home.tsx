import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <main className="home-main">
      <section className="hero-section">
        <h1>{t('home.hero.title')}</h1>
        <p>{t('home.hero.subtitle')}</p>
        <div className="hero-buttons">
          <Link to="/booking" className="cta-button">{t('home.hero.bookNow')}</Link>
          <button className="cta-button secondary">{t('home.services.testing')}</button>
        </div>
      </section>

      <section className="features-section">
        <h2>{t('home.services.title')}</h2>
        <div className="features-grid">
          <Link to="/cycleTracker" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="feature-card service-card">
              <h3>{t('home.services.cycleTracking')}</h3>
              <p>{t('home.services.cycleTrackingDesc')}</p>
            </div>
          </Link>
          <div className="feature-card">
            <h3>{t('home.services.consultation')}</h3>
            <p>{t('home.services.consultationDesc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('home.services.testing')}</h3>
            <p>{t('home.services.testingDesc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('home.services.advisory')}</h3>
            <p>{t('home.services.advisoryDesc')}</p>
          </div>
        </div>
      </section>

      <section className="blog-preview">
        <h2>{t('home.blog.title')}</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src="/blog-1.pngpng" alt={t('home.blog.articles.sexEd.title')} />
            <h3>{t('home.blog.articles.sexEd.title')}</h3>
            <p>{t('home.blog.articles.sexEd.desc')}</p>
          </div>
          <div className="blog-card">
            <img src="/blog-2.pngpng" alt={t('home.blog.articles.reproHealth.title')} />
            <h3>{t('home.blog.articles.reproHealth.title')}</h3>
            <p>{t('home.blog.articles.reproHealth.desc')}</p>
          </div>
          <div className="blog-card">
            <img src="/blog-3.png" alt={t('home.blog.articles.stisPrev.title')} />
            <h3>{t('home.blog.articles.stisPrev.title')}</h3>
            <p>{t('home.blog.articles.stisPrev.desc')}</p>
          </div>
        </div>
      </section>

      <section className="tools-section">
        <h2>{t('home.tools.title')}</h2>
        <div className="tools-grid">
          <button className="tool-button">{t('home.tools.ovulationCalc')}</button>
          <button className="tool-button">{t('home.tools.askQuestion')}</button>
          <button className="tool-button">{t('home.tools.consultHistory')}</button>
          <button className="tool-button">{t('home.tools.testResults')}</button>
        </div>
      </section>
    </main>
  );
};

export default Home; 