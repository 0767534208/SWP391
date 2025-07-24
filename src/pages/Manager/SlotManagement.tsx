import { useState, useEffect } from 'react';
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
    address?: string;
    dateOfBirth?: string;
    status?: boolean;
    consultantSlots?: ConsultantSlot[];
  };
}

interface AvailableSlot {
  slotID: number;
  startTime: string;
  endTime: string;
  maxConsultant: number;
  maxTestAppointment: number;
}

interface User {
  accountID: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  userRole?: string;
  status?: boolean;
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
  const [isRegisterSlotModalOpen, setIsRegisterSlotModalOpen] = useState<boolean>(false);
  const [isSlotDetailModalOpen, setIsSlotDetailModalOpen] = useState<boolean>(false);
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState<ConsultantSlot | null>(null);
  
  // Additional state for modals
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Form states
  const [createProfileForm, setCreateProfileForm] = useState({
    accountId: '',
    description: '',
    specialty: '',
    experience: '',
    consultantPrice: 0
  });

  const [registerSlotForm, setRegisterSlotForm] = useState({
    slotId: 0,
    maxAppointment: 5
  });

  const [swapSlotsForm, setSwapSlotsForm] = useState({
    fromConsultantId: '',
    toConsultantId: '',
    slotId: 0
  });

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

  // Search function using API - simplified since there's no specific search endpoint
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      // Since there's no specific search API, we'll filter locally
      if (activeTab === 'slots') {
        const filtered = consultantSlots.filter(slot =>
          slot.consultant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.consultant?.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSlots(filtered);
      } else {
        const filtered = consultantProfiles.filter(profile =>
          profile.account?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProfiles(filtered);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Có lỗi xảy ra khi tìm kiếm');
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
        alert(`Đăng ký slot thất bại: ${response.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error registering slot:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('403')) {
        alert('Lỗi 403: Không có quyền truy cập.\n\nCách khắc phục:\n• Đảm bảo đã đăng nhập với quyền Manager\n• Tạo consultant profile trước khi đăng ký slot\n• Kiểm tra slot chưa đầy consultant\n• Đăng xuất và đăng nhập lại nếu token hết hạn');
      } else if (errorMessage.includes('401')) {
        alert('Lỗi xác thực: Vui lòng đăng nhập lại');
      } else {
        alert(`Có lỗi xảy ra khi đăng ký slot: ${errorMessage}`);
      }
    }
  };

  // Create consultant profile
  const handleCreateProfile = async (profileData: {
    accountId: string;
    description: string;
    specialty: string;
    experience: string;
    consultantPrice: number;
  }) => {
    try {
      // Validate consultant price
      if (profileData.consultantPrice <= 0) {
        alert('Giá tư vấn phải lớn hơn 0!');
        return;
      }

      // Check if profile already exists for this account
      console.log('Checking for existing consultant profile...');
      try {
        const existingProfiles = await consultantSlotAPI.getAllConsultantProfiles();
        if (existingProfiles.data) {
          const existingProfile = existingProfiles.data.find(
            profile => profile.accountID === profileData.accountId
          );
          
          if (existingProfile) {
            alert('Tài khoản này đã có profile consultant. Mỗi tài khoản chỉ được tạo một profile.');
            return;
          }
        }
      } catch (checkError) {
        console.warn('Could not check existing profiles, proceeding with creation:', checkError);
      }

      const response = await consultantSlotAPI.createConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        alert('Tạo profile thành công!');
        setIsCreateProfileModalOpen(false);
        setCreateProfileForm({
          accountId: '',
          description: '',
          specialty: '',
          experience: '',
          consultantPrice: 0
        });
        if (activeTab === 'profiles') {
          fetchConsultantProfiles();
        }
      } else if (response.statusCode === 400) {
        if (response.message?.includes('ConsultantPrice must > 0')) {
          alert('Giá tư vấn phải lớn hơn 0!');
        } else {
          alert(`Tạo profile thất bại: ${response.message || 'Dữ liệu không hợp lệ'}`);
        }
      } else {
        alert(`Tạo profile thất bại: ${response.message || 'Lỗi không xác định'}`);
      }
    } catch (error: unknown) {
      console.error('Error creating profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      if (errorMessage.includes('duplicate key')) {
        alert('Tài khoản này đã có profile consultant. Mỗi tài khoản chỉ được tạo một profile.');
      } else if (errorMessage.includes('ConsultantPrice must > 0')) {
        alert('Giá tư vấn phải lớn hơn 0!');
      } else {
        alert(`Có lỗi xảy ra khi tạo profile: ${errorMessage}`);
      }
    }
  };

  // Swap slots between consultants
  const handleSwapSlots = async (fromConsultantId: string, toConsultantId: string, slotId: number) => {
    try {
      // Validate swap parameters
      if (fromConsultantId === toConsultantId) {
        alert('Không thể hoán đổi slot của cùng một consultant!');
        return;
      }

      // Sử dụng API mới với 4 tham số: consultantA, slotA, consultantB, slotB
      const response = await consultantSlotAPI.swapSlots(
        fromConsultantId, 
        slotId, 
        toConsultantId, 
        slotId // Giả sử hoán đổi cùng một slot
      );
      
      if (response.statusCode === 200) {
        alert('Hoán đổi slot thành công!');
        setIsSwapModalOpen(false);
        fetchConsultantSlots();
      } else {
        alert(`Hoán đổi slot thất bại: ${response.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error swapping slots:', error);
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('Cannot swap the same slot')) {
        alert('Không thể hoán đổi cùng một slot!\nVui lòng chọn các slot khác nhau để hoán đổi.');
      } else if (errorMessage.includes('405')) {
        alert('Chức năng hoán đổi slot hiện tại không khả dụng');
      } else {
        alert(`Có lỗi xảy ra khi hoán đổi slot: ${errorMessage}`);
      }
    }
  };
  // Fetch available slots
  const fetchAvailableSlots = async () => {
    try {
      const response = await consultantSlotAPI.getAvailableSlots();
      if (response.statusCode === 200 && response.data) {
        setAvailableSlots(response.data);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      await consultantSlotAPI.getAllUsers();
      // API này không hoạt động, sử dụng mock data
      const mockUsers: User[] = [
        { 
          accountID: '01eb9f40-4287-4631-8a6f-b982113fbaea', 
          name: 'Consultant', 
          email: 'consultant@example.com',
          phone: '0786014911',
          address: 'bac',
          userRole: 'consultant',
          status: true
        },
        { 
          accountID: '70c9b36d-678a-4932-8282-cedc9b1204bd', 
          name: 'Consultant2', 
          email: 'consultant2@example.com',
          phone: '0561887135',
          address: 'abc',
          userRole: 'consultant',
          status: true
        }
      ];
      setAllUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Sử dụng mock data khi API không khả dụng
      const mockUsers: User[] = [
        { 
          accountID: '01eb9f40-4287-4631-8a6f-b982113fbaea', 
          name: 'Consultant', 
          email: 'consultant@example.com',
          phone: '0786014911',
          address: 'bac',
          userRole: 'consultant',
          status: true
        },
        { 
          accountID: '70c9b36d-678a-4932-8282-cedc9b1204bd', 
          name: 'Consultant2', 
          email: 'consultant2@example.com',
          phone: '0561887135',
          address: 'abc',
          userRole: 'consultant',
          status: true
        }
      ];
      setAllUsers(mockUsers);
    }
  };

  // Load additional data when modals open
  useEffect(() => {
    if (isRegisterSlotModalOpen) {
      fetchAvailableSlots();
    }
    if (isCreateProfileModalOpen || isSwapModalOpen) {
      fetchAllUsers();
    }
  }, [isRegisterSlotModalOpen, isCreateProfileModalOpen, isSwapModalOpen]);

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button" style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
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
                  onClick={() => setIsRegisterSlotModalOpen(true)}
                >
                  Đăng ký Slot mới
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsSwapModalOpen(true)}
                >
                  Hoán đổi Slots
                </button>
                {/* Unregister button removed - API not available */}
              </>
            ) : (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => setIsCreateProfileModalOpen(true)}
                >
                  Tạo Profile mới
                </button>
              </>
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
                        onClick={() => {
                          setSelectedSlotForDetail(slot);
                          setIsSlotDetailModalOpen(true);
                        }}
                        title="Xem chi tiết slot này"
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => fetchConsultantProfile(profile.consultantProfileID)}
                          title="Xem chi tiết profile"
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setCurrentProfile(profile);
                            setIsProfileModalOpen(true);
                          }}
                          title="Chỉnh sửa profile"
                        >
                          Sửa
                        </button>
                      </div>
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

      {/* Create Profile Modal */}
      {isCreateProfileModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>Tạo Profile Consultant Mới</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Client-side validation
              if (!createProfileForm.accountId) {
                alert('Vui lòng chọn tài khoản!');
                return;
              }
              if (!createProfileForm.description.trim()) {
                alert('Vui lòng nhập mô tả!');
                return;
              }
              if (!createProfileForm.specialty.trim()) {
                alert('Vui lòng nhập chuyên môn!');
                return;
              }
              if (!createProfileForm.experience.trim()) {
                alert('Vui lòng nhập kinh nghiệm!');
                return;
              }
              if (createProfileForm.consultantPrice <= 0) {
                alert('Giá tư vấn phải lớn hơn 0!');
                return;
              }
              
              handleCreateProfile(createProfileForm);
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Account ID:</label>
                <select 
                  value={createProfileForm.accountId}
                  onChange={(e) => setCreateProfileForm({...createProfileForm, accountId: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Chọn Account</option>
                  {allUsers.map(user => (
                    <option key={user.accountID} value={user.accountID}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Mô tả:</label>
                <textarea 
                  value={createProfileForm.description}
                  onChange={(e) => setCreateProfileForm({...createProfileForm, description: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Chuyên môn:</label>
                <input 
                  type="text"
                  value={createProfileForm.specialty}
                  onChange={(e) => setCreateProfileForm({...createProfileForm, specialty: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Kinh nghiệm:</label>
                <input 
                  type="text"
                  value={createProfileForm.experience}
                  onChange={(e) => setCreateProfileForm({...createProfileForm, experience: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Giá tư vấn (VND):</label>
                <input 
                  type="number"
                  value={createProfileForm.consultantPrice}
                  onChange={(e) => setCreateProfileForm({...createProfileForm, consultantPrice: Number(e.target.value)})}
                  required
                  min="1"
                  step="1"
                  placeholder="Nhập giá tư vấn (tối thiểu: 1 VND)"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  Giá tư vấn phải lớn hơn 0 VND
                </small>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsCreateProfileModalOpen(false);
                    setCreateProfileForm({
                      accountId: '',
                      description: '',
                      specialty: '',
                      experience: '',
                      consultantPrice: 0
                    });
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Tạo Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Slot Modal */}
      {isRegisterSlotModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2>Đăng Ký Slot Mới</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleRegisterSlot(registerSlotForm.slotId, registerSlotForm.maxAppointment);
              setIsRegisterSlotModalOpen(false);
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Slot:</label>
                <select 
                  value={registerSlotForm.slotId}
                  onChange={(e) => setRegisterSlotForm({...registerSlotForm, slotId: Number(e.target.value)})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value={0}>Chọn Slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot.slotID} value={slot.slotID}>
                      Slot {slot.slotID}: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Số lượng appointment tối đa:</label>
                <input 
                  type="number"
                  value={registerSlotForm.maxAppointment}
                  onChange={(e) => setRegisterSlotForm({...registerSlotForm, maxAppointment: Number(e.target.value)})}
                  required
                  min="1"
                  max="10"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegisterSlotModalOpen(false);
                    setRegisterSlotForm({ slotId: 0, maxAppointment: 5 });
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap Slots Modal */}
      {isSwapModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Hoán Đổi Slots</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSwapSlots(swapSlotsForm.fromConsultantId, swapSlotsForm.toConsultantId, swapSlotsForm.slotId);
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Từ Consultant:</label>
                <select 
                  value={swapSlotsForm.fromConsultantId}
                  onChange={(e) => setSwapSlotsForm({...swapSlotsForm, fromConsultantId: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Chọn Consultant</option>
                  {uniqueConsultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Đến Consultant:</label>
                <select 
                  value={swapSlotsForm.toConsultantId}
                  onChange={(e) => setSwapSlotsForm({...swapSlotsForm, toConsultantId: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Chọn Consultant</option>
                  {uniqueConsultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Slot ID:</label>
                <input 
                  type="number"
                  value={swapSlotsForm.slotId}
                  onChange={(e) => setSwapSlotsForm({...swapSlotsForm, slotId: Number(e.target.value)})}
                  required
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSwapModalOpen(false);
                    setSwapSlotsForm({ fromConsultantId: '', toConsultantId: '', slotId: 0 });
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.25rem' }}
                >
                  Hoán Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {isProfileModalOpen && currentProfile && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>Chi Tiết Profile Consultant</h2>
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
              <p><strong>Profile ID:</strong> {currentProfile.consultantProfileID}</p>
              <p><strong>Account ID:</strong> {currentProfile.accountID}</p>
              <p><strong>Tên:</strong> {currentProfile.account?.name}</p>
              <p><strong>Email:</strong> {currentProfile.account?.email}</p>
              <p><strong>Điện thoại:</strong> {currentProfile.account?.phone}</p>
              <p><strong>Địa chỉ:</strong> {currentProfile.account?.address}</p>
              <p><strong>Ngày sinh:</strong> {currentProfile.account?.dateOfBirth ? formatDate(currentProfile.account.dateOfBirth) : 'Chưa có'}</p>
              <p><strong>Chuyên môn:</strong> {currentProfile.specialty}</p>
              <p><strong>Kinh nghiệm:</strong> {currentProfile.experience}</p>
              <p><strong>Mô tả:</strong> {currentProfile.description}</p>
              <p><strong>Giá tư vấn:</strong> {formatCurrency(currentProfile.consultantPrice)}</p>
              {currentProfile.account?.consultantSlots && currentProfile.account.consultantSlots.length > 0 && (
                <div>
                  <strong>Slots đã đăng ký:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {currentProfile.account.consultantSlots.map((slot: ConsultantSlot, index: number) => (
                      <li key={index}>
                        Slot {slot.slotID}: {slot.slot ? `${formatTime(slot.slot.startTime)} - ${formatTime(slot.slot.endTime)}` : 'Chưa có thông tin'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setCurrentProfile(null);
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Detail Modal */}
      {isSlotDetailModalOpen && selectedSlotForDetail && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Chi Tiết Slot</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '0.5rem' 
              }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>Thông Tin Slot</h3>
                <p><strong>Slot ID:</strong> {selectedSlotForDetail.slotID}</p>
                <p><strong>Max Appointment:</strong> {selectedSlotForDetail.maxAppointment}</p>
                <p><strong>Ngày Đăng Ký:</strong> {formatDate(selectedSlotForDetail.assignedDate)}</p>
                {selectedSlotForDetail.slot && (
                  <>
                    <p><strong>Thời Gian:</strong> {formatTime(selectedSlotForDetail.slot.startTime)} - {formatTime(selectedSlotForDetail.slot.endTime)}</p>
                    <p><strong>Max Consultant:</strong> {selectedSlotForDetail.slot.maxConsultant}</p>
                  </>
                )}
              </div>

              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#ecfdf5', 
                borderRadius: '0.5rem' 
              }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#065f46' }}>Thông Tin Chuyên Gia</h3>
                <p><strong>ID:</strong> {selectedSlotForDetail.consultantID}</p>
                <p><strong>Tên:</strong> {selectedSlotForDetail.consultant?.name || 'Chưa có tên'}</p>
                <p><strong>Chuyên Môn:</strong> {selectedSlotForDetail.consultant?.specialty || 'Chưa có thông tin'}</p>
              </div>
            </div>

            {/* Additional details section */}
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fffbeb', 
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#92400e' }}>Thông Tin Bổ Sung</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Trạng Thái:</strong> <span style={{ color: '#059669' }}>Đã Đăng Ký</span></p>
                <p><strong>Loại Slot:</strong> Tư Vấn</p>
                {selectedSlotForDetail.slot?.maxTestAppointment !== undefined && (
                  <p><strong>Max Test Appointment:</strong> {selectedSlotForDetail.slot.maxTestAppointment}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setIsSlotDetailModalOpen(false);
                  setSelectedSlotForDetail(null);
                }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  fontWeight: '500'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SlotManagement; 