import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaCheck, FaCalendarAlt, FaListUl, FaEllipsisV, FaPlay } from 'react-icons/fa';
import './ConsultantAppointments.css';
import { consultantService } from '../../services';
import { toast } from 'react-hot-toast';

interface Appointment {
  appointmentID: string;
  customerID: string;
  consultantID: string;
  appointmentDate: string;
  appointmentCode: string;
  status: number;
  appointmentType: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string;
  slot?: {
    slotID: number;
    startTime: string;
    endTime: string;
  };
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  appointmentDetails?: {
    service?: {
      servicesName: string;
      serviceType: number;
    };
  }[];
  notes?: string;
}

const statusLabels = [
  "Đang chờ xác nhận",     // Pending = 0
  "Đã xác nhận",           // Confirmed = 1
  "Đang xử lý",            // InProgress = 2
  "Yêu cầu xét nghiệm STI", // RequireSTIsTest = 3
  "Chờ kết quả",           // WaitingForResult = 4
  "Đã hoàn thành",         // Completed = 5
  "Đã hủy",                // Cancelled = 6
  "Yêu cầu hoàn tiền",     // RequestRefund = 7
  "Yêu cầu hủy"            // RequestCancel = 8
];

const statusClasses = [
  "status-pending",
  "status-confirmed",
  "status-inprogress",
  "status-testing",
  "status-waiting",
  "status-completed",
  "status-cancelled",
  "status-refund",
  "status-requestcancel"
];

const appointmentTypeLabels = [
  "Tư vấn",
  "Xét nghiệm"
];

const serviceTypeLabels = [
  "Tư vấn",
  "Xét nghiệm STI"
];

const ConsultantAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [consultantSlots, setConsultantSlots] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{appointmentId: string, newStatus: number, paymentStatus?: number} | null>(null);

  // Appointment Actions Component
  const AppointmentActions: React.FC<{appointment: Appointment}> = ({ appointment }) => {
    const isDropdownOpen = dropdownOpen === appointment.appointmentID;
    
    const toggleDropdown = () => {
      setDropdownOpen(isDropdownOpen ? null : appointment.appointmentID);
    };

    const closeDropdown = () => {
      setDropdownOpen(null);
    };

    const handleAction = (action: () => void) => {
      action();
      closeDropdown();
    };

    return (
      <div className="appointment-actions-dropdown">
        <button 
          className="actions-toggle"
          onClick={toggleDropdown}
          title="Thao tác"
        >
          <FaEllipsisV />
        </button>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-overlay" onClick={closeDropdown}></div>
            <div className="dropdown-content">
              {!canUpdateAppointment(appointment) ? (
                <div className="dropdown-item disabled-item">
                  <span>Không có quyền cập nhật</span>
                  <small style={{ display: 'block', marginTop: '0.25rem' }}>
                    (Ngoài slot được phân công)
                  </small>
                </div>
              ) : (
                <>
                  {appointment.status === 0 && ( // Pending
                    <>
                      <button 
                        className="dropdown-item approve-item"
                        onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 1))}
                      >
                        <FaCheck /> Xác nhận
                      </button>
                      <button 
                        className="dropdown-item cancel-item"
                        onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 6))}
                      >
                        <FaTimes /> Từ chối
                      </button>
                    </>
                  )}
                    
                  {appointment.status === 1 && ( // Confirmed
                    <>
                      <button 
                        className="dropdown-item progress-item"
                        onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 2))}
                      >
                        <FaPlay /> Bắt đầu xử lý
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 2 && ( // InProgress
                    <>
                      <button 
                        className="dropdown-item approve-item"
                        onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 5))}
                      >
                        <FaCheck /> Hoàn thành
                      </button>
                      {canRequestSTITest(appointment) && (
                        <button 
                          className="dropdown-item testing-item"
                          onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 3, 2))}
                        >
                          🧪 Yêu cầu STI Test
                        </button>
                      )}
                    </>
                  )}
                    
                  {appointment.status === 3 && ( // STI Test requested
                    <>
                      <div className="dropdown-item disabled-item">
                        Đang chờ xét nghiệm STI
                      </div>
                      <button 
                        className="dropdown-item testing-item"
                        onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 4))}
                      >
                        🔄 Chuyển sang Chờ kết quả
                      </button>
                    </>
                  )}
                    
                  {appointment.status === 4 && ( // WaitingForResult
                    <button 
                      className="dropdown-item approve-item"
                      onClick={() => handleAction(() => confirmStatusUpdate(appointment.appointmentID, 5))}
                    >
                      <FaCheck /> Hoàn thành
                    </button>
                  )}
                </>
              )}
              
              {/* Chi tiết luôn hiển thị cho tất cả lịch hẹn */}
              <button 
                className="dropdown-item details-item"
                onClick={() => handleAction(() => viewAppointmentDetails(appointment))}
              >
                Chi tiết
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        
        if (!consultantId) {
          setError('Không tìm thấy thông tin người dùng');
          toast.error('Không tìm thấy thông tin người dùng');
          return;
        }
        
        // Fetch appointments
        const response = await consultantService.getConsultantAppointments(consultantId);
        
        if (response.statusCode === 200 && response.data) {
          setAppointments(response.data);
          setFilteredAppointments(response.data);
          console.log('Appointments loaded:', response.data);
          // Check if appointmentCode exists in the data
          if (response.data.length > 0) {
            console.log('First appointment code:', response.data[0].appointmentCode);
          }
        } else {
          setError(`Lỗi khi lấy dữ liệu: ${response.message}`);
          toast.error(`Lỗi khi lấy dữ liệu lịch hẹn: ${response.message}`);
        }

        // Fetch consultant slots
        try {
          const slotsResponse = await consultantService.getConsultantSlots(consultantId);
          if (slotsResponse.statusCode === 200 && slotsResponse.data) {
            const slotIds = slotsResponse.data.map((slot: { slotID: number }) => slot.slotID);
            setConsultantSlots(slotIds);
            console.log('Consultant slots:', slotIds);
          }
        } catch (slotError) {
          console.error('Error fetching consultant slots:', slotError);
          // Don't show error to user, just log it
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Có lỗi khi tải dữ liệu lịch hẹn');
        toast.error('Có lỗi khi tải dữ liệu lịch hẹn, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.appointment-actions-dropdown')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== null) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== null) {
      filtered = filtered.filter(app => {
        const hasSTITest = app.appointmentDetails && app.appointmentDetails.length > 0 && 
          app.appointmentDetails.some(detail => 
            detail.service?.serviceType === 1 || 
            detail.service?.servicesName.toLowerCase().includes('sti') ||
            detail.service?.servicesName.toLowerCase().includes('xét nghiệm')
          );
        const appointmentTypeIndex = hasSTITest ? 1 : 0;
        return appointmentTypeIndex === typeFilter;
      });
    }
    
    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(app => app.appointmentDate.split('T')[0] === dateFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.customer?.name?.toLowerCase().includes(searchTermLower) || 
        app.appointmentID.toLowerCase().includes(searchTermLower) ||
        app.customer?.phone?.toLowerCase().includes(searchTermLower) ||
        app.customer?.email?.toLowerCase().includes(searchTermLower) ||
        (app.appointmentCode && app.appointmentCode.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, typeFilter, dateFilter, searchTerm]);

  // Get appointment type from services
  const getAppointmentType = (appointment: Appointment): string => {
    if (appointment.appointmentDetails && appointment.appointmentDetails.length > 0) {
      const hasSTITest = appointment.appointmentDetails.some(detail => 
        detail.service?.serviceType === 1 || 
        detail.service?.servicesName.toLowerCase().includes('sti') ||
        detail.service?.servicesName.toLowerCase().includes('xét nghiệm')
      );
      return hasSTITest ? serviceTypeLabels[1] : serviceTypeLabels[0];
    }
    return serviceTypeLabels[0];
  };

  // Check if consultant can update appointment (must be in their assigned slot)
  const canUpdateAppointment = (appointment: Appointment): boolean => {
    if (!appointment.slot) return false;
    return consultantSlots.includes(appointment.slot.slotID);
  };

  // Validate STI test request - only for in-progress appointments
  const canRequestSTITest = (appointment: Appointment): boolean => {
    return appointment.status === 2 && canUpdateAppointment(appointment);
  };

  // Show confirmation modal before updating status
  const confirmStatusUpdate = (appointmentId: string, newStatus: number, paymentStatus?: number) => {
    setPendingAction({ appointmentId, newStatus, paymentStatus });
    setIsConfirmModalOpen(true);
  };
  
  // Execute the status update after confirmation
  const updateAppointmentStatus = async (appointmentId: string, newStatus: number, paymentStatus?: number) => {
    try {
      const response = await consultantService.updateAppointmentStatus(appointmentId, newStatus, paymentStatus);
      
      if (response.statusCode === 200) {
        // Update the local state to reflect the change
        setAppointments(appointments.map(appointment => 
          appointment.appointmentID === appointmentId 
            ? { ...appointment, status: newStatus, paymentStatus: paymentStatus || appointment.paymentStatus } 
              : appointment
        ));
        
        toast.success('Cập nhật trạng thái lịch hẹn thành công');
        
        // Close modal if it's open
        if (showDetailModal) {
          setShowDetailModal(false);
          setSelectedAppointment(null);
        }
      } else {
        toast.error(`Không thể cập nhật trạng thái: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái lịch hẹn, vui lòng thử lại sau');
    } finally {
      // Close confirmation modal if open
      setIsConfirmModalOpen(false);
      setPendingAction(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setDateFilter('');
    setSearchTerm('');
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format time from ISO string
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get appointment time from slot
  const getAppointmentTime = (appointment: Appointment): string => {
    if (appointment.slot) {
      const startTime = new Date(appointment.slot.startTime);
      const endTime = new Date(appointment.slot.endTime);
      
      return `${startTime.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${endTime.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    return formatTime(appointment.appointmentDate);
  };

  // Sort appointments by ID (ascending order)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // Try to parse IDs as numbers for numeric sorting if possible
    const idA = parseInt(a.appointmentID);
    const idB = parseInt(b.appointmentID);
    
    // If both IDs can be parsed as numbers, sort numerically
    if (!isNaN(idA) && !isNaN(idB)) {
      return idA - idB;
    }
    
    // Otherwise sort as strings
    return a.appointmentID.localeCompare(b.appointmentID);
  });

  // View appointment details
  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setSelectedAppointment(null);
    setShowDetailModal(false);
  };

  return (
    <div className="consultant-appointments-container">
      <div className="appointments-header">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản lý lịch hẹn</h1>
          <p className="text-sm text-gray-500">Tổng số: {filteredAppointments.length} lịch hẹn</p>
        </div>
        
        <div className="header-controls">
          <button 
            className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaListUl /> Danh sách
          </button>
          <button 
            className={`view-toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <FaCalendarAlt /> Lịch
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã, số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Trạng thái</label>
            <select 
              value={statusFilter === null ? '' : statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              {statusLabels.map((label, index) => (
                <option key={index} value={index}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Loại lịch hẹn</label>
            <select 
              value={typeFilter === null ? '' : typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">Tất cả loại</option>
              {appointmentTypeLabels.map((label, index) => (
                <option key={index} value={index}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Ngày hẹn</label>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-input"
            />
          </div>
          
          <button className="reset-button" onClick={clearFilters}>
            <FaTimes /> Xóa bộ lọc
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu lịch hẹn...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-retry"
              >
                Tải lại
              </button>
            </div>
          ) : sortedAppointments.length > 0 ? (
            <div className="appointments-list">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã lịch hẹn</th>
                    <th>Thông tin khách hàng</th>
                    <th>Ngày hẹn</th>
                    <th>Giờ hẹn</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAppointments.map((appointment) => (
                    <tr 
                      key={appointment.appointmentID}
                      className={!canUpdateAppointment(appointment) ? 'not-authorized' : ''}
                    >
                      <td>{appointment.appointmentID}</td>
                      <td>
                        <span className="appointment-code">{appointment.appointmentCode || 'N/A'}</span>
                      </td>
                      <td>
                        <div className="patient-info">
                          <span className="patient-name">{appointment.customer?.name || 'Không xác định'}</span>
                          <span className="patient-id">{appointment.customer?.phone || 'Không có SĐT'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="appointment-datetime">
                          <span className="appointment-date">{formatDate(appointment.appointmentDate)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="appointment-time">{getAppointmentTime(appointment)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getAppointmentType(appointment) === 'Xét nghiệm STI' ? 'status-badge-warning' : 'status-badge-secondary'}`}>
                          {getAppointmentType(appointment)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClasses[appointment.status]}`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </td>
                      <td>
                        <AppointmentActions appointment={appointment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-appointments">
              <p>Không tìm thấy lịch hẹn nào phù hợp với bộ lọc.</p>
              {(statusFilter !== null || typeFilter !== null || dateFilter || searchTerm) && (
                <button onClick={clearFilters} className="reset-button">
                  <FaTimes /> Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="calendar-view">
          <div className="calendar-placeholder">
            Chế độ xem lịch đang được phát triển. Vui lòng sử dụng chế độ xem danh sách.
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="appointment-detail-modal-overlay">
          <div className="appointment-detail-modal">
            <div className="modal-header">
              <h2>Chi tiết lịch hẹn - {selectedAppointment.appointmentCode || selectedAppointment.appointmentID}</h2>
              <button className="close-button" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="modal-content">
              {/* Appointment code section */}
              <div className="detail-section code-section">
                <div className="appointment-code-display">
                  <div className="code-label">Mã lịch hẹn</div>
                  <div className="code-value">{selectedAppointment.appointmentCode || 'Không có mã'}</div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Họ tên</div>
                    <div className="detail-value">{selectedAppointment.customer?.name || 'Không xác định'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Số điện thoại</div>
                    <div className="detail-value">{selectedAppointment.customer?.phone || 'Không có'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Email</div>
                    <div className="detail-value">{selectedAppointment.customer?.email || 'Không có'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Mã khách hàng</div>
                    <div className="detail-value">{selectedAppointment.customerID}</div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Thông tin lịch hẹn</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Mã lịch hẹn</div>
                    <div className="detail-value">{selectedAppointment.appointmentCode || selectedAppointment.appointmentID}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Ngày hẹn</div>
                    <div className="detail-value">{formatDate(selectedAppointment.appointmentDate)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Giờ hẹn</div>
                    <div className="detail-value">{getAppointmentTime(selectedAppointment)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Loại lịch hẹn</div>
                    <div className="detail-value">{getAppointmentType(selectedAppointment)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Trạng thái</div>
                    <div className={`detail-value status ${['pending', 'confirmed', 'awaiting_results', 'testing', 'completed', 'cancelled'][selectedAppointment.status]}`}>
                      {statusLabels[selectedAppointment.status]}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Tổng tiền</div>
                    <div className="detail-value">{selectedAppointment.totalAmount.toLocaleString('vi-VN')} VND</div>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p className="detail-text">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="detail-section">
                <h3>Kết quả xét nghiệm</h3>
                {selectedAppointment.status >= 2 ? (
                  <ul className="test-results-list">
                    <li>Kết quả xét nghiệm máu - <a href="#">Xem chi tiết</a></li>
                    <li>Kết quả xét nghiệm nước tiểu - <a href="#">Xem chi tiết</a></li>
                  </ul>
                ) : (
                  <p className="detail-text">Chưa có kết quả xét nghiệm.</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="close-button-secondary" onClick={closeDetailModal}>
                Đóng
              </button>
              
              <div className="action-buttons">
                {selectedAppointment.status === 0 && canUpdateAppointment(selectedAppointment) && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => {
                        confirmStatusUpdate(selectedAppointment.appointmentID, 1);
                        closeDetailModal();
                      }}
                    >
                      <FaCheck /> Xác nhận lịch hẹn
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => {
                        confirmStatusUpdate(selectedAppointment.appointmentID, 6);
                        closeDetailModal();
                      }}
                    >
                      <FaTimes /> Từ chối lịch hẹn
                    </button>
                  </>
                )}
                
                {selectedAppointment.status === 1 && canUpdateAppointment(selectedAppointment) && (
                  <button 
                    className="progress-button"
                    onClick={() => {
                      confirmStatusUpdate(selectedAppointment.appointmentID, 2);
                      closeDetailModal();
                    }}
                  >
                    <FaPlay /> Bắt đầu xử lý
                  </button>
                )}
                
                {selectedAppointment.status === 2 && canUpdateAppointment(selectedAppointment) && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => {
                        confirmStatusUpdate(selectedAppointment.appointmentID, 5);
                        closeDetailModal();
                      }}
                    >
                      <FaCheck /> Hoàn thành
                    </button>
                    
                    {canRequestSTITest(selectedAppointment) && (
                      <button 
                        className="testing-button"
                        onClick={() => {
                          confirmStatusUpdate(selectedAppointment.appointmentID, 3, 2);
                          closeDetailModal();
                        }}
                      >
                        🧪 Yêu cầu STI Test
                      </button>
                    )}
                  </>
                )}
                
                {selectedAppointment.status === 3 && canUpdateAppointment(selectedAppointment) && (
                  <button 
                    className="testing-button"
                    onClick={() => {
                      confirmStatusUpdate(selectedAppointment.appointmentID, 4);
                      closeDetailModal();
                    }}
                  >
                    🔄 Chuyển sang Chờ kết quả
                  </button>
                )}
                
                {selectedAppointment.status === 4 && canUpdateAppointment(selectedAppointment) && (
                  <button 
                    className="approve-button"
                    onClick={() => {
                      confirmStatusUpdate(selectedAppointment.appointmentID, 5);
                      closeDetailModal();
                    }}
                  >
                    <FaCheck /> Hoàn thành
                  </button>
                )}
                
                {selectedAppointment.status === 5 && (
                  <div className="status-note success">
                    <FaCheck className="mr-2" /> Lịch hẹn đã được hoàn thành
                  </div>
                )}
                
                {selectedAppointment.status === 6 && (
                  <div className="status-note danger">
                    <FaTimes className="mr-2" /> Lịch hẹn đã bị hủy
                  </div>
                )}
                
                {!canUpdateAppointment(selectedAppointment) && (
                  <div className="status-note warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Bạn không có quyền cập nhật lịch hẹn này (không trong slot được phân công)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {isConfirmModalOpen && pendingAction && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {pendingAction.newStatus === 1 && "Xác nhận lịch hẹn"}
                {pendingAction.newStatus === 2 && "Bắt đầu xử lý lịch hẹn"}
                {pendingAction.newStatus === 3 && "Yêu cầu xét nghiệm STI"}
                {pendingAction.newStatus === 4 && "Chuyển sang chờ kết quả"}
                {pendingAction.newStatus === 5 && "Hoàn thành lịch hẹn"}
                {pendingAction.newStatus === 6 && "Từ chối lịch hẹn"}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsConfirmModalOpen(false)}
                aria-label="Đóng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                {pendingAction.newStatus === 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {pendingAction.newStatus === 2 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {pendingAction.newStatus === 3 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {pendingAction.newStatus === 4 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {pendingAction.newStatus === 5 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {pendingAction.newStatus === 6 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="text-gray-700">
                  {pendingAction.newStatus === 1 && "Bạn có chắc chắn muốn xác nhận lịch hẹn này? Sau khi xác nhận, lịch hẹn sẽ được chuyển sang trạng thái 'Đã xác nhận'."}
                  {pendingAction.newStatus === 2 && "Bạn có chắc chắn muốn bắt đầu xử lý lịch hẹn này? Lịch hẹn sẽ được chuyển sang trạng thái 'Đang xử lý'."}
                  {pendingAction.newStatus === 3 && "Bạn có chắc chắn muốn yêu cầu khách hàng xét nghiệm STI? Lịch hẹn sẽ được chuyển sang trạng thái 'Yêu cầu xét nghiệm STI'."}
                  {pendingAction.newStatus === 4 && "Bạn có chắc chắn muốn chuyển lịch hẹn này sang trạng thái chờ kết quả? Lịch hẹn sẽ được chuyển sang trạng thái 'Chờ kết quả'."}
                  {pendingAction.newStatus === 5 && "Bạn có chắc chắn muốn hoàn thành lịch hẹn này? Lịch hẹn sẽ được chuyển sang trạng thái 'Đã hoàn thành'."}
                  {pendingAction.newStatus === 6 && "Bạn có chắc chắn muốn từ chối lịch hẹn này? Sau khi từ chối, lịch hẹn sẽ được chuyển sang trạng thái 'Đã hủy'."}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none 
                  ${pendingAction.newStatus === 1 ? 'bg-green-600 hover:bg-green-700 border-green-600' : 
                    pendingAction.newStatus === 2 ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' :
                    pendingAction.newStatus === 3 ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500' :
                    pendingAction.newStatus === 4 ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600' :
                    pendingAction.newStatus === 5 ? 'bg-green-600 hover:bg-green-700 border-green-600' :
                    'bg-red-600 hover:bg-red-700 border-red-600'}`}
                onClick={() => updateAppointmentStatus(pendingAction.appointmentId, pendingAction.newStatus, pendingAction.paymentStatus)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantAppointments; 