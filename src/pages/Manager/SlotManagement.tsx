import React, { useState, useEffect } from 'react';
import './SlotManagement.css';
import { consultantSlotAPI } from '../../utils/api';

// Types based on actual API data structure
interface ConsultantSlot {
  consultantID: string;
  slotID: number;
  maxAppointment: number;
  assignedDate: string;
  slot?: {
    slotID: number;
    startTime: string;
    endTime: string;
    maxConsultant: number;
    maxTestAppointment: number;
  };
  consultant?: {
    name: string;
    specialty?: string;
    imageUrl?: string;
  };
}

interface ConsultantProfile {
  consultantProfileID: number;
  accountID: string;
  description: string;
  specialty: string;
  experience: string;
  consultantPrice: number;
  account?: {
    name: string;
    email: string;
    phone: string;
  };
}

const SlotManagement = () => {
  // State
  const [consultantSlots, setConsultantSlots] = useState<ConsultantSlot[]>([]);
  const [consultantProfiles, setConsultantProfiles] = useState<ConsultantProfile[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<ConsultantSlot[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ConsultantProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'slots' | 'profiles'>('slots');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState<boolean>(false);
  const [currentProfile, setCurrentProfile] = useState<ConsultantProfile | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);

  // Constants
  const itemsPerPage = 10;

  // Fetch consultant slots from API
  const fetchConsultantSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await consultantSlotAPI.getAllConsultantSlots();
      
      if (response.statusCode === 200 && response.data) {
        setConsultantSlots(response.data);
        setFilteredSlots(response.data);
      } else {
        setError('Không thể tải dữ liệu consultant slots');
        setConsultantSlots([]);
        setFilteredSlots([]);
      }
    } catch (error) {
      console.error('Error fetching consultant slots:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu slots');
      setConsultantSlots([]);
      setFilteredSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultant profiles from API
  const fetchConsultantProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await consultantSlotAPI.getAllConsultantProfiles();
      
      if (response.statusCode === 200 && response.data) {
        setConsultantProfiles(response.data);
        setFilteredProfiles(response.data);
      } else {
        setError('Không thể tải dữ liệu consultant profiles');
        setConsultantProfiles([]);
        setFilteredProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching consultant profiles:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu profiles');
      setConsultantProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'slots') {
      fetchConsultantSlots();
    } else {
      fetchConsultantProfiles();
    }
  }, [activeTab]);

  // Filter data based on search query and selected consultant
  useEffect(() => {
    if (activeTab === 'slots') {
      let filtered = consultantSlots;

      if (selectedConsultantId) {
        filtered = filtered.filter(slot => slot.consultantID === selectedConsultantId);
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(slot =>
          slot.consultant?.name?.toLowerCase().includes(query) ||
          slot.consultant?.specialty?.toLowerCase().includes(query)
        );
      }

      setFilteredSlots(filtered);
    } else {
      let filtered = consultantProfiles;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(profile =>
          profile.account?.name?.toLowerCase().includes(query) ||
          profile.specialty?.toLowerCase().includes(query) ||
          profile.description?.toLowerCase().includes(query)
        );
      }

      setFilteredProfiles(filtered);
    }
    
    setCurrentPage(1);
  }, [searchQuery, selectedConsultantId, consultantSlots, consultantProfiles, activeTab]);

  // Search function using API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await consultantSlotAPI.searchConsultantSlots({ query: searchQuery });
      
      if (response.statusCode === 200 && response.data) {
        if (activeTab === 'slots') {
          setFilteredSlots(response.data);
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  // Get consultant slots by specific consultant ID
  const fetchConsultantSlotsById = async (consultantId: string) => {
    try {
      setLoading(true);
      const response = await consultantSlotAPI.getConsultantSlots(consultantId);
      
      if (response.statusCode === 200 && response.data) {
        setFilteredSlots(response.data);
      } else {
        setFilteredSlots([]);
      }
    } catch (error) {
      console.error('Error fetching consultant slots by ID:', error);
      setError('Không thể tải dữ liệu cho consultant này');
    } finally {
      setLoading(false);
    }
  };

  // Get consultant profile by ID
  const fetchConsultantProfile = async (profileId: number) => {
    try {
      const response = await consultantSlotAPI.getConsultantProfileById(profileId);
      
      if (response.statusCode === 200 && response.data) {
        setCurrentProfile(response.data);
        setIsProfileModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching consultant profile:', error);
      alert('Không thể tải thông tin profile');
    }
  };

  // Register a new slot for consultant
  const handleRegisterSlot = async (slotId: number, maxAppointment: number) => {
    try {
      const response = await consultantSlotAPI.registerSlot(slotId, maxAppointment);
      
      if (response.statusCode === 200) {
        alert('Đăng ký slot thành công!');
        fetchConsultantSlots();
      } else {
        alert('Đăng ký slot thất bại');
      }
    } catch (error) {
      console.error('Error registering slot:', error);
      alert('Có lỗi xảy ra khi đăng ký slot');
    }
  };

  // Create consultant profile
  const handleCreateProfile = async (profileData: any) => {
    try {
      const response = await consultantSlotAPI.createConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        alert('Tạo profile thành công!');
        setIsCreateProfileModalOpen(false);
        if (activeTab === 'profiles') {
          fetchConsultantProfiles();
        }
      } else {
        alert('Tạo profile thất bại');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Có lỗi xảy ra khi tạo profile');
    }
  };

  // Update consultant profile
  const handleUpdateProfile = async (profileId: number, profileData: any) => {
    try {
      const response = await consultantSlotAPI.updateConsultantProfile(profileId, profileData);
      
      if (response.statusCode === 200) {
        alert('Cập nhật profile thành công!');
        setIsProfileModalOpen(false);
        if (activeTab === 'profiles') {
          fetchConsultantProfiles();
        }
      } else {
        alert('Cập nhật profile thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật profile');
    }
  };

  // Swap slots between consultants
  const handleSwapSlots = async (consultantA: string, slotA: number, consultantB: string, slotB: number) => {
    try {
      const response = await consultantSlotAPI.swapSlots(consultantA, slotA, consultantB, slotB);
      
      if (response.statusCode === 200) {
        alert('Hoán đổi slot thành công!');
        fetchConsultantSlots();
      } else {
        alert('Hoán đổi slot thất bại');
      }
    } catch (error) {
      console.error('Error swapping slots:', error);
      alert('Có lỗi xảy ra khi hoán đổi slot');
    }
  };

  // Pagination
  const currentData = activeTab === 'slots' ? filteredSlots : filteredProfiles;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  // Helper functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get unique consultants for filter dropdown
  const uniqueConsultants = consultantSlots.reduce((acc: { id: string, name: string }[], slot) => {
    if (slot.consultant?.name && !acc.find(c => c.id === slot.consultantID)) {
      acc.push({
        id: slot.consultantID,
        name: slot.consultant.name
      });
    }
    return acc;
  }, []);

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="pagination-button"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          className="pagination-button"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="slot-management-container">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Consultant Slots & Profiles</h1>
        <p className="page-subtitle">
          Quản lý slots và profiles của chuyên gia theo API ConsultantSlot
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        marginBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button 
          className={`tab-button ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'slots' ? '#3b82f6' : 'transparent',
            color: activeTab === 'slots' ? 'white' : '#6b7280',
            borderRadius: '0.5rem 0.5rem 0 0',
            cursor: 'pointer'
          }}
        >
          Consultant Slots
        </button>
        <button 
          className={`tab-button ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'profiles' ? '#3b82f6' : 'transparent',
            color: activeTab === 'profiles' ? 'white' : '#6b7280',
            borderRadius: '0.5rem 0.5rem 0 0',
            cursor: 'pointer'
          }}
        >
          Consultant Profiles
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-container" style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          <p>{error}</p>
        </div>
      )}

      {/* Filter and search */}
      {!loading && (
        <div className="filter-search-container">
          {activeTab === 'slots' && (
            <div className="filter-container">
              <label htmlFor="consultant-filter">Chuyên gia:</label>
              <select 
                id="consultant-filter" 
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả chuyên gia</option>
                {uniqueConsultants.map(consultant => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="search-container">
            <input 
              type="text"
              placeholder={activeTab === 'slots' ? 
                "Tìm kiếm theo tên chuyên gia hoặc chuyên môn..." :
                "Tìm kiếm theo tên, chuyên môn hoặc mô tả..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* API Actions */}
      {!loading && (
        <div className="api-actions" style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3>Các chức năng có sẵn:</h3>
          <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {activeTab === 'slots' ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const slotId = prompt('Nhập Slot ID:');
                    const maxAppointment = prompt('Nhập số lượng appointment tối đa:');
                    if (slotId && maxAppointment) {
                      handleRegisterSlot(parseInt(slotId), parseInt(maxAppointment));
                    }
                  }}
                >
                  Đăng ký Slot mới
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsSwapModalOpen(true)}
                >
                  Hoán đổi Slots
                </button>
              </>
            ) : (
              <button 
                className="btn btn-success"
                onClick={() => setIsCreateProfileModalOpen(true)}
              >
                Tạo Profile mới
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data table */}
      {!loading && (
        <div className="requests-table-container">
          {activeTab === 'slots' ? (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Chuyên Gia ID</th>
                  <th>Tên Chuyên Gia</th>
                  <th>Chuyên Môn</th>
                  <th>Slot ID</th>
                  <th>Ngày</th>
                  <th>Thời Gian</th>
                  <th>Max Appointment</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {(currentItems as ConsultantSlot[]).map((slot, index) => (
                  <tr key={`${slot.consultantID}-${slot.slotID}-${index}`}>
                    <td>{slot.consultantID}</td>
                    <td>{slot.consultant?.name || 'Chưa có tên'}</td>
                    <td>{slot.consultant?.specialty || 'Chưa có chuyên môn'}</td>
                    <td>{slot.slotID}</td>
                    <td>{formatDate(slot.assignedDate)}</td>
                    <td>
                      {slot.slot ? 
                        `${formatTime(slot.slot.startTime)} - ${formatTime(slot.slot.endTime)}` 
                        : 'Chưa có thông tin'
                      }
                    </td>
                    <td>{slot.maxAppointment}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => fetchConsultantSlotsById(slot.consultantID)}
                        title="Xem tất cả slots của consultant này"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Profile ID</th>
                  <th>Account ID</th>
                  <th>Tên</th>
                  <th>Chuyên Môn</th>
                  <th>Kinh Nghiệm</th>
                  <th>Giá Tư Vấn</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {(currentItems as ConsultantProfile[]).map((profile, index) => (
                  <tr key={`${profile.consultantProfileID}-${index}`}>
                    <td>{profile.consultantProfileID}</td>
                    <td>{profile.accountID}</td>
                    <td>{profile.account?.name || 'Chưa có tên'}</td>
                    <td>{profile.specialty || 'Chưa có chuyên môn'}</td>
                    <td>{profile.experience || 'Chưa có thông tin'}</td>
                    <td>{formatCurrency(profile.consultantPrice)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => fetchConsultantProfile(profile.consultantProfileID)}
                        title="Xem chi tiết profile"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* No data message */}
      {!loading && currentData.length === 0 && (
        <div className="no-data-container" style={{ 
          textAlign: 'center', 
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p>
            {activeTab === 'slots' ? 
              'Không có slot nào được đăng ký.' : 
              'Không có profile nào.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && renderPagination()}

      {/* Modals would be implemented here */}
      {/* Create Profile Modal, Update Profile Modal, Swap Slots Modal */}
    </div>
  );
};

export default SlotManagement; 