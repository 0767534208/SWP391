import React, { useState, useEffect } from 'react';
import './ConsultantProfile.css';
import consultantService from '../../services/consultantService';
import { toast } from 'react-hot-toast';
import { 
  FaUser, 
  FaGraduationCap, 
  FaClock, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaStethoscope,
  FaAward,
  FaDollarSign,
  FaCalendarAlt,
  FaUserCheck
} from 'react-icons/fa';
import type { ConsultantProfile, UpdateConsultantProfileRequest } from '../../types';
import { authUtils } from '../../utils/auth';

interface FormData {
  name: string;
  address: string;
  phone: string;
  dateOfBirth: string;
  description: string;
  specialty: string;
  experience: string;
  consultantPrice: number;
}

const ConsultantProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone: '',
    dateOfBirth: '',
    description: '',
    specialty: '',
    experience: '',
    consultantPrice: 0
  });

  // Fetch consultant profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching consultant profile...');
        
        // Debug localStorage contents
        authUtils.debugLocalStorage();
        
        // Get account ID from localStorage (from login response)
        let accountId = authUtils.getCurrentUserId();
        
        if (!accountId) {
          console.error('❌ No account ID found in localStorage');
          
          // For testing purposes, use the account ID from the login response you provided
          accountId = '01eb9f40-4287-4631-8a6f-b982113fbaea';
          console.log('🧪 Using test account ID for development:', accountId);
          
          // Set the test account ID
          authUtils.setTestUserId(accountId);
        }
        
        console.log('👤 Account ID:', accountId);
        
        const response = await consultantService.getConsultantById(accountId);
        
        console.log('📡 API Response:', response);
        
        if (response && response.data) {
          console.log('✅ Profile data received:', response.data);
          setProfile(response.data);
          
          // Initialize form data with fetched data
          setFormData({
            name: response.data.account?.name || '',
            address: response.data.account?.address || '',
            phone: response.data.account?.phone || '',
            dateOfBirth: response.data.account?.dateOfBirth || '',
            description: response.data.description || '',
            specialty: response.data.specialty || '',
            experience: response.data.experience || '',
            consultantPrice: response.data.consultantPrice || 0
          });
          
          console.log('📝 Form data initialized:', {
            name: response.data.account?.name,
            description: response.data.description,
            specialty: response.data.specialty,
            experience: response.data.experience,
            consultantPrice: response.data.consultantPrice
          });
        } else {
          console.error('❌ No data in response:', response);
          setError('Không tìm thấy dữ liệu hồ sơ');
        }
      } catch (err) {
        console.error('💥 Error fetching profile:', err);
        setError(`Lỗi khi tải hồ sơ: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'consultantPrice' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      console.log('Saving profile with data:', formData);
      
      // Use the new API method signature
      const updateData: UpdateConsultantProfileRequest = {
        description: formData.description,
        specialty: formData.specialty,
        experience: formData.experience,
        consultantPrice: formData.consultantPrice
      };

      console.log('Update data:', updateData);
      
      const response = await consultantService.updateConsultantProfile(
        profile.consultantProfileID,
        updateData
      );
      
      console.log('Update response:', response);
      
      if (response && response.data) {
        toast.success('Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        
        // Update profile state with new data
        setProfile(prev => prev ? {
          ...prev,
          description: formData.description,
          specialty: formData.specialty,
          experience: formData.experience,
          consultantPrice: formData.consultantPrice
        } : null);
      } else {
        toast.error('Cập nhật hồ sơ thất bại');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(`Lỗi khi cập nhật hồ sơ: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.account?.name || '',
        address: profile.account?.address || '',
        phone: profile.account?.phone || '',
        dateOfBirth: profile.account?.dateOfBirth || '',
        description: profile.description || '',
        specialty: profile.specialty || '',
        experience: profile.experience || '',
        consultantPrice: profile.consultantPrice || 0
      });
    }
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Format time from ISO string to display format
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="consultant-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultant-profile-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="consultant-profile-page">
        <div className="error-container">
          <p>Không có dữ liệu hồ sơ</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consultant-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Hồ sơ tư vấn viên</h1>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-button"
                title="Chỉnh sửa"
              >
                <FaEdit />
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="save-button"
                >
                  <FaSave /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  <FaTimes /> Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {/* Personal Information */}
          <div className="profile-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h2>Thông tin cá nhân</h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label><FaUser /> Họ và tên:</label>
                  <span>{profile.account?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label><FaPhone /> Số điện thoại:</label>
                  <span>{profile.account?.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label><FaMapMarkerAlt /> Địa chỉ:</label>
                  <span>{profile.account?.address || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label><FaBirthdayCake /> Ngày sinh:</label>
                  <span>{formatDate(profile.account?.dateOfBirth || '')}</span>
                </div>
                <div className="info-item">
                  <label><FaUserCheck /> Trạng thái:</label>
                  <span className={`status ${profile.account?.status ? 'active' : 'inactive'}`}>
                    {profile.account?.status ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="profile-section">
            <div className="section-header">
              <FaGraduationCap className="section-icon" />
              <h2>Thông tin nghề nghiệp</h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label><FaStethoscope /> Chuyên khoa:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="Nhập chuyên khoa"
                    />
                  ) : (
                    <span>{profile.specialty || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label><FaAward /> Kinh nghiệm:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="Nhập kinh nghiệm"
                    />
                  ) : (
                    <span>{profile.experience || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label><FaDollarSign /> Giá tư vấn:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="consultantPrice"
                      value={formData.consultantPrice}
                      onChange={handleInputChange}
                      className="edit-input"
                      min="0"
                      placeholder="Nhập giá tư vấn"
                    />
                  ) : (
                    <span className="price">{formatCurrency(profile.consultantPrice)}</span>
                  )}
                </div>
              </div>
              <div className="info-item full-width">
                <label>Mô tả:</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows={4}
                    placeholder="Nhập mô tả"
                  />
                ) : (
                  <p className="description">{profile.description || 'Không có mô tả'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="profile-section">
            <div className="section-header">
              <FaClock className="section-icon" />
              <h2>Thông tin lịch làm việc</h2>
            </div>
            <div className="section-content">
              {profile.account?.consultantSlots && profile.account.consultantSlots.length > 0 ? (
                <div className="schedule-grid">
                  {profile.account.consultantSlots.map((consultantSlot) => (
                    <div key={consultantSlot.slotID} className="schedule-item">
                      <div className="schedule-time">
                        <FaClock /> {formatTime(consultantSlot.slot.startTime)} - {formatTime(consultantSlot.slot.endTime)}
                      </div>
                      <div className="schedule-details">
                        <span><FaCalendarAlt /> Ngày: {formatDate(consultantSlot.assignedDate)}</span>
                        <span><FaUserCheck /> Tối đa cuộc hẹn: {consultantSlot.maxAppointment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-schedule">Không có lịch làm việc</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantProfilePage;