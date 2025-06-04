import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmBooking.css';

interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
}

interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface LocationState {
  service: Service;
  date: string;
  time: string;
  personal: PersonalInfo;
}

const SuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="success-modal">
      <div className="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="success-title">Đặt Lịch Thành Công!</h2>
      <p className="success-message">
        Cảm ơn bạn đã đặt lịch khám.
      </p>
      <button className="success-button" onClick={onClose}>
        Hoàn Tất
      </button>
    </div>
  </div>
);

const ConfirmBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect to booking if accessed directly
  if (!state) {
    navigate('/booking');
    return null;
  }

  const { service, date, time, personal } = state;

  const handleFinalConfirm = () => {
    // Here you would typically make an API call to save the booking
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/');  // Navigate to home page after successful booking
  };

  return (
    <div className="confirm-page">
      <div className="confirm-container">
        <header className="confirm-header">
          <h1>Xác Nhận Lịch Khám</h1>
          <p>Vui lòng kiểm tra thông tin đặt lịch trước khi xác nhận</p>
        </header>

        <div className="confirm-grid">
          {/* Service & Schedule Details */}
          <div className="confirm-card">
            <h3 className="confirm-card-title">Thông Tin Dịch Vụ</h3>
            <div className="confirm-item">
              <span className="label">Dịch vụ:</span>
              <span className="value">{service.name}</span>
            </div>
            <div className="confirm-item">
              <span className="label">Thời gian:</span>
              <span className="value">{service.duration}</span>
            </div>
            <div className="confirm-item">
              <span className="label">Giá:</span>
              <span className="value">{service.price}</span>
            </div>
            <hr />
            <h3 className="confirm-card-title">Lịch Hẹn</h3>
            <div className="confirm-item">
              <span className="label">Ngày:</span>
              <span className="value">{date}</span>
            </div>
            <div className="confirm-item">
              <span className="label">Giờ:</span>
              <span className="value">{time}</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="confirm-card">
            <h3 className="confirm-card-title">Thông Tin Cá Nhân</h3>
            <div className="confirm-item">
              <span className="label">Họ và tên:</span>
              <span className="value">{personal.name}</span>
            </div>
            <div className="confirm-item">
              <span className="label">Điện thoại:</span>
              <span className="value">{personal.phone}</span>
            </div>
            {personal.email && (
              <div className="confirm-item">
                <span className="label">Email:</span>
                <span className="value">{personal.email}</span>
              </div>
            )}
            {personal.notes && (
              <div className="confirm-item">
                <span className="label">Ghi chú:</span>
                <span className="value">{personal.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="confirm-actions">
          <button className="btn-edit" onClick={() => navigate('/booking')}>
            Chỉnh Sửa
          </button>
          <button className="btn-confirm" onClick={handleFinalConfirm}>
            Xác Nhận Đặt Lịch
          </button>
        </div>
      </div>

      {showSuccessModal && <SuccessModal onClose={handleSuccessClose} />}
    </div>
  );
};

export default ConfirmBooking;