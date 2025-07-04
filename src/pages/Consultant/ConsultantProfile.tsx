import React, { useState } from 'react';
import './ConsultantProfile.css';

// Định nghĩa kiểu dữ liệu cho lịch làm việc
type TimeSlot = {
  start: string;
  end: string;
};

type DaySchedule = TimeSlot[];

type ScheduleType = {
  [key: string]: DaySchedule;
};

const ConsultantProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [scheduleEditMode, setScheduleEditMode] = useState(false);

  // Mock profile data
  const [profile, setProfile] = useState({
    name: 'BS. Nguyễn Văn A',
    title: 'Chuyên gia sức khỏe sinh sản',
    email: 'nguyenvana@example.com',
    phone: '(+84) 901-234-567',
    gender: 'Nam',
    birthDate: '1985-04-15',
    specialty: 'Sức khỏe sinh sản',
    experience: 'Hơn 10 năm kinh nghiệm',
    education: 'Bác sĩ chuyên khoa, Đại học Y Hà Nội',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    about: 'BS. Nguyễn Văn A là bác sĩ chuyên khoa được chứng nhận về sức khỏe sinh sản với hơn 10 năm kinh nghiệm. Ông chuyên về chăm sóc sức khỏe tình dục toàn diện, tư vấn về biện pháp tránh thai và phòng chống, điều trị các bệnh lây qua đường tình dục. BS. Nguyễn tiếp cận toàn diện trong chăm sóc bệnh nhân, đảm bảo rằng mỗi cá nhân đều nhận được sự quan tâm đặc biệt và kế hoạch điều trị phù hợp với nhu cầu cụ thể của họ.',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    certificates: [
      { id: 1, name: 'Chứng chỉ chuyên khoa Sức khỏe sinh sản', issuer: 'Bộ Y tế Việt Nam', year: 2015, file: 'cert1.pdf' },
      { id: 2, name: 'Chứng chỉ Sức khỏe sinh sản nâng cao', issuer: 'Hội Y học Việt Nam', year: 2018, file: 'cert2.pdf' }
    ],
    experiences: [
      { id: 1, title: 'Tư vấn viên cao cấp', organization: 'Phòng khám Sức khỏe sinh sản TP.HCM', location: 'TP. Hồ Chí Minh', startDate: '2018-01', endDate: null, description: 'Tư vấn viên chính cho các dịch vụ sức khỏe sinh sản và tình dục' },
      { id: 2, title: 'Bác sĩ chuyên khoa Sức khỏe sinh sản', organization: 'Bệnh viện Trung ương', location: 'Hà Nội', startDate: '2013-03', endDate: '2017-12', description: 'Chuyên về tư vấn biện pháp tránh thai và điều trị các bệnh lây qua đường tình dục' },
      { id: 3, title: 'Nghiên cứu viên', organization: 'Viện Y học sinh sản', location: 'Singapore', startDate: '2011-06', endDate: '2013-02', description: 'Nghiên cứu về giáo dục sức khỏe tình dục và chiến lược phòng ngừa' }
    ],
    schedule: {
      monday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '12:00' }],
      thursday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
      friday: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '17:00' }],
      saturday: [{ start: '09:00', end: '12:00' }],
      sunday: []
    } as ScheduleType
  });

  // Add new state for certificate upload
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

  // Update profile
  const handleProfileUpdate = (updatedProfile: typeof profile) => {
    setProfile(updatedProfile);
    setEditMode(false);
  };

  // Add certificate
  const handleAddCertificate = (certificate: { name: string, issuer: string, year: number, file: string }) => {
    setProfile({
      ...profile,
      certificates: [...profile.certificates, { id: profile.certificates.length + 1, ...certificate }]
    });
    setShowUploadModal(false);
  };

  // Add experience
  const handleAddExperience = (experience: { title: string, organization: string, location: string, startDate: string, endDate: string | null, description: string }) => {
    setProfile({
      ...profile,
      experiences: [...profile.experiences, { id: profile.experiences.length + 1, ...experience }]
    });
    setShowUploadModal(false);
  };

  // Update schedule
  const handleUpdateSchedule = () => {
    setScheduleEditMode(false);
  };

  // Open upload modal for certificate or experience
  const openUploadModal = (type: 'certificate' | 'experience') => {
    setUploadType(type);
    setShowUploadModal(true);
  };
  
  // Handle certificate form change
  const handleCertificateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCertificate({
      ...newCertificate,
      [name]: name === 'year' ? parseInt(value) : value
    });
  };
  
  // Handle experience form change
  const handleExperienceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience({
      ...newExperience,
      [name]: value
    });
  };
  
  // Handle certificate form submit
  const handleCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddCertificate(newCertificate);
    setNewCertificate({
      name: '',
      issuer: '',
      year: new Date().getFullYear(),
      file: ''
    });
  };
  
  // Handle experience form submit
  const handleExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddExperience({
      ...newExperience,
      endDate: newExperience.endDate || null
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

  // Translate day name from English to Vietnamese
  const translateDayName = (day: string): string => {
    const dayTranslations: Record<string, string> = {
      'monday': 'Thứ Hai',
      'tuesday': 'Thứ Ba',
      'wednesday': 'Thứ Tư',
      'thursday': 'Thứ Năm',
      'friday': 'Thứ Sáu',
      'saturday': 'Thứ Bảy',
      'sunday': 'Chủ Nhật'
    };
    return dayTranslations[day] || capitalizeFirstLetter(day);
  };

  // Render the right content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="profile-section">
            {!editMode ? (
              <div className="profile-view">
                <div className="profile-header">
                  <h2>Thông tin cá nhân</h2>
                  <button 
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Chỉnh sửa hồ sơ
                  </button>
                </div>
                
                <div className="info-group">
                  <label>Họ và Tên</label>
                  <p>{profile.name}</p>
                </div>
                
                <div className="info-group">
                  <label>Chức Danh</label>
                  <p>{profile.title}</p>
                </div>
                
                <div className="info-grid">
                  <div className="info-group">
                    <label>Email</label>
                    <p>{profile.email}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Điện Thoại</label>
                    <p>{profile.phone}</p>
                  </div>
                </div>
                
                <div className="info-grid">
                  <div className="info-group">
                    <label>Giới Tính</label>
                    <p>{profile.gender}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Ngày Sinh</label>
                    <p>{new Date(profile.birthDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="info-grid">
                  <div className="info-group">
                    <label>Chuyên Khoa</label>
                    <p>{profile.specialty}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Kinh Nghiệm</label>
                    <p>{profile.experience}</p>
                  </div>
                </div>
                
                <div className="info-group">
                  <label>Học Vấn</label>
                  <p>{profile.education}</p>
                </div>
                
                <div className="info-group">
                  <label>Ngôn Ngữ</label>
                  <p>{profile.languages.join(', ')}</p>
                </div>
                
                <div className="info-group about-section">
                  <label>Giới Thiệu</label>
                  <p>{profile.about}</p>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <div className="profile-header">
                  <h2>Chỉnh Sửa Hồ Sơ</h2>
                </div>
                
                <div className="form-group">
                  <label htmlFor="name">Họ và Tên</label>
                  <input 
                    type="text" 
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="title">Chức Danh</label>
                  <input 
                    type="text" 
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="info-grid">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Điện Thoại</label>
                    <input 
                      type="tel" 
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="info-grid">
                  <div className="form-group">
                    <label htmlFor="gender">Giới Tính</label>
                    <select 
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      required
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="birthDate">Ngày Sinh</label>
                    <input 
                      type="date" 
                      id="birthDate"
                      value={profile.birthDate}
                      onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="info-grid">
                  <div className="form-group">
                    <label htmlFor="specialty">Chuyên Khoa</label>
                    <input 
                      type="text" 
                      id="specialty"
                      value={profile.specialty}
                      onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience">Kinh Nghiệm</label>
                    <input 
                      type="text" 
                      id="experience"
                      value={profile.experience}
                      onChange={(e) => setProfile({...profile, experience: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="education">Học Vấn</label>
                  <input 
                    type="text" 
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="languages">Ngôn Ngữ (phân cách bằng dấu phẩy)</label>
                  <input 
                    type="text" 
                    id="languages"
                    value={profile.languages.join(', ')}
                    onChange={(e) => setProfile({...profile, languages: e.target.value.split(',').map(lang => lang.trim())})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="about">Giới Thiệu</label>
                  <textarea 
                    id="about"
                    rows={5}
                    value={profile.about}
                    onChange={(e) => setProfile({...profile, about: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="avatar">Ảnh Đại Diện</label>
                  <input 
                    type="file" 
                    id="avatar"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        setProfile({...profile, avatar: URL.createObjectURL(e.target.files[0])});
                      }
                    }}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setEditMode(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => handleProfileUpdate(profile)}
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'qualifications':
        return (
          <div className="qualifications-section">
            <div className="section-header">
              <h2>Kinh Nghiệm & Chứng Chỉ</h2>
              <div className="action-buttons">
                <button 
                  className="add-button"
                  onClick={() => openUploadModal('experience')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Thêm Kinh Nghiệm
                </button>
                <button 
                  className="add-button"
                  onClick={() => openUploadModal('certificate')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Thêm Chứng Chỉ
                </button>
              </div>
            </div>
            
            <div className="qualifications-content">
              <div className="experiences-section">
                <h3 className="qualifications-subtitle">Kinh Nghiệm Làm Việc</h3>
                
                {profile.experiences.map(experience => (
                  <div className="experience-card" key={experience.id}>
                    <div className="experience-title">{experience.title}</div>
                    <div className="experience-org">{experience.organization}</div>
                    <div className="experience-period">{formatYearMonth(experience.startDate)} - {experience.endDate ? formatYearMonth(experience.endDate) : 'Hiện tại'}</div>
                    <div className="experience-location">{experience.location}</div>
                    <div className="experience-description">{experience.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="certificates-section">
                <h3 className="qualifications-subtitle">Chứng Chỉ Chuyên Môn</h3>
                
                {profile.certificates.map(certificate => (
                  <div className="certificate-card" key={certificate.id}>
                    <div className="certificate-title">{certificate.name}</div>
                    <div className="certificate-issuer">Cấp bởi: {certificate.issuer}</div>
                    <div className="certificate-year">Năm: {certificate.year}</div>
                    <div className="certificate-actions">
                      {certificate.file && (
                        <button className="view-button">Xem Chứng Chỉ</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="schedule-section">
            <div className="section-header">
              <h2>Lịch Làm Việc</h2>
              <button 
                className="edit-button"
                onClick={() => setScheduleEditMode(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Chỉnh Sửa Lịch
              </button>
            </div>
            
            {!scheduleEditMode ? (
              <div className="schedule-grid">
                {Object.entries(profile.schedule).map(([day, slots]) => (
                  <div key={day} className="day-schedule">
                    <h3>{translateDayName(day)}</h3>
                    {slots.length > 0 ? (
                      <div className="time-slots">
                        {slots.map((slot, index) => (
                          <div key={index} className="time-slot">
                            {slot.start} - {slot.end}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-schedule">Không làm việc</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="schedule-edit">
                {Object.entries(profile.schedule).map(([day, slots]) => (
                  <div key={day} className="day-schedule-edit">
                    <h3>{translateDayName(day)}</h3>
                    <div className="time-slots-edit">
                      {slots.map((slot, index) => (
                        <div key={index} className="time-slot-edit">
                          <div className="time-input-group">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => {
                                const newSchedule = {...profile.schedule};
                                newSchedule[day][index].start = e.target.value;
                                setProfile({...profile, schedule: newSchedule});
                              }}
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => {
                                const newSchedule = {...profile.schedule};
                                newSchedule[day][index].end = e.target.value;
                                setProfile({...profile, schedule: newSchedule});
                              }}
                            />
                          </div>
                          <button 
                            className="remove-time-slot"
                            onClick={() => {
                              const newSchedule = {...profile.schedule};
                              newSchedule[day] = slots.filter((_, i) => i !== index);
                              setProfile({...profile, schedule: newSchedule});
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button 
                        className="add-time-slot"
                        onClick={() => {
                          const newSchedule = {...profile.schedule};
                          newSchedule[day] = [...slots, { start: '09:00', end: '17:00' }];
                          setProfile({...profile, schedule: newSchedule});
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Thêm Khung Giờ
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="form-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setScheduleEditMode(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => {
                      handleUpdateSchedule();
                    }}
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Vui lòng chọn tab để xem thông tin</div>;
    }
  };

  // Helper functions for formatting
  const formatYearMonth = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Render upload modals
  const renderUploadModal = () => {
    if (!showUploadModal) return null;
    
    return (
      <div className="upload-modal-overlay">
        <div className="upload-modal">
          <div className="upload-modal-header">
            <h3>{uploadType === 'certificate' ? 'Thêm Chứng Chỉ' : 'Thêm Kinh Nghiệm'}</h3>
            <button 
              className="close-button"
              onClick={() => setShowUploadModal(false)}
            >
              &times;
            </button>
          </div>
          
          <div className="upload-modal-content">
            {uploadType === 'certificate' ? (
              <form onSubmit={handleCertificateSubmit} className="upload-form">
                <div className="form-group">
                  <label htmlFor="name">Tên Chứng Chỉ</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={newCertificate.name}
                    onChange={handleCertificateFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="issuer">Tổ Chức Cấp</label>
                  <input 
                    type="text" 
                    id="issuer"
                    name="issuer"
                    value={newCertificate.issuer}
                    onChange={handleCertificateFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="year">Năm Cấp</label>
                  <input 
                    type="number" 
                    id="year"
                    name="year"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={newCertificate.year}
                    onChange={handleCertificateFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="file">Tệp Chứng Chỉ</label>
                  <input 
                    type="file" 
                    id="file"
                    name="file"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        setNewCertificate({
                          ...newCertificate,
                          file: URL.createObjectURL(e.target.files[0])
                        });
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <small>Chấp nhận PDF, JPG, PNG</small>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="submit-button"
                  >
                    Thêm Chứng Chỉ
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExperienceSubmit} className="upload-form">
                <div className="form-group">
                  <label htmlFor="title">Chức Danh</label>
                  <input 
                    type="text" 
                    id="title"
                    name="title"
                    value={newExperience.title}
                    onChange={handleExperienceFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="organization">Tổ Chức</label>
                  <input 
                    type="text" 
                    id="organization"
                    name="organization"
                    value={newExperience.organization}
                    onChange={handleExperienceFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Địa Điểm</label>
                  <input 
                    type="text" 
                    id="location"
                    name="location"
                    value={newExperience.location}
                    onChange={handleExperienceFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="startDate">Ngày Bắt Đầu</label>
                  <input 
                    type="month" 
                    id="startDate"
                    name="startDate"
                    value={newExperience.startDate}
                    onChange={handleExperienceFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endDate">Ngày Kết Thúc</label>
                  <input 
                    type="month" 
                    id="endDate"
                    name="endDate"
                    value={newExperience.endDate}
                    onChange={handleExperienceFormChange}
                  />
                  <small>Để trống nếu là vị trí hiện tại</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Mô Tả</label>
                  <textarea 
                    id="description"
                    name="description"
                    rows={3}
                    value={newExperience.description}
                    onChange={handleExperienceFormChange}
                    required
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="submit-button"
                  >
                    Thêm Kinh Nghiệm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="consultant-profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar-section">
          <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
          <div className="profile-basic-info">
            <h1>{profile.name}</h1>
            <p className="profile-title">{profile.title}</p>
          </div>
        </div>
        
        <div className="profile-nav">
          <button 
            className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Hồ Sơ
          </button>
          
          <button 
            className={`profile-nav-item ${activeTab === 'qualifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('qualifications')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm9.3 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Kinh Nghiệm & Chứng Chỉ
          </button>
          
          <button 
            className={`profile-nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Lịch Làm Việc
          </button>
        </div>
      </div>
      
      <div className="profile-content">
        {renderContent()}
      </div>

      {/* Add the upload modal */}
      {renderUploadModal()}
    </div>
  );
};

export default ConsultantProfile; 