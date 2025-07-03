import React from 'react';
import './AdvisorModal.css';

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  year: number;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface Consultant {
  id: number;
  name: string;
  specialty: string;
  image?: string;
  education: string;
  experience: string;
  certificates: Certificate[];
  schedule: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
}

interface AdvisorModalProps {
  consultant: Consultant | null;
  isOpen?: boolean;
  onClose: () => void;
  servicePrice?: string;
}

const AdvisorModal: React.FC<AdvisorModalProps> = ({ consultant, isOpen = true, onClose, servicePrice }) => {
  if (!isOpen || !consultant) return null;

  // Close modal when clicking outside of content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Translate day name to Vietnamese
  const translateDayName = (day: string): string => {
    const translations: { [key: string]: string } = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật'
    };
    return translations[day] || day;
  };

  return (
    <div className="advisor-modal-backdrop" onClick={handleBackdropClick}>
      <div className="advisor-modal-content">
        <button className="advisor-modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="advisor-modal-header">
          <h2>{consultant.name}</h2>
          <p className="advisor-specialty">{consultant.specialty}</p>
        </div>
        
        <div className="advisor-modal-body">
          <div className="advisor-detail-section">
            <h3>Học vấn</h3>
            <p>{consultant.education}</p>
          </div>
          
          <div className="advisor-detail-section">
            <h3>Kinh nghiệm</h3>
            <p>{consultant.experience}</p>
          </div>
          
          <div className="advisor-detail-section">
            <h3>Chứng chỉ</h3>
            <ul className="advisor-certificates-list">
              {consultant.certificates.map(cert => (
                <li key={cert.id}>
                  <div className="certificate-name">{cert.name}</div>
                  <div className="certificate-info">{cert.issuer} ({cert.year})</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdvisorModal; 