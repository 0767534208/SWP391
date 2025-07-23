import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { serviceAPI, categoryAPI, blogAPI } from '../../utils/api';

interface ServiceData {
  servicesID: number;
  categoryID: number;
  category: string | null;
  servicesName: string;
  description: string;
  createAt: string;
  updateAt: string;
  servicesPrice: number;
  status: boolean;
  imageServices: { image: string }[];
}

interface CategoryData {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

interface BlogData {
  blogID: number;
  title: string;
  content: string;
  author: string;
  createAt: string;
  status: boolean;
  imageBlogs?: { image: string }[];
}

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //
  // Fetch services and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch services
        const serviceResponse = await serviceAPI.getServices();

        // Fetch categories
        const categoryResponse = await categoryAPI.getCategories();

        // Fetch blogs
        const blogResponse = await blogAPI.getBlogs();

        if (serviceResponse.statusCode === 200 && serviceResponse.data) {
          // Lọc chỉ lấy dịch vụ có status = true và sắp xếp theo thời gian tạo mới nhất
          const activeServices = serviceResponse.data.filter((service: ServiceData) => service.status === true);
          const sortedServices = [...activeServices].sort((a, b) => 
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          );
          setServices(sortedServices);
        } else {
          setError('Failed to fetch services');
        }

        if (categoryResponse.statusCode === 200 && categoryResponse.data) {
          setCategories(categoryResponse.data);
        }

        if (blogResponse.statusCode === 200 && blogResponse.data) {
          // Sắp xếp blog theo thời gian tạo mới nhất
          const sortedBlogs = [...blogResponse.data].sort((a, b) => 
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          );
          setBlogs(sortedBlogs);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.categoryID === categoryId);
    return category ? category.name : '';
  };

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'VNĐ');
  };

  const handleBookService = (serviceId: number) => {
    navigate('/booking', { state: { serviceId } });
  };

  // Get featured services (limit to 4)
  const featuredServices = services.slice(0, 4);

  // Get featured blogs (limit to 3)
  const featuredBlogs = blogs.slice(0, 3);

  // Xử lý khi click vào blog
  const handleBlogClick = (blogId: number) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <main className="home-main">
      <section className="hero-section">
        <div className="hero-image-container">
          <img src="/healthcare.png" alt="Dịch vụ y tế" className="hero-background-image" />
        </div>
        <div className="hero-content">
          <h1>Chăm Sóc Sức Khỏe Sinh Sản Toàn Diện</h1>
          <p>Đối tác tin cậy của bạn trong sức khỏe sinh sản và tình dục</p>
        </div>
      </section>

      <section className="features-section" id="services">
        <h2>Các dịch vụ y tế</h2>
        <div className="service-intro">
          <p>Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe sinh sản toàn diện với đội ngũ y bác sĩ chuyên nghiệp và trang thiết bị hiện đại.</p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dịch vụ...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>Có lỗi xảy ra khi tải dịch vụ. Vui lòng thử lại sau.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="features-grid">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <div key={service.servicesID} className="feature-card service-card">
                  <div className="service-image-container">
                    {service.imageServices && service.imageServices.length > 0 ? (
                      <img
                        src={service.imageServices[0].image}
                        alt={service.servicesName}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/healthcare.png"; // Fallback image
                        }}
                      />
                    ) : (
                      <img
                        src="/healthcare.png"
                        alt={service.servicesName}
                      />
                    )}
                  </div>
                  <h3>{service.servicesName}</h3>
                  <p>{service.description}</p>
                  <div className="service-category">{getCategoryName(service.categoryID)}</div>
                  <div className="service-details">
                    <span className="price">{formatPrice(service.servicesPrice)}</span>
                  </div>
                  <button
                    className="service-link"
                    onClick={() => handleBookService(service.servicesID)}
                  >
                    Đặt lịch ngay
                  </button>
                </div>
              ))
            ) : (
              <div className="no-services-found">
                <p>Không có dịch vụ nào.</p>
                <Link to="/services" className="view-all-services">
                  Xem tất cả dịch vụ
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="view-all-container">
          <Link to="/services" className="view-all-button">
            Xem tất cả dịch vụ
          </Link>
        </div>
      </section>

      <section className="blog-preview">
        <h2>Bài viết mới nhất</h2>
        <div className="blog-grid">
          {featuredBlogs.length > 0 ? (
            featuredBlogs.map((blog) => (
              <div key={blog.blogID} className="blog-card" onClick={() => handleBlogClick(blog.blogID)}>
                <div className="blog-image-container">
                  <img 
                    src={blog.imageBlogs && blog.imageBlogs.length > 0 ? blog.imageBlogs[0].image : "/blog-1.png"} 
                    alt={blog.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/blog-1.png"; // Fallback image
                    }}
                  />
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.content.substring(0, 100)}...</p>
                <div className="blog-link">Xem thêm</div>
              </div>
            ))
          ) : (
            <>
              <div className="blog-card" onClick={() => navigate('/blog/1')}>
                <div className="blog-image-container">
                  <img src="/blog-1.png" alt="Giáo dục giới tính cho thanh thiếu niên" />
                </div>
                <h3>Giáo dục giới tính cho thanh thiếu niên</h3>
                <p>Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ.</p>
                <div className="blog-link">Xem thêm</div>
              </div>
              <div className="blog-card" onClick={() => navigate('/blog/2')}>
                <div className="blog-image-container">
                  <img src="/blog-2.png" alt="Hiểu về sức khỏe sinh sản" />
                </div>
                <h3>Hiểu về sức khỏe sinh sản</h3>
                <p>Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn.</p>
                <div className="blog-link">Xem thêm</div>
              </div>
              <div className="blog-card" onClick={() => navigate('/blog/3')}>
                <div className="blog-image-container">
                  <img src="/blog-3.png" alt="Hướng dẫn phòng ngừa STI" />
                </div>
                <h3>Hướng dẫn phòng ngừa STI</h3>
                <p>Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục.</p>
                <div className="blog-link">Xem thêm</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* <section className="tools-section">
        <h2>Công cụ hữu ích</h2>
        <div className="tools-grid">
          <Link to="/cycletracker" className="tool-button">Theo dõi chu kỳ</Link>
          <Link to="/qna" className="tool-button">Hỏi đáp</Link>
          <Link to="/services" className="tool-button">Dịch vụ</Link>
          <Link to="/profile" className="tool-button">Kết quả xét nghiệm</Link>
        </div>
      </section> */}
    </main>
  );
};

export default Home;