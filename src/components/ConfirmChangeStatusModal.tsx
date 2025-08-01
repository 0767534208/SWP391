import React from 'react';
import { FaClock, FaTimes } from 'react-icons/fa';
import { formatDate, getStatusText, statusColor } from '../pages/User/Profile';
import type { AppointmentData } from '../utils/api';

interface ConfirmChangeStatusModalProps {
  appointment: AppointmentData;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  icon?: React.ReactNode;
  confirmButtonColor?: string;
}

const ConfirmChangeStatusModal: React.FC<ConfirmChangeStatusModalProps> = ({ 
  appointment, 
  onClose, 
  onConfirm, 
  isLoading,
  title,
  message,
  confirmButtonText,
  icon = <FaClock size={40} color="#3b82f6" />,
  confirmButtonColor = '#3b82f6'
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {icon}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            {title}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          backgroundColor: '#f9fafb', 
          borderRadius: 8,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#4b5563', fontSize: 15 }}>
            Thông tin cuộc hẹn:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Mã cuộc hẹn:</span>
              <span style={{ fontWeight: 500, color: '#374151' }}>{appointment.appointmentCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Ngày:</span>
              <span style={{ fontWeight: 500, color: '#374151' }}>{appointment.appointmentDate ? formatDate(appointment.appointmentDate) : 'Chưa xác định'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Giờ:</span>
              <span style={{ fontWeight: 500, color: '#374151' }}>{appointment.slot ? `${appointment.slot.startTime} - ${appointment.slot.endTime}` : 'Chưa xác định'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Trạng thái hiện tại:</span>
              <span style={{ 
                fontWeight: 500, 
                color: statusColor(appointment.status), 
                backgroundColor: `${statusColor(appointment.status)}15`,
                padding: '2px 8px',
                borderRadius: 4
              }}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: '#ffffff',
              color: '#374151',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <FaTimes size={14} /> Đóng lại
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              background: isLoading ? '#9ca3af' : confirmButtonColor,
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: isLoading ? 'none' : `0 2px 4px ${confirmButtonColor}40`
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = confirmButtonColor === '#3b82f6' ? '#2563eb' : confirmButtonColor + 'dd';
                e.currentTarget.style.boxShadow = `0 4px 6px ${confirmButtonColor}60`;
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = confirmButtonColor;
                e.currentTarget.style.boxShadow = `0 2px 4px ${confirmButtonColor}40`;
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Đang xử lý...
              </>
            ) : (
              <>
                {confirmButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmChangeStatusModal;
