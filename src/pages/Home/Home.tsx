import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { serviceAPI, categoryAPI } from '../../utils/api';

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
  imageServices: string[];
}

interface CategoryData {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch services
        const serviceResponse = await serviceAPI.getServices();

        // Fetch categories
        const categoryResponse = await categoryAPI.getCategories();

        if (serviceResponse.statusCode === 200 && serviceResponse.data) {
          setServices(serviceResponse.data);
        } else {
          setError('Failed to fetch services');
        }

        if (categoryResponse.statusCode === 200 && categoryResponse.data) {
          setCategories(categoryResponse.data);
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
                  {service.imageServices && service.imageServices.length > 0 && (
                    <img
                      src={service.imageServices[0]}
                      alt={service.servicesName}
                    />
                  )}
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

            {/* Always show the cycle tracker card */}
            <div className="feature-card service-card">
              <img src="/bang_tinh_chu_ky_kinh_nguyet_va_thoi_diem_rung_trung.jpg" alt="Theo dõi chu kỳ" className="service-card-image" />
              <h3>Theo dõi chu kỳ</h3>
              <p>Công cụ theo dõi chu kỳ kinh nguyệt và dự đoán thời kỳ rụng trứng</p>
              <div className="service-details">
                <span className="price">Miễn phí</span>
              </div>
              <Link to="/cycletracker" className="service-link">Sử dụng ngay</Link>
            </div>
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
          <div className="blog-card">
            <img src="/blog-1.png" alt="Giáo dục giới tính cho thanh thiếu niên" />
            <h3>Giáo dục giới tính cho thanh thiếu niên</h3>
            <p>Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ.</p>
            <Link to="/blog/1" className="blog-link">Xem thêm</Link>
          </div>
          <div className="blog-card">
            <img src="/blog-2.png" alt="Hiểu về sức khỏe sinh sản" />
            <h3>Hiểu về sức khỏe sinh sản</h3>
            <p>Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn.</p>
            <Link to="/blog/2" className="blog-link">Xem thêm</Link>
          </div>
          <div className="blog-card">
            <img src="/blog-3.png" alt="Hướng dẫn phòng ngừa STI" />
            <h3>Hướng dẫn phòng ngừa STI</h3>
            <p>Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục.</p>
            <Link to="/blog/3" className="blog-link">Xem thêm</Link>
          </div>
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