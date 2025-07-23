import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaCheckCircle, FaTimesCircle, FaClock, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaUser, FaVial, FaMoneyBillWave, FaBan } from 'react-icons/fa';

import { userAPI, appointmentAPI, serviceAPI, getAppointmentPaymentUrl, changeAppointmentStatus } from '../../utils/api';
import type { UserData } from '../../types';
import type { AppointmentData } from '../../utils/api';
import { format } from 'date-fns';
import CancelAppointmentModal from '../../components/CancelAppointmentModal';

// Helper function to get status text based on status code
export const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ xác nhận';          // Pending
    case 1: return 'Đã xác nhận';           // Confirmed
    case 2: return 'Đang thực hiện';        // InProgress
    case 3: return 'Yêu cầu xét nghiệm STIs'; // RequireSTIsTest
    case 4: return 'Đợi kết quả';           // WaitingForResult
    case 5: return 'Hoàn thành';            // Completed
    case 6: return 'Đã hủy';                // Cancelled
    case 7: return 'Yêu cầu hoàn tiền';     // RequestRefund
    case 8: return 'Yêu cầu hủy';           // RequestCancel
    default: return 'Không xác định';
  }
};

// Helper function to get payment status text
const getPaymentStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ thanh toán';
    case 1: return 'Đã đặt cọc';
    case 2: return 'Đã thanh toán';
    case 3: return 'Đã hoàn tiền';
    case 4: return 'Hoàn tiền một phần';
    default: return 'Không xác định';
  }
};

// Helper function to get appointment type text
const getAppointmentTypeText = (type: number): string => {
  switch (type) {
    case 0: return 'Tư vấn';
    case 1: return 'Xét nghiệm';
    default: return 'Không xác định';
  }
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to format time
export const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return format(date, 'HH:mm');
  } catch (error) {
    return 'Invalid time';
  }
};

export const statusColor = (status: number) => {
  switch (status) {
    case 1: // Đã xác nhận
    case 5: // Hoàn thành
      return '#16a34a'; // Green
    case 6: // Đã hủy
    case 7: // Yêu cầu hoàn tiền
    case 8: // Yêu cầu hủy
      return '#e53e3e'; // Red
    case 3: // Yêu cầu xét nghiệm STIs
      return '#8b5cf6'; // Purple
    case 0: // Chờ xác nhận
    case 2: // Đang thực hiện
    case 4: // Đợi kết quả
      return '#f59e42'; // Orange
    default:
      return '#6b7280'; // Gray
  }
};

const statusIcon = (status: number) => {
  switch (status) {
    case 1: // Đã xác nhận
    case 5: // Hoàn thành
      return <FaCheckCircle color="#16a34a" style={{marginRight: 4}} />;
    case 6: // Đã hủy
    case 7: // Yêu cầu hoàn tiền
    case 8: // Yêu cầu hủy
      return <FaTimesCircle color="#e53e3e" style={{marginRight: 4}} />;
    case 3: // Yêu cầu xét nghiệm STIs
      return <FaVial color="#8b5cf6" style={{marginRight: 4}} />;
    case 0: // Chờ xác nhận
    case 2: // Đang thực hiện
    case 4: // Đợi kết quả
      return <FaClock color="#f59e42" style={{marginRight: 4}} />;
    default:
      return <FaClock color="#6b7280" style={{marginRight: 4}} />;
  }
};

const infoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18,
  fontSize: 17,
  color: '#222',
  background: '#f7f8fa',
  borderRadius: 12,
  padding: '14px 22px',
  boxShadow: '0 2px 8px #e3e8f0',
};

const labelStyle = {
  minWidth: 120,
  color: '#2563eb',
  fontWeight: 600,
  fontSize: 16,
};

const paymentStatusColor = (status: number) => {
  switch (status) {
    case 2: // Đã thanh toán
      return '#16a34a'; // Green
    case 3: // Đã hoàn tiền
      return '#2563eb'; // Blue
    case 4: // Hoàn tiền một phần
      return '#8b5cf6'; // Purple
    case 1: // Đã đặt cọc
      return '#f59e42'; // Orange
    case 0: // Chờ thanh toán
      return '#6b7280'; // Gray
    default:
      return '#6b7280'; // Gray
  }
};

const PaymentStatusBadge = ({ status }: { status: number }) => {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: paymentStatusColor(status),
    }}>
      {getPaymentStatusText(status)}
    </span>
  );
};

const appointmentTypeColor = (type: number) => {
  switch (type) {
    case 0: // Tư vấn
      return '#3b82f6'; // Blue
    case 1: // Xét nghiệm
      return '#8b5cf6'; // Purple
    default:
      return '#6b7280'; // Gray
  }
};

