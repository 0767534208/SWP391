import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileMedical, 
  faCalendarCheck, 
  faCreditCard, 
  faUniversity, 
  faMoneyBillWave, 
  faSpinner, 
  faLock,
  faUser,
  faClock,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

interface PaymentProps {}

const Payment: React.FC<PaymentProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');
  
  // Get booking data from location state
  const bookingData = location.state || {
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
    appointmentId: null
  };

  // Format booking price (remove VNĐ and dots)
  const formatPrice = (price: string) => {
    return parseInt(price.replace(/\./g, '').replace(' VNĐ', ''));
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  // Handle payment submission
  const handlePayment = () => {
    setIsLoading(true);
    
    // Different handling based on payment method
    setTimeout(() => {
      if (paymentMethod === 'vnpay') {
        // In a real implementation, you would pass the appointmentId to the payment service
        // Redirect to VNPay payment page (in real implementation)
        redirectToVNPayPaymentPage(bookingData.appointmentId);
      } else if (paymentMethod === 'banking') {
        // For bank transfer, show banking information and redirect to success page
        navigate('/payment-success', { 
          state: { 
            ...bookingData,
            paymentMethod,
            transactionId: generateTransactionId(),
            isPaid: false,
            paymentStatus: 'pending'
          } 
        });
      } else if (paymentMethod === 'cash') {
        // For cash payment, mark as unpaid and redirect to success page
        navigate('/payment-success', { 
          state: { 
            ...bookingData,
            paymentMethod,
            isPaid: false,
            paymentStatus: 'pending'
          } 
        });
      }
    }, 1500);
  };

  // Mock function to redirect to VNPay
  const redirectToVNPayPaymentPage = (appointmentId?: string) => {
    // In a real implementation, your backend would create a payment URL
    // and you would redirect the user to that URL
    // Include the appointmentId in the payment process if available
    const paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+dich+vu";
    const urlWithAppointment = appointmentId ? 
      `${paymentUrl}&vnp_OrderType=250000&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fpayment-success&vnp_TmnCode=DEMO&vnp_TxnRef=${appointmentId}&vnp_Version=2.1.0&vnp_SecureHash=18ee1aedaad3d07d9a19fe1187752a3adb8700bf5019b9bc1aacfaf7d1ae8d0a` :
      `${paymentUrl}&vnp_OrderType=250000&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fpayment-success&vnp_TmnCode=DEMO&vnp_TxnRef=1234567890&vnp_Version=2.1.0&vnp_SecureHash=18ee1aedaad3d07d9a19fe1187752a3adb8700bf5019b9bc1aacfaf7d1ae8d0a`;
    
    window.location.href = urlWithAppointment;
  };

  // Generate a random transaction ID
  const generateTransactionId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
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

  // Get secure note text based on payment method
  const getSecureNoteText = () => {
    switch(paymentMethod) {
      case 'vnpay':
        return 'Thanh toán an toàn và bảo mật qua VNPay';
      case 'banking':
        return 'Thanh toán an toàn qua chuyển khoản ngân hàng';
      case 'cash':
        return 'Thanh toán tại cơ sở y tế';
      default:
        return 'Thanh toán an toàn và bảo mật';
    }
  };

  // Get button text based on payment method
  const getButtonText = () => {
    if (isLoading) {
      return 'Đang xử lý...';
    }
    
    if (paymentMethod === 'cash') {
      return 'Hoàn tất đặt lịch';
    }
    
    return 'Thanh toán ngay';
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <header className="payment-header">
          <h1>Thanh Toán</h1>
          <p>Hoàn tất quá trình đặt lịch của bạn</p>
        </header>

        <div className="payment-grid">
          <div className="payment-details">
            <div className="booking-summary">
              <h3>Thông Tin Đặt Lịch</h3>
              <div className="summary-card">
                <div className="booking-info-grid">
                  <div className="booking-info-item">
                    <div className="booking-info-label">
                      <FontAwesomeIcon icon={faFileMedical} className="info-icon" />
                      <span>Dịch vụ:</span>
                    </div>
                    <div className="booking-info-value">{bookingData.service.name}</div>
                  </div>
                  
                  {bookingData.consultant && (
                    <div className="booking-info-item">
                      <div className="booking-info-label">
                        <FontAwesomeIcon icon={faUser} className="info-icon" />
                        <span>Bác sĩ tư vấn:</span>
                      </div>
                      <div className="booking-info-value">{bookingData.consultant.name}</div>
                    </div>
                  )}
                  
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
                </div>
              </div>
            </div>

            <div className="payment-methods">
              <h3>Phương Thức Thanh Toán</h3>
              <div className="methods-container">
                <div 
                  className={`payment-method ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('vnpay')}
                >
                  <div className="method-logo">
                    <img src="/images/vnpay-logo.png" alt="VNPay" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png';
                      }}
                    />
                  </div>
                  <div className="method-info">
                    <h4>VNPay</h4>
                    <p>Thanh toán qua VNPay</p>
                  </div>
                </div>

                <div 
                  className={`payment-method ${paymentMethod === 'banking' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('banking')}
                >
                  <div className="method-logo banking">
                    <img src="/images/banking-logo.png" alt="Chuyển khoản ngân hàng" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2168/2168748.png';
                      }}
                    />
                  </div>
                  <div className="method-info">
                    <h4>Chuyển khoản ngân hàng</h4>
                    <p>Thanh toán qua chuyển khoản</p>
                  </div>
                </div>

                <div 
                  className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('cash')}
                >
                  <div className="method-logo cash">
                    <img src="/images/cash-logo.png" alt="Tiền mặt" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png';
                      }}
                    />
                  </div>
                  <div className="method-info">
                    <h4>Tiền mặt</h4>
                    <p>Thanh toán tại cơ sở y tế</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-summary">
            <h3>Tổng Thanh Toán</h3>
            <div className="summary-card payment-card">
              <div className="price-item">
                <span className="price-label">
                  <FontAwesomeIcon icon={faFileMedical} /> Phí dịch vụ
                </span>
                <span className="price-value">{bookingData.service.price}</span>
              </div>
              <div className="price-item">
                <span className="price-label">
                  <FontAwesomeIcon icon={faCalendarCheck} /> Phí đặt lịch
                </span>
                <span className="price-value">0 VNĐ</span>
              </div>
              <div className="divider"></div>
              <div className="price-total">
                <span className="total-label">Tổng cộng</span>
                <span className="total-value">{bookingData.service.price}</span>
              </div>

              <button 
                className="payment-button" 
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> {getButtonText()}</>
                ) : (
                  <>{paymentMethod === 'vnpay' ? <FontAwesomeIcon icon={faCreditCard} /> : 
                     paymentMethod === 'banking' ? <FontAwesomeIcon icon={faUniversity} /> : 
                     <FontAwesomeIcon icon={faMoneyBillWave} />} {getButtonText()}</>
                )}
              </button>
              
              <div className="secure-note">
                <FontAwesomeIcon icon={faLock} className="secure-icon" />
                <span>{getSecureNoteText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 