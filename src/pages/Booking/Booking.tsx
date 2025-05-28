import React, { useState, useEffect } from 'react';
import './Booking.css';

const Booking = () => {
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
      name: 'STI Testing',
      duration: '45 min',
      price: '$50'
    },
    {
      id: 2,
      name: 'Consultation',
      duration: '60 min',
      price: '$75'
    },
    {
      id: 3,
      name: 'Reproductive Health',
      duration: '60 min',
      price: '$80'
    }
  ];

  const handlePersonalDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Set locale for date picker
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.setAttribute('lang', 'en-US');
    });
  }, []);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <header className="booking-header">
          <h1>Book an Appointment</h1>
          <p>Schedule your visit to our healthcare center</p>
        </header>

        {/* Main Grid */}
        <div className="booking-grid">
          {/* Left Column: Service & Date/Time */}
          <section className="booking-sidebar">
            {/* Select service */}
            <div className="form-section">
              <h3>Select Service</h3>
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
                        {selectedService === service.id && (
                          <span className="checkmark">✓</span>
                        )}
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

            {/* Select date and time */}
            <div className="form-section">
              <h3>Select Date & Time</h3>
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

          {/* Right Column: Personal Information & Submit */}
          <section className="booking-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={personalDetails.name}
                    onChange={handlePersonalDetails}
                    placeholder="Enter your full name"
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={personalDetails.phone}
                    onChange={handlePersonalDetails}
                    placeholder="Enter your phone number"
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
                    placeholder="Enter your email address"
                    required
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={personalDetails.notes}
                    onChange={handlePersonalDetails}
                    placeholder="Additional information or special requests"
                    className="form-input notes"
                  />
                </div>
              </div>
            </div>

            <button
              className="booking-submit"
              disabled={
                !selectedDate ||
                !selectedTime ||
                selectedService === null ||
                !personalDetails.name ||
                !personalDetails.phone
              }
            >
              Confirm Booking
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Booking;