const AppointmentTypeBadge = ({ type }: { type: number }) => {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: appointmentTypeColor(type),
    }}>
      {getAppointmentTypeText(type)}
    </span>
  );
};

const AppointmentStatusBadge = ({ status }: { status: number }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: statusColor(status),
    }}>
      {statusIcon(status)} {getStatusText(status)}
    </span>
  );
};

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'profile' | 'history'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to get user data from localStorage
  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setForm({
          name: parsedUser.name || '',
          phone: parsedUser.phone || '',
          dateOfBirth: parsedUser.dateOfBirth || '',
          address: parsedUser.address || '',
        });
        setError(null);
        return parsedUser;
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setError("Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.");
        return null;
      }
    } else {
      setError("Không tìm thấy dữ liệu người dùng. Vui lòng đăng nhập.");
      return null;
    }
  };

  // Function to reload data
  const reloadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const parsedUser = getUserFromLocalStorage();
      
      if (parsedUser) {
        // Ưu tiên sử dụng customerID, nếu không có thì dùng userID
        const customerId = parsedUser.customerID || parsedUser.userID;
        console.log('🔍 Debug - Parsed User:', parsedUser);
        console.log('🔍 Debug - Customer ID extracted:', customerId);
        
        if (customerId) {
          console.log('📡 Making API call to get appointments...');
          console.log('📡 API URL will be: /api/appointment/GetAppointmentByCustomerID/' + customerId);
          
          const appointmentsResponse = await appointmentAPI.getAppointmentsByCustomerId(customerId);
          console.log("✅ Reloaded appointments response:", appointmentsResponse);
          
          if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
            setAppointments(appointmentsResponse.data);
            console.log('✅ Successfully set appointments:', appointmentsResponse.data);
          } else {
            console.warn('⚠️ Response not successful or no data:', appointmentsResponse);
            setError(`API trả về không thành công: ${appointmentsResponse.message || 'Không có dữ liệu'}`);
          }
        } else {
          console.error('❌ No customer ID found');
          setError("Không tìm thấy ID khách hàng. Vui lòng đăng nhập lại.");
        }
      }
    } catch (error) {
      console.error("❌ Error reloading data:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: error
      });
      setError(`Có lỗi xảy ra khi tải dữ liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user data from localStorage using our helper function
        const parsedUser = getUserFromLocalStorage();
        
        if (parsedUser) {
          // Fetch appointments using customer ID from localStorage
          // Ưu tiên sử dụng customerID, nếu không có thì dùng userID
          const customerId = parsedUser.customerID || parsedUser.userID;
          console.log("🔍 Debug - Customer ID from localStorage:", customerId);
          console.log("🔍 Debug - customerID field exists:", 'customerID' in parsedUser);
          console.log("🔍 Debug - userID field exists:", 'userID' in parsedUser);
          
          if (customerId) {
            try {
              console.log("📡 Fetching appointments for customerId:", customerId);
              console.log('📡 API endpoint will be: /api/appointment/GetAppointmentByCustomerID/' + customerId);
              
              const appointmentsResponse = await appointmentAPI.getAppointmentsByCustomerId(customerId);
              console.log("📦 Appointments API response:", appointmentsResponse);
              console.log("📦 Response status code:", appointmentsResponse.statusCode);
              console.log("📦 Response message:", appointmentsResponse.message);
              console.log("📦 Response data:", appointmentsResponse.data);
              
              if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
                setAppointments(appointmentsResponse.data);
                console.log('✅ Successfully loaded appointments:', appointmentsResponse.data.length, 'appointments');
              } else {
                console.warn("⚠️ API response indicates no data or error");
                console.warn("⚠️ Status code:", appointmentsResponse.statusCode);
                console.warn("⚠️ Message:", appointmentsResponse.message);
                setError(`API không trả về dữ liệu hợp lệ. Status: ${appointmentsResponse.statusCode}, Message: ${appointmentsResponse.message || 'Không có thông báo'}`);
              }
            } catch (userIdError) {
              console.error("❌ Error fetching with customer ID:", userIdError);
              console.error("❌ Error type:", typeof userIdError);
              console.error("❌ Error instanceof Error:", userIdError instanceof Error);
              console.error("❌ Error message:", userIdError instanceof Error ? userIdError.message : 'Unknown error type');
              console.error("❌ Full error object:", userIdError);
              setError(`Có lỗi khi lấy dữ liệu cuộc hẹn: ${userIdError instanceof Error ? userIdError.message : 'Lỗi không xác định'}`);
            }
          } else {
            console.warn("⚠️ No customerID found in localStorage");
            console.warn("⚠️ Available fields in user data:", Object.keys(parsedUser));
            setError("Không tìm thấy ID khách hàng. Vui lòng thiết lập ID mẫu để xem dữ liệu.");
          }
        } else {
          console.error("❌ No user data found in localStorage");
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setError(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setErrorMessage(null);
      if (!user) return;
      
      // Update user profile
      const updatedUserData = {
        ...user,
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      };
      
      // Call API to update profile
      await userAPI.updateProfile(updatedUserData);
      
      // Update local state and localStorage
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };
  
  // State for STI test modal
  const [showSTIModal, setShowSTIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [stiServices, setSTIServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedAppointmentId, setUpdatedAppointmentId] = useState<string | null>(null);
  
  // State for cancel appointment modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Utility function to check if an appointment already has test services
  const hasTestServices = (appointment: AppointmentData): boolean => {
    if (!appointment.appointmentDetails || appointment.appointmentDetails.length === 0) {
      return false;
    }
    
    return appointment.appointmentDetails.some(detail => {
      if (!detail.service) return false;
      
      const service = detail.service as any;
      const name = (service.servicesName || '').toLowerCase();
      
      return service.serviceType === 1 || 
             service.type === 1 || 
             name.includes('xét nghiệm') || 
             name.includes('test') ||
             name.includes('sti');
    });
  };
  
  // Handle payment for the STI test registration
  const handlePayment = async () => {
    try {
      // Clear any previous error
      setErrorMessage(null);
      
      if (!updatedAppointmentId) {
        console.error('Missing appointment ID for payment');
        setErrorMessage('Không tìm thấy mã lịch hẹn. Vui lòng thử lại.');
        return;
      }
      
      setIsLoading(true);
      
      // Get the payment URL using the imported function from api.ts
      const response: any = await getAppointmentPaymentUrl(updatedAppointmentId);
      
      console.log('📡 Payment URL response:', response);
      
      // Handle various response formats:
      // 1. Direct URL string: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
      // 2. Object with data property containing URL
      // 3. Object with paymentUrl property
      
      if (typeof response === 'string' && response.startsWith('http')) {
        // Direct URL string response
        console.log('📡 Direct URL string detected, redirecting to:', response);
        window.location.href = response;
      } else if (response && typeof response === 'object') {
        if (typeof response.data === 'string' && response.data.startsWith('http')) {
          console.log('📡 URL in response.data detected, redirecting to:', response.data);
          window.location.href = response.data;
        } else if (response.data && response.data.paymentUrl) {
          console.log('📡 URL in response.data.paymentUrl detected, redirecting to:', response.data.paymentUrl);
          window.location.href = response.data.paymentUrl;
        } else if (response.paymentUrl) {
          console.log('📡 URL in response.paymentUrl detected, redirecting to:', response.paymentUrl);
          window.location.href = response.paymentUrl;
        } else {
          console.error('📡 Payment URL not found in response:', response);
          setErrorMessage('Không tìm thấy link thanh toán. Vui lòng thử lại sau.');
        }
      } else {
        console.error('📡 Invalid payment response format:', response);
        setErrorMessage('Không tìm thấy link thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error getting payment URL:', error);
      setErrorMessage('Có lỗi xảy ra khi lấy đường dẫn thanh toán. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle STI test request
  const handleShowSTIModal = async (appointment: AppointmentData) => {
    try {
      // Log appointment details for debugging
      console.log('📋 Opening STI modal for appointment:', {
        id: appointment.appointmentID,
        status: appointment.status,
        hasTestServices: hasTestServices(appointment),
        services: appointment.appointmentDetails?.map(d => d.service?.servicesName) || []
      });
      
      setIsLoading(true);
      setSelectedAppointment(appointment);
      setShowSTIModal(true);
      
      // Fetch STI test services (filter for serviceType = 1)
      const servicesResponse = await serviceAPI.getServices();
      console.log('📡 Services response:', servicesResponse);
      
      if (servicesResponse.statusCode === 200 && servicesResponse.data) {
        // Check the structure of the first service to understand the data format
        if (servicesResponse.data.length > 0) {
          console.log('📡 Sample service structure:', servicesResponse.data[0]);
          
          // Log all services with their type information to help debug
          console.log('📡 Services with their type info:', servicesResponse.data.map((service: any) => ({
            id: service.servicesID || service.id,
            name: service.servicesName || service.name,
            serviceType: service.serviceType,
            type: service.type,
            categoryID: service.categoryID
          })));
        }
        
        // Filter for ONLY services with serviceType = 1 (STI test services)
        const testServices = servicesResponse.data.filter((service: any) => {
          // First, try to match by explicit serviceType or type property
          if (service.serviceType === 1 || service.type === 1) {
            return true;
          }
          
          // If no explicit type match, check other indicators of test services
          // but make sure it's not a consultation service (type 0)
          if (service.serviceType === 0 || service.type === 0) {
            return false; // Exclude consultation services
          }
          
          // Category based checks
          if (service.category === 'test' || service.categoryID === 1) {
            return true;
          }
          
          // Name-based checks - only if no explicit type is found
          if (service.servicesName) {
            const name = service.servicesName.toLowerCase();
            // Only include if it has test-related words and doesn't have consultation-related words
            return (name.includes('xét nghiệm') || name.includes('test')) && 
                  !name.includes('tư vấn') && 
                  !name.includes('consultation');
          }
          
          return false;
        });
        
        console.log('📡 Filtered STI test services:', testServices);
        setSTIServices(testServices);
      }
    } catch (error) {
      console.error('Error fetching STI services:', error);
      setErrorMessage('Có lỗi xảy ra khi tải dịch vụ xét nghiệm.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle STI test request submission
  const handleSubmitSTIRequest = async () => {
    try {
      setErrorMessage(null);
      if (!selectedAppointment || selectedService === null) {
        setErrorMessage('Vui lòng chọn một dịch vụ xét nghiệm');
        return;
      }
      
      setIsLoading(true);
      
      // Create the request payload based on the API endpoint format
      // The API expects appointmentID as a query parameter
      const requestData = {
        appointmentDetails: [
          {
            servicesID: selectedService,
            quantity: 1
          }
        ]
      };
      
      // Call the API to update appointment with STI request
      // Using the URL format: /api/appointment/UpdateAppointmentWithSTIRequest?appointmentID=1
      const appointmentId = selectedAppointment.appointmentID;
      console.log(`📡 Making API call to UpdateAppointmentWithSTIRequest for appointment ID: ${appointmentId}`);
      console.log('📡 Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await appointmentAPI.updateAppointmentWithSTIRequest(appointmentId, requestData);
      
      if (response.statusCode === 200) {
        // Save the appointmentId for payment
        setUpdatedAppointmentId(appointmentId);
        
        // Hide the service selection modal
        setShowSTIModal(false);
        
        // Show the success modal
        setShowSuccessModal(true);
        
        // Reload appointments data in the background
        reloadData();
      } else {
        setErrorMessage(`Lỗi: ${response.message || 'Không thể đăng ký xét nghiệm'}`);
      }
    } catch (error) {
      console.error('Error submitting STI request:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setErrorMessage('Có lỗi xảy ra khi đăng ký xét nghiệm.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if an appointment is ONLY consultation type (0) with NO test services
  const checkIfConsultationType = (appointment: AppointmentData): boolean => {
    // First check if there's an explicit appointmentType property
    if ((appointment as any).appointmentType !== undefined) {
      return (appointment as any).appointmentType === 0; // 0 = consultation
    }
    
    // Log the details to help debug
    console.log('📊 Checking appointment details:', appointment.appointmentDetails?.map(detail => ({
      serviceName: detail.service?.servicesName,
      serviceId: detail.service?.servicesID,
    })));
    
    // If we have no details, we can't determine the type
    if (!appointment.appointmentDetails || appointment.appointmentDetails.length === 0) {
      return false;
    }
    
    // Check if this is ONLY a consultation appointment with no test services
    // The appointment should contain at least one consultation service AND no test services
    
    let hasConsultationService = false;
    let hasTestService = false;
    
    for (const detail of appointment.appointmentDetails) {
      if (!detail.service || !detail.service.servicesName) continue;
      
      const service = detail.service as any;
      const name = service.servicesName.toLowerCase();
      
      // Check if this is a test service
      if (
        service.serviceType === 1 || 
        service.type === 1 || 
        name.includes('xét nghiệm') || 
        name.includes('test') ||
        name.includes('stis') ||
        name.includes('sti')
      ) {
        console.log('🧪 Found test service:', service.servicesName);
        hasTestService = true;
      }
      
      // Check if this is a consultation service
      if (
        service.serviceType === 0 || 
        service.type === 0 || 
        name.includes('tư vấn') || 
        name.includes('consultation')
      ) {
        console.log('👨‍⚕️ Found consultation service:', service.servicesName);
        hasConsultationService = true;
      }
    }
    
    // Only return true if it has consultation services and NO test services
    const result = hasConsultationService && !hasTestService;
    console.log(`🔍 Appointment ${appointment.appointmentID} is ${result ? 'ONLY consultation' : 'not only consultation'}`);
    return result;
  };
  
  // Function to handle showing cancel confirmation modal
  const handleShowCancelModal = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };
  
  // Function to cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCancelLoading(true);
      const { appointmentID } = selectedAppointment;
      
      console.log('🚫 Cancelling appointment:', appointmentID);
      
      const response = await changeAppointmentStatus(appointmentID, 8, selectedAppointment.paymentStatus);
      
      if (response.statusCode === 200) {
        console.log('✅ Appointment cancelled successfully');
        setShowCancelModal(false);
        setErrorMessage('');
        
        // Show success message
        setSuccessMessage('Yêu cầu hủy cuộc hẹn đã được gửi thành công');
        
        // Reload appointments data
        reloadData();
      } else {
        setErrorMessage(`Lỗi: ${response.message || 'Không thể hủy cuộc hẹn'}`);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setErrorMessage('Đã xảy ra lỗi khi hủy cuộc hẹn. Vui lòng thử lại sau.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: 'profile' | 'history') => {
    setTab(newTab);
    
    // Automatically reload appointments data when switching to history tab
    if (newTab === 'history' && user && (user.customerID || user.userID)) {
      reloadData();
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ marginBottom: 20, fontSize: 20, color: '#4b5563' }}>Bạn chưa đăng nhập!</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/login">
            <button 
              style={{ 
                background: '#3b82f6', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '12px 32px', 
                fontWeight: 700, 
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)'
              }}
            >
              Đăng nhập
            </button>
          </Link>
        </div>
        <div style={{ marginTop: 16, color: '#ef4444', fontSize: 14 }}>
          {error && <p>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #e3e8f0', padding: 40 }}>
      {/* Avatar + name/email */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
        <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa 60%,#a5b4fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, color: '#fff', boxShadow: '0 4px 16px #e3e8f0', marginBottom: 18 }}>
          <FaUserCircle style={{ width: 110, height: 110 }} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, color: '#2563eb', letterSpacing: 1 }}>{user.name || 'Tên của bạn'}</div>
        <div style={{ color: '#555', marginBottom: 2, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><FaEnvelope style={{ color: '#3b82f6' }} /> {user.email}</div>
      </div>
      {/* Tab switch */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 36, justifyContent: 'center' }}>
        <button onClick={() => handleTabChange('profile')} style={{ background: tab === 'profile' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'profile' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Hồ Sơ Cá Nhân</button>
        <button onClick={() => handleTabChange('history')} style={{ background: tab === 'history' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'history' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'history' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Lịch Sử Đặt Khám</button>
      </div>
      {/* Tab Profile */}
      {tab === 'profile' && (
        <div style={{ padding: 24, background: 'linear-gradient(90deg,#f0f7ff 60%,#f3f4f6 100%)', borderRadius: 18, boxShadow: '0 2px 8px #e3e8f0', marginBottom: 12 }}>
          <h2 style={{ marginBottom: 32, fontSize: 24, color: '#2563eb', letterSpacing: 1, textAlign: 'center', fontWeight: 700 }}>Thông Tin Hồ Sơ</h2>
          {!editMode ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={infoStyle}><FaUser /><span style={labelStyle}>Họ tên:</span> {user.name || 'Chưa cập nhật'}</div>
                  <div style={infoStyle}><FaEnvelope /><span style={labelStyle}>Email:</span> {user.email}</div>
                  <div style={infoStyle}><FaPhone /><span style={labelStyle}>Điện thoại:</span> {user.phone || 'Chưa cập nhật'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={infoStyle}><FaBirthdayCake /><span style={labelStyle}>Ngày sinh:</span> {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Chưa cập nhật'}</div>
                  <div style={infoStyle}><FaMapMarkerAlt /><span style={labelStyle}>Địa chỉ:</span> {user.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={() => {
                  setForm({
                    name: user.name || '',
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                  });
                  setEditMode(true);
                }} style={{ background: 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e3e8f0', letterSpacing: 1 }}>Chỉnh Sửa</button>
              </div>
            </>
          ) : (
            <form style={{ maxWidth: 600, margin: '0 auto', marginTop: 16 }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Họ tên:</label>
                    <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Điện thoại:</label>
                    <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Ngày sinh:</label>
                    <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} placeholder="YYYY-MM-DD" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Địa chỉ:</label>
                    <input name="address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button type="submit" style={{ background: 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e3e8f0', letterSpacing: 1, marginRight: 16 }}>Lưu</button>
                <button type="button" onClick={() => setEditMode(false)} style={{ background: '#e5e7eb', color: '#333', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', letterSpacing: 1 }}>Hủy</button>
              </div>
            </form>
          )}
        </div>
      )}
      {/* Tab History with Debug Panel */}
      {tab === 'history' && (
        <div style={{ padding: 24, background: 'linear-gradient(90deg,#f0f7ff 60%,#f3f4f6 100%)', borderRadius: 18, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h2 style={{ marginBottom: 24, fontSize: 24, color: '#2563eb', letterSpacing: 1, textAlign: 'center', fontWeight: 700 }}>Lịch Sử Đặt Khám</h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🔄 Đang tải lịch sử đặt khám...</div>
              <div style={{ fontSize: 14 }}>Vui lòng chờ trong giây lát</div>
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 24,
              border: '1px solid #f5c6cb'
            }}>
              <strong>❌ Lỗi:</strong> {error}
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>📅 Chưa có lịch hẹn nào</div>
              <div style={{ fontSize: 14 }}>Bạn chưa đặt lịch khám nào hoặc chưa có dữ liệu trong hệ thống</div>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#2563eb' }}>
                📊 Tìm thấy {appointments.length} lịch hẹn
              </div>
              <div style={{ display: 'grid', gap: 20 }}>
                {appointments.map((appointment, index) => (
                  <div key={appointment.appointmentID || index} style={{ 
                    background: '#fff', 
                    borderRadius: 12, 
                    padding: 20, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e3e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>
                          Mã lịch hẹn: {appointment.appointmentID || 'N/A'}
                        </div>
                        <div style={{ fontSize: 14, color: '#666' }}>
                          Ngày tạo: {appointment.createAt ? formatDate(appointment.createAt) : 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                        <AppointmentStatusBadge status={appointment.status || 0} />
                        <PaymentStatusBadge status={appointment.paymentStatus || 0} />
                        {/* For now, let's determine type based on services - assume test services have "test" or "xét nghiệm" in the name */}
                        {appointment.appointmentDetails && appointment.appointmentDetails.length > 0 && (
                          <AppointmentTypeBadge type={
                            appointment.appointmentDetails.some(detail => 
                              detail.service?.servicesName?.toLowerCase().includes('test') || 
                              detail.service?.servicesName?.toLowerCase().includes('xét nghiệm')
                            ) ? 1 : 0
                          } />
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>📅 Ngày hẹn:</div>
                        <div>{appointment.appointmentDate ? formatDate(appointment.appointmentDate) : 'Chưa xác định'}</div>
                      </div>
                      
                      {appointment.slot && (
                        <div>
                          <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>⏰ Thời gian:</div>
                          <div>
                            {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>💰 Tổng tiền:</div>
                        <div style={{ color: '#059669', fontWeight: 600 }}>
                          {appointment.totalAmount?.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      
                      {appointment.consultant && (
                        <div>
                          <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>👨‍⚕️ Tư vấn viên:</div>
                          <div>{appointment.consultant.name || 'Chưa phân công'}</div>
                        </div>
                      )}
                      
                      {/* Hiển thị tên dịch vụ */}
                      <div>
                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>🏥 Dịch vụ:</div>
                        <div>
                          {appointment.appointmentDetails && appointment.appointmentDetails.length > 0 ? (
                            appointment.appointmentDetails.map((detail, idx) => {
                              // Determine service type for visual indicator
                              let serviceType = "unknown";
                              let serviceIcon = "🔹";
                              let serviceColor = "#6b7280";
                              
                              if (detail && detail.service && detail.service.servicesName) {
                                const name = detail.service.servicesName.toLowerCase();
                                const serviceObj = detail.service as any;
                                
                                if (serviceObj.serviceType === 1 || 
                                    serviceObj.type === 1 ||
                                    name.includes('xét nghiệm') || 
                                    name.includes('test') ||
                                    name.includes('sti')) {
                                  serviceType = "test";
                                  serviceIcon = "🧪";
                                  serviceColor = "#8b5cf6"; // Purple for test services
                                } else if (serviceObj.serviceType === 0 || 
                                          serviceObj.type === 0 ||
                                          name.includes('tư vấn') || 
                                          name.includes('consultation')) {
                                  serviceType = "consultation";
                                  serviceIcon = "👨‍⚕️";
                                  serviceColor = "#3b82f6"; // Blue for consultation
                                }
                              }
                              
                              return (
                                <div key={idx} style={{
                                  marginBottom: idx < appointment.appointmentDetails!.length - 1 ? 8 : 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '4px 10px',
                                  backgroundColor: `${serviceColor}10`,
                                  borderRadius: 6,
                                  border: `1px solid ${serviceColor}30`
                                }}>
                                  <span>{serviceIcon}</span>
                                  <span style={{
                                    color: serviceColor,
                                    fontWeight: serviceType === "test" ? 500 : 400
                                  }}>
                                    {detail.service?.servicesName || 'Không có thông tin'}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: '#f3f4f6', 
                              borderRadius: 6,
                              color: '#6b7280',
                              fontStyle: 'italic'
                            }}>
                              Không có thông tin dịch vụ
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add buttons based on appointment status */}
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16 }}>
                      {/* Add button for STI Test if status is 3 (RequireSTIsTest) AND appointment is ONLY consultation type (0) */}
                      {(() => {
                        // Check if the button should be displayed and log reasoning
                        const isStatus3 = appointment.status === 3;
                        const isConsultationOnly = checkIfConsultationType(appointment);
                        
                        console.log(`🔍 Button check for appointment ${appointment.appointmentID}: 
                          Status is 3: ${isStatus3}
                          Is consultation only: ${isConsultationOnly}
                          Should show button: ${isStatus3 && isConsultationOnly}
                        `);
                        
                        return isStatus3 && isConsultationOnly ? (
                          <button
                            onClick={() => handleShowSTIModal(appointment)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: '#8b5cf6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 16px',
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            <FaVial /> Đăng ký xét nghiệm STIs
                          </button>
                        ) : null;
                      })()}
                      
                      {/* Add button for canceling appointment if status is 0, 1, 3 AND payment status is 2 */}
                      {(() => {
                        // Check if the cancel button should be displayed
                        const canCancel = 
                          // Status conditions (0: Chờ xác nhận, 1: Đã xác nhận, 3: Yêu cầu xét nghiệm STIs)
                          (appointment.status === 0 || appointment.status === 1 || appointment.status === 3) && 
                          // Payment status condition (2: Đã thanh toán)
                          appointment.paymentStatus === 2;
                        
                        console.log(`🔍 Cancel button check for appointment ${appointment.appointmentID}: 
                          Status: ${appointment.status} (${getStatusText(appointment.status)})
                          Payment status: ${appointment.paymentStatus} (${getPaymentStatusText(appointment.paymentStatus)})
                          Can cancel: ${canCancel}
                        `);
                        
                        return canCancel ? (
                          <button
                            onClick={() => handleShowCancelModal(appointment)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 16px',
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            <FaBan /> Hủy cuộc hẹn
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error message display */}
      {errorMessage && (
        <div style={{
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
          <FaTimesCircle size={18} />
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

      {/* Success message display */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
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
          <FaCheckCircle size={18} />
          <div>{successMessage}</div>
          <button 
            onClick={() => setSuccessMessage(null)}
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
      
      {/* STI Test Modal */}
      {/* Show STI modal when active */}
      {showSTIModal && selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '90%',
            maxWidth: 500,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 20, marginBottom: 16, color: '#2563eb', textAlign: 'center' }}>
              Đăng Ký Xét Nghiệm STIs
            </h3>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                Đang tải dịch vụ xét nghiệm...
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#2563eb' }}>
                    Chọn dịch vụ xét nghiệm:
                  </label>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                    Hãy lựa chọn dịch vụ xét nghiệm phù hợp với nhu cầu của bạn.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '300px', overflowY: 'auto' }}>
                    {stiServices.length > 0 ? (
                      stiServices.map(service => (
                        <div 
                          key={service.servicesID || service.id} 
                          style={{ 
                            padding: 16,
                            border: `2px solid ${selectedService === (service.servicesID || service.id) ? '#3b82f6' : '#e5e7eb'}`,
                            borderRadius: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: selectedService === (service.servicesID || service.id) ? '#f0f7ff' : '#ffffff',
                            boxShadow: selectedService === (service.servicesID || service.id) ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => setSelectedService(service.servicesID || service.id)}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 600, 
                              fontSize: 16, 
                              color: selectedService === (service.servicesID || service.id) ? '#2563eb' : '#374151',
                              marginBottom: 6
                            }}>
                              {service.servicesName || service.name}
                            </div>
                            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                              {(service.description || service.desc)?.substring(0, 150)}
                              {(service.description || service.desc)?.length > 150 ? '...' : ''}
                            </div>
                          </div>
                          <div style={{ 
                            color: '#059669', 
                            fontWeight: 600, 
                            marginLeft: 16, 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'center'
                          }}>
                            <div>{(service.servicesPrice || service.price)?.toLocaleString('vi-VN')} VNĐ</div>
                            {selectedService === (service.servicesID || service.id) && (
                              <div style={{ 
                                fontSize: 12, 
                                color: '#2563eb', 
                                marginTop: 4, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4 
                              }}>
                                <FaCheckCircle /> Đã chọn
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#6b7280', 
                        padding: 24, 
                        backgroundColor: '#f9fafb', 
                        borderRadius: 8,
                        border: '1px dashed #d1d5db'
                      }}>
                        Không tìm thấy dịch vụ xét nghiệm nào. Vui lòng thử lại sau.
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 20,
                  marginTop: 24 
                }}>
                  <div style={{ fontSize: 14, color: '#4b5563' }}>
                    {selectedService !== null && stiServices.find(s => (s.servicesID || s.id) === selectedService) ? (
                      <div style={{ fontStyle: 'italic' }}>
                        Dịch vụ đã chọn: <span style={{ fontWeight: 600, color: '#2563eb' }}>
                          {stiServices.find(s => (s.servicesID || s.id) === selectedService)?.servicesName || 
                           stiServices.find(s => (s.servicesID || s.id) === selectedService)?.name}
                        </span>
                      </div>
                    ) : (
                      <div>Vui lòng chọn một dịch vụ xét nghiệm</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowSTIModal(false)}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        background: '#ffffff',
                        color: '#374151',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <FaTimesCircle size={14} /> Hủy bỏ
                    </button>
                    <button
                      onClick={handleSubmitSTIRequest}
                      disabled={selectedService === null || isLoading}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: 8,
                        background: selectedService === null ? '#9ca3af' : '#3b82f6',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: selectedService === null ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: selectedService !== null ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (selectedService !== null && !isLoading) {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedService !== null && !isLoading) {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                        }
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div style={{ 
                            width: 16, 
                            height: 16, 
                            border: '2px solid rgba(255,255,255,0.3)', 
                            borderTop: '2px solid #fff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle size={16} /> Xác nhận đăng ký
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Add some CSS for animations */}
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px) translateX(-50%); }
                      to { opacity: 1; transform: translateY(0) translateX(-50%); }
                    }
                  `}
                </style>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Cancel Appointment Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <FaBan size={40} color="#ef4444" style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                Xác nhận hủy cuộc hẹn
              </h2>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn hủy cuộc hẹn này không? Yêu cầu hủy cuộc hẹn của bạn sẽ được gửi đến quản trị viên để xử lý.
              </p>
            </div>
            
            <div style={{ 
              marginTop: 24, 
              padding: 16, 
              backgroundColor: '#f9fafb', 
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#4b5563', fontSize: 15 }}>
                Thông tin cuộc hẹn:
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Mã cuộc hẹn:</span> {selectedAppointment.appointmentID}</div>
                <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Ngày hẹn:</span> {formatDate(selectedAppointment.appointmentDate)}</div>
                {selectedAppointment.slot && (
                  <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Thời gian:</span> {formatTime(selectedAppointment.slot.startTime)} - {formatTime(selectedAppointment.slot.endTime)}</div>
                )}
                <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Trạng thái:</span> <span style={{ color: statusColor(selectedAppointment.status) }}>{getStatusText(selectedAppointment.status)}</span></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: '#ffffff',
                  color: '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <FaTimesCircle size={14} /> Đóng lại
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelLoading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 8,
                  background: cancelLoading ? '#9ca3af' : '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: cancelLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  boxShadow: cancelLoading ? 'none' : '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!cancelLoading) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!cancelLoading) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                  }
                }}
              >
                {cancelLoading ? (
                  <>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaBan size={16} /> Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Appointment Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <CancelAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelAppointment}
          isLoading={cancelLoading}
        />
      )}
      
      {/* Success Modal for STI Test Registration */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <FaCheckCircle size={60} color="#16a34a" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 24, margin: '0 0 12px', color: '#16a34a' }}>Đăng ký xét nghiệm thành công!</h3>
              <p style={{ fontSize: 16, marginBottom: 24, color: '#4b5563' }}>
                Bạn đã đăng ký dịch vụ xét nghiệm STI thành công. Vui lòng thanh toán để hoàn tất quá trình đăng ký.
              </p>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#ffffff',
                    color: '#374151',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FaTimesCircle size={14} /> Đóng
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: 8,
                    background: '#3b82f6',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #f3f4f6',
                        borderTop: '2px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave size={16} /> Thanh toán ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;