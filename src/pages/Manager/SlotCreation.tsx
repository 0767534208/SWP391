import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SlotCreation.css';
import api from '../../utils/api';
import type { SlotCreationRequest } from '../../types';

// CustomTimePicker component
interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  isEndTime?: boolean;
  minTime?: string;
  maxTime?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, isEndTime = false, minTime, maxTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '');
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Update internal state when value changes externally
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    } else {
      // Reset when value is cleared
      setSelectedHour('');
      setSelectedMinute('');
    }
  }, [value]);

  // Generate available hours (8-20)
  const hours = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return hour < 10 ? `0${hour}` : `${hour}`;
  });

  // Generate available minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => {
    return i < 10 ? `0${i}` : `${i}`;
  });

  // Get available minutes based on selected hour
  const availableMinutes = selectedHour === '20' ? ['00'] : minutes;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle time selection
  const handleTimeSelection = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    // Make sure to call onChange with the new time value
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };

  // Handle hour selection
  const handleHourSelection = (hour: string) => {
    // If selecting hour 20, force minute to 00
    if (hour === '20') {
      handleTimeSelection(hour, '00');
    } else {
      setSelectedHour(hour);
      // If minute is already selected, update the full time
      if (selectedMinute) {
        onChange(`${hour}:${selectedMinute}`);
      }
    }
  };

  return (
    <div className="custom-time-picker-container" ref={dropdownRef}>
      <div 
        className="custom-time-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-grow">{selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : 'Chọn thời gian'}</span>
        <div className="clock-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="time-dropdown">
          <div className="time-columns">
            <div className="hour-column">
              <div className="column-header">Giờ</div>
              <div className="time-options">
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    className={`time-option ${selectedHour === hour ? 'selected' : ''}`}
                    onClick={() => handleHourSelection(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="minute-column">
              <div className="column-header">Phút</div>
              <div className="time-options">
                {availableMinutes.map(minute => (
                  <div 
                    key={minute} 
                    className={`time-option ${selectedMinute === minute ? 'selected' : ''}`}
                    onClick={() => handleTimeSelection(selectedHour, minute)}
                  >
                    {minute}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Notification component
interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const [isHiding, setIsHiding] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`notification ${type} ${isHiding ? 'hiding' : ''}`}>
      <div className="notification-icon">
        {type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="notification-content">
        {message}
      </div>
    </div>
  );
};

interface NotificationItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const SlotCreation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get date from query parameters if available
  const getDateFromQueryParams = (): string => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('date') || '';
  };

  // State
  const [selectedDate, setSelectedDate] = useState<string>(getDateFromQueryParams());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clinicId, setClinicId] = useState<number>(1); // Default clinic ID
  const [maxConsultant, setMaxConsultant] = useState<number>(5); // Default max consultant
  const [maxTestAppointment, setMaxTestAppointment] = useState<number>(5); // Default max test appointments

  // Working hours state
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [workingHourId, setWorkingHourId] = useState<number | null>(null);

  // Fetch working hours on mount
  useEffect(() => {
    api.get('/api/WorkingHour/GetWorkingHour').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setWorkingHours(res.data);
        setWorkingHourId(res.data[0].workingHourID);
      }
    });
  }, []);

  // Get selected working hour object
  const selectedWorkingHour = workingHours.find(wh => wh.workingHourID === workingHourId);
  const minWorkingHour = selectedWorkingHour ? selectedWorkingHour.openingTime.slice(0,5) : '07:00';
  const maxWorkingHour = selectedWorkingHour ? selectedWorkingHour.closingTime.slice(0,5) : '19:00';

  // Format date and time for API
  const formatDateTimeForApi = (date: string, time: string): string => {
    const [hours, minutes] = time.split(':');
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    // Format as 'YYYY-MM-DDTHH:mm:ss' (local time, no Z)
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;
  };

  // Create slot using API
  const createSlot = async () => {
    if (!selectedDate) {
      showNotification('error', 'Vui lòng chọn ngày');
      return;
    }
    if (!startTime || !endTime) {
      showNotification('error', 'Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    if (startTime >= endTime) {
      showNotification('error', 'Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    if (startTime < minWorkingHour || endTime > maxWorkingHour) {
      showNotification('error', `Thời gian phải trong khung giờ làm việc (${minWorkingHour} - ${maxWorkingHour})`);
      return;
    }
    if (!workingHourId) {
      showNotification('error', 'Vui lòng chọn giờ làm việc');
      return;
    }
    setIsLoading(true);
    try {
      const startDateTime = formatDateTimeForApi(selectedDate, startTime);
      const endDateTime = formatDateTimeForApi(selectedDate, endTime);
      const response = await api.post('/api/slot', {
        clinicID: clinicId,
        workingHourID: workingHourId,
        maxConsultant: maxConsultant,
        maxTestAppointment: maxTestAppointment,
        startTime: startDateTime,
        endTime: endDateTime
      });
      if (response.statusCode === 201) {
        showNotification('success', 'Đã tạo khung giờ làm việc thành công!');
        setStartTime('');
        setEndTime('');
        setTimeout(() => {
          navigate('/manager/slot-calendar?slotCreated=true');
        }, 1500);
      } else {
        showNotification('error', `Lỗi: ${response.message || 'Không thể tạo khung giờ làm việc'}`);
      }
    } catch (error) {
      let errorMessage = 'Đã xảy ra lỗi khi tạo khung giờ làm việc';
      if (error instanceof Error) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      if (errorMessage.includes('overlap') || errorMessage.includes('trùng lặp')) {
        errorMessage = 'Khung giờ này bị trùng lặp với khung giờ đã tồn tại';
      } else if (errorMessage.includes('invalid time') || errorMessage.includes('thời gian không hợp lệ')) {
        errorMessage = 'Thời gian không hợp lệ';
      }
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  // Remove notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="slot-creation-container">
      {/* Notifications container */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-800">Tạo khung giờ làm việc</h1>
      </div>
      <div className="slot-creation-form bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Tạo khung giờ mới</h2>
        {/* Date Selection */}
        <div className="form-group mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày:</label>
          <div className="date-input-container">
            <input
              type="date"
              id="date"
              className="form-input w-full p-2 border border-gray-300 rounded-md date-input cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              placeholder="dd/mm/yyyy"
              required
            />
          </div>
        </div>
        {/* Time Selection */}
        <div className="time-inputs-container mb-4">
          <div className="flex flex-wrap gap-4">
            <div className="form-group flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu:</label>
              {selectedWorkingHour ? (
                <>
                  <CustomTimePicker
                    value={startTime}
                    onChange={setStartTime}
                    minTime={minWorkingHour}
                    maxTime={maxWorkingHour}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Từ {minWorkingHour} đến {maxWorkingHour}
                  </div>
                </>
              ) : (
                <div className="text-red-500">Vui lòng chọn giờ làm việc trước</div>
              )}
            </div>
            <div className="form-group flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc:</label>
              {selectedWorkingHour ? (
                <>
                  <CustomTimePicker
                    value={endTime}
                    onChange={setEndTime}
                    isEndTime={true}
                    minTime={minWorkingHour}
                    maxTime={maxWorkingHour}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Từ {minWorkingHour} đến {maxWorkingHour}
                  </div>
                </>
              ) : (
                <div className="text-red-500">Vui lòng chọn giờ làm việc trước</div>
              )}
            </div>
          </div>
        </div>
        {/* Clinic and Working Hour Settings */}
        <div className="form-group mb-4">
          <label htmlFor="clinicId" className="block text-sm font-medium text-gray-700 mb-1">Phòng khám:</label>
          <input
            type="number"
            id="clinicId"
            className="form-input w-full p-2 border border-gray-300 rounded-md"
            value={clinicId}
            onChange={(e) => setClinicId(parseInt(e.target.value))}
            min={1}
            required
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="workingHourId" className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc:</label>
          {workingHours.length > 0 ? (
            <select
              id="workingHourId"
              className="form-input w-full p-2 border border-gray-300 rounded-md"
              value={workingHourId ?? ''}
              onChange={e => setWorkingHourId(Number(e.target.value))}
              required
            >
              {workingHours.map(wh => (
                <option key={wh.workingHourID} value={wh.workingHourID}>
                  {wh.name ? wh.name + ' - ' : ''}{wh.openingTime.slice(0,5)} - {wh.closingTime.slice(0,5)}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-red-500">Không có giờ làm việc nào, vui lòng tạo trước!</div>
          )}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="maxConsultant" className="block text-sm font-medium text-gray-700 mb-1">Số lượng tư vấn viên tối đa:</label>
          <input
            type="number"
            id="maxConsultant"
            className="form-input w-full p-2 border border-gray-300 rounded-md"
            value={maxConsultant}
            onChange={(e) => setMaxConsultant(parseInt(e.target.value))}
            min={1}
            required
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="maxTestAppointment" className="block text-sm font-medium text-gray-700 mb-1">Số lượng cuộc hẹn xét nghiệm tối đa:</label>
          <input
            type="number"
            id="maxTestAppointment"
            className="form-input w-full p-2 border border-gray-300 rounded-md"
            value={maxTestAppointment}
            onChange={(e) => setMaxTestAppointment(parseInt(e.target.value))}
            min={1}
            required
          />
        </div>
        {/* Create button */}
        <button
          className={`create-slots-button text-white px-4 py-2 rounded-md transition-colors w-full ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          onClick={createSlot}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Tạo khung giờ làm việc'
          )}
        </button>
      </div>
    </div>
  );
};

export default SlotCreation; 