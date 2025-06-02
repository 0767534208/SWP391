import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Giáo dục giới tính cho thanh thiếu niên',
      description: 'Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ.',
    },
    {
      id: 2,
      title: 'Hiểu về sức khỏe sinh sản',
      description: 'Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn.',
    },
    {
      id: 3,
      title: 'Hướng dẫn phòng ngừa STI',
      description: 'Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục.',
    }
  ];

  return (
    <div className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <h1 className="blog-title">Kiến Thức Sức Khỏe</h1>
        </header>

        <div className="blog-grid">
          {blogPosts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-content">
                <h2 className="card-title">{post.title}</h2>
                <p className="card-description">{post.description}</p>
              </div>
              <Link to={`/blog/${post.id}`} className="read-more-btn">
                Xem thêm
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