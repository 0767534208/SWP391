import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import './BlogDetail.css';
import { blogAPI } from '../../utils/api';

interface BlogData {
  blogID: number;
  title: string;
  content: string;
  author: string;
  createAt: string;
  updateAt: string;
  status: boolean;
  imageBlogs?: { image: string }[];
}

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Kiểm tra xem người dùng đến từ trang quản lý hay không
  const isFromManager = location.state?.fromManager || false;
  // Kiểm tra xem người dùng đến từ trang quản lý của staff hay không
  const isFromStaff = location.state?.fromStaff || false;
  
  // Lấy role từ localStorage (hoặc nơi lưu trữ khác)
  const userRole = localStorage.getItem('userRole') || 'customer';

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await blogAPI.getBlogById(id);
        
        if (response.statusCode === 200 && response.data) {
          setBlog(response.data);
        } else {
          setError('Failed to fetch blog details');
        }
      } catch (err) {
        setError('Error fetching blog details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  // Xử lý quay lại
  const handleGoBack = () => {
    if (isFromStaff || userRole === 'staff') {
      navigate('/staff/blogs');
    } else if (isFromManager || userRole === 'manager' || userRole === 'admin') {
      navigate('/manager/blogs');
    } else {
      navigate('/blogUser');
    }
  };

  // Fallback blog posts if API fails
  const fallbackBlogPosts = [
    {
      id: '1',
      title: 'Giáo dục giới tính cho thanh thiếu niên',
      content: [
        'Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ. Hướng dẫn toàn diện này khám phá tầm quan trọng của giáo dục giới tính phù hợp với lứa tuổi và tác động của nó đến sự phát triển của thanh thiếu niên.',
        'Giáo dục giới tính đóng vai trò quan trọng trong việc giúp người trẻ đưa ra quyết định sáng suốt về sức khỏe và các mối quan hệ của họ. Thông qua các phương pháp dựa trên bằng chứng và đối thoại cởi mở, chúng ta có thể tạo ra một môi trường hỗ trợ cho việc học tập và phát triển.',
        'Chương trình của chúng tôi tập trung vào việc cung cấp thông tin chính xác, nuôi dưỡng thái độ lành mạnh và phát triển các kỹ năng sống thiết yếu. Chúng tôi tin vào việc tạo ra một không gian an toàn cho các câu hỏi và thảo luận, đảm bảo rằng thanh thiếu niên có kiến thức cần thiết để đưa ra lựa chọn có trách nhiệm.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: '15 tháng 3, 2024',
      author: 'TS. Nguyễn Thị Hương'
    },
    {
      id: '2',
      title: 'Hiểu về sức khỏe sinh sản',
      content: [
        'Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn. Tìm hiểu về các khía cạnh khác nhau của sức khỏe sinh sản và cách chăm sóc hệ sinh sản của bạn.',
        'Sức khỏe sinh sản bao gồm nhiều chủ đề, từ giải phẫu cơ bản đến các tình trạng y tế phức tạp. Hiểu về cơ thể và nhu cầu của nó là bước đầu tiên hướng tới việc duy trì sức khỏe sinh sản tối ưu.',
        'Kiểm tra định kỳ, chăm sóc phòng ngừa và nhận thức về các vấn đề tiềm ẩn là những thành phần chính của chăm sóc sức khỏe sinh sản. Hướng dẫn này cung cấp thông tin toàn diện để giúp bạn đưa ra quyết định sáng suốt về sức khỏe của mình.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: '14 tháng 3, 2024',
      author: 'TS. Trần Minh Tuấn'
    },
    {
      id: '3',
      title: 'Hướng dẫn phòng ngừa STI',
      content: [
        'Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục. Hướng dẫn này cung cấp thông tin toàn diện về phòng ngừa STI, xét nghiệm và các lựa chọn điều trị.',
        'Phòng ngừa luôn tốt hơn chữa bệnh, đặc biệt là khi nói đến STI. Hiểu các yếu tố rủi ro, thực hành hành vi an toàn và kiểm tra thường xuyên là những bước cần thiết để duy trì sức khỏe tình dục.',
        'Chúng tôi thảo luận về các chiến lược phòng ngừa khác nhau, quy trình xét nghiệm và các phương pháp điều trị hiện có. Phát hiện sớm và chăm sóc y tế đúng cách là rất quan trọng để quản lý STI hiệu quả và ngăn chặn sự lây lan của chúng.'
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: '13 tháng 3, 2024',
      author: 'TS. Lê Thị Phương'
    }
  ];

  // Nếu đang tải
  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu có lỗi hoặc không tìm thấy bài viết từ API
  if (error || !blog) {
    // Thử tìm trong fallback data
    const fallbackPost = fallbackBlogPosts.find(post => post.id === id);
    
    if (!fallbackPost) {
      return (
        <div className="blog-detail-page">
          <div className="blog-detail-container">
            <h2>Không tìm thấy bài viết</h2>
            <p>Bài viết bạn đang tìm kiếm không tồn tại.</p>
            <button onClick={handleGoBack} className="back-btn">
              Quay lại
            </button>
          </div>
        </div>
      );
    }
    
    // Hiển thị dữ liệu fallback
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="detail-nav">
            <button onClick={handleGoBack} className="back-link">
              ← {
                isFromStaff || userRole === 'staff' ? 'Quay lại trang quản lý bài viết' : 
                isFromManager || userRole === 'manager' || userRole === 'admin' ? 'Quay lại trang quản lý bài viết' : 
                'Quay lại trang bài viết'
              }
            </button>
          </div>

          <header className="detail-header">
            <h1 className="detail-title">{fallbackPost.title}</h1>
            <div className="detail-meta">
              <span className="detail-author">{fallbackPost.author}</span>
              <span className="detail-date">{fallbackPost.publishedDate}</span>
            </div>
          </header>

          <div className="detail-image">
            <img src={fallbackPost.imageUrl} alt={fallbackPost.title} />
          </div>

          <article className="detail-content">
            {fallbackPost.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        </div>
      </div>
    );
  }

  // Hiển thị dữ liệu từ API
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Không xác định';
    }
  };

  // Tách nội dung thành các đoạn văn
  const contentParagraphs = blog.content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <div className="detail-nav">
          <button onClick={handleGoBack} className="back-link">
            ← {
              isFromStaff || userRole === 'staff' ? 'Quay lại trang quản lý bài viết' : 
              isFromManager || userRole === 'manager' || userRole === 'admin' ? 'Quay lại trang quản lý bài viết' : 
              'Quay lại trang bài viết'
            }
          </button>
        </div>

        <header className="detail-header">
          <h1 className="detail-title">{blog.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">{blog.author}</span>
            <span className="detail-date">{formatDate(blog.createAt)}</span>
          </div>
        </header>

        <div className="detail-image">
          <img 
            src={blog.imageBlogs && blog.imageBlogs.length > 0 ? blog.imageBlogs[0].image : "/blog1.jpg"} 
            alt={blog.title} 
          />
        </div>

        <article className="detail-content">
          {contentParagraphs.length > 0 ? (
            contentParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>{blog.content}</p>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;