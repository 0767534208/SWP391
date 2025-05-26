// src/pages/Blog/BlogDetail.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BlogDetail.css';  // Bạn có thể tạo file này để style riêng cho detail

const BlogDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();          // Lấy id từ URL
  const navigate = useNavigate();

  // Dữ liệu demo (có thể thay bằng fetch API thực tế)
  const blogPosts = [
    {
      id: '1',
      title: t('blog.sexualEducation.title'),
      content: t('Sức khỏe sinh sản (SKSS) là trạng thái khỏe mạnh về thể chất, tinh thần và xã hội liên quan đến mọi khía cạnh của hệ thống sinh sản. Nó bao gồm sức khỏe tình dục, khả năng sinh sản, việc mang thai, sinh con, kế hoạch hóa gia đình và các yếu tố liên quan khác'),
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: t('1/5/2003'),
      author: t('Huy'),
    },
    {
      id: '2',
      title: t('blog.reproductiveHealth.title'),
      content: t('Sức khỏe sinh sản (SKSS) là trạng thái khỏe mạnh về thể chất, tinh thần và xã hội liên quan đến mọi khía cạnh của hệ thống sinh sản. Nó bao gồm sức khỏe tình dục, khả năng sinh sản, việc mang thai, sinh con, kế hoạch hóa gia đình và các yếu tố liên quan khác'),
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: t('1/5/2003'),
      author: t('Luân'),
    },
    {
      id: '3',
      title: t('blog.stisPrevention.title'),
      content: t('Sức khỏe sinh sản (SKSS) là trạng thái khỏe mạnh về thể chất, tinh thần và xã hội liên quan đến mọi khía cạnh của hệ thống sinh sản. Nó bao gồm sức khỏe tình dục, khả năng sinh sản, việc mang thai, sinh con, kế hoạch hóa gia đình và các yếu tố liên quan khác'),
      imageUrl: '/cham-soc-suc-khoe-sinh-san-1-4658.jpg',
      publishedDate: t('1/5/2003'),
      author: t('Quốc'),
    }
  ];

  // Tìm bài viết theo id
  const post = blogPosts.find(item => item.id === id);

  if (!post) {
    // Nếu không tìm thấy, hiển thị thông báo và nút quay lại
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <h2>{t('blog.notFoundTitle')}</h2>
          <p>{t('blog.notFoundMessage')}</p>
          <button 
            className="back-btn" 
            onClick={() => navigate(-1)}
          >
            {t('blog.backToList')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Nút quay về danh sách */}
        <div className="detail-nav">
          <Link to="/blog" className="back-link">
            ← {t('Quay lại')}
          </Link>
        </div>

        {/* Tiêu đề và metadata */}
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">
              {/* {t('blog.by')} {post.author} */}
              {post.author}
            </span>
            <span className="detail-date">{post.publishedDate}</span>
          </div>
        </header>

        {/* Ảnh minh họa nếu có */}
        {post.imageUrl && (
          <div className="detail-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}

        {/* Nội dung chi tiết */}
        <article className="detail-content">
          {/* Nếu nội dung dài, bạn có thể chia nhiều <p> */}
          <p>{post.content}</p>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;