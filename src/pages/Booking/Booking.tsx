import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import AdvisorModal from '../Booking/AdvisorModal';
import ServiceCard from './ServiceCard';
import { serviceAPI, categoryAPI, consultantSlotAPI } from '../../utils/api';

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
  price: string;
}

// Interface for API service data
interface ServiceData {
  servicesID: number;
  categoryID: number;
  category: string | null;
  servicesName: string;
  description: string;
  createAt: string;
  updateAt: string;
  servicesPrice: number;
  status: boolean;
  imageServices: string[];
}

// Interface for UI service display
interface ServiceUI {
  id: number;
  name: string;
  price: string;
  requiresConsultant: boolean;
  description?: string;
  imageUrl?: string;
}

// Interface for API category data
interface CategoryData {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

// Interface for consultant slot data
interface ConsultantSlot {
  slotID: string;
  consultantID: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Interface for consultant data
interface ConsultantData {
  consultantID: string;
  userID: string;
  name: string;
  specialty: string;
  experience: number;
  bio: string;
  rating: number;
  imageUrl?: string;
  id?: number;
  image?: string;
  education?: string;
  certificates?: Certificate[];
  schedule?: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
  price?: string;
}

// Define the type for slot selection
interface SlotSelection {
  slot: string;
  date: string;
  startTime: string;
  endTime: string;
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
  const [services, setServices] = useState<ServiceUI[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [consultantCategoryId, setConsultantCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [consultantSlots, setConsultantSlots] = useState<ConsultantSlot[]>([]);
  const [consultantLoading, setConsultantLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);

  // Load user data from localStorage when component mounts
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setPersonalDetails(prevDetails => ({
        ...prevDetails,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, []);

  // Fetch services and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const serviceResponse = await serviceAPI.getServices();
        
        // Fetch categories
        const categoryResponse = await categoryAPI.getCategories();
        
        if (serviceResponse.statusCode === 200 && serviceResponse.data && categoryResponse.statusCode === 200 && categoryResponse.data) {
          // Store categories
          setCategories(categoryResponse.data);
          
          // Find the consultant category (assuming there's a category for consultant services)
          // For now, let's assume it's a category with a specific name like "consultation"
          const consultantCategory = categoryResponse.data.find(
            category => category.name.toLowerCase().includes('consult')
          );
          
          if (consultantCategory) {
            setConsultantCategoryId(consultantCategory.categoryID);
          }
          
          // Map API data to UI format
          const mappedServices: ServiceUI[] = serviceResponse.data.map((service: ServiceData) => ({
            id: service.servicesID,
            name: service.servicesName,
            price: formatPrice(service.servicesPrice),
            // A service requires consultant if it belongs to the consultant category
            requiresConsultant: consultantCategory ? service.categoryID === consultantCategory.categoryID : false,
            description: service.description,
            imageUrl: service.imageServices && service.imageServices.length > 0 
              ? service.imageServices[0] 
              : undefined
          }));
          setServices(mappedServices);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'VNĐ');
  };

  // Add state to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  // Available time slots
  const timeSlots = [
    '08:00-9:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Check if a service ID was passed from another page
  useEffect(() => {
    if (location.state && location.state.serviceId) {
      setSelectedService(location.state.serviceId);
    }
  }, [location.state]);

  // Fetch consultants from API when needed
  useEffect(() => {
    if (serviceRequiresConsultant()) {
      setConsultantLoading(true);
      consultantSlotAPI.getAllConsultants()
        .then(res => {
          if (res.statusCode === 200 && res.data) {
            setConsultants(res.data);
          } else {
            setConsultants([]);
          }
        })
        .catch(() => setConsultants([]))
        .finally(() => setConsultantLoading(false));
    }
  }, [selectedService]);

  // Fetch slots when consultant is selected
  useEffect(() => {
    if (selectedConsultant) {
      setSlotLoading(true);
      consultantSlotAPI.getSlotsByConsultantId(String(selectedConsultant))
        .then(res => {
          if (res.statusCode === 200 && res.data) {
            setConsultantSlots(res.data);
          } else {
            setConsultantSlots([]);
          }
        })
        .catch(() => setConsultantSlots([]))
        .finally(() => setSlotLoading(false));
    } else {
      setConsultantSlots([]);
    }
  }, [selectedConsultant]);

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
    const daySchedule = consultant.schedule?.[dayOfWeek as keyof typeof consultant.schedule];
    
    if (!daySchedule || daySchedule.length === 0) return [];
    
    // Create array of available hours based on consultant schedule
    const availableHours: string[] = [];
    daySchedule.forEach((slot: TimeSlot) => {
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
    const service = services.find(s => s.id === selectedService);
    return service ? service.requiresConsultant : false;
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

  // Update getConsultantsByDate to use API data
  const getConsultantsByDate = (): any[] => {
    if (!selectedService || !selectedDate) return [];
    // Filter consultants by date if needed, or just return all for now
    return consultants;
  };

  // Update getConsultantTimeSlots to use API slot data
  const getConsultantTimeSlots = (): string[] => {
    if (!selectedConsultant || !selectedDate) return [];
    // Filter slots by selectedDate
    const slots = consultantSlots.filter((slot: ConsultantSlot) => slot.date === selectedDate);
    return slots.map((slot: ConsultantSlot) => `${slot.startTime} - ${slot.endTime}`);
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
              <h3>1. Chọn dịch vụ</h3>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải dịch vụ...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>{error}</p>
                </div>
              ) : (
                <>
                  <div className="services-grid">
                    {getVisibleServices().map((service) => (
                      <ServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        price={service.price}
                        isSelected={selectedService === service.id}
                        onSelect={handleServiceSelect}
                        imageUrl={service.imageUrl}
                        description={service.description}
                      />
                    ))}
                  </div>
                  
                  {services.length > 4 && (
                    <div className="pagination-controls">
                      <button
                        className="pagination-button"
                        onClick={prevServicePage}
                        disabled={currentServicePage === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="pagination-info">
                        {currentServicePage + 1} / {Math.ceil(services.length / 4)}
                      </span>
                      <button
                        className="pagination-button"
                        onClick={nextServicePage}
                        disabled={currentServicePage >= Math.ceil(services.length / 4) - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bước 2: Chọn ngày (hiển thị sau khi chọn dịch vụ) */}
            {selectedService && (
              <div className="form-section">
                <h3>Chọn Ngày</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-picker"
                  required
                />
              </div>
            )}

            {/* Bước 3: Chọn tư vấn viên (chỉ hiển thị cho dịch vụ cần tư vấn viên và sau khi đã chọn ngày) */}
            {selectedService && serviceRequiresConsultant() && selectedDate && (
              <div className="form-section">
                <h3>Chọn Tư Vấn Viên</h3>
                {getConsultantsByDate().length > 0 ? (
                  <div className="consultants-grid">
                    {getConsultantsByDate().map(consultant => (
                      <div 
                        key={consultant.id} 
                        className={`consultant-card-compact ${selectedConsultant === consultant.id ? 'selected' : ''}`}
                        onClick={() => handleConsultantSelect(consultant.id)}
                      >
                        <h4 title={consultant.name}>{consultant.name}</h4>
                        <p className="consultant-specialty">{consultant.specialty}</p>
                        <p className="consultant-price" style={{ color: '#4f46e5', fontWeight: 600, margin: 0 }}>{consultant.price}</p>
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
                ) : (
                  <p className="no-slots-message">Không có tư vấn viên làm việc vào ngày này</p>
                )}
              </div>
            )}

            {/* Bước 4: Chọn giờ (hiển thị sau khi đã chọn tư vấn viên hoặc cho dịch vụ không cần tư vấn viên) */}
            {selectedDate && ((serviceRequiresConsultant() && selectedConsultant) || !serviceRequiresConsultant()) && (
              <div className="form-section">
                <h3>Chọn Giờ</h3>
                <div className="time-slots">
                  {serviceRequiresConsultant() ? (
                    getConsultantTimeSlots().length > 0 ? (
                      getConsultantTimeSlots().map((time) => (
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
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
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
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
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
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
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
        servicePrice={selectedService ? services.find(s => s.id === selectedService)?.price : undefined}
      />
    </div>
  );
};

export default Booking;