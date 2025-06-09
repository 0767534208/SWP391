import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmBooking.css';

interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  requiresConsultant: boolean;
}

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  year: number;
}

interface Consultant {
  id: number;
  name: string;
  specialty: string;
  image: string;
  education: string;
  experience: string;
  certificates: Certificate[];
  schedule: {
    [key: string]: Array<{ start: string; end: string }>;
  };
}

interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface LocationState {
  service: Service;
  consultant: Consultant | null;
  date: string;
  time: string;
  personal: PersonalInfo;
}

const ConfirmBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // Redirect to booking if accessed directly
  if (!state) {
    navigate('/booking');
    return null;
  }

  const { service, consultant, date, time, personal } = state;

  const handleFinalConfirm = () => {
    // Navigate to payment page with booking details
    navigate('/payment', { state });
  };

  // Format date to display in Vietnamese format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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
            
            {consultant && (
              <>
                <hr />
                <h3 className="confirm-card-title">Tư Vấn Viên</h3>
                <div className="confirm-consultant">
                  <div className="confirm-consultant-info">
                    <div className="confirm-item">
                      <span className="value consultant-name">{consultant.name}</span>
                    </div>
                    <div className="confirm-item">
                      <span className="value consultant-specialty">{consultant.specialty}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <hr />
            <h3 className="confirm-card-title">Lịch Hẹn</h3>
            <div className="confirm-item">
              <span className="label">Ngày:</span>
              <span className="value">{formatDate(date)}</span>
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
            Tiếp tục thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;