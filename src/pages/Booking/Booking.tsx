import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import AdvisorModal from '../Booking/AdvisorModal';
import ServiceCard from '../../components/ServiceCard';

interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  [key: string]: TimeSlot[];
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
  ratings: number;
  education: string;
  experience: string;
  certificates: Certificate[];
  schedule: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
}

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);
  const [modalConsultant, setModalConsultant] = useState<Consultant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentServicePage, setCurrentServicePage] = useState(0);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Available time slots
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Services data
  const services = [
    {
      id: 1,
      name: 'Xét nghiệm & Tư vấn HIV',
      duration: '30-45 phút',
      price: '300.000 VNĐ',
      requiresConsultant: false
    },
    {
      id: 2,
      name: 'Kiểm tra STI toàn diện',
      duration: '1 giờ',
      price: '850.000 VNĐ',
      requiresConsultant: false
    },
    {
      id: 3,
      name: 'Tư vấn sức khỏe tình dục',
      duration: '45-60 phút',
      price: '400.000 VNĐ',
      requiresConsultant: true
    },
    {
      id: 4,
      name: 'Gói khám sức khỏe sinh sản',
      duration: '1.5 giờ',
      price: '1.200.000 VNĐ',
      requiresConsultant: false
    },
    {
      id: 5,
      name: 'Tư vấn biện pháp tránh thai',
      duration: '30-45 phút',
      price: '350.000 VNĐ',
      requiresConsultant: true
    },
    {
      id: 6,
      name: 'Tiêm vắc-xin HPV',
      duration: '15-20 phút',
      price: '1.500.000 VNĐ',
      requiresConsultant: false
    },
    {
      id: 7,
      name: 'Gói chăm sóc thai sản',
      duration: '2 giờ (lần khám đầu)',
      price: '2.500.000 VNĐ',
      requiresConsultant: false
    },
    {
      id: 8,
      name: 'Quản lý thời kỳ mãn kinh',
      duration: '45-60 phút',
      price: '500.000 VNĐ',
      requiresConsultant: true
    }
  ];

  // Consultants data
  const consultants: Consultant[] = [
    { 
      id: 1, 
      name: 'BS. Nguyễn Văn A', 
      specialty: 'Sức khỏe tình dục',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      ratings: 4.8,
      education: 'Bác sĩ chuyên khoa, Đại học Y Hà Nội',
      experience: 'Hơn 10 năm kinh nghiệm tư vấn sức khỏe tình dục',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Sức khỏe sinh sản', issuer: 'Bộ Y tế Việt Nam', year: 2015 },
        { id: 2, name: 'Chứng chỉ Sức khỏe tình dục nâng cao', issuer: 'Hội Y học Việt Nam', year: 2018 }
      ],
      schedule: {
        monday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '12:00' }],
        thursday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        friday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        saturday: [{ start: '09:00', end: '12:00' }],
        sunday: []
      }
    },
    { 
      id: 2, 
      name: 'BS. Trần Thị B', 
      specialty: 'Sức khỏe mãn kinh',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      ratings: 4.9,
      education: 'Tiến sĩ Y khoa, Đại học Y Dược TP.HCM',
      experience: '15 năm kinh nghiệm điều trị và tư vấn thời kỳ mãn kinh',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Nội tiết học', issuer: 'Đại học Y Dược TP.HCM', year: 2010 },
        { id: 2, name: 'Chứng nhận đào tạo về Quản lý thời kỳ mãn kinh', issuer: 'Hiệp hội Mãn kinh Quốc tế', year: 2016 }
      ],
      schedule: {
        monday: [{ start: '08:00', end: '12:00' }],
        tuesday: [{ start: '13:30', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        thursday: [{ start: '08:00', end: '12:00' }],
        friday: [{ start: '13:30', end: '17:00' }],
        saturday: [{ start: '08:00', end: '12:00' }],
        sunday: []
      }
    },
    { 
      id: 3, 
      name: 'BS. Lê Văn C', 
      specialty: 'Sức khỏe tình dục',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      ratings: 4.7,
      education: 'Bác sĩ chuyên khoa II, Đại học Y Hà Nội',
      experience: '8 năm kinh nghiệm tư vấn sức khỏe tình dục và sinh sản',
      certificates: [
        { id: 1, name: 'Chứng chỉ Tư vấn Sức khỏe tình dục', issuer: 'Tổ chức Y tế Thế giới (WHO)', year: 2017 },
        { id: 2, name: 'Chứng nhận đào tạo về Giáo dục giới tính', issuer: 'Bộ Y tế', year: 2019 }
      ],
      schedule: {
        monday: [{ start: '13:30', end: '17:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        wednesday: [{ start: '13:30', end: '17:00' }],
        thursday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        friday: [{ start: '08:00', end: '12:00' }],
        saturday: [],
        sunday: [{ start: '09:00', end: '12:00' }]
      }
    },
    { 
      id: 4, 
      name: 'BS. Phạm Thị D', 
      specialty: 'Sức khỏe mãn kinh',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
      ratings: 4.6,
      education: 'Thạc sĩ Y khoa, Đại học Y Dược Huế',
      experience: '12 năm kinh nghiệm chuyên về sức khỏe phụ nữ trung niên',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Sản phụ khoa', issuer: 'Đại học Y Dược Huế', year: 2012 },
        { id: 2, name: 'Chứng nhận đào tạo về Liệu pháp hormone', issuer: 'Hiệp hội Nội tiết Việt Nam', year: 2018 }
      ],
      schedule: {
        monday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }],
        wednesday: [{ start: '13:30', end: '17:00' }],
        thursday: [{ start: '08:00', end: '12:00' }],
        friday: [{ start: '13:30', end: '17:00' }],
        saturday: [{ start: '08:00', end: '12:00' }],
        sunday: []
      }
    },
    { 
      id: 5, 
      name: 'BS. Hoàng Thị E', 
      specialty: 'Tư vấn kế hoạch hóa gia đình',
      image: 'https://randomuser.me/api/portraits/women/5.jpg',
      ratings: 4.8,
      education: 'Bác sĩ chuyên khoa I, Đại học Y Dược TP.HCM',
      experience: '9 năm kinh nghiệm tư vấn biện pháp tránh thai và kế hoạch hóa gia đình',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Sản phụ khoa', issuer: 'Đại học Y Dược TP.HCM', year: 2014 },
        { id: 2, name: 'Chứng nhận đào tạo về Kế hoạch hóa gia đình', issuer: 'Bộ Y tế', year: 2016 }
      ],
      schedule: {
        monday: [{ start: '08:00', end: '12:00' }],
        tuesday: [{ start: '13:30', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        thursday: [{ start: '13:30', end: '17:00' }],
        friday: [{ start: '08:00', end: '12:00' }],
        saturday: [{ start: '08:00', end: '12:00' }],
        sunday: []
      }
    },
    { 
      id: 6, 
      name: 'BS. Vũ Văn F', 
      specialty: 'Tư vấn kế hoạch hóa gia đình',
      image: 'https://randomuser.me/api/portraits/men/6.jpg',
      ratings: 4.7,
      education: 'Bác sĩ chuyên khoa, Đại học Y Hà Nội',
      experience: '7 năm kinh nghiệm tư vấn biện pháp tránh thai và sức khỏe sinh sản',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Sản khoa', issuer: 'Đại học Y Hà Nội', year: 2016 },
        { id: 2, name: 'Chứng nhận đào tạo về Tư vấn sức khỏe sinh sản', issuer: 'Tổ chức Y tế Thế giới (WHO)', year: 2018 }
      ],
      schedule: {
        monday: [{ start: '13:30', end: '17:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }],
        thursday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        friday: [{ start: '13:30', end: '17:00' }],
        saturday: [],
        sunday: [{ start: '09:00', end: '12:00' }]
      }
    },
    { 
      id: 7, 
      name: 'BS. Nguyễn Thị G', 
      specialty: 'Sức khỏe tình dục',
      image: 'https://randomuser.me/api/portraits/women/7.jpg',
      ratings: 4.9,
      education: 'Tiến sĩ Y khoa, Đại học Y Hà Nội',
      experience: '11 năm kinh nghiệm tư vấn sức khỏe tình dục và sinh sản',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Sản phụ khoa', issuer: 'Đại học Y Hà Nội', year: 2013 },
        { id: 2, name: 'Chứng nhận đào tạo về Sức khỏe tình dục', issuer: 'Tổ chức Y tế Thế giới (WHO)', year: 2017 }
      ],
      schedule: {
        monday: [{ start: '08:00', end: '12:00' }],
        tuesday: [{ start: '13:30', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        thursday: [{ start: '08:00', end: '12:00' }],
        friday: [{ start: '13:30', end: '17:00' }],
        saturday: [{ start: '08:00', end: '12:00' }],
        sunday: []
      }
    },
    { 
      id: 8, 
      name: 'BS. Trần Văn H', 
      specialty: 'Sức khỏe mãn kinh',
      image: 'https://randomuser.me/api/portraits/men/8.jpg',
      ratings: 4.5,
      education: 'Bác sĩ chuyên khoa II, Đại học Y Dược TP.HCM',
      experience: '10 năm kinh nghiệm tư vấn sức khỏe mãn kinh',
      certificates: [
        { id: 1, name: 'Chứng chỉ chuyên khoa Nội tiết', issuer: 'Đại học Y Dược TP.HCM', year: 2015 },
        { id: 2, name: 'Chứng nhận đào tạo về Liệu pháp hormone', issuer: 'Hiệp hội Nội tiết Việt Nam', year: 2019 }
      ],
      schedule: {
        monday: [{ start: '13:30', end: '17:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }],
        thursday: [{ start: '13:30', end: '17:00' }],
        friday: [{ start: '08:00', end: '12:00' }],
        saturday: [{ start: '08:00', end: '12:00' }],
        sunday: []
      }
    }
  ];

  // Get day of week from date string
  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  // Get available time slots based on selected consultant and date
  const getAvailableTimeSlots = (): string[] => {
    if (!selectedConsultant || !selectedDate) return [];
    
    const consultant = consultants.find(c => c.id === selectedConsultant);
    if (!consultant) return [];
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const daySchedule = consultant.schedule[dayOfWeek as keyof typeof consultant.schedule];
    
    if (!daySchedule || daySchedule.length === 0) return [];
    
    // Create array of available hours based on consultant schedule
    const availableHours: string[] = [];
    daySchedule.forEach(slot => {
      const startHour = parseInt(slot.start.split(':')[0]);
      const endHour = parseInt(slot.end.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        availableHours.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    });
    
    return availableHours;
  };

  // Translate day name to Vietnamese
  const translateDayName = (day: string): string => {
    const translations: { [key: string]: string } = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật'
    };
    return translations[day] || day;
  };

  // Get filtered consultants based on selected service
  const getFilteredConsultants = (): Consultant[] => {
    if (!selectedService) return [];
    
    const selectedServiceData = services.find(s => s.id === selectedService);
    if (!selectedServiceData || !selectedServiceData.requiresConsultant) return [];
    
    // Filter consultants based on service
    if (selectedService === 3) { // Tư vấn sức khỏe tình dục
      return consultants.filter(c => c.specialty === 'Sức khỏe tình dục');
    } else if (selectedService === 5) { // Tư vấn biện pháp tránh thai
      return consultants.filter(c => c.specialty === 'Tư vấn kế hoạch hóa gia đình');
    } else if (selectedService === 8) { // Quản lý thời kỳ mãn kinh
      return consultants.filter(c => c.specialty === 'Sức khỏe mãn kinh');
    }
    
    return [];
  };

  // Check if selected service requires consultant
  const serviceRequiresConsultant = (): boolean => {
    if (!selectedService) return false;
    
    const selectedServiceData = services.find(s => s.id === selectedService);
    return selectedServiceData?.requiresConsultant || false;
  };

  const handlePersonalDetails = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setSelectedConsultant(null); // Reset consultant when service changes
    setSelectedDate(''); // Reset date
    setSelectedTime(''); // Reset time
  };

  const handleConsultantSelect = (consultantId: number) => {
    setSelectedConsultant(consultantId);
    setSelectedDate(''); // Reset date when consultant changes
    setSelectedTime(''); // Reset time when consultant changes
  };

  const openConsultantModal = (consultant: Consultant) => {
    setModalConsultant(consultant);
    setIsModalOpen(true);
  };

  const closeConsultantModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedService || 
        (serviceRequiresConsultant() && !selectedConsultant) || 
        !selectedDate || 
        !selectedTime || 
        !personalDetails.name || 
        !personalDetails.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedConsultantData = selectedConsultant ? consultants.find(c => c.id === selectedConsultant) : null;
    
    if (!selectedServiceData) return;

    navigate('/confirm-booking', {
      state: {
        service: selectedServiceData,
        consultant: selectedConsultantData,
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
    
    // Check if service ID was passed in location state
    if (location.state && location.state.serviceId) {
      const serviceId = location.state.serviceId;
      setSelectedService(serviceId);
      
      // Find which page the service is on and set that page
      const serviceIndex = services.findIndex(s => s.id === serviceId);
      if (serviceIndex >= 0) {
        const page = Math.floor(serviceIndex / 4);
        setCurrentServicePage(page);
      }
    }
  }, []);

  // Reset time when date changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  // Slider functions
  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    const filteredConsultants = getFilteredConsultants();
    const maxSlide = Math.ceil(filteredConsultants.length / 3) - 1;
    setCurrentSlide(prev => Math.min(maxSlide, prev + 1));
  };

  // Get visible services based on current page (4 services per page)
  const getVisibleServices = () => {
    const startIndex = currentServicePage * 4;
    return services.slice(startIndex, startIndex + 4);
  };

  // Calculate total number of service pages
  const totalServicePages = Math.ceil(services.length / 4);

  // Navigate to next service page
  const nextServicePage = () => {
    if (currentServicePage < totalServicePages - 1) {
      setCurrentServicePage(prev => prev + 1);
    }
  };

  // Navigate to previous service page
  const prevServicePage = () => {
    if (currentServicePage > 0) {
      setCurrentServicePage(prev => prev - 1);
    }
  };

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
                {getVisibleServices().map(service => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    duration={service.duration}
                    price={service.price}
                    isSelected={selectedService === service.id}
                    onSelect={handleServiceSelect}
                  />
                ))}
              </div>
              
              {totalServicePages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-button" 
                    onClick={prevServicePage}
                    disabled={currentServicePage === 0}
                  >
                    Trang trước
                  </button>
                  <span className="pagination-info">
                    {currentServicePage + 1}/{totalServicePages}
                  </span>
                  <button 
                    className="pagination-button" 
                    onClick={nextServicePage}
                    disabled={currentServicePage === totalServicePages - 1}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>

            {selectedService && serviceRequiresConsultant() && (
              <div className="form-section">
                <h3>Chọn Tư Vấn Viên</h3>
                <div className="consultants-grid">
                  {getFilteredConsultants().map(consultant => (
                    <div 
                      key={consultant.id} 
                      className={`consultant-card-compact ${selectedConsultant === consultant.id ? 'selected' : ''}`}
                      onClick={() => handleConsultantSelect(consultant.id)}
                    >
                      <h4 title={consultant.name}>{consultant.name}</h4>
                      <p className="consultant-specialty">{consultant.specialty}</p>
                      <div className="consultant-rating">
                        <span className="star">★</span>
                        <span>{consultant.ratings.toFixed(1)}</span>
                      </div>
                      <button 
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConsultantModal(consultant);
                        }}
                      >
                        Chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedConsultant || !serviceRequiresConsultant()) && selectedService && (
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
                {selectedDate && (
                  <div className="time-slots">
                    {serviceRequiresConsultant() ? (
                      getAvailableTimeSlots().length > 0 ? (
                        getAvailableTimeSlots().map(time => (
                          <button
                            key={time}
                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <p className="no-slots-message">Không có lịch trống vào ngày này</p>
                      )
                    ) : (
                      timeSlots.map(time => (
                        <button
                          key={time}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
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
              disabled={
                !selectedService || 
                (serviceRequiresConsultant() && !selectedConsultant) || 
                !selectedDate || 
                !selectedTime || 
                !personalDetails.name || 
                !personalDetails.phone
              }
            >
              Xác Nhận Đặt Lịch
            </button>
          </section>
        </div>
      </div>
      
      {/* Advisor Modal */}
      <AdvisorModal 
        consultant={modalConsultant} 
        isOpen={isModalOpen} 
        onClose={closeConsultantModal} 
      />
    </div>
  );
};

export default Booking;