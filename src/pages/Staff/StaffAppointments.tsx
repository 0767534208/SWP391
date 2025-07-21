import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import './StaffAppointments.css';
import { FaSync, FaCheckCircle, FaTimesCircle, FaEye, FaPencilAlt, FaMoneyBillWave } from 'react-icons/fa';
import { appointmentAPI } from '../../utils/api';

interface AppointmentType {
  id: string;
  patientName: string;
  patientPhone: string;
  service: string;
  serviceType: 'test' | 'consultation';
  price: string;
  date: string;
  time: string;
  consultant: string;
  status: string;
  paymentStatus: number;
  testResults?: string;
  consultationNotes?: string;
}

// Toast notification type
interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Helper functions for status display
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'status-badge status-badge-pending';
    case 'confirmed':
      return 'status-badge status-badge-confirmed';
    case 'in_progress':
      return 'status-badge status-badge-in-progress';
    case 'require_stis_test':
      return 'status-badge status-badge-require-test';
    case 'awaiting_results':
      return 'status-badge status-badge-awaiting-results';
    case 'completed':
      return 'status-badge status-badge-completed';
    case 'cancelled':
      return 'status-badge status-badge-cancelled';
    case 'request_refund':
      return 'status-badge status-badge-request-refund';
    case 'request_cancel':
      return 'status-badge status-badge-request-cancel';
    default:
      return 'status-badge status-badge-pending';
  }
};

// Inline styles for status badges to ensure they always have colors
const getStatusStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'confirmed':
      return { backgroundColor: '#e0f2fe', color: '#0369a1' };
    case 'in_progress':
      return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
    case 'require_stis_test':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'awaiting_results':
      return { backgroundColor: '#fae8ff', color: '#a21caf' };
    case 'completed':
      return { backgroundColor: '#d1fae5', color: '#047857' };
    case 'cancelled':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    case 'request_refund':
      return { backgroundColor: '#ede9fe', color: '#6d28d9' };
    case 'request_cancel':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    default:
      return { backgroundColor: '#fef3c7', color: '#92400e' };
  }
};

const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Đang Chờ';
    case 'confirmed':
      return 'Đã Xác Nhận';
    case 'in_progress':
      return 'Đang Thực Hiện';
    case 'require_stis_test':
      return 'Yêu cầu xét nghiệm STIs';
    case 'awaiting_results':
      return 'Đợi Kết Quả';
    case 'completed':
      return 'Hoàn Thành';
    case 'cancelled':
      return 'Đã Hủy';
    case 'request_refund':
      return 'Yêu Cầu Hoàn Tiền';
    case 'request_cancel':
      return 'Yêu Cầu Hủy';
    default:
      return 'Đang Chờ';
  }
};

// Map API status numbers to string values
const mapStatusNumberToString = (statusNumber: number): string => {
  switch (statusNumber) {
    case 0:
      return 'pending';
    case 1:
      return 'confirmed';
    case 2:
      return 'in_progress';
    case 3:
      return 'require_stis_test';
    case 4:
      return 'awaiting_results';
    case 5:
      return 'completed';
    case 6:
      return 'cancelled';
    case 7:
      return 'request_refund';
    case 8:
      return 'request_cancel';
    default:
      return 'pending';
  }
};

// Map string status values to API status numbers
const mapStatusStringToNumber = (statusString: string): number => {
  switch (statusString) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'in_progress':
      return 2;
    case 'require_stis_test':
      return 3;
    case 'awaiting_results':
      return 4;
    case 'completed':
      return 5;
    case 'cancelled':
      return 6;
    case 'request_refund':
      return 7;
    case 'request_cancel':
      return 8;
    default:
      return 0;
  }
};

// Helper function for payment status display
const getPaymentStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ thanh toán';
    case 1:
      return 'Đã đặt cọc';
    case 2:
      return 'Đã thanh toán';
    case 3:
      return 'Đã hoàn tiền';
    case 4:
      return 'Hoàn tiền một phần';
    default:
      return 'Không xác định';
  }
};

// Payment status badge classes are now handled by the PaymentStatusBadge component

