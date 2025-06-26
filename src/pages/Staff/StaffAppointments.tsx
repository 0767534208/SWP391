import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StaffAppointments.css';
import { FaSync, FaEllipsisH } from 'react-icons/fa';

interface AppointmentType {
  id: number;
  patientName: string;
  patientPhone: string;
  service: string;
  serviceType: 'test' | 'consultation';
  date: string;
  time: string;
  consultant: string;
  status: string;
  notes: string;
  testResults?: string;
  consultationNotes?: string;
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
    case 'awaiting_results':
      return 'status-badge status-badge-awaiting-results';
    case 'completed':
      return 'status-badge status-badge-completed';
    default:
      return 'status-badge status-badge-pending';
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
    case 'awaiting_results':
      return 'Đợi Kết Quả';
    case 'completed':
      return 'Hoàn Thành';
    default:
      return 'Đang Chờ';
  }
};

const StaffAppointments = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentType | null>(null);
  const [resultText, setResultText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const appointmentsPerPage = 10;

  // Mock data
  const [appointments, setAppointments] = useState<AppointmentType[]>([
    { id: 1, patientName: "Nguyễn Văn A", patientPhone: "0901234567", service: "Xét nghiệm HIV", serviceType: 'test', date: "15/06/2023", time: "09:00", consultant: "Dr. Minh", status: "pending", notes: "Lịch hẹn lần đầu" },
    { id: 2, patientName: "Trần Thị B", patientPhone: "0912345678", service: "Tư vấn STI", serviceType: 'consultation', date: "16/06/2023", time: "10:30", consultant: "Dr. Hoa", status: "confirmed", notes: "Đã xác nhận qua điện thoại" },
    { id: 3, patientName: "Lê Văn C", patientPhone: "0923456789", service: "Xét nghiệm STI tổng quát", serviceType: 'test', date: "17/06/2023", time: "14:00", consultant: "Dr. Minh", status: "in_progress", notes: "Đang thực hiện xét nghiệm" },
    { id: 4, patientName: "Phạm Thị D", patientPhone: "0934567890", service: "Tư vấn sức khỏe tình dục", serviceType: 'consultation', date: "18/06/2023", time: "15:30", consultant: "Dr. Hoa", status: "awaiting_results", notes: "Đang chờ kết quả tư vấn" },
    { id: 5, patientName: "Hoàng Văn E", patientPhone: "0945678901", service: "Xét nghiệm HIV", serviceType: 'test', date: "19/06/2023", time: "08:00", consultant: "Dr. Nam", status: "completed", notes: "Đã hoàn thành tư vấn và xét nghiệm", testResults: "HIV: Âm tính\nGhi chú: Tư vấn về phòng ngừa đã được thực hiện" },
    { id: 6, patientName: "Ngô Thị F", patientPhone: "0956789012", service: "Tư vấn STI", serviceType: 'consultation', date: "20/06/2023", time: "11:00", consultant: "Dr. Nam", status: "pending", notes: "" },
    { id: 7, patientName: "Vũ Văn G", patientPhone: "0967890123", service: "Xét nghiệm STI tổng quát", serviceType: 'test', date: "21/06/2023", time: "13:30", consultant: "Dr. Minh", status: "confirmed", notes: "Đã xác nhận qua email" },
    { id: 8, patientName: "Đặng Thị H", patientPhone: "0978901234", service: "Tư vấn sức khỏe tình dục", serviceType: 'consultation', date: "22/06/2023", time: "16:00", consultant: "Dr. Hoa", status: "completed", notes: "Đã hoàn thành tư vấn", consultationNotes: "Đã tư vấn về các biện pháp phòng tránh an toàn" },
  ]);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientPhone.includes(searchQuery) ||
      appointment.consultant.toLowerCase().includes(searchQuery) ||
      appointment.service.toLowerCase().includes(searchQuery);
    
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
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle status change
  const handleStatusChange = (appointment: AppointmentType) => {
    setCurrentAppointment(appointment);
    setIsStatusModalOpen(true);
  };

  // Handle view test results
  const handleViewTestResults = (appointmentId: number) => {
    navigate(`/staff/test-results/${appointmentId}`);
  };

  // Update appointment status
  const updateAppointmentStatus = (newStatus: string) => {
    if (currentAppointment) {
      // If changing from awaiting_results to completed, redirect to test results input page
      if (currentAppointment.status === 'awaiting_results' && newStatus === 'completed') {
        navigate(`/staff/test-result-input/${currentAppointment.id}`);
        setIsStatusModalOpen(false);
        return;
      }
      
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
  };

  // Save test results and complete appointment
  const saveTestResults = () => {
    if (currentAppointment && resultText.trim() !== '') {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
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
        setIsSubmitting(false);
        setResultText('');
      }, 1000);
    } else {
      alert('Vui lòng nhập kết quả trước khi hoàn thành');
    }
  };

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call to refresh data
    setTimeout(() => {
      // In a real app, you would fetch fresh data from the server here
      setIsRefreshing(false);
    }, 1000);
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

  return (
    <div className="staff-appointments-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Lịch Hẹn</h1>
          <p className="text-sm text-gray-500">
            Theo dõi và cập nhật trạng thái các lịch hẹn
          </p>
        </div>
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
              <option value="awaiting_results">Đợi Kết Quả</option>
              <option value="completed">Hoàn Thành</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="reset-button"
            >
              Đặt Lại
            </button>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative w-full">
              <input
                type="date"
                className="filter-input date-input"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="relative w-full">
              <input
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
          <table className="appointments-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Bệnh Nhân</th>
                <th>Dịch Vụ</th>
                <th>Ngày & Giờ</th>
                <th>Chuyên Gia</th>
                <th>Trạng Thái</th>
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
                    <td>{appointment.service}</td>
                    <td>
                      <div>{appointment.date}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td>{appointment.consultant}</td>
                    <td>
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {getStatusDisplayText(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="action-button action-button-edit"
                          onClick={() => handleStatusChange(appointment)}
                          title="Cập nhật trạng thái"
                        >
                          <FaEllipsisH className="h-4 w-4" />
                        </button>
                        {appointment.status === 'completed' && (
                          <button 
                            className="action-button action-button-view"
                            onClick={() => handleViewTestResults(appointment.id)}
                            title="Xem kết quả"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">Không tìm thấy lịch hẹn nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredAppointments.length > 0 && (
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
                    <span className="w-32 text-sm text-gray-500">Loại dịch vụ:</span>
                    <span className="text-sm font-medium">{currentAppointment.service}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Chuyên gia:</span>
                    <span className="text-sm font-medium">{currentAppointment.consultant}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">Ngày & giờ hẹn:</span>
                    <span className="text-sm font-medium">{currentAppointment.date} {currentAppointment.time}</span>
                  </div>
                  {currentAppointment.notes && (
                    <div className="flex">
                      <span className="w-32 text-sm text-gray-500">Ghi chú:</span>
                      <span className="text-sm font-medium">{currentAppointment.notes}</span>
                    </div>
                  )}
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
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Chọn trạng thái mới:</div>
                    <div className="status-options">
                      {currentAppointment.status === 'pending' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-confirmed"
                            onClick={() => updateAppointmentStatus('confirmed')}
                          >
                            Đã Xác Nhận
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'confirmed' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-in-progress"
                            onClick={() => updateAppointmentStatus('in_progress')}
                          >
                            Đang Thực Hiện
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'in_progress' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-awaiting-results"
                            onClick={() => updateAppointmentStatus('awaiting_results')}
                          >
                            Đợi Kết Quả
                          </button>
                        </div>
                      )}
                      
                      {currentAppointment.status === 'awaiting_results' && (
                        <div className="status-option">
                          <button 
                            className="status-button status-button-completed"
                            onClick={() => updateAppointmentStatus('completed')}
                          >
                            Hoàn Thành
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
    </div>
  );
};

export default StaffAppointments; 