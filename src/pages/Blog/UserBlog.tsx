import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserBlog.css';
import { blogAPI } from '../../utils/api';

interface BlogData {
  blogID: number;
  title: string;
  content: string;
  author: string;
  createAt: string;
  status: boolean;
  imageBlogs?: { image: string }[];
}

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogs();
        
        if (response.statusCode === 200 && response.data) {
          // Sắp xếp blog theo thời gian tạo mới nhất
          const sortedBlogs = [...response.data].sort((a, b) => 
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          );
          setBlogs(sortedBlogs);
        } else {
          setError('Failed to fetch blogs');
        }
      } catch (err) {
        setError('Error fetching blogs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Xử lý khi click vào bài viết
  const handleBlogClick = (blogId: number) => {
    navigate(`/blog/${blogId}`);
  };

  // Fallback blog posts if API fails
  const fallbackBlogPosts = [
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

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.</p>
          </div>
        )}

        <div className="blog-grid">
          {blogs.length > 0 ? (
            blogs.map(blog => (
              <article key={blog.blogID} className="blog-card" onClick={() => handleBlogClick(blog.blogID)}>
                <div className="blog-card-image">
                  <img 
                    src={blog.imageBlogs && blog.imageBlogs.length > 0 ? blog.imageBlogs[0].image : "/blog-1.png"} 
                    alt={blog.title} 
                  />
                </div>
                <div className="blog-card-content">
                  <h2 className="card-title">{blog.title}</h2>
                  <p className="card-description">{blog.content.substring(0, 150)}...</p>
                </div>
                <div className="read-more-btn">
                  Xem thêm
                  <span className="btn-arrow">→</span>
                </div>
              </article>
            ))
          ) : !loading && !error && (
            fallbackBlogPosts.map(post => (
              <article key={post.id} className="blog-card" onClick={() => navigate(`/blog/${post.id}`)}>
                <div className="blog-card-content">
                  <h2 className="card-title">{post.title}</h2>
                  <p className="card-description">{post.description}</p>
                </div>
                <div className="read-more-btn">
                  Xem thêm
                  <span className="btn-arrow">→</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;