import React, { useState, useEffect } from 'react';
import './ConsultantProfile.css';
import { consultantService } from '../../services';
import { toast } from 'react-hot-toast';
import { FaEdit, FaUser, FaGraduationCap, FaBriefcase, FaClock, FaPlus, FaTrash } from 'react-icons/fa';
import type { ConsultantProfileRequest } from '../../types';
import { useNavigate } from 'react-router-dom';

// Define interfaces for data structures
interface ConsultantProfileData {
  accountId?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  specialty: string;
  experience: string;
  education: string;
  languages: string[];
  about: string;
  avatar: string;
  certificates?: {
    id: number;
    name: string;
    issuer: string;
    year: number;
    file: string;
  }[];
  experiences?: {
    id: number;
    title: string;
    organization: string;
    location: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }[];
  schedule?: {
    [key: string]: { start: string; end: string }[];
  };
  isActive?: boolean;
  consultantProfileID?: number;
}

const ConsultantProfile: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Profile data state
  const [profile, setProfile] = useState<ConsultantProfileData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    specialty: '',
    experience: '',
    education: '',
    languages: [],
    about: '',
    avatar: '',
    certificates: [],
    experiences: [],
    schedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  });

  // Form states for certificates and experience
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    year: new Date().getFullYear(),
    file: ''
  });
  
  const [newExperience, setNewExperience] = useState({
    title: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [newLanguage, setNewLanguage] = useState<string>('');

  // Fetch consultant profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra xem có dữ liệu đã lưu trong localStorage không
        const savedProfile = localStorage.getItem('consultantProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            console.log("Loaded profile from localStorage:", parsedProfile);
            setProfile(parsedProfile);
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing saved profile:", e);
            // Nếu có lỗi khi parse, tiếp tục lấy dữ liệu từ API
          }
        }
        
        // Get consultant ID from local storage
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        
        if (!consultantId) {
          toast.error('Không tìm thấy thông tin người dùng');
          return;
        }

        // Fetch consultant profile from API
        const response = await consultantService.getConsultantById(consultantId);
        console.log("Raw API response for consultant profile:", response);
        
        if (response.statusCode === 200 && response.data) {
          // Transform API data to match our component state structure
          const profileData = response.data;
          console.log("Profile data from API:", profileData);
          
          // Tìm consultantProfileID từ response
          let consultantProfileID;
          if (profileData.consultantProfileID) {
            consultantProfileID = profileData.consultantProfileID;
          } else if (profileData.id) {
            consultantProfileID = profileData.id;
          } else if (profileData.consultant && profileData.consultant.id) {
            consultantProfileID = profileData.consultant.id;
          }
          
          console.log("Found consultantProfileID:", consultantProfileID);
          
          // Extract data and set default values if any field is missing
          const formattedProfile: ConsultantProfileData = {
            accountId: profileData.accountId || profileData.consultantID || consultantId,
            name: profileData.consultant?.name || profileData.name || '',
            title: profileData.title || 'Tư vấn viên',
            email: profileData.consultant?.email || profileData.email || '',
            phone: profileData.consultant?.phone || profileData.phone || '',
            gender: profileData.consultant?.gender || profileData.gender || '',
            birthDate: profileData.consultant?.dateOfBirth || profileData.birthDate || '',
            specialty: profileData.specialty || '',
            experience: profileData.experience || '',
            education: profileData.education || '',
            languages: profileData.languages || [],
            about: profileData.description || profileData.about || '',
            avatar: profileData.avatar || 'https://via.placeholder.com/150',
            certificates: profileData.certificates || [],
            experiences: profileData.experiences || [],
            schedule: profileData.schedule || {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: []
            },
            isActive: profileData.consultant?.status || profileData.isActive,
            consultantProfileID: consultantProfileID
          };
          
          setProfile(formattedProfile);
          console.log('Formatted profile data:', formattedProfile);
          
          // Lưu profile vào localStorage để tránh mất dữ liệu khi refresh trang
          localStorage.setItem('consultantProfile', JSON.stringify(formattedProfile));
        } else {
          toast.error('Không thể tải thông tin hồ sơ');
        }
      } catch (error) {
        console.error('Error fetching consultant profile:', error);
        toast.error('Có lỗi khi tải dữ liệu hồ sơ, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a language to the profile
  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLanguage.trim()) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  // Remove a language from the profile
  const handleRemoveLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      console.log("Saving profile data:", profile);
      console.log("consultantProfileID available:", profile.consultantProfileID);
      
      // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
      const profileData: ConsultantProfileRequest & { consultantProfileID?: number } = {
        description: profile.about,
        specialty: profile.specialty,
        experience: profile.experience,
        consultantPrice: 0, // Giá trị mặc định nếu không có
        consultantProfileID: profile.consultantProfileID // Thêm consultantProfileID nếu có
      };
      
      console.log("Sending profile data to API:", profileData);
      
      // Show loading toast
      toast.loading('Đang cập nhật hồ sơ...', { id: 'profile-update' });
      
      const response = await consultantService.updateConsultantProfile(profileData);
      console.log("API response:", response);
      
      if (response && response.statusCode === 200) {
        setEditMode(false);
        toast.success('Hồ sơ đã được cập nhật thành công', { id: 'profile-update' });
        
        // Refresh the profile data to ensure we have the latest data
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (consultantId) {
          try {
            const refreshResponse = await consultantService.getConsultantById(consultantId);
            console.log("Refresh response:", refreshResponse);
            
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              // Update local state with refreshed data
              const refreshedData = refreshResponse.data;
              
              // Tìm consultantProfileID từ response
              let consultantProfileID;
              if (refreshedData.consultantProfileID) {
                consultantProfileID = refreshedData.consultantProfileID;
              } else if (refreshedData.id) {
                consultantProfileID = refreshedData.id;
              } else if (refreshedData.consultant && refreshedData.consultant.id) {
                consultantProfileID = refreshedData.consultant.id;
              }
              
              console.log("Found consultantProfileID after refresh:", consultantProfileID);
              
              // Create a new profile object with the refreshed data but keep existing data that might not be in the response
              const updatedProfile = {
                ...profile,
                accountId: refreshedData.userId || consultantId,
                name: refreshedData.user?.name || profile.name,
                title: profile.title,
                specialty: refreshedData.specialization || profile.specialty,
                experience: refreshedData.experience?.toString() || profile.experience,
                education: profile.education,
                languages: profile.languages,
                about: refreshedData.bio || refreshedData.description || profile.about,
                certificates: profile.certificates || [],
                experiences: profile.experiences || [],
                avatar: refreshedData.avatar || profile.avatar,
                consultantProfileID: consultantProfileID // Lưu consultantProfileID từ response
              };
              
              console.log("Updated profile:", updatedProfile);
              setProfile(updatedProfile);
              
              // Lưu profile vào localStorage để tránh mất dữ liệu khi refresh trang
              localStorage.setItem('consultantProfile', JSON.stringify(updatedProfile));
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data:', refreshError);
          }
        }
      } else {
        toast.error(`Không thể cập nhật hồ sơ: ${response?.message || 'Lỗi không xác định'}`, { id: 'profile-update' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi khi cập nhật hồ sơ, vui lòng thử lại sau', { id: 'profile-update' });
    }
  };

  // Delete a certificate
  const handleDeleteCertificate = async (certificateId: number) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này không?')) {
        return;
      }
      
      // Show loading toast
      toast.loading('Đang xóa chứng chỉ...', { id: 'certificate-delete' });
      
      const updatedCertificates = profile.certificates?.filter(cert => cert.id !== certificateId) || [];
      
      // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
      const profileData: ConsultantProfileRequest = {
        description: profile.about,
        specialty: profile.specialty,
        experience: profile.experience,
        consultantPrice: 0
      };
      
      // Update profile with removed certificate
      const response = await consultantService.updateConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          certificates: updatedCertificates
        }));
        
        toast.success('Đã xóa chứng chỉ thành công', { id: 'certificate-delete' });
        
        // Refresh profile data
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (consultantId) {
          try {
            const refreshResponse = await consultantService.getConsultantById(consultantId);
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              // Update certificates with refreshed data
              if (refreshResponse.data.certificates) {
                setProfile(prev => ({
                  ...prev,
                  certificates: refreshResponse.data.certificates
                }));
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data:', refreshError);
          }
        }
      } else {
        toast.error(`Không thể xóa chứng chỉ: ${response.message || 'Lỗi không xác định'}`, { id: 'certificate-delete' });
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Có lỗi khi xóa chứng chỉ, vui lòng thử lại sau', { id: 'certificate-delete' });
    }
  };
  
  // Delete an experience
  const handleDeleteExperience = async (experienceId: number) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xóa kinh nghiệm làm việc này không?')) {
        return;
      }
      
      // Show loading toast
      toast.loading('Đang xóa kinh nghiệm làm việc...', { id: 'experience-delete' });
      
      const updatedExperiences = profile.experiences?.filter(exp => exp.id !== experienceId) || [];
      
      // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
      const profileData: ConsultantProfileRequest = {
        description: profile.about,
        specialty: profile.specialty,
        experience: profile.experience,
        consultantPrice: 0
      };
      
      // Update profile with removed experience
      const response = await consultantService.updateConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          experiences: updatedExperiences
        }));
        
        toast.success('Đã xóa kinh nghiệm làm việc thành công', { id: 'experience-delete' });
        
        // Refresh profile data
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (consultantId) {
          try {
            const refreshResponse = await consultantService.getConsultantById(consultantId);
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              // Update experiences with refreshed data
              if (refreshResponse.data.experiences) {
                setProfile(prev => ({
                  ...prev,
                  experiences: refreshResponse.data.experiences
                }));
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data:', refreshError);
          }
        }
      } else {
        toast.error(`Không thể xóa kinh nghiệm làm việc: ${response.message || 'Lỗi không xác định'}`, { id: 'experience-delete' });
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Có lỗi khi xóa kinh nghiệm làm việc, vui lòng thử lại sau', { id: 'experience-delete' });
    }
  };

  // Open modal for adding certificate or experience
  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    // Reset form values
    setNewCertificate({
      name: '',
      issuer: '',
      year: new Date().getFullYear(),
      file: ''
    });
    setNewExperience({
      title: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  // Handle certificate form changes
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  // Handle experience form changes
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new certificate
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Show loading toast
      toast.loading('Đang thêm chứng chỉ...', { id: 'certificate-add' });
      
      // Handle file upload if a file was selected
      let fileUrl = newCertificate.file;
      const fileInput = document.getElementById('certificate-file') as HTMLInputElement;
      
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const uploadResponse = await consultantService.uploadProfilePicture(file);
        
        if (uploadResponse.statusCode === 200 && uploadResponse.data) {
          fileUrl = uploadResponse.data.fileUrl;
        } else {
          toast.error('Không thể tải lên tệp chứng chỉ', { id: 'certificate-add' });
          return;
        }
      }
      
      // Create updated certificate list
      const newCertificateWithFile = {
        ...newCertificate,
        file: fileUrl
      };
      
      const updatedCertificates = [
        ...(profile.certificates || []),
        {
          id: (profile.certificates?.length || 0) + 1,
          ...newCertificateWithFile
        }
      ];
      
      // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
      const profileData: ConsultantProfileRequest = {
        description: profile.about,
        specialty: profile.specialty,
        experience: profile.experience,
        consultantPrice: 0
      };
      
      // Update profile with new certificate
      const response = await consultantService.updateConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          certificates: updatedCertificates
        }));
        
        closeModal();
        toast.success('Chứng chỉ đã được thêm thành công', { id: 'certificate-add' });
        
        // Refresh profile data
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (consultantId) {
          try {
            const refreshResponse = await consultantService.getConsultantById(consultantId);
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              // Update certificates with refreshed data
              if (refreshResponse.data.certificates) {
                setProfile(prev => ({
                  ...prev,
                  certificates: refreshResponse.data.certificates
                }));
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data:', refreshError);
          }
        }
      } else {
        toast.error(`Không thể thêm chứng chỉ: ${response.message || 'Lỗi không xác định'}`, { id: 'certificate-add' });
      }
    } catch (error) {
      console.error('Error adding certificate:', error);
      toast.error('Có lỗi khi thêm chứng chỉ, vui lòng thử lại sau', { id: 'certificate-add' });
    }
  };

  // Add a new experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Show loading toast
      toast.loading('Đang thêm kinh nghiệm làm việc...', { id: 'experience-add' });
      
      const updatedExperiences = [
        ...(profile.experiences || []),
        {
          id: (profile.experiences?.length || 0) + 1,
          ...newExperience,
          endDate: newExperience.endDate || null
        }
      ];
      
      // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
      const profileData: ConsultantProfileRequest = {
        description: profile.about,
        specialty: profile.specialty,
        experience: profile.experience,
        consultantPrice: 0
      };
      
      // Update profile with new experience
      const response = await consultantService.updateConsultantProfile(profileData);
      
      if (response.statusCode === 200) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          experiences: updatedExperiences
        }));
        
        closeModal();
        toast.success('Kinh nghiệm làm việc đã được thêm thành công', { id: 'experience-add' });
        
        // Refresh profile data to ensure we have the latest from the server
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (consultantId) {
          try {
            const refreshResponse = await consultantService.getConsultantById(consultantId);
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              // Update experiences with refreshed data
              if (refreshResponse.data.experiences) {
                setProfile(prev => ({
                  ...prev,
                  experiences: refreshResponse.data.experiences
                }));
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data:', refreshError);
          }
        }
      } else {
        toast.error(`Không thể thêm kinh nghiệm làm việc: ${response.message || 'Lỗi không xác định'}`, { id: 'experience-add' });
      }
    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error('Có lỗi khi thêm kinh nghiệm làm việc, vui lòng thử lại sau', { id: 'experience-add' });
    }
  };

  // Translate English day names to Vietnamese
  const translateDayName = (day: string): string => {
    const translations: Record<string, string> = {
      monday: 'Thứ 2',
      tuesday: 'Thứ 3',
      wednesday: 'Thứ 4',
      thursday: 'Thứ 5',
      friday: 'Thứ 6',
      saturday: 'Thứ 7',
      sunday: 'Chủ nhật'
    };
    return translations[day] || day;
  };

  // Format date to display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };
  
  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        toast.loading('Đang tải ảnh lên...', { id: 'avatar-upload' });
        
        // Upload the file
        const response = await consultantService.uploadProfilePicture(file);
        
        if (response.statusCode === 200 && response.data) {
          // Update profile with new avatar URL
          const avatarUrl = response.data.fileUrl;
          
          // Chỉ gửi các trường dữ liệu theo đúng định dạng API trong swagger
          const profileData: ConsultantProfileRequest = {
            description: profile.about,
            specialty: profile.specialty,
            experience: profile.experience,
            consultantPrice: 0
          };
          
          const updateResponse = await consultantService.updateConsultantProfile(profileData);
          
          if (updateResponse.statusCode === 200) {
            // Update local state
            setProfile(prev => ({
              ...prev,
              avatar: avatarUrl
            }));
            
            toast.success('Cập nhật ảnh đại diện thành công', { id: 'avatar-upload' });
            
            // Refresh profile data
            const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
            if (consultantId) {
              try {
                const refreshResponse = await consultantService.getConsultantById(consultantId);
                if (refreshResponse.statusCode === 200 && refreshResponse.data) {
                  // Update avatar with refreshed data
                  if (refreshResponse.data.avatar) {
                    setProfile(prev => ({
                      ...prev,
                      avatar: refreshResponse.data.avatar
                    }));
                  }
                }
              } catch (refreshError) {
                console.error('Error refreshing profile data:', refreshError);
              }
            }
          } else {
            toast.error('Không thể cập nhật ảnh đại diện', { id: 'avatar-upload' });
          }
        } else {
          toast.error('Không thể tải ảnh lên', { id: 'avatar-upload' });
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Có lỗi khi tải ảnh lên', { id: 'avatar-upload' });
      }
    }
  };
  
  // Set active tab and close any open modals when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Close modal when changing tabs
    if (showModal) {
      setShowModal(false);
      setModalType('');
    }
  };

  // Render profile content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <div className="profile-avatar">
              <div className="avatar-container">
                <img 
                  src={profile.avatar && profile.avatar !== '' ? profile.avatar : '/logo.png'} 
                  alt={profile.name} 
                  className="avatar-image" 
                />
                {editMode && (
                  <div className="avatar-upload">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload" className="avatar-edit-icon">
                      <FaEdit />
                    </label>
                </div>
                )}
              </div>
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-title">{profile.title}</p>
              <span className={`profile-status ${profile.isActive ? 'active' : 'inactive'}`}>
                {profile.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
                </div>
                
            <div className="profile-section">
              <h3 className="section-title">
                <FaUser className="icon" /> Thông tin cá nhân
              </h3>
                
                <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Họ tên</span>
                  {editMode ? (
                  <input 
                    type="text" 
                      name="name" 
                    value={profile.name}
                      onChange={handleProfileChange}
                      className="form-input"
                  />
                  ) : (
                    <span className="info-value">{profile.name || 'Chưa cập nhật'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <span className="info-label">Chức danh</span>
                  {editMode ? (
                  <input 
                    type="text" 
                      name="title" 
                    value={profile.title}
                      onChange={handleProfileChange}
                      className="form-input"
                  />
                  ) : (
                    <span className="info-value">{profile.title || 'Chưa cập nhật'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <span className="info-label">Email</span>
                  {editMode ? (
                    <input 
                      type="email" 
                      name="email" 
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="info-value">{profile.email || 'Chưa cập nhật'}</span>
                  )}
                  </div>
                  
                <div className="info-item">
                  <span className="info-label">Số điện thoại</span>
                  {editMode ? (
                    <input 
                      type="tel" 
                      name="phone" 
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <span className="info-value">{profile.phone || 'Chưa cập nhật'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <span className="info-label">Giới tính</span>
                  {editMode ? (
                    <select 
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      className="form-input"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <span className="info-value">{profile.gender || 'Chưa cập nhật'}</span>
                  )}
                  </div>
                  
                <div className="info-item">
                  <span className="info-label">Ngày sinh</span>
                  {editMode ? (
                    <input 
                      type="date" 
                      name="birthDate" 
                      value={profile.birthDate ? profile.birthDate.split('T')[0] : ''}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="info-value">{formatDate(profile.birthDate) || 'Chưa cập nhật'}</span>
                  )}
                </div>
                  </div>
                </div>

            <div className="profile-section">
              <h3 className="section-title">
                <FaGraduationCap className="icon" /> Chuyên môn
              </h3>
                
                <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Chuyên ngành</span>
                  {editMode ? (
                    <input 
                      type="text" 
                      name="specialty" 
                      value={profile.specialty}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="info-value">{profile.specialty || 'Chưa cập nhật'}</span>
                  )}
                  </div>
                  
                <div className="info-item">
                  <span className="info-label">Kinh nghiệm</span>
                  {editMode ? (
                    <input 
                      type="text" 
                      name="experience" 
                      value={profile.experience}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="info-value">{profile.experience || 'Chưa cập nhật'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <span className="info-label">Học vấn</span>
                  {editMode ? (
                  <input 
                    type="text" 
                      name="education" 
                    value={profile.education}
                      onChange={handleProfileChange}
                      className="form-input"
                  />
                  ) : (
                    <span className="info-value">{profile.education || 'Chưa cập nhật'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <span className="info-label">Ngôn ngữ</span>
                  {editMode ? (
                    <>
                      <div className="tag-list">
                        {profile.languages.map((language, index) => (
                          <span key={index} className="tag">
                            {language}
                            <span 
                              className="tag-remove" 
                              onClick={() => handleRemoveLanguage(language)}
                            >
                              &times;
                            </span>
                          </span>
                        ))}
                      </div>
                      <form onSubmit={handleAddLanguage} className="tag-input-container">
                  <input 
                    type="text" 
                          value={newLanguage}
                          onChange={e => setNewLanguage(e.target.value)}
                          placeholder="Thêm ngôn ngữ..."
                          className="tag-input"
                        />
                        <button type="submit" className="add-tag-button">Thêm</button>
                      </form>
                    </>
                  ) : (
                    <span className="info-value">
                      {profile.languages.length > 0 
                        ? profile.languages.join(', ') 
                        : 'Chưa cập nhật'
                      }
                    </span>
                  )}
                </div>
                </div>
                
              <div className="section-divider"></div>
              
              <div className="info-item">
                <span className="info-label">Giới thiệu</span>
                {editMode ? (
                  <textarea 
                    name="about" 
                    value={profile.about}
                    onChange={handleProfileChange}
                    className="form-input"
                    rows={5}
                  />
                ) : (
                  <p className="info-value">
                    {profile.about || 'Chưa có thông tin giới thiệu.'}
                  </p>
                )}
                </div>
                
              {editMode && (
                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                    Hủy
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    Lưu thông tin
                  </button>
              </div>
            )}
            </div>
          </div>
        );
        
      case 'certificates':
        return (
          <div className="profile-content">
            <div className="profile-section">
            <div className="section-header">
                <h3 className="section-title">
                  <FaGraduationCap className="icon" /> Chứng chỉ & Bằng cấp
                </h3>
                <button className="btn btn-primary" onClick={() => openModal('certificate')}>
                  <FaPlus /> Thêm chứng chỉ
                </button>
            </div>
            
              <div className="certificate-grid">
                {profile.certificates && profile.certificates.length > 0 ? (
                  profile.certificates.map((cert, index) => (
                    <div className="certificate-card" key={index}>
                      <h4 className="certificate-title">{cert.name}</h4>
                      <p className="certificate-issuer">{cert.issuer}</p>
                      <p className="certificate-year">Năm: {cert.year}</p>
                      <div className="certificate-actions">
                        <button className="btn btn-secondary" onClick={() => handleDeleteCertificate(cert.id)}>
                          <FaTrash /> Xóa
                </button>
              </div>
            </div>
                  ))
                ) : (
                  <p>Chưa có chứng chỉ nào được thêm.</p>
                )}
                  </div>
              </div>
          </div>
        );
        
      case 'experiences':
        return (
          <div className="profile-content">
            <div className="profile-section">
              <div className="section-header">
                <h3 className="section-title">
                  <FaBriefcase className="icon" /> Kinh nghiệm làm việc
                </h3>
                <button className="btn btn-primary" onClick={() => openModal('experience')}>
                  <FaPlus /> Thêm kinh nghiệm
                </button>
              </div>
              
              {profile.experiences && profile.experiences.length > 0 ? (
                profile.experiences.map((exp, index) => (
                  <div className="experience-item" key={index}>
                    <div className="experience-period">
                      <div className="experience-marker"></div>
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Hiện tại'}
                    </div>
                    <h4 className="experience-title">{exp.title}</h4>
                    <p className="experience-organization">{exp.organization}</p>
                    <p className="experience-location">{exp.location}</p>
                    <p className="experience-description">{exp.description}</p>
                    <div className="experience-actions">
                      <button className="btn btn-secondary" onClick={() => handleDeleteExperience(exp.id)}>
                        <FaTrash /> Xóa
                      </button>
                  </div>
              </div>
                ))
              ) : (
                <p>Chưa có kinh nghiệm làm việc nào được thêm.</p>
              )}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="profile-content">
            <div className="profile-section">
            <div className="section-header">
                <h3 className="section-title">
                  <FaClock className="icon" /> Lịch làm việc
                </h3>
            </div>
            
              <div className="schedule-section">
                {Object.entries(profile.schedule || {}).map(([day, slots]) => (
                  <div className="day-schedule" key={day}>
                    <div className="day-header">
                      <span>{translateDayName(day)}</span>
                    </div>
                    
                      <div className="time-slots">
                      {slots && slots.length > 0 ? (
                        slots.map((slot, idx) => (
                          <div className="time-slot" key={idx}>
                            {slot.start} - {slot.end}
                          </div>
                        ))
                    ) : (
                        <p>Không có ca làm việc</p>
                    )}
                  </div>
                        </div>
                      ))}
                    </div>
              
              <p className="info-value">
                Để đăng ký lịch làm việc, vui lòng liên hệ với quản lý để được hỗ trợ.
              </p>
                </div>
          </div>
        );

      default:
        return <div>Không có dữ liệu</div>;
    }
  };

  // Render add certificate modal
  const renderCertificateModal = () => (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Thêm chứng chỉ mới</h3>
          <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          
        <form onSubmit={handleAddCertificate}>
                <div className="form-group">
            <label className="form-label">Tên chứng chỉ</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newCertificate.name}
              onChange={handleCertificateChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Đơn vị cấp</label>
                  <input 
                    type="text" 
                    name="issuer"
                    value={newCertificate.issuer}
              onChange={handleCertificateChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Năm cấp</label>
                  <input 
                    type="number" 
                    name="year"
              value={newCertificate.year}
              onChange={handleCertificateChange}
              className="form-input"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Tài liệu đính kèm</label>
            <div className="file-input-container">
                  <input 
                    type="file" 
                id="certificate-file"
                    name="file"
                className="file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
              <label htmlFor="certificate-file" className="file-input-label">
                Chọn tệp
              </label>
              {newCertificate.file && (
                <div className="file-name">{newCertificate.file}</div>
              )}
            </div>
                </div>
                
                <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Hủy
                  </button>
            <button type="submit" className="btn btn-primary">
              Thêm chứng chỉ
                  </button>
                </div>
              </form>
      </div>
    </div>
  );

  // Render add experience modal
  const renderExperienceModal = () => (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Thêm kinh nghiệm làm việc</h3>
          <button className="modal-close" onClick={closeModal}>&times;</button>
        </div>
        
        <form onSubmit={handleAddExperience}>
                <div className="form-group">
            <label className="form-label">Chức danh</label>
                  <input 
                    type="text" 
                    name="title"
                    value={newExperience.title}
              onChange={handleExperienceChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Tổ chức / Công ty</label>
                  <input 
                    type="text" 
                    name="organization"
                    value={newExperience.organization}
              onChange={handleExperienceChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Địa điểm</label>
                  <input 
                    type="text" 
                    name="location"
                    value={newExperience.location}
              onChange={handleExperienceChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Ngày bắt đầu</label>
                  <input 
              type="date"
                    name="startDate"
                    value={newExperience.startDate}
              onChange={handleExperienceChange}
              className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Ngày kết thúc (để trống nếu vẫn đang làm việc)</label>
                  <input 
              type="date"
                    name="endDate"
                    value={newExperience.endDate}
              onChange={handleExperienceChange}
              className="form-input"
                  />
                </div>
                
                <div className="form-group">
            <label className="form-label">Mô tả công việc</label>
                  <textarea 
                    name="description"
                    value={newExperience.description}
              onChange={handleExperienceChange}
              className="form-input"
              rows={4}
                    required
            />
                </div>
                
                <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Hủy
                  </button>
            <button type="submit" className="btn btn-primary">
              Thêm kinh nghiệm
                  </button>
                </div>
              </form>
        </div>
      </div>
    );

  // Cleanup function to handle logout
  const cleanupOnLogout = () => {
    // Listen for storage events
    window.addEventListener('storage', (event) => {
      // Check if token was removed (logout)
      if (event.key === 'token' && !event.newValue) {
        // Clear consultant profile data
        localStorage.removeItem('consultantProfile');
      }
    });
    
    // Check if user is logged out when component mounts
    if (!localStorage.getItem('token')) {
      localStorage.removeItem('consultantProfile');
    }
  };

  // Call cleanup function
  cleanupOnLogout();

  return (
    <div className="consultant-profile-container">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin hồ sơ...</p>
          </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-tabs">
          <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => handleTabChange('profile')}
          >
                Thông tin cá nhân
          </button>
          <button 
                className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`} 
                onClick={() => handleTabChange('certificates')}
          >
                Chứng chỉ & Bằng cấp
          </button>
          <button 
                className={`tab-button ${activeTab === 'experiences' ? 'active' : ''}`} 
                onClick={() => handleTabChange('experiences')}
              >
                Kinh nghiệm làm việc
              </button>
              <button 
                className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} 
                onClick={() => handleTabChange('schedule')}
              >
                Lịch làm việc
          </button>
        </div>
            
            {activeTab === 'profile' && !editMode && (
              <button className="edit-button" onClick={toggleEditMode}>
                <FaEdit /> Chỉnh sửa
              </button>
            )}
      </div>
      
        {renderContent()}
          
          {/* Render modals only when showModal is true and we're on the correct tab */}
          {showModal && modalType === 'certificate' && activeTab === 'certificates' && renderCertificateModal()}
          {showModal && modalType === 'experience' && activeTab === 'experiences' && renderExperienceModal()}
        </>
      )}
    </div>
  );
};

export default ConsultantProfile; 