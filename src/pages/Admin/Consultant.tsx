import React, { useState, type ChangeEvent } from 'react';
import './Consultant.css';

interface ConsultantType {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
  consultations: number;
  image: string;
}

interface ConsultantFormData {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
  image: string;
}

const Consultants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentConsultant, setCurrentConsultant] = useState<ConsultantType | null>(null);
  const consultantsPerPage = 8; // Changed from 10 to 8 for better grid layout

  // Form state for add/edit consultant
  const [formData, setFormData] = useState<ConsultantFormData>({
    name: '',
    email: '',
    phone: '',
    specialty: 'Reproductive Health',
    status: 'active',
    image: 'https://randomuser.me/api/portraits/men/1.jpg'
  });

  // Mock data
  const [consultants, setConsultants] = useState<ConsultantType[]>([
    { id: 1, name: 'Dr. John Smith', email: 'johnsmith@example.com', phone: '0901234567', specialty: 'Reproductive Health', status: 'active', consultations: 158, image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Dr. Sarah Johnson', email: 'sarahjohnson@example.com', phone: '0912345678', specialty: 'HIV/AIDS', status: 'active', consultations: 216, image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, name: 'Dr. Michael Brown', email: 'michaelbrown@example.com', phone: '0923456789', specialty: 'STI Treatment', status: 'inactive', consultations: 94, image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, name: 'Dr. Emily Davis', email: 'emilydavis@example.com', phone: '0934567890', specialty: 'Reproductive Health', status: 'active', consultations: 172, image: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: 5, name: 'Dr. Robert Wilson', email: 'robertwilson@example.com', phone: '0945678901', specialty: 'HIV/AIDS', status: 'active', consultations: 143, image: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 6, name: 'Dr. Jessica Miller', email: 'jessicamiller@example.com', phone: '0956789012', specialty: 'STI Treatment', status: 'inactive', consultations: 78, image: 'https://randomuser.me/api/portraits/women/6.jpg' },
    { id: 7, name: 'Dr. David Garcia', email: 'davidgarcia@example.com', phone: '0967890123', specialty: 'Reproductive Health', status: 'active', consultations: 201, image: 'https://randomuser.me/api/portraits/men/7.jpg' },
    { id: 8, name: 'Dr. Linda Martinez', email: 'lindamartinez@example.com', phone: '0978901234', specialty: 'HIV/AIDS', status: 'active', consultations: 165, image: 'https://randomuser.me/api/portraits/women/8.jpg' },
    { id: 9, name: 'Dr. James Taylor', email: 'jamestaylor@example.com', phone: '0989012345', specialty: 'STI Treatment', status: 'active', consultations: 112, image: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { id: 10, name: 'Dr. Jennifer Anderson', email: 'jenniferanderson@example.com', phone: '0990123456', specialty: 'Reproductive Health', status: 'inactive', consultations: 86, image: 'https://randomuser.me/api/portraits/women/10.jpg' },
    { id: 11, name: 'Dr. Thomas White', email: 'thomaswhite@example.com', phone: '0901234568', specialty: 'HIV/AIDS', status: 'active', consultations: 197, image: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { id: 12, name: 'Dr. Mary Clark', email: 'maryclark@example.com', phone: '0912345679', specialty: 'STI Treatment', status: 'active', consultations: 132, image: 'https://randomuser.me/api/portraits/women/12.jpg' },
  ]);

  // Statistics
  const stats = {
    totalConsultants: consultants.length,
    activeConsultants: consultants.filter(consultant => consultant.status === 'active').length,
    totalConsultations: consultants.reduce((sum, consultant) => sum + consultant.consultations, 0)
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

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle user actions
  const handleEdit = (id: number) => {
    const consultantToEdit = consultants.find(consultant => consultant.id === id);
    if (consultantToEdit) {
      setCurrentConsultant(consultantToEdit);
      setFormData({
        name: consultantToEdit.name,
        email: consultantToEdit.email,
        phone: consultantToEdit.phone,
        specialty: consultantToEdit.specialty,
        status: consultantToEdit.status,
        image: consultantToEdit.image
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const consultantToDelete = consultants.find(consultant => consultant.id === id);
    if (consultantToDelete) {
      setCurrentConsultant(consultantToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  const handleAddNew = () => {
    // Reset form data
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: 'Reproductive Health',
      status: 'active',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    setIsAddModalOpen(true);
  };

  // CRUD operations
  const addConsultant = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Create new consultant object
    const newConsultant: ConsultantType = {
      id: consultants.length > 0 ? Math.max(...consultants.map(c => c.id)) + 1 : 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      status: formData.status,
      consultations: 0,
      image: formData.image
    };

    // Add new consultant to the list
    setConsultants([...consultants, newConsultant]);
    setIsAddModalOpen(false);
  };

  const updateConsultant = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (currentConsultant) {
      // Update consultant
      const updatedConsultants = consultants.map(consultant => {
        if (consultant.id === currentConsultant.id) {
          return {
            ...consultant,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialty: formData.specialty,
            status: formData.status,
            image: formData.image
          };
        }
        return consultant;
      });

      setConsultants(updatedConsultants);
      setIsEditModalOpen(false);
    }
  };

  const deleteConsultant = () => {
    if (currentConsultant) {
      const updatedConsultants = consultants.filter(consultant => consultant.id !== currentConsultant.id);
      setConsultants(updatedConsultants);
      setIsDeleteModalOpen(false);
    }
  };

  // Image preview function
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(formData.image);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      image: value
    });
    setImagePreviewUrl(value);
  };

  return (
    <div className="consultants-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Chuyên Gia</h1>
          <p className="text-sm text-gray-500">
            Quản lý các chuyên gia y tế trong hệ thống
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="add-consultant-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm Chuyên Gia
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
            <div className="stats-item-title">Tổng Số Chuyên Gia</div>
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
            <div className="stats-item-title">Đang Hoạt Động</div>
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
            <div className="stats-item-title">Tổng Số Buổi Tư Vấn</div>
            <div className="stats-item-value">{stats.totalConsultations}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="consultants-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
              <option value="all">Tất Cả Chuyên Môn</option>
              <option value="Reproductive Health">Sức Khỏe Sinh Sản</option>
              <option value="HIV/AIDS">HIV/AIDS</option>
              <option value="STI Treatment">Điều Trị STI</option>
            </select>
            
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="active">Đang Hoạt Động</option>
              <option value="inactive">Không Hoạt Động</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-700">{currentConsultants.length}</span> trong số <span className="font-semibold text-gray-700">{filteredConsultants.length}</span> chuyên gia
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
                  Trạng thái: <span className={getStatusBadgeClass(consultant.status)} style={{ marginLeft: '0.25rem' }}>
                    {consultant.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
              <div className="consultant-stats">
                <div className="consultant-stat">
                  <div className="consultant-stat-value">{consultant.consultations}</div>
                  <div className="consultant-stat-label">Buổi Tư Vấn</div>
                </div>
              </div>
              <div className="consultant-actions">
                <button 
                  onClick={() => handleEdit(consultant.id)}
                  className="action-button action-button-edit"
                  title="Chỉnh sửa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(consultant.id)}
                  className="action-button action-button-delete"
                  title="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
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

      {/* Add Consultant Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Thêm Chuyên Gia Mới</h2>
              <span className="close" onClick={() => setIsAddModalOpen(false)}>&times;</span>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); addConsultant(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="name">Tên Đầy Đủ <span className="required-field">*</span></label>
                    <input 
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email <span className="required-field">*</span></label>
                    <input 
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Số Điện Thoại <span className="required-field">*</span></label>
                    <input 
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="specialty">Chuyên Môn</label>
                    <select 
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Reproductive Health">Sức Khỏe Sinh Sản</option>
                      <option value="HIV/AIDS">HIV/AIDS</option>
                      <option value="STI Treatment">Điều Trị STI</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Trạng Thái</label>
                    <select 
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="active">Hoạt Động</option>
                      <option value="inactive">Không Hoạt Động</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="image">Avatar URL</label>
                    <input 
                      id="image"
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleImageChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                {/* Image preview */}
                <div className="mt-4">
                  <label>Xem Trước Ảnh:</label>
                  <div className="mt-2">
                    <img src={imagePreviewUrl} alt="Avatar Preview" className="image-preview" />
                  </div>
                </div>
                
                <div className="button-group mt-4">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    Thêm Chuyên Gia
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Consultant Modal */}
      {isEditModalOpen && currentConsultant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chỉnh Sửa Thông Tin Chuyên Gia</h2>
              <span className="close" onClick={() => setIsEditModalOpen(false)}>&times;</span>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); updateConsultant(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-name">Tên Đầy Đủ <span className="required-field">*</span></label>
                    <input 
                      id="edit-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-email">Email <span className="required-field">*</span></label>
                    <input 
                      id="edit-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-phone">Số Điện Thoại <span className="required-field">*</span></label>
                    <input 
                      id="edit-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-specialty">Chuyên Môn</label>
                    <select 
                      id="edit-specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Reproductive Health">Sức Khỏe Sinh Sản</option>
                      <option value="HIV/AIDS">HIV/AIDS</option>
                      <option value="STI Treatment">Điều Trị STI</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-status">Trạng Thái</label>
                    <select 
                      id="edit-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="active">Hoạt Động</option>
                      <option value="inactive">Không Hoạt Động</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-image">Avatar URL</label>
                    <input 
                      id="edit-image"
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleImageChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                {/* Image preview */}
                <div className="mt-4">
                  <label>Xem Trước Ảnh:</label>
                  <div className="mt-2">
                    <img src={imagePreviewUrl} alt="Avatar Preview" className="image-preview" />
                  </div>
                </div>
                
                <div className="button-group mt-4">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    Cập Nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentConsultant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Xác Nhận Xóa</h2>
              <span className="close" onClick={() => setIsDeleteModalOpen(false)}>&times;</span>
            </div>
            
            <div className="modal-body">
              <div className="flex items-center mb-4">
                <img src={currentConsultant.image} alt={currentConsultant.name} className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <p className="font-medium">{currentConsultant.name}</p>
                  <p className="text-sm text-gray-500">{currentConsultant.specialty}</p>
                </div>
              </div>
              
              <p className="mb-2">Bạn có chắc chắn muốn xóa chuyên gia này khỏi hệ thống?</p>
              <p className="text-sm text-red-500">Hành động này không thể hoàn tác!</p>
            </div>
            
            <div className="button-group mt-4">
              <button 
                className="btn-secondary" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-danger" 
                onClick={() => {
                  deleteConsultant();
                  setIsDeleteModalOpen(false);
                }}
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

export default Consultants;