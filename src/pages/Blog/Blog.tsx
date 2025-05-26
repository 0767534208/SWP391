import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const { t } = useTranslation();

  const blogPosts = [
    {
      id: 1,
      title: t('blog.sexualEducation.title'),
      description: t('blog.sexualEducation.description'),
    },
    {
      id: 2,
      title: t('blog.reproductiveHealth.title'),
      description: t('blog.reproductiveHealth.description'),
    },
    {
      id: 3,
      title: t('blog.stisPrevention.title'),
      description: t('blog.stisPrevention.description'),
    }
  ];

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <h1 className="blog-title">{t('blog.title')}</h1>
        </header>

        <div className="blog-grid">
          {blogPosts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-content">
                <h2 className="card-title">{post.title}</h2>
                <p className="card-description">{post.description}</p>
              </div>
              <Link to={`/blog/${post.id}`} className="read-more-btn">
                {t('blog.readMore')}
                <span className="btn-arrow">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;