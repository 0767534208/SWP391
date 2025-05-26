import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
 import { useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // thêm hook useNavigate
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [personalDetails, setPersonalDetails] = useState({
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
      name: t('booking.services.stis.name'),
      duration: t('booking.services.stis.duration'),
      price: t('booking.services.stis.price')
    },
    {
      id: 2,
      name: t('booking.services.consultation.name'),
      duration: t('booking.services.consultation.duration'),
      price: t('booking.services.consultation.price')
    },
    {
      id: 3,
      name: t('booking.services.reproductiveHealth.name'),
      duration: t('booking.services.reproductiveHealth.duration'),
      price: t('booking.services.reproductiveHealth.price')
    }
  ];

  const handlePersonalDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Đặt locale cho date picker
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.setAttribute('lang', 'en-US');
    });
  }, []);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
  };

 const handleConfirmClick = () => {
   if (
     !selectedDate ||
     !selectedTime ||
     selectedService === null ||
     !personalDetails.name ||
     !personalDetails.phone
   ) {
     return;
   }

   // Lấy đối tượng service đã chọn
   const serviceObj = services.find(s => s.id === selectedService);

   // Chuyển hướng kèm dữ liệu qua state
   navigate('/confirm-booking', {
     state: {
       service: serviceObj,
       date: selectedDate,
       time: selectedTime,
       personal: personalDetails
     }
   });
 };

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <header className="booking-header">
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.subtitle')}</p>
        </header>

        {/* Main Grid */}
        <div className="booking-grid">
          {/* Left Column: Service & Date/Time */}
          <section className="booking-sidebar">
            {/* Chọn dịch vụ */}
            <div className="form-section">
              <h3>{t('booking.selectService')}</h3>
              <div className="services-grid">
                {services.map(service => (
                  <div
                    key={service.id}
                    className={`service-card ${
                      selectedService === service.id ? 'selected' : ''
                    }`}
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

            {/* Chọn ngày giờ */}
            <div className="form-section">
              <h3>{t('booking.selectDateTime')}</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="date-picker"
                min={new Date().toISOString().split('T')[0]}
                lang="en-US"
              />
              <div className="time-slots">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`time-slot ${
                      selectedTime === time ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Thông tin cá nhân & Submit */}
          <section className="booking-form">
            <div className="form-section">
              <h3>{t('booking.personalInfo')}</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="name">{t('booking.form.fullName')}</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={personalDetails.name}
                    onChange={handlePersonalDetails}
                    placeholder={t('booking.form.fullNamePlaceholder')}
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">{t('booking.form.phone')}</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={personalDetails.phone}
                    onChange={handlePersonalDetails}
                    placeholder={t('booking.form.phonePlaceholder')}
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="email">{t('booking.form.email')}</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={personalDetails.email}
                    onChange={handlePersonalDetails}
                    placeholder={t('booking.form.emailPlaceholder')}
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="notes">{t('booking.form.notes')}</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={personalDetails.notes}
                    onChange={handlePersonalDetails}
                    placeholder={t('booking.form.notesPlaceholder')}
                    className="form-input notes"
                  />
                </div>
              </div>
            </div>

            <button
              className="booking-submit"
              onClick={handleConfirmClick}
              disabled={
                !selectedDate ||
                !selectedTime ||
                selectedService === null ||
                !personalDetails.name ||
                !personalDetails.phone
              }
            >
              {t('booking.form.confirmButton')}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Booking;