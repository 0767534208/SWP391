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
      name: 'STIs Testing',
      duration: '60 min',
      price: '$100'
    },
    {
      id: 2,
      name: 'Health Consultation',
      duration: '30 min',
      price: '$50'
    },
    {
      id: 3,
      name: 'Reproductive Health Check',
      duration: '45 min',
      price: '$75'
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
      alert('Please fill in all required fields');
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
      input.setAttribute('lang', 'en-US');
    });
  }, []);

  return (
    <div className="booking-page">
      <div className="booking-container">
        <header className="booking-header">
          <h1>Schedule an Appointment</h1>
          <p>Book your consultation with our healthcare professionals</p>
        </header>

        <div className="booking-grid">
          <div className="booking-sidebar">
            <div className="form-section">
              <h3>Select Service</h3>
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
              <h3>Select Date & Time</h3>
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
                  <label htmlFor="phone">Phone Number</label>
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
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={personalDetails.notes}
                    onChange={handlePersonalDetails}
                    placeholder="Any specific concerns or requests?"
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
              Confirm Appointment
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Booking;