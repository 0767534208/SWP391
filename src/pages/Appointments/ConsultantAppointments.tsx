import React, { useState } from 'react';
import './ConsultantAppointments.css';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface Appointment {
  id: number;
  patientName: string;
  patientId: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'awaiting_results' | 'completed' | 'cancelled';
  notes?: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  reason?: string;
  history?: string;
  testResults?: string[];
}

const ConsultantAppointments: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Mock data
  const [appointments, setAppointments] = useState<Appointment[]>([
    { 
      id: 1, 
      patientName: 'Nguyễn Văn B', 
      patientId: 'P-1001', 
      service: 'Tư vấn bệnh lây qua đường tình dục', 
      date: '2023-06-28', 
      time: '10:00', 
      status: 'confirmed',
      phone: '0912345678',
      email: 'nguyenvanb@example.com',
      dob: '15/05/1992',
      gender: 'Nam',
      reason: 'Tư vấn về các biện pháp phòng tránh STDs',
      history: 'Đã từng xét nghiệm HIV âm tính vào tháng trước'
    },
    { 
      id: 2, 
      patientName: 'Trần Thị C', 
      patientId: 'P-1042', 
      service: 'Xét nghiệm HIV', 
      date: '2023-06-28', 
      time: '14:00', 
      status: 'confirmed',
      phone: '0987654321',
      email: 'tranthic@example.com',
      dob: '22/08/1990',
      gender: 'Nữ',
      reason: 'Xét nghiệm định kỳ',
      history: 'Không có tiền sử bệnh lý'
    },
    { 
      id: 3, 
      patientName: 'Lê Văn D', 
      patientId: 'P-1089', 
      service: 'Tư vấn sức khỏe sinh sản', 
      date: '2023-06-29', 
      time: '09:30', 
      status: 'pending',
      phone: '0909123456',
      email: 'levand@example.com',
      dob: '10/11/1988',
      gender: 'Nam',
      reason: 'Tư vấn về kế hoạch hóa gia đình',
      history: 'Đã có 2 con'
    },
    { 
      id: 4, 
      patientName: 'Phạm Thị E', 
      patientId: 'P-1112', 
      service: 'Xét nghiệm STI tổng quát', 
      date: '2023-06-29', 
      time: '15:30', 
      status: 'awaiting_results',
      phone: '0912876543',
      email: 'phamthie@example.com',
      dob: '05/03/1995',
      gender: 'Nữ',
      reason: 'Nghi ngờ nhiễm HPV',
      history: 'Từng điều trị viêm nhiễm phụ khoa',
      testResults: ['Đang chờ kết quả xét nghiệm HPV', 'Đang chờ kết quả xét nghiệm Chlamydia']
    },
    { 
      id: 5, 
      patientName: 'Đặng Văn F', 
      patientId: 'P-1156', 
      service: 'Tư vấn sức khỏe sinh sản', 
      date: '2023-06-30', 
      time: '11:00', 
      status: 'pending',
      phone: '0978123456',
      email: 'dangvanf@example.com',
      dob: '18/07/1985',
      gender: 'Nam',
      reason: 'Tư vấn về vấn đề vô sinh',
      history: 'Đã kết hôn 5 năm, chưa có con'
    },
    { 
      id: 6, 
      patientName: 'Hoàng Thị G', 
      patientId: 'P-1187', 
      service: 'Xét nghiệm HPV', 
      date: '2023-07-01', 
      time: '13:30', 
      status: 'cancelled',
      phone: '0918765432',
      email: 'hoangthig@example.com',
      dob: '30/12/1993',
      gender: 'Nữ',
      reason: 'Xét nghiệm định kỳ',
      history: 'Không có tiền sử bệnh lý'
    },
    { 
      id: 7, 
      patientName: 'Vũ Minh H', 
      patientId: 'P-1201', 
      service: 'Tư vấn kế hoạch hóa gia đình', 
      date: '2023-07-02', 
      time: '09:00', 
      status: 'confirmed',
      phone: '0923456789',
      email: 'vuminhh@example.com',
      dob: '25/04/1991',
      gender: 'Nam',
      reason: 'Tư vấn về các biện pháp tránh thai',
      history: 'Đã có 1 con'
    },
    { 
      id: 8, 
      patientName: 'Ngô Thanh I', 
      patientId: 'P-1234', 
      service: 'Xét nghiệm HIV', 
      date: '2023-07-03', 
      time: '16:00', 
      status: 'completed',
      phone: '0934567890',
      email: 'ngothanhi@example.com',
      dob: '12/09/1987',
      gender: 'Nam',
      reason: 'Xét nghiệm định kỳ',
      history: 'Không có tiền sử bệnh lý',
      testResults: ['HIV: Âm tính', 'Syphilis: Âm tính']
    }
  ]);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    // Filter by date range if provided
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate) {
      const appointmentDate = new Date(appointment.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      matchesDateRange = appointmentDate >= startDate && appointmentDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Handle actions
  const handleApproveAppointment = (id: number) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'confirmed' } 
          : appointment
      )
    );
    toast.success('Đã xác nhận lịch hẹn thành công');
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments(
      appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'cancelled' as const }
          : appointment
      )
    );
    toast.success('Đã hủy lịch hẹn');
  };

  const handlePatientArrived = (id: number) => {
    setAppointments(
      appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'awaiting_results' as const }
          : appointment
      )
    );
    toast.success('Đã cập nhật trạng thái thành chờ kết quả');
  };

  const handleTestResultReady = (id: number) => {
    setAppointments(
      appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'completed' as const }
          : appointment
      )
    );
    toast.success('Đã xác nhận kết quả đã sẵn sàng');
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedAppointment(null);
    setShowDetailModal(false);
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'status-badge status-badge-success';
      case 'confirmed':
        return 'status-badge status-badge-info';
      case 'awaiting_results':
        return 'status-badge status-badge-warning';
      case 'pending':
        return 'status-badge status-badge-secondary';
      case 'cancelled':
        return 'status-badge status-badge-danger';
      default:
        return 'status-badge status-badge-info';
    }
  };

  // Translate status to Vietnamese
  const translateStatus = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Đã xác nhận';
      case 'confirmed':
        return 'Đã xác nhận lịch hẹn';
      case 'awaiting_results':
        return 'Chờ kết quả';
      case 'pending':
        return 'Đang chờ';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus('all');
    setSearchQuery('');
    setDateRange({startDate: '', endDate: ''});
  };

  return (
    <div className="consultant-appointments-container">
      <div className="appointments-header">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Lịch Hẹn</h1>
          <p className="text-sm text-gray-500">
            Xem và quản lý tất cả các lịch hẹn của bạn
          </p>
        </div>
        <div className="header-controls">
          <button 
            className={`view-toggle-button ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Danh Sách</span>
          </button>
          <button 
            className={`view-toggle-button ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Lịch</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân, ID, dịch vụ..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="pending">Đang Chờ</option>
            <option value="confirmed">Đã Xác Nhận Lịch Hẹn</option>
            <option value="awaiting_results">Chờ Kết Quả</option>
            <option value="completed">Đã Xác Nhận</option>
            <option value="cancelled">Đã Hủy</option>
          </select>
          
          <div className="date-range">
            <input
              type="date"
              className="date-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              placeholder="Từ ngày"
            />
            <span>-</span>
            <input
              type="date"
              className="date-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              placeholder="Đến ngày"
            />
          </div>
          
          <button
            onClick={resetFilters}
            className="reset-button"
          >
            Đặt Lại
          </button>
        </div>
      </div>

      {/* Appointments List View */}
      {view === 'list' && (
        <div className="appointments-list">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Bệnh Nhân</th>
                <th>Dịch Vụ</th>
                <th>Ngày & Giờ</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{appointment.patientName}</div>
                      <div className="patient-id">{appointment.patientId}</div>
                    </div>
                  </td>
                  <td>{appointment.service}</td>
                  <td>
                    <div className="appointment-datetime">
                      <div className="appointment-date">{appointment.date}</div>
                      <div className="appointment-time">{appointment.time}</div>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(appointment.status)}>
                      {translateStatus(appointment.status)}
                    </span>
                  </td>
                  <td>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="approve-button"
                            onClick={() => handleApproveAppointment(appointment.id)}
                            title="Xác nhận lịch hẹn với bệnh nhân"
                          >
                            Xác nhận
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button 
                            className="check-in-button"
                            onClick={() => handlePatientArrived(appointment.id)}
                            title="Bệnh nhân đã đến trung tâm"
                          >
                            Đã đến trung tâm
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Hủy lịch hẹn
                          </button>
                        </>
                      )}
                      {appointment.status === 'awaiting_results' && (
                                                  <button 
                            className="complete-button"
                            onClick={() => handleTestResultReady(appointment.id)}
                            title="Xác nhận kết quả xét nghiệm đã có"
                          >
                            Xác nhận kết quả
                          </button>
                      )}
                      {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                        <button 
                          className="view-details-button"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          Xem chi tiết
                        </button>
                      )}
                      {(appointment.status !== 'completed' && appointment.status !== 'cancelled') && (
                        <button 
                          className="view-details-button secondary"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          Chi tiết
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAppointments.length === 0 && (
            <div className="no-appointments">
              <p>Không tìm thấy lịch hẹn nào phù hợp với bộ lọc.</p>
              <button onClick={resetFilters} className="reset-button">Đặt Lại Bộ Lọc</button>
            </div>
          )}
        </div>
      )}

      {/* Calendar View - Placeholder */}
      {view === 'calendar' && (
        <div className="calendar-view-placeholder">
          <p>Chức năng xem lịch đang được phát triển.</p>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="appointment-detail-modal-overlay">
          <div className="appointment-detail-modal">
            <div className="modal-header">
              <h2>Chi tiết cuộc hẹn</h2>
              <button className="close-button" onClick={closeDetailModal}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h3>Thông tin cuộc hẹn</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã cuộc hẹn:</span>
                    <span className="detail-value">APT-{selectedAppointment.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dịch vụ:</span>
                    <span className="detail-value">{selectedAppointment.service}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày hẹn:</span>
                    <span className="detail-value">{selectedAppointment.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giờ hẹn:</span>
                    <span className="detail-value">{selectedAppointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`detail-value status ${selectedAppointment.status}`}>
                      {translateStatus(selectedAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Thông tin bệnh nhân</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên:</span>
                    <span className="detail-value">{selectedAppointment.patientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mã bệnh nhân:</span>
                    <span className="detail-value">{selectedAppointment.patientId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày sinh:</span>
                    <span className="detail-value">{selectedAppointment.dob || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giới tính:</span>
                    <span className="detail-value">{selectedAppointment.gender || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">{selectedAppointment.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedAppointment.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Lý do khám</h3>
                <p className="detail-text">{selectedAppointment.reason || 'Không có thông tin'}</p>
              </div>
              
              <div className="detail-section">
                <h3>Tiền sử bệnh</h3>
                <p className="detail-text">{selectedAppointment.history || 'Không có thông tin'}</p>
              </div>
              
              {selectedAppointment.testResults && selectedAppointment.testResults.length > 0 && (
                <div className="detail-section">
                  <h3>Kết quả xét nghiệm</h3>
                  <ul className="test-results-list">
                    {selectedAppointment.testResults.map((result, index) => (
                      <li key={index}>{result}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="close-button-secondary" onClick={closeDetailModal}>
                Đóng
              </button>
              {selectedAppointment.status !== 'cancelled' && (
                <div className="action-buttons">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button 
                        className="approve-button"
                        onClick={() => {
                          handleApproveAppointment(selectedAppointment.id);
                          closeDetailModal();
                        }}
                      >
                        Xác nhận
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => {
                          handleCancelAppointment(selectedAppointment.id);
                          closeDetailModal();
                        }}
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      <button 
                        className="check-in-button"
                        onClick={() => {
                          handlePatientArrived(selectedAppointment.id);
                          closeDetailModal();
                        }}
                      >
                        Đã đến trung tâm
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => {
                          handleCancelAppointment(selectedAppointment.id);
                          closeDetailModal();
                        }}
                      >
                        Hủy lịch hẹn
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === 'awaiting_results' && (
                    <button 
                      className="complete-button"
                      onClick={() => {
                        handleTestResultReady(selectedAppointment.id);
                        closeDetailModal();
                      }}
                    >
                      Xác nhận kết quả
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Thêm Toaster component */}
      <Toaster position="top-right" />
    </div>
  );
};

export default ConsultantAppointments; 