import React, { useState } from 'react';

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
      ? 'admin-badge admin-badge-success' 
      : 'admin-badge admin-badge-danger';
  };

  // Specialty badge class
  const getSpecialtyBadgeClass = (specialty: string) => {
    switch(specialty) {
      case 'Reproductive Health':
        return 'admin-badge admin-badge-primary';
      case 'HIV/AIDS':
        return 'admin-badge admin-badge-info';
      case 'STI Treatment':
        return 'admin-badge admin-badge-warning';
      default:
        return 'admin-badge admin-badge-secondary';
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
    <div className="admin-dashboard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Specialist Management</h1>
          <p className="admin-text-muted admin-text-sm">
            Manage healthcare specialists in the system
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Specialist
        </button>
      </div>

      {/* Stats Summary */}
      <div className="admin-stats-summary mb-5">
        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Total Specialists</div>
            <div className="admin-stats-item-value">{stats.totalConsultants}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Active</div>
            <div className="admin-stats-item-value">{stats.activeConsultants}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Total Consultations</div>
            <div className="admin-stats-item-value">{stats.totalConsultations}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Average Rating</div>
            <div className="admin-stats-item-value">{stats.avgRating}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="admin-select"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              <option value="Reproductive Health">Reproductive Health</option>
              <option value="HIV/AIDS">HIV/AIDS</option>
              <option value="STI Treatment">STI Treatment</option>
            </select>
            
            <select 
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="admin-text-sm admin-text-muted">Total: <span className="font-semibold text-gray-800">{filteredConsultants.length} specialists</span></span>
          </div>
        </div>
      </div>

      {/* Consultants Grid - Updated with larger, centered cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {currentConsultants.map(consultant => (
          <div key={consultant.id} className="admin-card overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="relative p-3 text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border-2 border-indigo-100 shadow-sm">
                <img 
                  src={consultant.image} 
                  alt={consultant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={getStatusBadgeClass(consultant.status) + " absolute top-2 right-2 text-xs"}>
                {consultant.status === 'active' ? 'Active' : 'Inactive'}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{consultant.name}</h3>
              <div className={getSpecialtyBadgeClass(consultant.specialty) + " mb-2 inline-block text-xs"}>
                    {consultant.specialty}
              </div>
              
              <div className="flex justify-center items-center space-x-1 mb-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg 
                    key={index}
                    className={`h-3 w-3 ${index < Math.floor(consultant.ratings) ? 'text-yellow-400' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="text-xs font-medium text-gray-600">{consultant.ratings}</span>
              </div>
              
              <div className="text-xs text-gray-600 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {consultant.email}
              </div>
              <div className="text-xs text-gray-600 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {consultant.phone}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                {consultant.consultations} consultations
              </div>
            </div>
            
            <div className="flex border-t border-gray-200">
                  <button 
                    onClick={() => handleEdit(consultant.id)}
                className="flex-1 px-4 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                Edit
                  </button>
              <div className="border-r border-gray-200"></div>
                  <button 
                    onClick={() => handleDelete(consultant.id)}
                className="flex-1 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                Delete
                  </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="admin-pagination">
            <button
            className="admin-pagination-btn"
              disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            >
            Previous
            </button>
          
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`admin-pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          
              <button 
            className="admin-pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          >
            Next
              </button>
        </div>
      )}
    </div>
  );
};

export default Consultants; 