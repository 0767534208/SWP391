import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const ConfirmBooking: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // Nếu không có state (người dùng truy cập trực tiếp), chuyển về /booking
  if (!state) {
    navigate('/booking');
    return null;
  }

  const { service, date, time, personal } = state;

  const handleFinalConfirm = () => {
    // Ví dụ: gọi API lưu booking
    // Khi thành công:
    alert(t('confirmBooking.alert.success', { name: personal.name, service: service.name }));
    navigate('/booking');
  };


  return (
    <div className="confirm-page">
      <div className="confirm-container">
        {/* Header */}
        <header className="confirm-header">
          <h1>{t('confirmBooking.title')}</h1>
          <p>{t('confirmBooking.subtitle')}</p>
        </header>

        {/* Thông tin được chia làm hai cột */}
        <div className="confirm-grid">
          {/* Cột trái: Dịch vụ & Ngày/giờ */}
          <div className="confirm-card">
            <h3 className="confirm-card-title">{t('confirmBooking.serviceSection')}</h3>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.service')}:</span>
              <span className="value">{service.name}</span>
            </div>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.duration')}:</span>
              <span className="value">{service.duration}</span>
            </div>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.price')}:</span>
              <span className="value">{service.price}</span>
            </div>
            <hr />
            <h3 className="confirm-card-title">{t('confirmBooking.dateSection')}</h3>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.date')}:</span>
              <span className="value">{date}</span>
            </div>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.time')}:</span>
              <span className="value">{time}</span>
            </div>
          </div>

          {/* Cột phải: Thông tin cá nhân */}
          <div className="confirm-card">
            <h3 className="confirm-card-title">{t('confirmBooking.personalSection')}</h3>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.name')}:</span>
              <span className="value">{personal.name}</span>
            </div>
            <div className="confirm-item">
              <span className="label">{t('confirmBooking.fields.phone')}:</span>
              <span className="value">{personal.phone}</span>
            </div>
            {personal.email && (
              <div className="confirm-item">
                <span className="label">{t('confirmBooking.fields.email')}:</span>
                <span className="value">{personal.email}</span>
              </div>
            )}
            {personal.notes && (
              <div className="confirm-item">
                <span className="label">{t('confirmBooking.fields.notes')}:</span>
                <span className="value">{personal.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hai nút ở cuối: Chỉnh sửa & Hoàn tất */}
        <div className="confirm-actions">
          <button className="btn-confirm" onClick={handleFinalConfirm}>
            {t('Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;