import React, { useState } from 'react';
import './Consultants.css';

const Consultants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const consultantsPerPage = 8; // Changed from 10 to 8 for better grid layout

  // Mock data
  const consultants = [
    { id: 1, name: 'Dr. John Smith', email: 'johnsmith@example.com', phone: '0901234567', specialty: 'Reproductive Health', status: 'active', ratings: 4.8, consultations: 158, image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Dr. Sarah Johnson', email: 'sarahjohnson@example.com', phone: '0912345678', specialty: 'HIV/AIDS', status: 'active', ratings: 4.9, consultations: 216, image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, name: 'Dr. Michael Brown', email: 'michaelbrown@example.com', phone: '0923456789', specialty: 'STI Treatment', status: 'inactive', ratings: 4.5, consultations: 94, image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, name: 'Dr. Emily Davis', email: 'emilydavis@example.com', phone: '0934567890', specialty: 'Reproductive Health', status: 'active', ratings: 4.7, consultations: 172, image: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: 5, name: 'Dr. Robert Wilson', email: 'robertwilson@example.com', phone: '0945678901', specialty: 'HIV/AIDS', status: 'active', ratings: 4.6, consultations: 143, image: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 6, name: 'Dr. Jessica Miller', email: 'jessicamiller@example.com', phone: '0956789012', specialty: 'STI Treatment', status: 'inactive', ratings: 4.3, consultations: 78, image: 'https://randomuser.me/api/portraits/women/6.jpg' },
    { id: 7, name: 'Dr. David Garcia', email: 'davidgarcia@example.com', phone: '0967890123', specialty: 'Reproductive Health', status: 'active', ratings: 4.9, consultations: 201, image: 'https://randomuser.me/api/portraits/men/7.jpg' },
    { id: 8, name: 'Dr. Linda Martinez', email: 'lindamartinez@example.com', phone: '0978901234', specialty: 'HIV/AIDS', status: 'active', ratings: 4.7, consultations: 165, image: 'https://randomuser.me/api/portraits/women/8.jpg' },
    { id: 9, name: 'Dr. James Taylor', email: 'jamestaylor@example.com', phone: '0989012345', specialty: 'STI Treatment', status: 'active', ratings: 4.5, consultations: 112, image: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { id: 10, name: 'Dr. Jennifer Anderson', email: 'jenniferanderson@example.com', phone: '0990123456', specialty: 'Reproductive Health', status: 'inactive', ratings: 4.4, consultations: 86, image: 'https://randomuser.me/api/portraits/women/10.jpg' },
    { id: 11, name: 'Dr. Thomas White', email: 'thomaswhite@example.com', phone: '0901234568', specialty: 'HIV/AIDS', status: 'active', ratings: 4.8, consultations: 197, image: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { id: 12, name: 'Dr. Mary Clark', email: 'maryclark@example.com', phone: '0912345679', specialty: 'STI Treatment', status: 'active', ratings: 4.6, consultations: 132, image: 'https://randomuser.me/api/portraits/women/12.jpg' },
  ];

  // Statistics
  const stats = {
    totalConsultants: consultants.length,
    activeConsultants: consultants.filter(consultant => consultant.status === 'active').length,
    totalConsultations: consultants.reduce((sum, consultant) => sum + consultant.consultations, 0),
    avgRating: (consultants.reduce((sum, consultant) => sum + consultant.ratings, 0) / consultants.length).toFixed(1)
  };

  // Filter consultants
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = 
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.phone.includes(searchQuery);
    
    const matchesSpecialty = filterSpecialty === 'all' || consultant.specialty === filterSpecialty;
    const matchesStatus = filterStatus === 'all' || consultant.status === filterStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  // Pagination
  const indexOfLastConsultant = currentPage * consultantsPerPage;
  const indexOfFirstConsultant = indexOfLastConsultant - consultantsPerPage;
  const currentConsultants = filteredConsultants.slice(indexOfFirstConsultant, indexOfLastConsultant);
  const totalPages = Math.ceil(filteredConsultants.length / consultantsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' 
      ? 'status-badge status-badge-success' 
      : 'status-badge status-badge-danger';
  };

  // Specialty badge class
  const getSpecialtyBadgeClass = (specialty: string) => {
    switch(specialty) {
      case 'Reproductive Health':
        return 'status-badge status-badge-primary';
      case 'HIV/AIDS':
        return 'status-badge status-badge-info';
      case 'STI Treatment':
        return 'status-badge status-badge-warning';
      default:
        return 'status-badge status-badge-secondary';
    }
  };

  // Handle user actions
  const handleEdit = (id: number) => {
    console.log('Edit consultant', id);
    // Implementation for edit
  };

  const handleDelete = (id: number) => {
    console.log('Delete consultant', id);
    // Implementation for delete
  };

  const handleAddNew = () => {
    console.log('Add new consultant');
    // Implementation for adding new consultant
  };

  return (
    <div className="consultants-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Specialist Management</h1>
          <p className="text-sm text-gray-500">
            Manage healthcare specialists in the system
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="add-consultant-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Specialist
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stats-item">
          <div className="stats-item-icon icon-bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Total Specialists</div>
            <div className="stats-item-value">{stats.totalConsultants}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Active</div>
            <div className="stats-item-value">{stats.activeConsultants}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Total Consultations</div>
            <div className="stats-item-value">{stats.totalConsultations}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Average Rating</div>
            <div className="stats-item-value">{stats.avgRating}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="consultants-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="filter-select"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              <option value="Reproductive Health">Reproductive Health</option>
              <option value="HIV/AIDS">HIV/AIDS</option>
              <option value="STI Treatment">STI Treatment</option>
            </select>
            
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{currentConsultants.length}</span> of <span className="font-semibold text-gray-700">{filteredConsultants.length}</span> specialists
            </span>
          </div>
        </div>
      </div>

      {/* Consultants Grid */}
      <div className="consultants-grid mb-4">
        {currentConsultants.map(consultant => (
          <div key={consultant.id} className="consultant-profile">
            <div className="consultant-header">
              <img 
                src={consultant.image} 
                alt={consultant.name} 
                className="consultant-image"
              />
            </div>
            <div className="consultant-body">
              <h3 className="consultant-name">{consultant.name}</h3>
              <div className="consultant-specialty">
                <span className={getSpecialtyBadgeClass(consultant.specialty)}>
                  {consultant.specialty}
                </span>
              </div>
              <div className="consultant-info">
                <div className="consultant-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="consultant-info-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {consultant.email}
                </div>
                <div className="consultant-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="consultant-info-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {consultant.phone}
                </div>
                <div className="consultant-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="consultant-info-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Status: <span className={getStatusBadgeClass(consultant.status)} style={{ marginLeft: '0.25rem' }}>
                    {consultant.status}
                  </span>
                </div>
              </div>
              <div className="consultant-stats">
                <div className="consultant-stat">
                  <div className="consultant-stat-value">{consultant.ratings}</div>
                  <div className="consultant-stat-label">Rating</div>
                </div>
                <div className="consultant-stat">
                  <div className="consultant-stat-value">{consultant.consultations}</div>
                  <div className="consultant-stat-label">Consultations</div>
                </div>
              </div>
              <div className="consultant-actions">
                <button 
                  onClick={() => handleEdit(consultant.id)}
                  className="consultant-action-button action-button-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(consultant.id)}
                  className="consultant-action-button action-button-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
  );
};

export default Consultants; 