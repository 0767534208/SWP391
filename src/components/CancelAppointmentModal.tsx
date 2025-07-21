import React from 'react';
import { FaBan, FaTimesCircle } from 'react-icons/fa';
import { formatDate, formatTime, getStatusText, statusColor } from '../pages/User/Profile';
import type { AppointmentData } from '../utils/api';

interface CancelModalProps {
  appointment: AppointmentData;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const CancelAppointmentModal: React.FC<CancelModalProps> = ({ 
  appointment, 
  onClose, 
  onConfirm, 
  isLoading 
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
          <FaBan size={40} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            Xác nhận hủy cuộc hẹn
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.5 }}>
            Bạn có chắc chắn muốn hủy cuộc hẹn này không? Yêu cầu hủy cuộc hẹn của bạn sẽ được gửi đến quản trị viên để xử lý.
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
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Mã cuộc hẹn:</span> {appointment.appointmentID}</div>
            <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Ngày hẹn:</span> {formatDate(appointment.appointmentDate)}</div>
            {appointment.slot && (
              <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Thời gian:</span> {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}</div>
            )}
            <div><span style={{ fontWeight: 500, color: '#4b5563' }}>Trạng thái:</span> <span style={{ color: statusColor(appointment.status) }}>{getStatusText(appointment.status)}</span></div>
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
            <FaTimesCircle size={14} /> Đóng lại
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              background: isLoading ? '#9ca3af' : '#ef4444',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: isLoading ? 'none' : '0 2px 4px rgba(239, 68, 68, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
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
                <FaBan size={16} /> Xác nhận hủy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
