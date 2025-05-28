// src/pages/Blog/BlogDetail.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './BlogDetail.css';  // You can create this file for styling the detail page

const BlogDetail = () => {
  const { id } = useParams();          // Get id from URL
  const navigate = useNavigate();

  // Demo data (can be replaced with actual API fetch)
  const blogPosts = [
    {
      id: '1',
      title: 'Sex Education for Teenagers',
      content: 'Reproductive health is a state of complete physical, mental, and social well-being in all aspects of the reproductive system. It encompasses sexual health, fertility, pregnancy, childbirth, family planning, and other related factors.',
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: '05/01/2023',
      author: 'Dr. John Smith',
    },
    {
      id: '2',
      title: 'Understanding Reproductive Health',
      content: 'Reproductive health is a state of complete physical, mental, and social well-being in all aspects of the reproductive system. It encompasses sexual health, fertility, pregnancy, childbirth, family planning, and other related factors.',
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: '05/01/2023',
      author: 'Dr. Sarah Johnson',
    },
    {
      id: '3',
      title: 'STIs Prevention Guide',
      content: 'Reproductive health is a state of complete physical, mental, and social well-being in all aspects of the reproductive system. It encompasses sexual health, fertility, pregnancy, childbirth, family planning, and other related factors.',
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: '05/01/2023',
      author: 'Dr. Michael Brown',
    }
  ];

  // Find the post by id
  const post = blogPosts.find(item => item.id === id);

  if (!post) {
    // If not found, display message and back button
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <h2>Post Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <button 
            className="back-btn" 
            onClick={() => navigate(-1)}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Back to list button */}
        <div className="detail-nav">
          <Link to="/blog" className="back-link">
            ← Back
          </Link>
        </div>

        {/* Title and metadata */}
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">
              {post.author}
            </span>
            <span className="detail-date">{post.publishedDate}</span>
          </div>
        </header>

        {/* Featured image if available */}
        {post.imageUrl && (
          <div className="detail-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}

        {/* Detailed content */}
        <article className="detail-content">
          {/* If the content is long, you might want to split into multiple <p> tags */}
          <p>{post.content}</p>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;