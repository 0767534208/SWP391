import React from 'react';
import ChatbotWidget from './ChatbotWidgetSimple';
import './ChatbotDemo.css';

const ChatbotWidgetDemo: React.FC = () => {
  return (
    <div className="chatbot-demo-container">
      <div className="demo-content">
        <h1>Chatbot Widget Demo</h1>
        <p className="demo-description">
          Chatbot widget đã được tích hợp vào hệ thống với đầy đủ tính năng API từ Swagger.
          Bạn có thể thấy icon chatbot ở góc dưới bên phải màn hình.
        </p>

        <div className="demo-features">
          <h2>Tính năng chính:</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Quản lý lịch hẹn</h3>
              <p>Xem, đặt và quản lý lịch hẹn tư vấn hoặc xét nghiệm</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Thông tin dịch vụ</h3>
              <p>Tìm hiểu về các dịch vụ và giá cả của phòng khám</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👩‍⚕️</div>
              <h3>Đội ngũ bác sĩ</h3>
              <p>Thông tin về các bác sĩ và tư vấn viên chuyên khoa</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3>Kết quả xét nghiệm</h3>
              <p>Xem và theo dõi kết quả xét nghiệm STI</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Theo dõi chu kỳ</h3>
              <p>Theo dõi và dự đoán chu kỳ kinh nguyệt</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Hỗ trợ thông minh</h3>
              <p>Tích hợp AI để trả lời câu hỏi một cách thông minh</p>
            </div>
          </div>
        </div>

        <div className="demo-instructions">
          <h2>Hướng dẫn sử dụng:</h2>
          <ol>
            <li>Click vào icon chatbot ở góc dưới bên phải</li>
            <li>Chọn câu hỏi gợi ý hoặc nhập câu hỏi của bạn</li>
            <li>Chatbot sẽ tự động kết nối với API để trả lời</li>
            <li>Có thể thực hiện các tác vụ như đặt lịch, xem thông tin</li>
          </ol>
        </div>

        <div className="demo-examples">
          <h2>Ví dụ câu hỏi:</h2>
          <div className="examples-list">
            <span className="example-badge">"Tôi muốn đặt lịch hẹn"</span>
            <span className="example-badge">"Xem thông tin dịch vụ và giá cả"</span>
            <span className="example-badge">"Theo dõi chu kỳ kinh nguyệt"</span>
            <span className="example-badge">"Xem kết quả xét nghiệm"</span>
            <span className="example-badge">"Thông tin bác sĩ tư vấn"</span>
          </div>
        </div>
      </div>

      {/* Chatbot Widget sẽ tự động hiển thị */}
      <ChatbotWidget />
    </div>
  );
};

export default ChatbotWidgetDemo;
