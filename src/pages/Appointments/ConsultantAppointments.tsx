import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaCheck, FaSpinner, FaVideo, FaCalendarAlt, FaListUl } from 'react-icons/fa';
import './ConsultantAppointments.css';
import { consultantService } from '../../services';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Appointment {
  appointmentID: string;
  customerID: string;
  consultantID: string;
  appointmentDate: string;
  status: number;
  appointmentType: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string;
  slot?: {
    startTime: string;
    endTime: string;
  };
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
}

const statusLabels = [
  "Đang chờ xác nhận",
  "Đã xác nhận",
  "Đang chờ kết quả",
  "Đã hoàn thành",
  "Đã hủy"
];

const statusClasses = [
  "status-pending",
  "status-confirmed",
  "status-awaiting",
  "status-completed",
  "status-cancelled"
];

const appointmentTypeLabels = [
  "Trực tiếp",
  "Trực tuyến"
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
        
        const response = await consultantService.getConsultantAppointments(consultantId);
        
        if (response.statusCode === 200 && response.data) {
          setAppointments(response.data);
          setFilteredAppointments(response.data);
          console.log('Appointments loaded:', response.data);
        } else {
          setError(`Lỗi khi lấy dữ liệu: ${response.message}`);
          toast.error(`Lỗi khi lấy dữ liệu lịch hẹn: ${response.message}`);
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

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== null) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== null) {
      filtered = filtered.filter(app => app.appointmentType === typeFilter);
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
        app.customer?.email?.toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, typeFilter, dateFilter, searchTerm]);

  const updateAppointmentStatus = async (appointmentId: string, newStatus: number) => {
    try {
      const response = await consultantService.updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.statusCode === 200) {
        // Update the local state to reflect the change
        setAppointments(appointments.map(appointment => 
          appointment.appointmentID === appointmentId 
            ? { ...appointment, status: newStatus } 
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

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );

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
                    <tr key={appointment.appointmentID}>
                      <td>{appointment.appointmentID}</td>
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
                        <span className={`status-badge ${appointment.appointmentType === 1 ? 'status-badge-info' : 'status-badge-secondary'}`}>
                          {appointmentTypeLabels[appointment.appointmentType]}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClasses[appointment.status]}`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </td>
                      <td>
                        <div className="appointment-actions">
                          {appointment.status === 0 && ( // Pending
                            <>
                              <button 
                                className="approve-button"
                                onClick={() => updateAppointmentStatus(appointment.appointmentID, 1)}
                                title="Xác nhận lịch hẹn"
                              >
                                <FaCheck /> Xác nhận
                              </button>
                              <button 
                                className="cancel-button"
                                onClick={() => updateAppointmentStatus(appointment.appointmentID, 4)}
                                title="Từ chối lịch hẹn"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                            
                          {appointment.status === 1 && ( // Confirmed
                            <>
                              <button 
                                className="complete-button"
                                onClick={() => updateAppointmentStatus(appointment.appointmentID, 3)}
                                title="Đánh dấu hoàn thành"
                              >
                                <FaCheck /> Hoàn thành
                              </button>
                              <button 
                                className="check-in-button"
                                onClick={() => updateAppointmentStatus(appointment.appointmentID, 2)}
                                title="Đánh dấu đang chờ kết quả"
                              >
                                <FaSpinner /> Chờ kết quả
                              </button>
                            </>
                          )}
                          
                          {appointment.status === 2 && ( // Awaiting results
                            <button 
                              className="complete-button"
                              onClick={() => updateAppointmentStatus(appointment.appointmentID, 3)}
                              title="Đánh dấu hoàn thành"
                            >
                              <FaCheck /> Hoàn thành
                            </button>
                          )}
                          
                          {appointment.appointmentType === 1 && appointment.status === 1 && (
                            <button 
                              className="view-details-button"
                              title="Bắt đầu cuộc gọi video"
                            >
                              <FaVideo /> Gọi video
                            </button>
                          )}
                          
                          <button 
                            className="view-details-button secondary"
                            onClick={() => viewAppointmentDetails(appointment)}
                            title="Xem chi tiết"
                          >
                            Chi tiết
                          </button>
                        </div>
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
              <h2>Chi tiết lịch hẹn - {selectedAppointment.appointmentID}</h2>
              <button className="close-button" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="modal-content">
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
                    <div className="detail-value">{selectedAppointment.appointmentID}</div>
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
                    <div className="detail-value">{appointmentTypeLabels[selectedAppointment.appointmentType]}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Trạng thái</div>
                    <div className={`detail-value status ${['pending', 'confirmed', 'awaiting_results', 'completed', 'cancelled'][selectedAppointment.status]}`}>
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
                {selectedAppointment.status === 0 && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.appointmentID, 1);
                        closeDetailModal();
                      }}
                    >
                      <FaCheck /> Xác nhận lịch hẹn
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.appointmentID, 4);
                        closeDetailModal();
                      }}
                    >
                      <FaTimes /> Từ chối lịch hẹn
                    </button>
                  </>
                )}
                
                {selectedAppointment.status === 1 && (
                  <>
                    <button 
                      className="complete-button"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.appointmentID, 3);
                        closeDetailModal();
                      }}
                    >
                      <FaCheck /> Đánh dấu hoàn thành
                    </button>
                    <button 
                      className="check-in-button"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.appointmentID, 2);
                        closeDetailModal();
                      }}
                    >
                      <FaSpinner /> Đánh dấu chờ kết quả
                    </button>
                  </>
                )}
                
                {selectedAppointment.status === 2 && (
                  <button 
                    className="complete-button"
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.appointmentID, 3);
                      closeDetailModal();
                    }}
                  >
                    <FaCheck /> Đánh dấu hoàn thành
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantAppointments; 