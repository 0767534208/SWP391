import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmBooking.css';
import { getAppointmentsByCustomerId, getAppointmentPaymentUrl } from '../../utils/api';

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
  price?: number | string;
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
  appointmentId?: string;
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

  // Debug: log state và các trường liên quan
  console.log('ConfirmBooking state:', state);
  const { service, consultant, date, time, personal, appointmentId } = state;

  // Lấy appointmentId từ state, nếu không có thì lấy từ localStorage, nếu vẫn không có thì gọi API lấy cuộc hẹn mới nhất có paymentStatus=0
  const [realAppointmentId, setRealAppointmentId] = useState<string | null>(appointmentId || null);
  React.useEffect(() => {
    if (appointmentId) {
      setRealAppointmentId(appointmentId);
      return;
    }
    const localId = localStorage.getItem('lastAppointmentId');
    if (localId && localId !== 'undefined') {
      setRealAppointmentId(localId);
      console.log('Lấy appointmentId từ localStorage:', localId);
      return;
    }
    // Nếu vẫn không có, lấy customerID từ localStorage
    const userData = localStorage.getItem('user');
    let customerId = '';
    if (userData) {
      try {
        const user = JSON.parse(userData);
        customerId = user.customerID || user.userID || '';
      } catch {}
    }
    if (customerId) {
      // Gọi API lấy danh sách cuộc hẹn của khách hàng
      getAppointmentsByCustomerId(customerId)
        .then(data => {
          if (data && data.data && Array.isArray(data.data)) {
            // Lấy appointmentID có paymentStatus=0 mới nhất
            const unpaid = data.data.filter((a: any) => a.paymentStatus === 0);
            if (unpaid.length > 0) {
              // Sắp xếp theo createAt giảm dần nếu có
              unpaid.sort((a: any, b: any) => new Date(b.createAt || b.appointmentDate).getTime() - new Date(a.createAt || a.appointmentDate).getTime());
              setRealAppointmentId(unpaid[0].appointmentID?.toString() || '');
              console.log('Lấy appointmentId từ API:', unpaid[0].appointmentID);
            }
          }
        });
    }
  }, [appointmentId]);

  const handleFinalConfirm = async () => {
    // Lấy giá trị mới nhất của realAppointmentId
    const appointmentIdToUse = realAppointmentId;
    if (!appointmentIdToUse || appointmentIdToUse === 'undefined') {
      alert('Không tìm thấy mã lịch hẹn. Vui lòng đặt lại lịch hoặc liên hệ hỗ trợ.');
      return;
    }
    try {
      // Gọi API lấy link thanh toán
      const data: any = await getAppointmentPaymentUrl(appointmentIdToUse);
      // Ưu tiên lấy link nếu trả về trực tiếp là string (raw response body)
      if (typeof data === 'string' && data.startsWith('http')) {
        window.location.href = data;
      } else if (data && typeof data.data === 'string' && data.data.startsWith('http')) {
        window.location.href = data.data;
      } else if (data && data.data && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else if (data && (data as any).paymentUrl) {
        window.location.href = (data as any).paymentUrl;
      } else {
        alert('Không nhận được link thanh toán từ hệ thống.');
      }
    } catch (err) {
      alert('Có lỗi khi lấy link thanh toán.');
    }
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
              <span className="value">
                {(() => {
                  const servicePrice = Number(service.price.toString().replace(/[^\d]/g, '')) || 0;
                  const consultantPrice = consultant && consultant.price ? Number(consultant.price.toString().replace(/[^\d]/g, '')) : 0;
                  const total = servicePrice + consultantPrice;
                  return total > 0 ? total.toLocaleString('vi-VN') + ' VNĐ' : service.price;
                })()}
              </span>
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
          Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;