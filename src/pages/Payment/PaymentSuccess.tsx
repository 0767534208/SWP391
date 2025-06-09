import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

interface PaymentSuccessProps {}

const PaymentSuccess: React.FC<PaymentSuccessProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get payment data from location state
  const paymentData = location.state || {
    service: {
      name: 'Xét nghiệm & Tư vấn HIV',
      price: '300.000 VNĐ',
    },
    date: '2023-06-15',
    time: '10:00',
    consultant: null,
    personal: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      email: 'example@gmail.com',
    },
    paymentMethod: 'vnpay',
    transactionId: '123456789',
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

  // Format payment method name
  const formatPaymentMethod = (method: string) => {
    switch(method) {
      case 'vnpay':
        return 'VNPay';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      case 'cash':
        return 'Tiền mặt';
      default:
        return method;
    }
  };

  // Get title and message based on payment method
  const getSuccessTitle = () => {
    if (paymentData.paymentMethod === 'cash') {
      return 'Đặt Lịch Thành Công!';
    }
    
    if (paymentData.paymentMethod === 'banking' && paymentData.paymentStatus === 'pending') {
      return 'Thanh Toán Thành Công!';
    }
    
    return 'Thanh Toán Thành Công!';
  };
  
  const getSuccessMessage = () => {
    if (paymentData.paymentMethod === 'cash') {
      return 'Cảm ơn bạn đã đặt lịch khám. Vui lòng thanh toán tại cơ sở y tế khi đến khám.';
    }
    
    if (paymentData.paymentMethod === 'banking' && paymentData.paymentStatus === 'pending') {
      return 'Cảm ơn bạn đã đặt lịch khám. Vui lòng hoàn tất thanh toán chuyển khoản trong vòng 24 giờ để xác nhận lịch hẹn.';
    }
    
    return 'Cảm ơn bạn đã đặt lịch khám. Thông tin chi tiết về lịch hẹn đã được gửi qua email.';
  };

  // Generate random appointment ID
  const appointmentId = `APT-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`;

  // If no payment data is available, redirect to booking page
  useEffect(() => {
    if (!location.state) {
      setTimeout(() => {
        navigate('/booking');
      }, 3000);
    }
  }, [location.state, navigate]);

  // Handle return to home
  const handleReturnHome = () => {
    navigate('/');
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    // In a real implementation, this would generate and download a PDF receipt
    alert('Chức năng tải hóa đơn sẽ được triển khai trong phiên bản sau.');
  };

  // Determine payment status display
  const getPaymentStatusDisplay = () => {
    if (paymentData.paymentMethod === 'cash') {
      return 'Chưa thanh toán (Thanh toán tại cơ sở)';
    }
    
    if (paymentData.paymentMethod === 'banking' && paymentData.paymentStatus === 'pending') {
      return 'Đang chờ thanh toán';
    }
    
    return 'Đã thanh toán';
  };

  // Show bank account info for banking method with pending status
  const showBankingInfo = paymentData.paymentMethod === 'banking' && paymentData.paymentStatus === 'pending';

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="success-title">{getSuccessTitle()}</h1>
        <p className="success-message">
          {getSuccessMessage()}
        </p>

        <div className="appointment-details">
          <div className="appointment-card">
            <div className="appointment-header">
              <h3>Thông Tin Lịch Hẹn</h3>
              <span className="appointment-id">{appointmentId}</span>
            </div>

            <div className="appointment-info">
              <div className="info-item">
                <span className="info-label">Dịch vụ:</span>
                <span className="info-value">{paymentData.service.name}</span>
              </div>
              
              {paymentData.consultant && (
                <div className="info-item">
                  <span className="info-label">Bác sĩ tư vấn:</span>
                  <span className="info-value">{paymentData.consultant.name}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Ngày khám:</span>
                <span className="info-value">{formatDate(paymentData.date)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Giờ khám:</span>
                <span className="info-value">{paymentData.time}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Phương thức thanh toán:</span>
                <span className="info-value">{formatPaymentMethod(paymentData.paymentMethod)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Trạng thái thanh toán:</span>
                <span className="info-value">{getPaymentStatusDisplay()}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Số tiền:</span>
                <span className="info-value price">{paymentData.service.price}</span>
              </div>
              
              {paymentData.transactionId && (
                <div className="info-item">
                  <span className="info-label">Mã giao dịch:</span>
                  <span className="info-value">{paymentData.transactionId}</span>
                </div>
              )}
            </div>

            {showBankingInfo && (
              <div className="banking-info">
                <h4>Thông tin thanh toán chuyển khoản:</h4>
                <div className="bank-details">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số tài khoản:</strong> 1234567890</p>
                  <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH Y TẾ ABC</p>
                  <p><strong>Nội dung CK:</strong> {appointmentId} {paymentData.personal.name}</p>
                </div>
              </div>
            )}

            <div className="appointment-footer">
              <div className="qr-code">
                <div className="qr-placeholder">
                  <span>Mã QR</span>
                </div>
                <p>Quét mã QR để xem chi tiết lịch hẹn</p>
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
          <button className="secondary-button" onClick={handleDownloadReceipt}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải hóa đơn
          </button>
          <button className="primary-button" onClick={handleReturnHome}>
            Trở về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 