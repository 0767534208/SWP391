import React, { useState, ChangeEvent } from 'react';
import './Appointment.css';

interface AppointmentType {
  id: number;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  consultant: string;
  status: string;
  notes: string;
}

interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  consultant: string;
  status: string;
  notes: string;
}

const Appointments = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentType | null>(null);
  const appointmentsPerPage = 10;

  // Form state for add/edit appointment
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    patientPhone: '',
    service: 'STI Consultation',
    date: '',
    time: '',
    consultant: 'Dr. Robert Brown',
    status: 'pending',
    notes: ''
  });

  // Mock data
  const [appointments, setAppointments] = useState<AppointmentType[]>([
    { id: 1, patientName: 'John Smith', patientPhone: '0901234567', service: 'STI Consultation', date: '15/06/2023', time: '09:00', consultant: 'Dr. Robert Brown', status: 'completed', notes: 'Consultation completed with testing' },
    { id: 2, patientName: 'Sarah Johnson', patientPhone: '0912345678', service: 'HIV Testing', date: '16/06/2023', time: '10:30', consultant: 'Dr. Emily Davis', status: 'pending', notes: '' },
    { id: 3, patientName: 'Michael Lee', patientPhone: '0923456789', service: 'Sexual Health Consultation', date: '17/06/2023', time: '14:00', consultant: 'Dr. James Wilson', status: 'confirmed', notes: 'Patient confirmed appointment' },
    { id: 4, patientName: 'Jessica Taylor', patientPhone: '0934567890', service: 'General STI Testing', date: '18/06/2023', time: '15:30', consultant: 'Dr. Robert Brown', status: 'cancelled', notes: 'Patient cancelled due to unexpected commitment' },
    { id: 5, patientName: 'David Martinez', patientPhone: '0945678901', service: 'Sexual Health Consultation', date: '19/06/2023', time: '08:00', consultant: 'Dr. Emily Davis', status: 'pending', notes: '' },
    { id: 6, patientName: 'Jennifer Garcia', patientPhone: '0956789012', service: 'HIV Testing', date: '20/06/2023', time: '11:00', consultant: 'Dr. James Wilson', status: 'confirmed', notes: '' },
    { id: 7, patientName: 'Thomas Rodriguez', patientPhone: '0967890123', service: 'STI Consultation', date: '21/06/2023', time: '13:30', consultant: 'Dr. Robert Brown', status: 'pending', notes: '' },
    { id: 8, patientName: 'Lisa Anderson', patientPhone: '0978901234', service: 'General STI Testing', date: '22/06/2023', time: '16:00', consultant: 'Dr. Emily Davis', status: 'completed', notes: 'Testing completed, results sent' },
    { id: 9, patientName: 'William Thompson', patientPhone: '0989012345', service: 'Sexual Health Consultation', date: '23/06/2023', time: '09:30', consultant: 'Dr. James Wilson', status: 'confirmed', notes: '' },
    { id: 10, patientName: 'Mary White', patientPhone: '0990123456', service: 'HIV Testing', date: '24/06/2023', time: '10:00', consultant: 'Dr. Robert Brown', status: 'pending', notes: '' },
    { id: 11, patientName: 'Daniel Harris', patientPhone: '0901234560', service: 'STI Consultation', date: '25/06/2023', time: '14:30', consultant: 'Dr. Emily Davis', status: 'confirmed', notes: '' },
    { id: 12, patientName: 'Patricia Clark', patientPhone: '0912345670', service: 'General STI Testing', date: '26/06/2023', time: '15:00', consultant: 'Dr. James Wilson', status: 'cancelled', notes: 'Patient rescheduled' },
  ]);

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

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

  // Handle CRUD actions
  const handleEditAppointment = (id: number) => {
    const appointmentToEdit = appointments.find(appointment => appointment.id === id);
    if (appointmentToEdit) {
      setCurrentAppointment(appointmentToEdit);
      // Format date for the input field (from DD/MM/YYYY to YYYY-MM-DD)
      const dateParts = appointmentToEdit.date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      setFormData({
        patientName: appointmentToEdit.patientName,
        patientPhone: appointmentToEdit.patientPhone,
        service: appointmentToEdit.service,
        date: formattedDate,
        time: appointmentToEdit.time,
        consultant: appointmentToEdit.consultant,
        status: appointmentToEdit.status,
        notes: appointmentToEdit.notes
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteAppointment = (id: number) => {
    const appointmentToDelete = appointments.find(appointment => appointment.id === id);
    if (appointmentToDelete) {
      setCurrentAppointment(appointmentToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  const handleAddAppointment = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setFormData({
      patientName: '',
      patientPhone: '',
      service: 'STI Consultation',
      date: formattedDate,
      time: '09:00',
      consultant: 'Dr. Robert Brown',
      status: 'pending',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  // CRUD operations
  const addAppointment = () => {
    // Validate form
    if (!formData.patientName || !formData.patientPhone || !formData.date || !formData.time) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const dateParts = formData.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Create new appointment object
    const newAppointment: AppointmentType = {
      id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      service: formData.service,
      date: formattedDate,
      time: formData.time,
      consultant: formData.consultant,
      status: formData.status,
      notes: formData.notes
    };

    // Add new appointment to the list
    setAppointments([...appointments, newAppointment]);
    setIsAddModalOpen(false);
  };

  const updateAppointment = () => {
    // Validate form
    if (!formData.patientName || !formData.patientPhone || !formData.date || !formData.time) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (currentAppointment) {
      // Format date from YYYY-MM-DD to DD/MM/YYYY
      const dateParts = formData.date.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      // Update appointment
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === currentAppointment.id) {
          return {
            ...appointment,
            patientName: formData.patientName,
            patientPhone: formData.patientPhone,
            service: formData.service,
            date: formattedDate,
            time: formData.time,
            consultant: formData.consultant,
            status: formData.status,
            notes: formData.notes
          };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      setIsEditModalOpen(false);
    }
  };

  const deleteAppointment = () => {
    if (currentAppointment) {
      const updatedAppointments = appointments.filter(appointment => appointment.id !== currentAppointment.id);
      setAppointments(updatedAppointments);
      setIsDeleteModalOpen(false);
    }
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
    <div className="appointments-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Lịch Hẹn</h1>
          <p className="text-sm text-gray-500">
            Theo dõi và quản lý tất cả các lịch hẹn trong hệ thống
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className={`view-toggle-button ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Danh Sách</span>
          </button>
          <button 
            className={`view-toggle-button ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Lịch</span>
          </button>
          <button 
            className="add-appointment-button"
            onClick={handleAddAppointment}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Thêm Lịch Hẹn</span>
          </button>
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
              <option value="completed">Hoàn Thành</option>
              <option value="cancelled">Đã Hủy</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="reset-button"
            >
              Đặt Lại
            </button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full">
              <input
                type="date"
                className="filter-input"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="relative w-full">
              <input
                type="date"
                className="filter-input"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        // List view implementation
        <>
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
                    <th className="w-20">Thao Tác</th>
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
                            {appointment.status === 'pending' ? 'Đang Chờ' :
                             appointment.status === 'confirmed' ? 'Đã Xác Nhận' :
                             appointment.status === 'completed' ? 'Hoàn Thành' : 'Đã Hủy'}
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-1">
                            <button 
                              className="action-button action-button-edit"
                              onClick={() => handleEditAppointment(appointment.id)}
                              title="Chỉnh sửa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              className="action-button action-button-delete"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              title="Xóa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
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
        </>
      ) : (
        // Calendar view implementation
        <div className="appointments-card p-4 mb-4">
          <div className="text-center py-10">
            <p className="text-gray-500">Calendar view will be implemented in a future update.</p>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Thêm Lịch Hẹn Mới</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <form>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên Bệnh Nhân <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="patientName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập tên bệnh nhân"
                      value={formData.patientName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="patientPhone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập số điện thoại"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dịch Vụ <span className="text-red-500">*</span></label>
                    <select 
                      name="service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.service}
                      onChange={handleInputChange}
                    >
                      <option value="STI Consultation">Tư Vấn STI</option>
                      <option value="HIV Testing">Xét Nghiệm HIV</option>
                      <option value="Sexual Health Consultation">Tư Vấn Sức Khỏe Tình Dục</option>
                      <option value="General STI Testing">Xét Nghiệm STI Tổng Quát</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        name="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giờ <span className="text-red-500">*</span></label>
                      <input 
                        type="time" 
                        name="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên Gia <span className="text-red-500">*</span></label>
                    <select 
                      name="consultant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.consultant}
                      onChange={handleInputChange}
                    >
                      <option value="Dr. Robert Brown">Dr. Robert Brown</option>
                      <option value="Dr. Emily Davis">Dr. Emily Davis</option>
                      <option value="Dr. James Wilson">Dr. James Wilson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select 
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Đang Chờ</option>
                      <option value="confirmed">Đã Xác Nhận</option>
                      <option value="completed">Hoàn Thành</option>
                      <option value="cancelled">Đã Hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                    <textarea 
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={formData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsAddModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                onClick={addAppointment}
              >
                Thêm Lịch Hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {isEditModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh Sửa Lịch Hẹn</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsEditModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <form>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên Bệnh Nhân <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="patientName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập tên bệnh nhân"
                      value={formData.patientName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="patientPhone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập số điện thoại"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dịch Vụ <span className="text-red-500">*</span></label>
                    <select 
                      name="service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.service}
                      onChange={handleInputChange}
                    >
                      <option value="STI Consultation">Tư Vấn STI</option>
                      <option value="HIV Testing">Xét Nghiệm HIV</option>
                      <option value="Sexual Health Consultation">Tư Vấn Sức Khỏe Tình Dục</option>
                      <option value="General STI Testing">Xét Nghiệm STI Tổng Quát</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        name="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giờ <span className="text-red-500">*</span></label>
                      <input 
                        type="time" 
                        name="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên Gia <span className="text-red-500">*</span></label>
                    <select 
                      name="consultant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.consultant}
                      onChange={handleInputChange}
                    >
                      <option value="Dr. Robert Brown">Dr. Robert Brown</option>
                      <option value="Dr. Emily Davis">Dr. Emily Davis</option>
                      <option value="Dr. James Wilson">Dr. James Wilson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select 
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Đang Chờ</option>
                      <option value="confirmed">Đã Xác Nhận</option>
                      <option value="completed">Hoàn Thành</option>
                      <option value="cancelled">Đã Hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                    <textarea 
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={formData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsEditModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                onClick={updateAppointment}
              >
                Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Xác Nhận Xóa</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa lịch hẹn của <span className="font-semibold">{currentAppointment.patientName}</span> vào ngày <span className="font-semibold">{currentAppointment.date}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 border border-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                onClick={deleteAppointment}
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 