// Payment status styles are now handled directly in the PaymentStatusBadge component

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }: { status: number }) => {
  // Get background color based on status
  const getPaymentStatusBgColor = (status: number) => {
    switch (status) {
      case 2: // Đã thanh toán
        return '#d1fadf'; // Light green background
      case 3: // Đã hoàn tiền
        return '#dbeafe'; // Light blue background
      case 4: // Hoàn tiền một phần
        return '#ede9fe'; // Light purple background
      case 1: // Đã đặt cọc
        return '#fef9c3'; // Light yellow background
      case 0: // Chờ thanh toán
        return '#fee2e2'; // Light red background
      default:
        return '#f3f4f6'; // Light gray background
    }
  };
  
  // Get text color based on status
  const getPaymentStatusTextColor = (status: number) => {
    switch (status) {
      case 2: // Đã thanh toán
        return '#16a34a'; // Green text
      case 3: // Đã hoàn tiền
        return '#2563eb'; // Blue text
      case 4: // Hoàn tiền một phần
        return '#8b5cf6'; // Purple text
      case 1: // Đã đặt cọc
        return '#92400e'; // Orange/brown text
      case 0: // Chờ thanh toán
        return '#b91c1c'; // Red text
      default:
        return '#6b7280'; // Gray text
    }
  };

  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 600,
      color: getPaymentStatusTextColor(status),
      backgroundColor: getPaymentStatusBgColor(status),
      border: 'none',
      textAlign: 'center',
    }}>
      {getPaymentStatusText(status)}
    </span>
  );
};

