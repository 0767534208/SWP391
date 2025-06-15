import React, { useState } from 'react';
import './ConsultantAppointments.css';
import { Link } from 'react-router-dom';

interface Appointment {
  id: number;
  patientName: string;
  patientId: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
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

  // Mock data
  const appointments: Appointment[] = [
    { id: 1, patientName: 'Nguyễn Văn B', patientId: 'P-1001', service: 'Tư vấn bệnh lây qua đường tình dục', date: '2023-06-28', time: '10:00', status: 'confirmed' },
    { id: 2, patientName: 'Trần Thị C', patientId: 'P-1042', service: 'Xét nghiệm HIV', date: '2023-06-28', time: '14:00', status: 'confirmed' },
    { id: 3, patientName: 'Lê Văn D', patientId: 'P-1089', service: 'Tư vấn sức khỏe sinh sản', date: '2023-06-29', time: '09:30', status: 'pending' },
    { id: 4, patientName: 'Phạm Thị E', patientId: 'P-1112', service: 'Xét nghiệm STI tổng quát', date: '2023-06-29', time: '15:30', status: 'confirmed' },
    { id: 5, patientName: 'Đặng Văn F', patientId: 'P-1156', service: 'Tư vấn sức khỏe sinh sản', date: '2023-06-30', time: '11:00', status: 'pending' },
    { id: 6, patientName: 'Hoàng Thị G', patientId: 'P-1187', service: 'Xét nghiệm HPV', date: '2023-07-01', time: '13:30', status: 'cancelled' },
    { id: 7, patientName: 'Vũ Minh H', patientId: 'P-1201', service: 'Tư vấn kế hoạch hóa gia đình', date: '2023-07-02', time: '09:00', status: 'confirmed' },
    { id: 8, patientName: 'Ngô Thanh I', patientId: 'P-1234', service: 'Xét nghiệm HIV', date: '2023-07-03', time: '16:00', status: 'completed' }
  ];

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
    console.log('Approve appointment', id);
    // Implementation for approve
  };

  const handleCancelAppointment = (id: number) => {
    console.log('Cancel appointment', id);
    // Implementation for cancel
  };

  const handleCompleteAppointment = (id: number) => {
    console.log('Complete appointment', id);
    // Implementation for complete
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'status-badge status-badge-success';
      case 'confirmed':
        return 'status-badge status-badge-info';
      case 'pending':
        return 'status-badge status-badge-warning';
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
        return 'Hoàn thành';
      case 'confirmed':
        return 'Đã xác nhận';
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
            <option value="confirmed">Đã Xác Nhận</option>
            <option value="completed">Hoàn Thành</option>
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
                          >
                            Chấp Nhận
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Từ Chối
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button 
                            className="complete-button"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            Hoàn Thành
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                        <button className="view-button">
                          Xem Chi Tiết
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
    </div>
  );
};

export default ConsultantAppointments; 