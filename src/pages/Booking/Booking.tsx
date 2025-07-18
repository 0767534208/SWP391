import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import AdvisorModal from '../Booking/AdvisorModal';
import ServiceCard from './ServiceCard';
import { serviceAPI, categoryAPI, consultantSlotAPI, appointmentAPI, consultantProfileAPI } from '../../utils/api';

interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

// Removed unused interface DaySchedule

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
  serviceType?: number; // 1 = test service (no consultant), 0 = consultation service
  imageServices: { image: string }[];
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

// Removed unused interface CategoryData

// Interface for consultant slot data
interface ConsultantSlot {
  slotID: string;
  consultantID: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointmentCount?: number; // Current number of appointments for this slot
  maxAppointments?: number;  // Maximum number of appointments allowed for this slot
}

// Interface for available time slots with associated consultants
interface AvailableTimeSlot {
  slotID: string;
  startTime: string;
  endTime: string;
  timeDisplay: string;
  consultants: Array<{
    consultantID: string;
    name: string;
    specialty: string;
    imageUrl: string;
    price?: number;
    address?: string;
  }>;
}

// Interface for consultant data
// Removed unused interface ConsultantData

// Removed unused interface SlotSelection

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [modalConsultant, setModalConsultant] = useState<Consultant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Removed unused state currentSlide
  const [currentServicePage, setCurrentServicePage] = useState(0);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    phone: '',
    email: ''
  });
  const [services, setServices] = useState<ServiceUI[]>([]);
  // Removed unused states for categories and consultantCategoryId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultantSlotData, setConsultantSlotData] = useState<any[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<any[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<ConsultantSlot[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [consultantLoading, setConsultantLoading] = useState(false);
  const [consultantProfiles, setConsultantProfiles] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add a state for selected time slot (to track which time slot was selected for consultant display)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailableTimeSlot | null>(null);
  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Lấy thông tin profile tư vấn viên khi load trang
  useEffect(() => {
    (async () => {
      try {
        const res = await consultantProfileAPI.getAllConsultantProfiles();
        if (res && res.statusCode === 200 && Array.isArray(res.data)) {
          setConsultantProfiles(res.data);
        } else {
          setConsultantProfiles([]);
        }
      } catch (e) {
        setConsultantProfiles([]);
      }
    })();
  }, []);

  // Hàm chuyển lỗi tiếng Anh phổ biến sang tiếng Việt
  const translateError = (msg: string): string => {
    if (!msg) return 'Đã xảy ra lỗi không xác định.';
    const lower = msg.toLowerCase();
    if (lower.includes('network')) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
    if (lower.includes('unauthorized') || lower.includes('401')) return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';
    if (lower.includes('not found') || lower.includes('404')) return 'Không tìm thấy tài nguyên.';
    if (lower.includes('slot') && lower.includes('booked')) return 'Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.';
    if (lower.includes('duplicate')) return 'Bạn đã đặt lịch cho dịch vụ này hoặc khung giờ này.';
    if (lower.includes('required')) return 'Vui lòng điền đầy đủ thông tin.';
    if (lower.includes('invalid')) return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    if (lower.includes('cannot select consultantid') || lower.includes('sti testing')) 
      return 'Dịch vụ xét nghiệm không yêu cầu tư vấn viên. Hệ thống đang xử lý yêu cầu của bạn.';
    // Xử lý lỗi về Consultant Profile
    if (lower.includes('consultantprofile') && lower.includes('does not match')) 
      return 'Có lỗi khi liên kết tư vấn viên. Vui lòng thử chọn tư vấn viên khác hoặc liên hệ hỗ trợ.';
    // Thêm các trường hợp khác nếu cần
    return msg;
  };

  // Load user data from localStorage when component mounts
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setPersonalDetails(prevDetails => ({
        ...prevDetails,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || ''
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
          // We can ignore storing categories since they're not being used
          // Note: We've removed the consultantCategory lookup since it's not being used
          
          // Map API data to UI format
          const mappedServices: ServiceUI[] = serviceResponse.data.map((service: ServiceData) => ({
            id: service.servicesID,
            name: service.servicesName,
            // Chỉ hiển thị giá cho dịch vụ xét nghiệm (serviceType=1), không hiển thị cho dịch vụ tư vấn (serviceType=0)
            price: service.serviceType === 1 ? formatPrice(service.servicesPrice) : "",
            // A service requires consultant if serviceType is not 1
            requiresConsultant: service.serviceType !== 1, // Type 1 = test service (no consultant needed)
            description: service.description,
            // Không truyền imageUrl vào để không hiển thị ảnh trong booking
            imageUrl: undefined
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
            slot: {
              ...item.slot,
              // Make sure we capture appointmentCount and maxAppointments if they exist
              appointmentCount: item.slot.appointmentCount || item.appointmentCount || 0,
              maxAppointments: item.slot.maxAppointments || item.maxAppointments || 5 // Default max is 5 if not specified
            },
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

  // Khi chọn ngày, lọc ra các khung giờ có sẵn (và tư vấn viên cho mỗi khung giờ)
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setAvailableTimeSlots([]);
      setFilteredSlots([]);
      setFilteredConsultants([]);
      return;
    }
    
    const selectedDateStr = selectedDate;
    
    // Filter slots for the selected date
    const slotsOnDate = consultantSlotData.filter(item => {
      const slotDateStr = item.slot.startTime.split('T')[0];
      return slotDateStr === selectedDateStr;
    });
    
    // If service doesn't require a consultant, directly populate available slots
    if (!serviceRequiresConsultant()) {
      const availableSlots = slotsOnDate.map(item => ({
        slotID: item.slotID.toString(),
        consultantID: item.consultantID, // Keep the consultantID for data structure consistency
        date: selectedDateStr,
        startTime: new Date(item.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(item.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isBooked: item.isBooked || false,
        appointmentCount: item.slot.appointmentCount,
        maxAppointments: item.slot.maxAppointments
      }));
      
      // Filter out slots that are booked or have reached maximum appointments
      setFilteredSlots(availableSlots.filter(slot => 
        !slot.isBooked && 
        (slot.appointmentCount === undefined || 
         slot.maxAppointments === undefined || 
         slot.appointmentCount < slot.maxAppointments)
      ));
      
      // For non-consultant services, still set consultantID to the first available one
      // This will help us track the slot but won't be sent to the API for test services
      if (availableSlots.length > 0 && !selectedConsultant) {
        setSelectedConsultant(availableSlots[0].consultantID);
      }
    } else {
      // For consultant services, we now group slots by time and collect consultants for each time slot
      const timeSlotMap = new Map<string, AvailableTimeSlot>();
      
      slotsOnDate.forEach(item => {
        // Skip booked slots or slots at maximum capacity
        if (item.isBooked || 
            (item.slot.appointmentCount !== undefined && 
             item.slot.maxAppointments !== undefined && 
             item.slot.appointmentCount >= item.slot.maxAppointments)) {
          return;
        }
        
        const startTime = new Date(item.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeKey = `${startTime}-${endTime}`;
        
        // Find the consultant profile
        const consultantProfile = consultantProfiles.find((p: any) => {
          if (p.account?.name && item.consultant?.name) {
            return p.account.name.trim().toLowerCase() === item.consultant.name.trim().toLowerCase();
          }
          return false;
        });
        
        // Create consultant data
        const consultantData = {
          consultantID: item.consultantID,
          name: item.consultant.name,
          specialty: consultantProfile?.specialty || item.consultant.specialty || 'Tư vấn sức khỏe',
          imageUrl: item.consultant.imageUrl || '',
          price: consultantProfile?.consultantPrice,
          address: item.consultant.address
        };
        
        if (timeSlotMap.has(timeKey)) {
          // Add consultant to existing time slot
          const existingSlot = timeSlotMap.get(timeKey)!;
          
          // Check if this consultant isn't already in the list
          if (!existingSlot.consultants.some(c => c.consultantID === consultantData.consultantID)) {
            existingSlot.consultants.push(consultantData);
          }
        } else {
          // Create new time slot
          timeSlotMap.set(timeKey, {
            slotID: item.slotID,
            startTime,
            endTime,
            timeDisplay: `${startTime} - ${endTime}`,
            consultants: [consultantData]
          });
        }
      });
      
      // Convert map to array and sort by time
      const availableTimeSlots = Array.from(timeSlotMap.values())
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      setAvailableTimeSlots(availableTimeSlots);
      
      // Reset selections when date or service changes, but not when just loading profiles
      if (selectedTime === '' || !selectedTimeSlot) {
        // Chỉ reset khi chưa chọn khung giờ
        setSelectedTimeSlot(null);
        setSelectedConsultant(null);
        setFilteredConsultants([]);
      }
    }
  }, [selectedDate, consultantSlotData, selectedService, consultantProfiles]);

  // Khi chọn consultant, lọc ra các slot của consultant đó vào ngày đã chọn
  // Lưu ý: Chỉ sử dụng khi là dịch vụ xét nghiệm, không dùng cho dịch vụ tư vấn
  useEffect(() => {
    // Nếu là dịch vụ tư vấn (serviceType=0) thì bỏ qua effect này
    // vì chúng ta đã xử lý trong luồng dịch vụ -> ngày -> khung giờ -> tư vấn viên
    if (serviceRequiresConsultant()) {
      return;
    }
    
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
      isBooked: item.isBooked || false,
      appointmentCount: item.slot.appointmentCount,
      maxAppointments: item.slot.maxAppointments
    }));
    
    // Filter out slots that are booked or have reached maximum appointments
    setFilteredSlots(slots.filter(slot => 
      !slot.isBooked && 
      (slot.appointmentCount === undefined || 
       slot.maxAppointments === undefined || 
       slot.appointmentCount < slot.maxAppointments)
    ));
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
    // Lưu lại thông tin tư vấn viên được chọn mà không thay đổi các state khác
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
    // Clear any previous error message
    setErrorMessage(null);
    
    // Check if the selected service requires a consultant
    const requiresConsultantSelection = serviceRequiresConsultant();
    
    if (!selectedService) {
      setErrorMessage('Vui lòng chọn dịch vụ');
      return;
    }
    if (!selectedDate) {
      setErrorMessage('Vui lòng chọn ngày');
      return;
    }
    if (!selectedTime) {
      setErrorMessage('Vui lòng chọn giờ');
      return;
    }
    
    // Only validate consultant selection if the service requires it
    if (requiresConsultantSelection && (!selectedConsultant || selectedConsultant === "")) {
      setErrorMessage('Vui lòng chọn tư vấn viên');
      return;
    }
    
    if (!personalDetails.name || !personalDetails.phone || !personalDetails.email) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin cá nhân');
      return;
    }
    if (!isLoggedIn) {
      setErrorMessage('Vui lòng đăng nhập để đặt lịch');
      navigate('/auth/login', { state: { returnUrl: '/booking' } });
      return;
    }
    
    // Find the selected slot information based on new workflow
    let selectedSlotInfo;
    
    if (requiresConsultantSelection) {
      // For consultation services, get slot from selected time slot and consultant
      if (!selectedTimeSlot) {
        setErrorMessage('Vui lòng chọn lại khung giờ');
        return;
      }
      
      // Get the corresponding slot from the consultantSlotData
      const matchingSlot = consultantSlotData.find(item => 
        item.consultantID === selectedConsultant &&
        item.slotID.toString() === selectedTimeSlot.slotID.toString()
      );
      
      if (!matchingSlot) {
        setErrorMessage('Không tìm thấy thông tin khung giờ đã chọn');
        return;
      }
      
      selectedSlotInfo = {
        slotID: matchingSlot.slotID,
        date: selectedDate,
        consultantID: selectedConsultant
      };
    } else {
      // For non-consultant services, get slot from filteredSlots
      selectedSlotInfo = filteredSlots.find(slot => 
        slot.date === selectedDate && 
        `${slot.startTime} - ${slot.endTime}` === selectedTime
      );
    }
    
    if (!selectedSlotInfo) {
      setErrorMessage('Không tìm thấy thông tin khung giờ đã chọn');
      return;
    }
    
    // Get the slot ID for the API request
    const slotID = parseInt(selectedSlotInfo.slotID);
    const userData = localStorage.getItem('user');
    if (!userData) {
      setErrorMessage('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
      navigate('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    const appointmentDateISO = selectedDate + 'T00:00:00';
    
    // Get the current service to check its type
    const currentService = services.find(s => s.id === selectedService);
    const isTestService = currentService?.requiresConsultant === false; // This checks if serviceType=1 (test service)
    
    // Tìm đúng consultantProfileID từ consultantProfiles (chỉ cho dịch vụ tư vấn - type 0)
    let consultantProfileID = null; // Khởi tạo với null
    if (!isTestService && selectedConsultant && selectedTimeSlot && consultantProfiles.length > 0) {
      // Lấy thông tin tư vấn viên đã được chọn từ selectedTimeSlot
      const selectedConsultantInfo = selectedTimeSlot.consultants.find(c => c.consultantID === selectedConsultant);
      
      if (selectedConsultantInfo) {
        // Tìm profile dựa theo ID thay vì tên để đảm bảo chính xác
        const foundProfile = consultantProfiles.find((p: any) => {
          if (p.accountID && selectedConsultantInfo.consultantID) {
            return p.accountID.toString() === selectedConsultantInfo.consultantID.toString();
          }
          return false;
        });
        
        if (foundProfile && foundProfile.consultantProfileID) {
          consultantProfileID = foundProfile.consultantProfileID;
        } else {
          // Nếu không tìm thấy theo ID, thử tìm theo tên
          const foundByName = consultantProfiles.find(
            (p: any) => p.account?.name && selectedConsultantInfo.name && 
            p.account.name.trim().toLowerCase() === selectedConsultantInfo.name.trim().toLowerCase()
          );
          
          if (foundByName && foundByName.consultantProfileID) {
            consultantProfileID = foundByName.consultantProfileID;
          }
        }
      }
    }
    
    // Nếu không tìm thấy, lấy consultantID làm consultantProfileID (trường hợp nếu ID trùng nhau)
    if (consultantProfileID === null && selectedConsultant) {
      consultantProfileID = parseInt(selectedConsultant);
    }
    
    // Double check that for type 0, we have a valid consultant selected
    if (!isTestService && (!selectedConsultant || selectedConsultant === "")) {
      setErrorMessage('Dịch vụ tư vấn yêu cầu phải chọn tư vấn viên');
      return;
    }
    
    // Prepare appointment data with proper typing based on service type
    let appointmentData: any;
    
    if (isTestService) {
      // For test services (serviceType=1), create data without consultantID and consultantProfileID
      appointmentData = {
        customerID: user.customerID || user.userID,
        clinicID: 1, // Default clinic ID
        slotID: slotID, // Use the slotID we found earlier
        appointmentDate: appointmentDateISO,
        appointmentDetails: [{
          servicesID: selectedService,
          quantity: 1
        }]
      };
    } else {
      // For consultation services (serviceType=0), include all fields with required consultant data
      const appointmentDetail: any = {
        servicesID: selectedService,
        quantity: 1
      };
      
      // Chỉ thêm consultantProfileID nếu đã tìm được
      if (consultantProfileID !== null) {
        appointmentDetail.consultantProfileID = consultantProfileID;
      }
      
      appointmentData = {
        customerID: user.customerID || user.userID,
        consultantID: selectedConsultant, // For type 0, consultantID is required and should be valid
        clinicID: 1, // Default clinic ID
        slotID: slotID, // Use the slotID we found earlier
        appointmentDate: appointmentDateISO,
        appointmentDetails: [appointmentDetail]
      };
    }
    // Debug thông tin trước khi gửi
    console.log('Appointment data being sent:', appointmentData);
    console.log('Selected consultant:', selectedConsultant);
    console.log('Consultant profile ID:', consultantProfileID);
    console.log('Selected time slot:', selectedTimeSlot);
    console.log('Consultant profiles:', consultantProfiles);
    
    appointmentAPI.createAppointment(appointmentData)
      .then((response: any) => {  
        if (response.statusCode === 201) {
          const serviceDetails = services.find(s => s.id === selectedService);
          const isTestService = serviceDetails?.requiresConsultant === false; // Check if it's a test service
          
          // For test services (serviceType=1), don't try to find consultant details
          let consultantDetails = null;
          
          if (!isTestService && selectedConsultant && selectedTimeSlot) {
            consultantDetails = selectedTimeSlot.consultants.find(c => c.consultantID === selectedConsultant);
            console.log('Found consultant details:', consultantDetails);
          }
          
          // Lưu appointmentID vào localStorage để backup
          localStorage.setItem('lastAppointmentId', response.data.appointmentID);
          navigate('/confirm-booking', { 
            state: { 
              service: {
                id: serviceDetails?.id || selectedService,
                name: serviceDetails?.name || 'Dịch vụ đã chọn',
                duration: selectedTime,
                price: serviceDetails?.price || '',
                requiresConsultant: !isTestService // Not a test service means it requires consultant
              },
              consultant: consultantDetails ? {
                id: parseInt(consultantDetails.consultantID),
                name: consultantDetails.name,
                specialty: consultantDetails.specialty || 'Tư vấn viên',
                image: consultantDetails.imageUrl || '',
                education: '', // Thông tin này sẽ được lấy từ consultantProfile nếu cần
                experience: '', // Thông tin này sẽ được lấy từ consultantProfile nếu cần
                certificates: [],
                price: consultantDetails.price || 0
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
          const apiError = response?.message || response?.error || 'Đã xảy ra lỗi không xác định.';
          setErrorMessage(translateError(apiError));
        }
      })
      .catch((error: any) => {
        let errorMsg = 'Đã xảy ra lỗi không xác định.';
        console.error('API Error:', error);
        
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
          console.error('Error message from API:', errorMsg);
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        // Nếu có lỗi về consultant profile, thêm thông tin để hỗ trợ debug
        if (errorMsg.includes('ConsultantProfile') || errorMsg.includes('consultant')) {
          errorMsg += ` (ConsultantID: ${selectedConsultant}, ProfileID: ${consultantProfileID})`;
        }
        
        setErrorMessage(translateError(errorMsg));
      });
  };

  // Khi chọn một khung giờ, hiển thị các tư vấn viên có sẵn trong khung giờ đó
  const handleTimeSlotSelect = (timeSlot: AvailableTimeSlot) => {
    setSelectedTime(timeSlot.timeDisplay);
    setSelectedTimeSlot(timeSlot);
    
    // Chỉ reset consultant khi thay đổi khung giờ, không reset khi lần đầu chọn
    if (selectedConsultant && timeSlot && 
        (!selectedTimeSlot || (selectedTimeSlot.timeDisplay !== timeSlot.timeDisplay))) {
      setSelectedConsultant(null);
    }
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

  // Update getConsultantTimeSlots to use API slot data for test services
  const getConsultantTimeSlots = (): string[] => {
    if (!selectedDate) return [];
    
    // If service doesn't require consultant, return filtered slots directly
    if (!serviceRequiresConsultant()) {
      return filteredSlots.map(slot => `${slot.startTime} - ${slot.endTime}`);
    }
    
    // For consultation services, return available time slots
    return availableTimeSlots.map(slot => slot.timeDisplay);
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

            {/* Bước 3: Chọn khung giờ */}
            {selectedService && selectedDate && (
              <div className="form-section">
                <h3>3. Chọn Khung Giờ</h3>
                <div className="time-slots">
                  {consultantLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Đang tải khung giờ...</p>
                    </div>
                  ) : getConsultantTimeSlots().length > 0 ? (
                    serviceRequiresConsultant() ? (
                      // Display time slots for consultation services
                      availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot.timeDisplay}
                          className={`time-slot ${selectedTime === timeSlot.timeDisplay ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotSelect(timeSlot)}
                        >
                          {timeSlot.timeDisplay}
                        </button>
                      ))
                    ) : (
                      // Display time slots for test services
                      getConsultantTimeSlots().map((time) => (
                        <button
                          key={time}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))
                    )
                  ) : (
                    <p className="no-slots-message">Không có lịch trống vào ngày này</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Bước 4: Chọn tư vấn viên (chỉ hiển thị cho dịch vụ tư vấn và sau khi đã chọn khung giờ) */}
            {selectedService && selectedDate && selectedTime && serviceRequiresConsultant() && selectedTimeSlot && (
              <div className="form-section">
                <h3>4. Chọn Tư Vấn Viên</h3>
                {consultantLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải tư vấn viên cho khung giờ đã chọn...</p>
                  </div>
                ) : selectedTimeSlot && selectedTimeSlot.consultants && selectedTimeSlot.consultants.length > 0 ? (
                  <div className="consultants-grid">
                    {selectedTimeSlot.consultants.map(consultant => (
                      <div 
                        key={consultant.consultantID} 
                        className={`consultant-card-compact ${selectedConsultant === consultant.consultantID ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn không cho sự kiện lan ra ngoài
                          handleConsultantSelect(consultant.consultantID);
                        }}
                      >
                        <h4 title={consultant.name}>{consultant.name}</h4>
                        <p className="consultant-specialty">{consultant.specialty || "Tư vấn sức khỏe"}</p>
                        <p className="consultant-address">{consultant.address}</p>
                        {consultant.price && (
                          <p className="consultant-price" style={{ color: '#0a7c1c', fontWeight: 600 }}>
                            Giá: {consultant.price.toLocaleString('vi-VN')} VNĐ
                          </p>
                        )}
                        <button 
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Tìm thêm thông tin chi tiết từ consultantProfiles nếu có
                            const profile = consultantProfiles.find(
                              (p: any) => p.account?.name && 
                                         p.account.name.trim().toLowerCase() === consultant.name.trim().toLowerCase()
                            );
                            
                            const consultantForModal: Consultant = {
                              id: parseInt(consultant.consultantID),
                              name: consultant.name,
                              specialty: consultant.specialty || "Tư vấn sức khỏe",
                              image: consultant.imageUrl || "https://via.placeholder.com/150",
                              education: profile?.education || "Chuyên viên tư vấn",
                              experience: profile?.experience || "5 năm kinh nghiệm",
                              certificates: profile?.certificates || [],
                              schedule: {
                                monday: [], tuesday: [], wednesday: [], 
                                thursday: [], friday: [], saturday: [], sunday: []
                              },
                              price: consultant.price ? consultant.price.toLocaleString('vi-VN') + ' VNĐ' : ''
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
                  <p className="no-slots-message">Không có tư vấn viên cho khung giờ này</p>
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
                <div className="input-group">
                  <label htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={personalDetails.dateOfBirth || ''}
                    onChange={handlePersonalDetails}
                    placeholder="Chọn ngày sinh"
                    className="form-input"
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={personalDetails.address || ''}
                    onChange={handlePersonalDetails}
                    placeholder="Nhập địa chỉ của bạn"
                    className="form-input"
                    readOnly={isLoggedIn}
                    disabled={isLoggedIn}
                  />
                </div>
              </div>
            </div>
            
            {/* Hiển thị lỗi bằng thông báo error toast */}
            <div className="booking-footer">
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={
                  !selectedService || 
                  !selectedDate || 
                  !selectedTime || 
                  (serviceRequiresConsultant() && !selectedConsultant)
                }
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
      
      {/* Error message toast */}
      {errorMessage && (
        <div className="error-toast" style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 2000,
          maxWidth: 400,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <div>{errorMessage}</div>
          <button 
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: 8,
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) translateX(-50%); }
            to { opacity: 1; transform: translateY(0) translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};

export default Booking;