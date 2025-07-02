import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentSuccess.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faHome, 
  faCheckCircle, 
  faUser, 
  faClock, 
  faPhone,
  faEnvelope,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from location state
  const bookingData = location.state || {
    service: {
      name: 'Xét nghiệm & Tư vấn HIV',
      price: '200.000 VNĐ',
    },
    date: '2023-06-15',
    time: '10:00',
    consultant: { name: 'Bác sĩ Nguyễn Văn A' },
    personal: {
      name: 'Nguyễn Văn B',
      phone: '0987654321',
      email: 'example@gmail.com',
    },
    paymentMethod: 'vnpay',
    isPaid: true,
    paymentStatus: 'completed'
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Handle return to home
  const handleReturnHome = () => {
    navigate('/');
  };

  // Get payment status text
  const getPaymentStatusText = () => {
    if (bookingData.isPaid) {
      return "Đã thanh toán";
    } else if (bookingData.paymentMethod === 'cash') {
      return "Thanh toán tại cơ sở y tế";
    } else {
      return "Đang chờ thanh toán";
    }
  };

  // Get payment method text
  const getPaymentMethodText = () => {
    switch(bookingData.paymentMethod) {
      case 'vnpay': return 'VNPay';
      case 'banking': return 'Chuyển khoản ngân hàng';
      case 'cash': return 'Tiền mặt';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>

        <h1 className="success-title">Đặt Lịch Thành Công!</h1>
        <p className="success-message">
          Cảm ơn bạn đã đặt lịch khám. Thông tin chi tiết về lịch hẹn đã được gửi qua email của bạn.
        </p>

        <div className="appointment-details">
          <div className="appointment-card">
            <div className="appointment-header">
              <h3>Thông Tin Lịch Hẹn</h3>
              <span className="appointment-id">#{Math.floor(Math.random() * 10000)}</span>
            </div>

            <div className="appointment-info">
              <div className="booking-info-grid">
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faCalendarCheck} className="info-icon" />
                    <span>Dịch vụ:</span>
                  </div>
                  <div className="booking-info-value">{bookingData.service.name}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faUser} className="info-icon" />
                    <span>Bác sĩ tư vấn:</span>
                  </div>
                  <div className="booking-info-value">{bookingData.consultant?.name || 'Chưa xác định'}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faCalendarCheck} className="info-icon" />
                    <span>Ngày khám:</span>
                  </div>
                  <div className="booking-info-value">{formatDate(bookingData.date)}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faClock} className="info-icon" />
                    <span>Giờ khám:</span>
                  </div>
                  <div className="booking-info-value">{bookingData.time}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faUser} className="info-icon" />
                    <span>Họ tên:</span>
                  </div>
                  <div className="booking-info-value">{bookingData.personal.name}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faPhone} className="info-icon" />
                    <span>Số điện thoại:</span>
                  </div>
                  <div className="booking-info-value">{bookingData.personal.phone}</div>
                </div>
                
                {bookingData.personal.email && (
                  <div className="booking-info-item">
                    <div className="booking-info-label">
                      <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                      <span>Email:</span>
                    </div>
                    <div className="booking-info-value">{bookingData.personal.email}</div>
                  </div>
                )}
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="info-icon" />
                    <span>Phí dịch vụ:</span>
                  </div>
                  <div className="booking-info-value price">{bookingData.service.price}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="info-icon" />
                    <span>Phương thức thanh toán:</span>
                  </div>
                  <div className="booking-info-value">{getPaymentMethodText()}</div>
                </div>
                
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="info-icon" />
                    <span>Trạng thái thanh toán:</span>
                  </div>
                  <div className="booking-info-value" style={{ 
                    color: bookingData.isPaid ? 'var(--success-color)' : 'var(--accent-color)'
                  }}>
                    {getPaymentStatusText()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reminder-notes">
            <h4>Lưu ý:</h4>
            <ul>
              <li>Vui lòng đến trước giờ hẹn 15 phút để hoàn tất thủ tục.</li>
              <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có).</li>
              <li>Nếu có thay đổi lịch hẹn, vui lòng liên hệ trước 24 giờ.</li>
              <li>Số điện thoại hỗ trợ: <strong>1900 1234</strong></li>
            </ul>
          </div>
        </div>

        <div className="action-buttons">
          <button className="primary-button" onClick={handleReturnHome}>
            <FontAwesomeIcon icon={faHome} /> Trở về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 