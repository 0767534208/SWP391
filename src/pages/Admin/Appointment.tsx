import React, { useState } from 'react';
import './Appointment.css';

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
    <div className="appointments-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Appointment Management</h1>
          <p className="text-sm text-gray-500">
            Track and manage all appointments in the system
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
            <span>List</span>
          </button>
          <button 
            className={`view-toggle-button ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Calendar</span>
          </button>
          <button 
            className="add-appointment-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="appointments-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search patients, doctors, services..."
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
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="reset-button"
            >
              Reset
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

          {/* List View */}
      {view === 'list' && (
        <div className="appointments-card mb-4 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="appointments-table w-full">
                <thead>
                  <tr>
                    <th className="w-12">ID</th>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Consultant</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th className="w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.length > 0 ? (
                    currentAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>
                          <div>
                          <div className="font-medium text-gray-800">{appointment.patientName}</div>
                          <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                          </div>
                        </td>
                        <td>{appointment.service}</td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-800">{appointment.date}</div>
                          <div className="text-xs text-gray-500">{appointment.time}</div>
                        </div>
                      </td>
                        <td>{appointment.consultant}</td>
                        <td>
                          <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status}
                          </span>
                        </td>
                        <td>
                        <span className="text-xs text-gray-500">
                          {appointment.notes || 'No notes'}
                        </span>
                        </td>
                        <td>
                          <div className="flex space-x-1">
                            <button 
                            className="action-button action-button-edit"
                              onClick={() => handleEditAppointment(appointment.id)}
                            >
                            Edit
                            </button>
                            <button 
                            className="action-button action-button-delete"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                            Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">No appointments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>

          {/* Pagination */}
          {filteredAppointments.length > 0 && (
            <div className="pagination" style={{ position: 'relative' }}>
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
                </svg>
                </button>
            </div>
          )}
        </div>
      )}

      {/* Calendar View - Simplified for this example */}
      {view === 'calendar' && (
        <div className="calendar-container mb-4">
          <div className="calendar-header">
            <h3 className="calendar-title">June 2023</h3>
            <div className="calendar-nav">
              <button className="calendar-nav-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="calendar-nav-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            <div className="calendar-day-header">Sun</div>
            <div className="calendar-day-header">Mon</div>
            <div className="calendar-day-header">Tue</div>
            <div className="calendar-day-header">Wed</div>
            <div className="calendar-day-header">Thu</div>
            <div className="calendar-day-header">Fri</div>
            <div className="calendar-day-header">Sat</div>
            
            {/* Example calendar days */}
            <div className="calendar-day other-month">
              <div className="calendar-day-number">28</div>
            </div>
            <div className="calendar-day other-month">
              <div className="calendar-day-number">29</div>
            </div>
            <div className="calendar-day other-month">
              <div className="calendar-day-number">30</div>
            </div>
            <div className="calendar-day other-month">
              <div className="calendar-day-number">31</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">1</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">2</div>
                </div>
            <div className="calendar-day">
              <div className="calendar-day-number">3</div>
            </div>
            
            {/* Week 2 */}
            <div className="calendar-day">
              <div className="calendar-day-number">4</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">5</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">6</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">7</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">8</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">9</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">10</div>
            </div>
            
            {/* Week 3 */}
            <div className="calendar-day">
              <div className="calendar-day-number">11</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">12</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">13</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">14</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">15</div>
              <div className="calendar-event calendar-event-completed">
                John Smith - 09:00
                        </div>
                        </div>
            <div className="calendar-day">
              <div className="calendar-day-number">16</div>
              <div className="calendar-event calendar-event-pending">
                Sarah Johnson - 10:30
                          </div>
                      </div>
            <div className="calendar-day">
              <div className="calendar-day-number">17</div>
              <div className="calendar-event calendar-event-confirmed">
                Michael Lee - 14:00
                  </div>
            </div>
            
            {/* Week 4 */}
            <div className="calendar-day">
              <div className="calendar-day-number">18</div>
              <div className="calendar-event calendar-event-cancelled">
                Jessica Taylor - 15:30
              </div>
            </div>
            <div className="calendar-day today">
              <div className="calendar-day-number">19</div>
              <div className="calendar-event calendar-event-pending">
                David Martinez - 08:00
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">20</div>
              <div className="calendar-event calendar-event-confirmed">
                Jennifer Garcia - 11:00
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">21</div>
              <div className="calendar-event calendar-event-pending">
                Thomas Rodriguez - 13:30
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">22</div>
              <div className="calendar-event calendar-event-completed">
                Lisa Anderson - 16:00
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">23</div>
              <div className="calendar-event calendar-event-confirmed">
                William Thompson - 09:30
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">24</div>
              <div className="calendar-event calendar-event-pending">
                Mary White - 10:00
              </div>
            </div>
            
            {/* Week 5 */}
            <div className="calendar-day">
              <div className="calendar-day-number">25</div>
              <div className="calendar-event calendar-event-confirmed">
                Daniel Harris - 14:30
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">26</div>
              <div className="calendar-event calendar-event-cancelled">
                Patricia Clark - 15:00
              </div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">27</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">28</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">29</div>
            </div>
            <div className="calendar-day">
              <div className="calendar-day-number">30</div>
            </div>
            <div className="calendar-day other-month">
              <div className="calendar-day-number">1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 