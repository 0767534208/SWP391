// src/pages/Blog/BlogDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();


  const blogPosts = [
    {
      id: '1',
      title: 'Sexual Education for Adolescents',
      content: [
        'Understanding effective approaches to sexual education and promoting healthy relationships among young people. This comprehensive guide explores the importance of age-appropriate sexual education and its impact on adolescent development.',
        'Sexual education plays a crucial role in helping young people make informed decisions about their health and relationships. Through evidence-based approaches and open dialogue, we can create a supportive environment for learning and growth.',
        'Our program focuses on providing accurate information, fostering healthy attitudes, and developing essential life skills. We believe in creating a safe space for questions and discussions, ensuring that adolescents have the knowledge they need to make responsible choices.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: 'March 15, 2024',
      author: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      title: 'Understanding Reproductive Health',
      content: [
        'Essential guide to maintaining reproductive wellness and making informed healthcare decisions. Learn about various aspects of reproductive health and how to take care of your reproductive system.',
        'Reproductive health encompasses a wide range of topics, from basic anatomy to complex medical conditions. Understanding your body and its needs is the first step toward maintaining optimal reproductive health.',
        'Regular check-ups, preventive care, and awareness of potential issues are key components of reproductive healthcare. This guide provides comprehensive information to help you make informed decisions about your health.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: 'March 14, 2024',
      author: 'Dr. Michael Chen'
    },
    {
      id: '3',
      title: 'STIs Prevention Guide',
      content: [
        'Learn about prevention methods and early detection of sexually transmitted infections. This guide provides comprehensive information about STI prevention, testing, and treatment options.',
        'Prevention is always better than cure, especially when it comes to STIs. Understanding risk factors, practicing safe behaviors, and getting regular screenings are essential steps in maintaining sexual health.',
        'We discuss various prevention strategies, testing procedures, and available treatments. Early detection and proper medical care are crucial for managing STIs effectively and preventing their spread.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: 'March 13, 2024',
      author: 'Dr. Emily Wilson'
    }
  ];

  const post = blogPosts.find(post => post.id === id);

  if (!post) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <h2>Article not found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="back-btn">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <div className="detail-nav">
          <Link to="/blog" className="back-link">
            ← Back to Blog
          </Link>
        </div>

        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">{post.author}</span>
            <span className="detail-date">{post.publishedDate}</span>
          </div>
        </header>

        <div className="detail-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>

        <article className="detail-content">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;