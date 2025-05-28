import React, { useState } from 'react';

const Appointments = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  // Mock data
  const appointments = [
    { id: 1, patientName: 'Nguyễn Văn A', patientPhone: '0901234567', service: 'Tư vấn STI', date: '15/06/2023', time: '09:00', consultant: 'Bs. Trần Văn B', status: 'completed', notes: 'Đã tư vấn và làm xét nghiệm' },
    { id: 2, patientName: 'Trần Thị C', patientPhone: '0912345678', service: 'Xét nghiệm HIV', date: '16/06/2023', time: '10:30', consultant: 'Bs. Lê Thị D', status: 'pending', notes: '' },
    { id: 3, patientName: 'Lê Văn E', patientPhone: '0923456789', service: 'Tư vấn sức khỏe tình dục', date: '17/06/2023', time: '14:00', consultant: 'Bs. Phạm Văn F', status: 'confirmed', notes: 'Khách hàng đã xác nhận' },
    { id: 4, patientName: 'Phạm Thị G', patientPhone: '0934567890', service: 'Xét nghiệm STI tổng quát', date: '18/06/2023', time: '15:30', consultant: 'Bs. Trần Văn B', status: 'cancelled', notes: 'Khách hàng hủy vì bận việc đột xuất' },
    { id: 5, patientName: 'Hoàng Văn H', patientPhone: '0945678901', service: 'Tư vấn sức khỏe tình dục', date: '19/06/2023', time: '08:00', consultant: 'Bs. Lê Thị D', status: 'pending', notes: '' },
    { id: 6, patientName: 'Ngô Thị I', patientPhone: '0956789012', service: 'Xét nghiệm HIV', date: '20/06/2023', time: '11:00', consultant: 'Bs. Phạm Văn F', status: 'confirmed', notes: '' },
    { id: 7, patientName: 'Đỗ Văn K', patientPhone: '0967890123', service: 'Tư vấn STI', date: '21/06/2023', time: '13:30', consultant: 'Bs. Trần Văn B', status: 'pending', notes: '' },
    { id: 8, patientName: 'Lý Thị L', patientPhone: '0978901234', service: 'Xét nghiệm STI tổng quát', date: '22/06/2023', time: '16:00', consultant: 'Bs. Lê Thị D', status: 'completed', notes: 'Hoàn thành xét nghiệm, đã gửi kết quả' },
    { id: 9, patientName: 'Vũ Văn M', patientPhone: '0989012345', service: 'Tư vấn sức khỏe tình dục', date: '23/06/2023', time: '09:30', consultant: 'Bs. Phạm Văn F', status: 'confirmed', notes: '' },
    { id: 10, patientName: 'Mai Thị N', patientPhone: '0990123456', service: 'Xét nghiệm HIV', date: '24/06/2023', time: '10:00', consultant: 'Bs. Trần Văn B', status: 'pending', notes: '' },
    { id: 11, patientName: 'Trịnh Văn P', patientPhone: '0901234560', service: 'Tư vấn STI', date: '25/06/2023', time: '14:30', consultant: 'Bs. Lê Thị D', status: 'confirmed', notes: '' },
    { id: 12, patientName: 'Đinh Thị Q', patientPhone: '0912345670', service: 'Xét nghiệm STI tổng quát', date: '26/06/2023', time: '15:00', consultant: 'Bs. Phạm Văn F', status: 'cancelled', notes: 'Khách hàng đổi lịch' },
  ];

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

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'admin-badge admin-badge-success';
      case 'confirmed':
        return 'admin-badge admin-badge-info';
      case 'pending':
        return 'admin-badge admin-badge-warning';
      case 'cancelled':
        return 'admin-badge admin-badge-danger';
      default:
        return 'admin-badge admin-badge-info';
    }
  };

  // Handle actions
  const handleEditAppointment = (id: number) => {
    console.log('Edit appointment', id);
    // Implementation for edit
  };

  const handleDeleteAppointment = (id: number) => {
    console.log('Delete appointment', id);
    // Implementation for delete
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
    <div className="admin-dashboard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản lý lịch hẹn</h1>
          <p className="admin-text-muted admin-text-sm">
            Theo dõi và quản lý các lịch hẹn trong hệ thống
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className={`admin-quick-action-btn ${view === 'list' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
            onClick={() => setView('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Danh sách</span>
          </button>
          <button 
            className={`admin-quick-action-btn ${view === 'calendar' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
            onClick={() => setView('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Lịch</span>
          </button>
          <button 
            className="admin-quick-action-btn bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Thêm lịch hẹn</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, bác sĩ, dịch vụ..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 focus:outline-none"
            >
              Đặt lại
            </button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full">
              <input
                type="date"
                className="admin-select"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="relative w-full">
              <input
                type="date"
                className="admin-select"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {/* List View */}
          <div className="admin-card mb-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th className="w-12">ID</th>
                    <th>Bệnh nhân</th>
                    <th>Dịch vụ</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Bác sĩ / Chuyên gia</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th className="w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.length > 0 ? (
                    currentAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>
                          <div>
                            <div className="font-medium">{appointment.patientName}</div>
                            <div className="admin-text-xs admin-text-muted">{appointment.patientPhone}</div>
                          </div>
                        </td>
                        <td>{appointment.service}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.consultant}</td>
                        <td>
                          <span className={getStatusBadgeClass(appointment.status)}>
                            {appointment.status === 'completed' ? 'Hoàn thành' : 
                             appointment.status === 'confirmed' ? 'Đã xác nhận' : 
                             appointment.status === 'pending' ? 'Đang chờ' : 'Đã hủy'}
                          </span>
                        </td>
                        <td>
                          <div className="max-w-xs truncate">
                            {appointment.notes || <span className="admin-text-muted admin-text-xs">Không có</span>}
                          </div>
                        </td>
                        <td>
                          <div className="flex space-x-1">
                            <button 
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              onClick={() => handleEditAppointment(appointment.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 admin-text-muted">
                        Không tìm thấy lịch hẹn nào phù hợp với điều kiện lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="admin-text-sm admin-text-muted">
                Hiển thị {indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, filteredAppointments.length)} trên {filteredAppointments.length} lịch hẹn
              </div>
              <div className="admin-pagination">
                <button
                  className={`admin-pagination-btn rounded-l-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(num => (num <= 2 || num > totalPages - 2 || Math.abs(num - currentPage) <= 1))
                  .map((number, idx, arr) => (
                    <React.Fragment key={number}>
                      {idx > 0 && arr[idx - 1] !== number - 1 && (
                        <span className="px-3 py-1 text-gray-400">...</span>
                      )}
                      <button
                        className={`admin-pagination-btn ${currentPage === number ? 'active' : ''}`}
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className={`admin-pagination-btn rounded-r-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Calendar View */
        <div className="admin-card mb-4">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Lịch xem theo tháng</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                <div key={index} className="text-center font-medium text-sm py-2 text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* For simplicity, we'll just mock a calendar view */}
              {Array(35).fill(0).map((_, index) => {
                const day = index + 1 - 5; // Starting from previous month's days
                const isCurrentMonth = day > 0 && day <= 30;
                const hasAppointments = isCurrentMonth && [10, 15, 20, 25].includes(day);
                
                return (
                  <div 
                    key={index}
                    className={`
                      border rounded-md p-1 h-24 overflow-y-auto
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    `}
                  >
                    <div className="text-right text-xs font-medium mb-1">{isCurrentMonth ? day : day <= 0 ? 31 + day : day - 30}</div>
                    {hasAppointments && (
                      <div>
                        <div className="text-xs mb-1 px-1 py-0.5 bg-blue-50 text-blue-600 rounded truncate">
                          9:00 - Tư vấn STI
                        </div>
                        <div className="text-xs mb-1 px-1 py-0.5 bg-green-50 text-green-600 rounded truncate">
                          11:30 - Xét nghiệm HIV
                        </div>
                        {day === 15 && (
                          <div className="text-xs mb-1 px-1 py-0.5 bg-purple-50 text-purple-600 rounded truncate">
                            14:00 - Tư vấn sức khỏe
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-50 border border-blue-600 rounded mr-1"></div>
                <span className="admin-text-xs">Đang chờ</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-50 border border-green-600 rounded mr-1"></div>
                <span className="admin-text-xs">Đã xác nhận</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-50 border border-purple-600 rounded mr-1"></div>
                <span className="admin-text-xs">Hoàn thành</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-50 border border-red-600 rounded mr-1"></div>
                <span className="admin-text-xs">Đã hủy</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 