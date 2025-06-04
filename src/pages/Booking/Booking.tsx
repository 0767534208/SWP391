import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const services = [
    {
      id: 1,
      name: 'Xét nghiệm & Tư vấn HIV',
      duration: '30-45 phút',
      price: '300.000 VNĐ'
    },
    {
      id: 2,
      name: 'Kiểm tra STI toàn diện',
      duration: '1 giờ',
      price: '850.000 VNĐ'
    },
    {
      id: 3,
      name: 'Tư vấn sức khỏe tình dục',
      duration: '45-60 phút',
      price: '400.000 VNĐ'
    },
    {
      id: 4,
      name: 'Gói khám sức khỏe sinh sản',
      duration: '1.5 giờ',
      price: '1.200.000 VNĐ'
    },
    {
      id: 5,
      name: 'Tư vấn biện pháp tránh thai',
      duration: '30-45 phút',
      price: '350.000 VNĐ'
    },
    {
      id: 6,
      name: 'Tiêm vắc-xin HPV',
      duration: '15-20 phút',
      price: '1.500.000 VNĐ'
    },
    {
      id: 7,
      name: 'Gói chăm sóc thai sản',
      duration: '2 giờ (lần khám đầu)',
      price: '2.500.000 VNĐ'
    },
    {
      id: 8,
      name: 'Quản lý thời kỳ mãn kinh',
      duration: '45-60 phút',
      price: '500.000 VNĐ'
    }
  ];

  const handlePersonalDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
  };

  const handleSubmit = () => {
    if (!selectedService || !selectedDate || !selectedTime || !personalDetails.name || !personalDetails.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    if (!selectedServiceData) return;

    navigate('/confirm-booking', {
      state: {
        service: selectedServiceData,
        date: selectedDate,
        time: selectedTime,
        personal: personalDetails
      }
    });
  };

  useEffect(() => {
    // Set locale for date picker
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.setAttribute('lang', 'vi-VN');
    });
  }, []);

  return (
    <div className="booking-page">
      <div className="booking-container">
        <header className="booking-header">
          <h1>Đặt Lịch Khám</h1>
          <p>Đặt lịch tư vấn với đội ngũ y bác sĩ chuyên nghiệp của chúng tôi</p>
        </header>

        <div className="booking-grid">
          <div className="booking-sidebar">
            <div className="form-section">
              <h3>Chọn Dịch Vụ</h3>
              <div className="services-grid">
                {services.map(service => (
                  <div
                    key={service.id}
                    className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(service.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="service-info">
                      <div className="service-header">
                        <h4>{service.name}</h4>
                      </div>
                      <div className="service-details">
                        <span className="duration">{service.duration}</span>
                        <span className="price">{service.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Chọn Ngày & Giờ</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-picker"
                required
              />
              <div className="time-slots">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section className="booking-form">
            <div className="form-section">
              <h3>Thông Tin Cá Nhân</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="name">Họ và Tên</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={personalDetails.name}
                    onChange={handlePersonalDetails}
                    placeholder="Nhập họ và tên của bạn"
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Số Điện Thoại</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={personalDetails.phone}
                    onChange={handlePersonalDetails}
                    placeholder="Nhập số điện thoại của bạn"
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={personalDetails.email}
                    onChange={handlePersonalDetails}
                    placeholder="Nhập email của bạn"
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="notes">Ghi Chú Thêm</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={personalDetails.notes}
                    onChange={handlePersonalDetails}
                    placeholder="Bạn có yêu cầu đặc biệt hoặc vấn đề cần lưu ý không?"
                    className="form-input notes"
                  />
                </div>
              </div>
            </div>

            <button
              className="booking-submit"
              onClick={handleSubmit}
              disabled={!selectedService || !selectedDate || !selectedTime || !personalDetails.name || !personalDetails.phone}
            >
              Xác Nhận Đặt Lịch
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Booking;