
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { appointmentAPI } from '../../utils/api';


const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!appointmentId) {
      console.error('❌ No appointmentId provided in URL params');
      setError('Không có ID lịch hẹn được cung cấp.');
      setLoading(false);
      return;
    }
    
    console.log('🔍 Fetching appointment with ID:', appointmentId);
    setLoading(true);
    
    appointmentAPI.getAppointmentById(appointmentId)
      .then(res => {
        console.log('📋 Appointment details fetched:', JSON.stringify(res.data, null, 2));
        
        // Log specific details about services and payment
        const appointmentData = res.data;
        if (appointmentData && appointmentData.appointmentDetails && appointmentData.appointmentDetails.length > 0) {
          console.log('🧪 Services:', appointmentData.appointmentDetails.map((d: any) => ({
            id: d.service?.serviceId,
            name: d.service?.servicesName,
            price: d.service?.price
          })));
        }
        if (appointmentData) {
          console.log('💰 Total amount:', appointmentData.totalAmount);
          console.log('💳 Payment status:', appointmentData.paymentStatus);
        }
        
        setAppointment(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error fetching appointment details:', error);
        setError('Không tìm thấy thông tin lịch hẹn.');
        setLoading(false);
      });
  }, [appointmentId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const getPaymentStatusText = () => {
    if (!appointment) return '';
    if (appointment.paymentStatus === 1 || appointment.paymentStatus === 2) return 'Đã thanh toán';
    if (appointment.paymentStatus === 0) return 'Chưa thanh toán';
    return 'Không xác định';
  };



  if (loading) {
    return <div className="success-page"><div className="success-container"><p>Đang tải thông tin lịch hẹn...</p></div></div>;
  }
  if (error) {
    return <div className="success-page"><div className="success-container"><p style={{color:'red'}}>{error}</p></div></div>;
  }

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
              <span className="appointment-id">#{appointment?.appointmentID}</span>
            </div>
            <div className="appointment-info">
              <div className="booking-info-grid">
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faCalendarCheck} className="info-icon" />
                    <span>Dịch vụ:</span>
                  </div>
                  <div className="booking-info-value">
                    {appointment?.appointmentDetails && appointment.appointmentDetails.length > 0 ? (
                      <div>
                        {appointment.appointmentDetails.map((detail: any, index: number) => (
                          <div key={index} style={{ 
                            marginBottom: index < appointment.appointmentDetails.length - 1 ? '8px' : '0',
                            display: 'flex', 
                            alignItems: 'center'
                          }}>
                            {detail.service?.serviceType === 1 || 
                              (detail.service?.servicesName?.toLowerCase().includes('xét nghiệm') || 
                               detail.service?.servicesName?.toLowerCase().includes('test') || 
                               detail.service?.servicesName?.toLowerCase().includes('sti')) ? (
                              <span style={{ marginRight: '5px', color: '#8b5cf6' }}>🧪</span>
                            ) : (
                              <span style={{ marginRight: '5px', color: '#3b82f6' }}>👨‍⚕️</span>
                            )}
                            {detail.service?.servicesName || 'Chưa xác định'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      'Chưa xác định'
                    )}
                  </div>
                </div>
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faUser} className="info-icon" />
                    <span>Bác sĩ tư vấn:</span>
                  </div>
                  <div className="booking-info-value">{appointment?.consultant?.name || 'Chưa xác định'}</div>
                </div>
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faCalendarCheck} className="info-icon" />
                    <span>Ngày khám:</span>
                  </div>
                  <div className="booking-info-value">{appointment?.appointmentDate ? formatDate(appointment.appointmentDate) : 'Chưa xác định'}</div>
                </div>
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faClock} className="info-icon" />
                    <span>Giờ khám:</span>
                  </div>
                  <div className="booking-info-value">{
                    appointment?.slot?.startTime 
                      ? new Date(appointment.slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
                        ' - ' + 
                        new Date(appointment.slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : 'Chưa xác định'
                  }</div>
                </div>
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faUser} className="info-icon" />
                    <span>Họ tên:</span>
                  </div>
                  <div className="booking-info-value">{appointment?.customer?.name || 'Chưa xác định'}</div>
                </div>
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faPhone} className="info-icon" />
                    <span>Số điện thoại:</span>
                  </div>
                  <div className="booking-info-value">{appointment?.customer?.phone || 'Chưa xác định'}</div>
                </div>
                {appointment?.customer?.email && (
                  <div className="booking-info-item">
                    <div className="booking-info-label">
                      <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                      <span>Email:</span>
                    </div>
                    <div className="booking-info-value">{appointment.customer.email}</div>
                  </div>
                )}
                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="info-icon" />
                    <span>Phí dịch vụ:</span>
                  </div>
                  <div className="booking-info-value price" style={{ color: '#10b981', fontWeight: 'bold' }}>{appointment?.totalAmount ? appointment.totalAmount.toLocaleString('vi-VN') + ' VNĐ' : 'Chưa xác định'}</div>
                </div>

                <div className="booking-info-item">
                  <div className="booking-info-label">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="info-icon" />
                    <span>Trạng thái thanh toán:</span>
                  </div>
                  <div className="booking-info-value" style={{
                    color: appointment?.paymentStatus === 1 || appointment?.paymentStatus === 2 ? 'var(--success-color)' : 'var(--accent-color)'
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