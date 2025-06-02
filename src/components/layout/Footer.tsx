import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Trung Tâm Sức Khỏe</h2>
          <p>Đối tác tin cậy của bạn trong lĩnh vực sức khỏe sinh sản và tình dục. Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện với trọng tâm là chất lượng và sự thoải mái của bệnh nhân.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Liên Kết Nhanh</h3>
          <ul className="footer-links">
            <li><Link to="/about">Về Chúng Tôi</Link></li>
            <li><Link to="/services">Dịch Vụ</Link></li>
            <li><Link to="/doctors">Đội Ngũ Bác Sĩ</Link></li>
            <li><Link to="/blog">Bài Viết & Tin Tức</Link></li>
            <li><Link to="/contact">Liên Hệ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Dịch Vụ Của Chúng Tôi</h3>
          <ul className="footer-links">
            <li><Link to="/services/consultation">Tư Vấn Sức Khỏe</Link></li>
            <li><Link to="/services/testing">Xét Nghiệm STI</Link></li>
            <li><Link to="/services/reproductive">Sức Khỏe Sinh Sản</Link></li>
            <li><Link to="/services/education">Giáo Dục Giới Tính</Link></li>
            <li><Link to="/services/counseling">Tư Vấn Sức Khỏe</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-contact">
        <div className="contact-container">
          <h3>Thông Tin Liên Hệ</h3>
          <div className="contact-info">
            <p><FaMapMarkerAlt /> 123 Đường Sức Khỏe, Thành Phố, Việt Nam</p>
            <p><FaPhone /> +84 234 567 890</p>
            <p><FaEnvelope /> lienhe@trungtsamsuckhoe.com</p>
            <p><FaClock /> Thứ 2 - Thứ 6: 8:00 - 20:00</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 Trung Tâm Sức Khỏe. Đã đăng ký bản quyền.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Chính Sách Bảo Mật</Link>
          <Link to="/terms">Điều Khoản Dịch Vụ</Link>
          <Link to="/sitemap">Sơ Đồ Website</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 