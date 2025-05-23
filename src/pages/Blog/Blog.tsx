import React from 'react';
import { useTranslation } from 'react-i18next';
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
        <h1 className="blog-title">{t('blog.title')}</h1>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <div key={post.id} className="blog-card">
              <div className="blog-content">
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <button className="read-more-btn">
                  {t('blog.readMore')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog; 