const StaffAppointments = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentType | null>(null);
  const [resultText, setResultText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const appointmentsPerPage = 10;
  
  // Refund related states
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'consultation' | 'sti'>('full');

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Real data from API
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getAllAppointments();
      console.log('Appointment API response:', response.data?.[0]); // Log first appointment to see structure
      // Check all the available fields in the response
      if (response.data && response.data[0]) {
        console.log('Available fields:', Object.keys(response.data[0]));
      }

      if (response.data) {
        // Map API data to our AppointmentType interface
        const mappedAppointments: AppointmentType[] = response.data.map(appointment => {
          // Extract date from appointmentDate
          const appointmentDate = new Date(appointment.appointmentDate || '');
          const formattedDate = appointmentDate.toLocaleDateString('vi-VN');
          
          // Get start and end time from slot data
          let formattedTime = '';
          if (appointment.slot && appointment.slot.startTime && appointment.slot.endTime) {
            const startTime = new Date(appointment.slot.startTime);
            const endTime = new Date(appointment.slot.endTime);
            const startHours = startTime.getHours();
            const startMinutes = startTime.getMinutes();
            const endHours = endTime.getHours();
            const endMinutes = endTime.getMinutes();
            
            const formattedStartTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
            const formattedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
            formattedTime = `${formattedStartTime} - ${formattedEndTime}`;
          } else {
            // Fallback if slot data is not available
            const startHours = appointmentDate.getHours();
            const startMinutes = appointmentDate.getMinutes();
            const endHours = startHours + 1;
            const formattedStartTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
            const formattedEndTime = `${endHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
            formattedTime = `${formattedStartTime} - ${formattedEndTime}`;
          }
          
          // Get service information
          let serviceType = 'consultation';
          
          // Get consultant name from the consultant object if available
          const consultantName = appointment.consultant?.name || 'Không có tư vấn viên';
          
          // Get customer name from customer object if available
          const customerName = appointment.customer?.name || 'Không có tên';
          
          // Get phone number from customer object if available
          const phoneNumber = appointment.customer?.phone || 'Không có SĐT';
          
          // Get all service names from appointment details
          let serviceNames: string[] = [];
          
          if (appointment.appointmentDetails && appointment.appointmentDetails.length > 0) {
            // Collect all service names from the details
            for (const detail of appointment.appointmentDetails) {
              if (detail.service && detail.service.servicesName) {
                serviceNames.push(detail.service.servicesName);
                // If any service is a test, we could set serviceType to 'test' here if needed
              }
            }
          }
          
          // Join all service names with comma or use default value if no services found
          const serviceName = serviceNames.length > 0 ? serviceNames.join(', ') : "Tư Vấn";
          
          // Use totalAmount from the API response directly
          const totalPrice = appointment.totalAmount || 0;
          
          // Format price as Vietnamese currency
          const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(totalPrice);
          
          return {
            id: appointment.appointmentID.toString(),
            patientName: customerName,
            patientPhone: phoneNumber,
            service: serviceName,
            serviceType: serviceType as 'test' | 'consultation',
            price: formattedPrice,
            date: formattedDate,
            time: formattedTime,
            consultant: consultantName,
            status: mapStatusNumberToString(appointment.status),
            paymentStatus: appointment.paymentStatus || 0,
            testResults: '',
            consultationNotes: ''
          };
        });

        setAppointments(mappedAppointments);
        setTotalPages(Math.ceil(mappedAppointments.length / appointmentsPerPage));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by search query
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientPhone.includes(searchQuery) ||
      appointment.consultant.toLowerCase().includes(searchQuery) ||
      appointment.service.toLowerCase().includes(searchQuery);
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    // Filter by date range if provided
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate) {
      const appointmentDate = new Date(appointment.date.split('/').reverse().join('-'));
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      matchesDateRange = appointmentDate >= startDate && appointmentDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

      // Handle status change
  const handleStatusChange = (appointment: AppointmentType) => {
    // Log the current status for debugging
    console.log(`Opening status modal for appointment ${appointment.id} with status: ${appointment.status}`);
    
    // Normalize the status if needed
    let normalizedAppointment = {...appointment};
    
    // For appointments where the status isn't properly converted
    if (appointment.status === 'in_progress' && 
        document.querySelectorAll('.status-options .status-option').length === 0) {
      // Force re-render with normalized status
      console.log('Status options missing, forcing normalization');
      normalizedAppointment = {
        ...normalizedAppointment,
        status: 'in_progress'
      };
    }
    
    setCurrentAppointment(normalizedAppointment);
    setIsStatusModalOpen(true);
  };  // Handle view appointment details
  const handleViewDetails = (appointment: AppointmentType) => {
    setCurrentAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  // Update appointment status
  const updateAppointmentStatus = async (newStatus: string) => {
    if (currentAppointment) {
      setIsSubmitting(true);
      
      console.log(`Updating status from ${currentAppointment.status} to ${newStatus}`);
      
      // Directly update status to completed without opening result modal
      // Skip the result input step and update status directly
      
      try {
        // Convert string status to number for API
        const statusNumber = mapStatusStringToNumber(newStatus);
        
        // Call the API to update appointment status
        // Using the correct API endpoint format with query parameters
        // https://localhost:7084/api/appointment/ChangeAppointmentStatus?appointmentID=1&status=4&paymentStatus=1
        const response = await appointmentAPI.changeAppointmentStatus(
          parseInt(currentAppointment.id),
          statusNumber + 1, // Add 1 to the status as requested
          currentAppointment.paymentStatus // Keep current payment status
        );
        
        if (response.statusCode === 200) {
          // Show success toast notification
          showToast("Cập nhật trạng thái thành công!", "success");
          
          // Update local state with the new status
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === currentAppointment.id) {
          return {
            ...appointment,
            status: newStatus
          };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      setIsStatusModalOpen(false);
        }
      } catch (error) {
        console.error('Error updating appointment status:', error);
        showToast("Cập nhật trạng thái thất bại. Vui lòng thử lại sau.", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Save test results and complete appointment
  const saveTestResults = async () => {
    if (currentAppointment && resultText.trim() !== '') {
      setIsSubmitting(true);
      
      try {
        // Update appointment status to completed
        const statusNumber = mapStatusStringToNumber('completed');
        
        const response = await appointmentAPI.changeAppointmentStatus(
          parseInt(currentAppointment.id),
          statusNumber + 1, // Add 1 to the status as requested
          currentAppointment.paymentStatus // Keep current payment status
        );
        
        if (response.statusCode === 200) {
          // Show success toast notification
          showToast("Lưu kết quả thành công!", "success");
          
          // In a real app, you would also save the test results or consultation notes
          // to a separate API endpoint here
          
        const updatedAppointments = appointments.map(appointment => {
          if (appointment.id === currentAppointment.id) {
            const updatedAppointment = {
              ...appointment,
              status: 'completed'
            };
            
            // Save to the appropriate field based on service type
            if (appointment.serviceType === 'test') {
              updatedAppointment.testResults = resultText;
            } else {
              updatedAppointment.consultationNotes = resultText;
            }
            
            return updatedAppointment;
          }
          return appointment;
        });
  
        setAppointments(updatedAppointments);
        setIsResultModalOpen(false);
        setIsStatusModalOpen(false);
          setResultText('');
        }
      } catch (error) {
        console.error('Error saving test results:', error);
        showToast("Lưu kết quả thất bại. Vui lòng thử lại sau.", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast('Vui lòng nhập kết quả trước khi hoàn thành', "error");
    }
  };

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments();
  };

  // Date range handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({...dateRange, startDate: e.target.value});
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({...dateRange, endDate: e.target.value});
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus('all');
    setSearchQuery('');
    setDateRange({startDate: '', endDate: ''});
    setCurrentPage(1);
  };
  
  // Handle opening refund modal
  const handleRefundClick = (appointment: AppointmentType) => {
    setCurrentAppointment(appointment);
    setIsRefundModalOpen(true);
    setRefundType('full'); // Default to full refund
  };
  
  // Process refund
  const processRefund = async () => {
    if (!currentAppointment) return;
    
    try {
      setIsSubmitting(true);
      
      // Use fixed account ID for now - in production this should come from the logged-in user
      const accountId = "73539b7a-f7e5-4889-a662-b71c9bbf7e88";
      const appointmentID = parseInt(currentAppointment.id);
      
      // Call the API with the correct parameters
      const paymentUrl = await appointmentAPI.appointmentRefundFull(
        appointmentID,
        accountId, 
        refundType
      );
      
      console.log("Refund API response (payment URL):", paymentUrl);
      
      // Check if the returned value is a valid VNPay URL
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.includes('vnpayment.vn')) {
        // Open the payment URL in a new tab immediately
        window.open(paymentUrl, '_blank');
        // Close the modal and reset state
        setIsRefundModalOpen(false);
        setRefundType('full');
        showToast("Đã tạo yêu cầu hoàn tiền thành công", "success");
        // Refresh appointments after creating refund
        fetchAppointments();
      } else {
        showToast("Không thể tạo yêu cầu hoàn tiền: Không nhận được URL thanh toán hợp lệ", "error");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      showToast("Xử lý hoàn tiền thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // No longer needed since we're redirecting immediately after refund processing

  return (
    <div className="staff-appointments-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-notification ${toast.type}`}>
            <div className="toast-content">
              {toast.type === 'success' ? (
                <FaCheckCircle className="toast-icon" />
              ) : (
                <FaTimesCircle className="toast-icon" />
              )}
              <span>{toast.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="page-header">
        <h1 className="page-title">Quản Lý Lịch Hẹn</h1>
        <p className="page-subtitle">Theo dõi và cập nhật trạng thái các lịch hẹn</p>
      </div>

      {/* Filter Bar */}
      <div className="appointments-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, bác sĩ, dịch vụ..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="pending">Đang Chờ</option>
              <option value="confirmed">Đã Xác Nhận</option>
              <option value="in_progress">Đang Thực Hiện</option>
              <option value="require_stis_test">Yêu cầu xét nghiệm STIs</option>
              <option value="awaiting_results">Đợi Kết Quả</option>
              <option value="completed">Hoàn Thành</option>
              <option value="cancelled">Đã Hủy</option>
              <option value="request_refund">Yêu Cầu Hoàn Tiền</option>
              <option value="request_cancel">Yêu Cầu Hủy</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="reset-button"
            >
              Xóa bộ lọc
            </button>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative w-full">
              <label htmlFor="start-date" className="date-label">Ngày bắt đầu</label>
              <input
                id="start-date"
                type="date"
                className="filter-input date-input"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="date-separator">
              <span>đến</span>
            </div>
            <div className="relative w-full">
              <label htmlFor="end-date" className="date-label">Ngày kết thúc</label>
              <input
                id="end-date"
                type="date"
                className="filter-input date-input"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
              />
            </div>
            <button 
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <FaSync className="refresh-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="appointments-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="loading-container p-8 text-center">
              <div className="loading-spinner"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu lịch hẹn...</p>
            </div>
          ) : (
          <table className="appointments-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Bệnh Nhân</th>
                <th>Dịch Vụ</th>
                <th>Giá Tiền</th>
                <th>Ngày & Giờ</th>
                <th>Chuyên Gia</th>
                <th>Trạng Thái</th>
                <th>Thanh Toán</th>
                <th className="w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.length > 0 ? (
                currentAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>
                      <div>{appointment.patientName}</div>
                      <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                    </td>
                    <td>
                      <div className="service-list">
                        {appointment.service.split(', ').map((service, index) => (
                          <div key={index} className="service-item-table">{service}</div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-green-700">{appointment.price}</div>
                    </td>
                    <td>
                      <div>{appointment.date}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td>{appointment.consultant}</td>
                    <td>
                      <span 
                        className={getStatusBadgeClass(appointment.status)}
                        style={getStatusStyle(appointment.status)}
                      >
                        {getStatusDisplayText(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <PaymentStatusBadge status={appointment.paymentStatus} />
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="action-button action-button-view"
                          onClick={() => handleViewDetails(appointment)}
                          title="Xem chi tiết"
                          style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          className="action-button action-button-edit"
                          onClick={() => handleStatusChange(appointment)}
                          title="Đổi trạng thái"
                          style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                        >
                          <FaPencilAlt className="h-4 w-4" />
                        </button>
                        {/* Show refund button only for appointments with 'request_cancel' status and payment status 2 (Đã thanh toán) */}
                        {appointment.status === 'request_cancel' && appointment.paymentStatus === 2 && (
                          <button 
                            className="action-button"
                            onClick={() => handleRefundClick(appointment)}
                            title="Xử lý hoàn tiền"
                            style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                          >
                            <FaMoneyBillWave className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">Không tìm thấy lịch hẹn nào</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && currentAppointments.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-button"
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="pagination-button"
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden modal-container status-update-modal">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cập Nhật Trạng Thái Lịch Hẹn</h3>
            </div>
            <div className="p-4">
              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Thông tin cuộc hẹn</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Mã cuộc hẹn:</span>
                    <span className="text-sm font-medium">#{currentAppointment.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Ngày tạo:</span>
                    <span className="text-sm font-medium">{currentAppointment.date}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Thông tin bệnh nhân</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Họ tên:</span>
                    <span className="text-sm font-medium">{currentAppointment.patientName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Số điện thoại:</span>
                    <span className="text-sm font-medium">{currentAppointment.patientPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Chi tiết dịch vụ</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Dịch vụ:</span>
                    <div className="text-sm font-medium">
                      {currentAppointment.service.split(', ').map((service, index) => (
                        <div key={index} className="service-item">{service}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Chuyên gia:</span>
                    <span className="text-sm font-medium">{currentAppointment.consultant}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Ngày & giờ hẹn:</span>
                    <span className="text-sm font-medium">{currentAppointment.date} {currentAppointment.time}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Cập nhật trạng thái</h4>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Trạng thái hiện tại:</span>
                    <span className={getStatusBadgeClass(currentAppointment.status)}>
                      {getStatusDisplayText(currentAppointment.status)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Trạng thái thanh toán:</span>
                    <PaymentStatusBadge status={currentAppointment.paymentStatus} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Chọn trạng thái mới:</div>
                    <div className="status-options">
                      {currentAppointment.status === 'pending' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-confirmed"
                            onClick={() => updateAppointmentStatus('confirmed')}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Đang cập nhật...' : 'Đã Xác Nhận'}
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'confirmed' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-in-progress"
                            onClick={() => updateAppointmentStatus('in_progress')}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Đang cập nhật...' : 'Đang Thực Hiện'}
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'in_progress' && (
                        <div className="status-option">
                          <p className="text-sm text-gray-500 italic">Không có trạng thái tiếp theo khả dụng. Chờ bác sĩ/chuyên gia cập nhật.</p>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'require_stis_test' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-awaiting-results"
                            onClick={() => updateAppointmentStatus('awaiting_results')}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Đang cập nhật...' : 'Đợi Kết Quả'}
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'awaiting_results' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-completed"
                            onClick={() => updateAppointmentStatus('completed')}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Đang cập nhật...' : 'Hoàn Thành'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-5">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-all"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Modal */}
      {isResultModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden modal-container result-input-modal">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentAppointment.serviceType === 'test' 
                  ? 'Nhập Kết Quả Xét Nghiệm' 
                  : 'Nhập Nhận Xét Tư Vấn'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn đóng mà không lưu kết quả?')) {
                    setIsResultModalOpen(false);
                  }
                }}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Bệnh nhân:</p>
                <p className="font-medium">{currentAppointment.patientName}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Dịch vụ:</p>
                <p className="font-medium">{currentAppointment.service}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentAppointment.serviceType === 'test' 
                    ? 'Kết quả xét nghiệm' 
                    : 'Nhận xét tư vấn'} <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={5}
                  placeholder={currentAppointment.serviceType === 'test' 
                    ? "Nhập kết quả xét nghiệm và ghi chú" 
                    : "Nhập nhận xét và khuyến nghị sau buổi tư vấn"}
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  required
                  disabled={isSubmitting}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Vui lòng nhập {currentAppointment.serviceType === 'test' ? 'kết quả xét nghiệm' : 'nhận xét tư vấn'} trước khi chuyển trạng thái sang Hoàn thành
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    if (resultText.trim() !== '' && window.confirm('Bạn có chắc chắn muốn đóng mà không lưu kết quả?')) {
                      setIsResultModalOpen(false);
                    } else if (resultText.trim() === '') {
                      setIsResultModalOpen(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  onClick={saveTestResults}
                  disabled={isSubmitting || resultText.trim() === ''}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu và hoàn thành'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {isDetailsModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden modal-container">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết cuộc hẹn #{currentAppointment.id}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Thông tin cuộc hẹn</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Mã cuộc hẹn:</span>
                    <span className="text-sm font-medium">#{currentAppointment.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Ngày hẹn:</span>
                    <span className="text-sm font-medium">{currentAppointment.date}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Giờ hẹn:</span>
                    <span className="text-sm font-medium">{currentAppointment.time}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Giá tiền:</span>
                    <span className="text-sm font-medium text-green-700">{currentAppointment.price}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Trạng thái:</span>
                    <span 
                      className={getStatusBadgeClass(currentAppointment.status)}
                      style={getStatusStyle(currentAppointment.status)}
                    >
                      {getStatusDisplayText(currentAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Thông tin bệnh nhân</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Họ tên:</span>
                    <span className="text-sm font-medium">{currentAppointment.patientName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Số điện thoại:</span>
                    <span className="text-sm font-medium">{currentAppointment.patientPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-base font-medium text-blue-600 mb-3">Chi tiết dịch vụ</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Dịch vụ:</span>
                    <div className="text-sm font-medium">
                      {currentAppointment.service.split(', ').map((service, index) => (
                        <div key={index} className="service-item">{service}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Chuyên gia:</span>
                    <span className="text-sm font-medium">{currentAppointment.consultant}</span>
                  </div>
                </div>
              </div>
              
              {currentAppointment.status === 'completed' && (
                <div className="mb-5 border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-base font-medium text-blue-600 mb-3">Kết quả / Ghi chú</h4>
                  <div className="p-3 bg-white border border-gray-200 rounded-md">
                    <p className="text-sm whitespace-pre-line">
                      {currentAppointment.serviceType === 'test' 
                        ? (currentAppointment.testResults || 'Không có kết quả xét nghiệm')
                        : (currentAppointment.consultationNotes || 'Không có ghi chú tư vấn')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-all"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  Đóng
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-all"
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleStatusChange(currentAppointment);
                  }}
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Refund Modal */}
      {isRefundModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden modal-container">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg text-gray-900">Xử lý hoàn tiền</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsRefundModalOpen(false)}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Thông tin lịch hẹn:</p>
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div><span className="font-medium">ID:</span> {currentAppointment.id}</div>
                  <div><span className="font-medium">Bệnh nhân:</span> {currentAppointment.patientName}</div>
                  <div><span className="font-medium">Dịch vụ:</span> {currentAppointment.service}</div>
                  <div><span className="font-medium">Giá tiền:</span> <span className="text-green-700 font-semibold">{currentAppointment.price}</span></div>
                  <div><span className="font-medium">Ngày & giờ:</span> {currentAppointment.date} {currentAppointment.time}</div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-700 font-medium mb-1">Chi tiết hoàn tiền:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Hoàn tiền toàn bộ:</div>
                      <div className="text-right font-medium">{currentAppointment.price}</div>
                      <div>• Hoàn tiền tư vấn:</div>
                      <div className="text-right font-medium">350.000 ₫</div>
                      <div>• Hoàn tiền xét nghiệm:</div>
                      <div className="text-right font-medium">500.000 ₫</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Chọn loại hoàn tiền:</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="full-refund" 
                        name="refund-type" 
                        checked={refundType === 'full'} 
                        onChange={() => setRefundType('full')} 
                        className="mr-2"
                      />
                      <label htmlFor="full-refund" className="text-gray-700">Hoàn tiền toàn bộ (Full)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="consultation-refund" 
                        name="refund-type" 
                        checked={refundType === 'consultation'} 
                        onChange={() => setRefundType('consultation')} 
                        className="mr-2"
                      />
                      <label htmlFor="consultation-refund" className="text-gray-700">Hoàn tiền tư vấn (Consultation)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="sti-refund" 
                        name="refund-type" 
                        checked={refundType === 'sti'} 
                        onChange={() => setRefundType('sti')} 
                        className="mr-2"
                      />
                      <label htmlFor="sti-refund" className="text-gray-700">Hoàn tiền xét nghiệm (STI)</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={processRefund}
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    isSubmitting ? 'bg-red-400 cursor-wait' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.9 : 1 }}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xử lý hoàn tiền'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments; 