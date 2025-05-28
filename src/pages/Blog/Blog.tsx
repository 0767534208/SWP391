import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Sex Education for Teenagers',
      description: 'Understanding effective approaches to sex education and promoting healthy relationships among young people.',
    },
    {
      id: 2,
      title: 'Understanding Reproductive Health',
      description: 'Essential guide to maintaining reproductive health and making informed healthcare decisions.',
    },
    {
      id: 3,
      title: 'STIs Prevention Guide',
      description: 'Learn about prevention methods and early detection of sexually transmitted infections.',
    }
  ];

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <h1 className="blog-title">Blog & Health News</h1>
        </header>

        <div className="blog-grid">
          {blogPosts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-content">
                <h2 className="card-title">{post.title}</h2>
                <p className="card-description">{post.description}</p>
              </div>
              <Link to={`/blog/${post.id}`} className="read-more-btn">
                Read more
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