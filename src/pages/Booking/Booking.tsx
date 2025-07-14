import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import AdvisorModal from '../Booking/AdvisorModal';
import ServiceCard from './ServiceCard';
import { serviceAPI, categoryAPI, consultantSlotAPI, appointmentAPI } from '../../utils/api';

interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
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
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [modalConsultant, setModalConsultant] = useState<Consultant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentServicePage, setCurrentServicePage] = useState(0);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    phone: '',
    email: ''
  });
  const [services, setServices] = useState<ServiceUI[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [consultantCategoryId, setConsultantCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultantSlotData, setConsultantSlotData] = useState<any[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<any[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<ConsultantSlot[]>([]);
  const [consultantLoading, setConsultantLoading] = useState(false);

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
            requiresConsultant: true, // Đặt tất cả dịch vụ đều cần tư vấn viên
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

  // Check if a service ID was passed from another page
  useEffect(() => {
    if (location.state && location.state.serviceId) {
      setSelectedService(location.state.serviceId);
    }
  }, [location.state]);

  // Fetch all consultant-slot data ONCE
  useEffect(() => {
    const fetchConsultantSlotData = async () => {
      setConsultantLoading(true);
      try {
        // Lấy toàn bộ slot của tất cả consultant (API trả về dạng tham khảo ở trên)
        const res = await consultantSlotAPI.getAllConsultants();
        if (res.statusCode === 200 && res.data) {
          // Chuẩn hóa dữ liệu: mỗi item gồm consultantID, consultant, slotID, slot, assignedDate
          setConsultantSlotData(res.data.map((item: any) => ({
            consultantID: item.consultantID,
            consultant: {
              ...item.consultant,
              consultantID: item.consultantID // thêm consultantID vào object consultant cho tiện truy xuất
            },
            slotID: item.slotID,
            slot: item.slot,
            assignedDate: item.assignedDate,
            isBooked: item.isBooked || false
          })));
        } else {
          setConsultantSlotData([]);
        }
      } catch (error) {
        setConsultantSlotData([]);
      } finally {
        setConsultantLoading(false);
      }
    };
    fetchConsultantSlotData();
  }, []);

  // Khi chọn ngày, lọc ra các consultant có slot vào ngày đó
  useEffect(() => {
    if (!selectedDate) {
      setFilteredConsultants([]);
      setFilteredSlots([]);
      return;
    }
    const selectedDateStr = selectedDate;
    // Debug: log slot.startTime
    consultantSlotData.forEach(item => {
      console.log('DEBUG slot.startTime:', item.slot.startTime, '->', item.slot.startTime.split('T')[0]);
    });
    const slotsOnDate = consultantSlotData.filter(item => {
      const slotDateStr = item.slot.startTime.split('T')[0];
      return slotDateStr === selectedDateStr;
    });
    // Lấy unique consultant theo consultantID
    const uniqueConsultants = Array.from(
      new Map(slotsOnDate.map(item => [
        item.consultantID,
        {
          id: item.consultantID,
          name: item.consultant.name,
          specialty: item.consultant.specialty || 'Tư vấn sức khỏe',
          address: item.consultant.address,
          phone: item.consultant.phone,
          dateOfBirth: item.consultant.dateOfBirth,
          status: item.consultant.status,
          imageUrl: item.consultant.imageUrl || '',
          experience: item.consultant.experience || '',
          education: item.consultant.education || '',
          certificates: item.consultant.certificates || [],
          consultantID: item.consultantID
        }
      ])).values()
    );
    setFilteredConsultants(uniqueConsultants);
    setFilteredSlots([]); // reset slot khi đổi ngày
    setSelectedConsultant(null);
    setSelectedTime('');
  }, [selectedDate, consultantSlotData]);

  // Khi chọn consultant, lọc ra các slot của consultant đó vào ngày đã chọn
  useEffect(() => {
    if (!selectedConsultant || !selectedDate) {
      setFilteredSlots([]);
      return;
    }
    const selectedDateStr = selectedDate;
    const slots = consultantSlotData.filter(item => {
      const slotDateStr = item.slot.startTime.split('T')[0];
      return (
        slotDateStr === selectedDateStr &&
        item.consultantID === selectedConsultant
      );
    }).map(item => ({
      slotID: item.slotID.toString(),
      consultantID: item.consultantID,
      date: selectedDateStr,
      startTime: new Date(item.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(item.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBooked: item.isBooked || false
    }));
    setFilteredSlots(slots);
    setSelectedTime('');
  }, [selectedConsultant, selectedDate, consultantSlotData]);

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
    setPersonalDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setSelectedDate('');
    setSelectedConsultant(null);
    setSelectedTime('');
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const handleConsultantSelect = (consultantId: string) => {
    setSelectedConsultant(consultantId);
  };

  const openConsultantModal = (consultant: Consultant) => {
    setModalConsultant(consultant);
    setIsModalOpen(true);
  };

  const closeConsultantModal = () => {
    setIsModalOpen(false);
    setModalConsultant(null);
  };

  const handleSubmit = () => {
    if (!selectedService) {
      alert('Vui lòng chọn dịch vụ');
      return;
    }

    if (!selectedDate) {
      alert('Vui lòng chọn ngày');
      return;
    }

    if (!selectedConsultant) {
      alert('Vui lòng chọn tư vấn viên');
      return;
    }

    if (!selectedTime) {
      alert('Vui lòng chọn giờ');
      return;
    }

    if (!personalDetails.name || !personalDetails.phone || !personalDetails.email) {
      alert('Vui lòng điền đầy đủ thông tin cá nhân');
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt lịch');
      navigate('/auth/login', { state: { returnUrl: '/booking' } });
      return;
    }

    // Get the selected slot information
    const selectedSlotInfo = filteredSlots.find(slot => 
      slot.date === selectedDate && 
      `${slot.startTime} - ${slot.endTime}` === selectedTime
    );

    if (!selectedSlotInfo) {
      alert('Không tìm thấy thông tin khung giờ đã chọn');
      return;
    }

    // Get user information from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
      navigate('/auth/login');
      return;
    }
    
    const user = JSON.parse(userData);

    // Chuẩn hóa appointmentDate về ISO string (yyyy-MM-ddT00:00:00)
    const appointmentDateISO = selectedDate + 'T00:00:00';

    // Chuẩn hóa dữ liệu gửi API đúng format mẫu
    const appointmentData = {
      customerID: user.customerID || user.userID,
      consultantID: selectedConsultant,
      clinicID: 1, // Default clinic ID
      slotID: parseInt(selectedSlotInfo.slotID),
      appointmentDate: appointmentDateISO,
      appointmentDetails: [
        {
          servicesID: selectedService,
          consultantProfileID: 1,
          quantity: 1
        }
      ]
    };

    // Log dữ liệu gửi API
    console.log("DEBUG appointmentData:\n" + JSON.stringify(appointmentData, null, 2));

    // Call API to create appointment
    appointmentAPI.createAppointment(appointmentData)
      .then((response: any) => {  
        if (response.statusCode === 201) {
          // Prepare booking data for confirmation page
          const serviceDetails = services.find(s => s.id === selectedService);
          // Sửa lấy consultantDetails cho đúng key id
          const consultantDetails = filteredConsultants.find(c => c.id === selectedConsultant || c.consultantID === selectedConsultant);
          
          // Navigate to confirmation page
          navigate('/confirm-booking', { 
            state: { 
              service: {
                id: serviceDetails?.id || selectedService,
                name: serviceDetails?.name || 'Dịch vụ đã chọn',
                duration: selectedTime,
                price: serviceDetails?.price || '',
                requiresConsultant: serviceRequiresConsultant()
              },
              consultant: consultantDetails ? {
                id: parseInt(consultantDetails.consultantID),
                name: consultantDetails.name,
                specialty: consultantDetails.specialty || 'Tư vấn viên',
                image: consultantDetails.imageUrl || '',
                education: consultantDetails.education || '',
                experience: `${consultantDetails.experience} năm kinh nghiệm`,
                certificates: consultantDetails.certificates || []
              } : null,
              date: selectedDate,
              time: selectedTime,
              personal: {
                ...personalDetails,
              },
              appointmentId: response.data.appointmentID
            } 
          });
        } else {
          alert('Đã có lỗi khi tạo lịch hẹn. Vui lòng thử lại sau.');
        }
      })
      .catch((error: any) => {
        console.error('Error creating appointment:', error);
        alert('Đã có lỗi khi tạo lịch hẹn: ' + (error?.message || 'Không xác định'));
      });
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

  // Update getConsultantTimeSlots to use API slot data
  const getConsultantTimeSlots = (): string[] => {
    if (!selectedConsultant || !selectedDate) return [];
    
    return filteredSlots.map(slot => `${slot.startTime} - ${slot.endTime}`);
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

            {/* Bước 2: Chọn ngày */}
            {selectedService && (
              <div className="form-section">
                <h3>2. Chọn Ngày</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateSelect}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-picker"
                  required
                />
              </div>
            )}

            {/* Bước 3: Chọn tư vấn viên (hiển thị sau khi chọn ngày) */}
            {selectedService && selectedDate && (
              <div className="form-section">
                <h3>3. Chọn Tư Vấn Viên</h3>
                {consultantLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải tư vấn viên có lịch vào ngày {selectedDate}...</p>
                  </div>
                ) : filteredConsultants.length > 0 ? (
                  <div className="consultants-grid">
                    {filteredConsultants.map(consultant => (
                      <div 
                        key={consultant.id} 
                        className={`consultant-card-compact ${selectedConsultant === consultant.id ? 'selected' : ''}`}
                        onClick={() => handleConsultantSelect(consultant.id)}
                      >
                        <h4 title={consultant.name}>{consultant.name}</h4>
                        <p className="consultant-specialty">{consultant.specialty || "Tư vấn sức khỏe"}</p>
                        <p className="consultant-address">{consultant.address}</p>
                        <button 
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const consultantForModal: Consultant = {
                              id: consultant.id,
                              name: consultant.name,
                              specialty: consultant.specialty || "Tư vấn sức khỏe",
                              image: consultant.imageUrl || "https://via.placeholder.com/150",
                              education: consultant.education || "Chuyên viên tư vấn",
                              experience: consultant.experience || "5 năm kinh nghiệm",
                              certificates: consultant.certificates || [],
                              schedule: {
                                monday: [], tuesday: [], wednesday: [], 
                                thursday: [], friday: [], saturday: [], sunday: []
                              },
                              price: ""
                            };
                            openConsultantModal(consultantForModal);
                          }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots-message">Không có tư vấn viên có lịch vào ngày {selectedDate}</p>
                )}
              </div>
            )}

            {/* Bước 4: Chọn giờ (hiển thị sau khi chọn tư vấn viên) */}
            {selectedService && selectedDate && selectedConsultant && (
              <div className="form-section">
                <h3>4. Chọn Giờ</h3>
                <div className="time-slots">
                  {consultantLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Đang tải khung giờ...</p>
                    </div>
                  ) : getConsultantTimeSlots().length > 0 ? (
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
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={personalDetails.email}
                    onChange={handlePersonalDetails}
                    placeholder="Nhập địa chỉ email của bạn"
                    required
                    className="form-input"
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
                  />
                </div>
              </div>
            </div>
            
            <div className="booking-footer">
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={!selectedService || !selectedDate || !selectedTime || (serviceRequiresConsultant() && !selectedConsultant)}
              >
                Xác Nhận Đặt Lịch
              </button>
            </div>
          </section>
        </div>
      </div>
      
      {isModalOpen && modalConsultant && (
        <AdvisorModal consultant={modalConsultant} onClose={closeConsultantModal} />
      )}
    </div>
  );
};

export default Booking;