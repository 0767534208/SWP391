import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
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
        <div className="features-grid">
          <div className="feature-card service-card">
            <img src="/blog-3.png" alt="Xét nghiệm STI" className="service-card-image" />
            <h3>Xét nghiệm STI</h3>
            <p>Dịch vụ xét nghiệm toàn diện cho các bệnh lây truyền qua đường tình dục</p>
            <div className="service-details">
              <span className="duration">45 phút</span>
              <span className="price">1.200.000 VND</span>
            </div>
            <Link to="/booking" className="service-link">Đặt lịch ngay</Link>
          </div>
          <div className="feature-card service-card">
            <img src="/tu van suc khoe.png" alt="Tư vấn sức khỏe" className="service-card-image" />
            <h3>Tư vấn sức khỏe</h3>
            <p>Tư vấn trực tiếp với bác sĩ chuyên khoa về các vấn đề sức khỏe sinh sản</p>
            <div className="service-details">
              <span className="duration">60 phút</span>
              <span className="price">800.000 VND</span>
            </div>
            <Link to="/booking" className="service-link">Đặt lịch ngay</Link>
          </div>
          <div className="feature-card service-card">
            <img src="/blog-2.png" alt="Sức khỏe sinh sản" className="service-card-image" />
            <h3>Sức khỏe sinh sản</h3>
            <p>Khám và tư vấn toàn diện về sức khỏe sinh sản và kế hoạch hóa gia đình</p>
            <div className="service-details">
              <span className="duration">60 phút</span>
              <span className="price">900.000 VND</span>
            </div>
            <Link to="/booking" className="service-link">Đặt lịch ngay</Link>
          </div>
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