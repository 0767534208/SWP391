import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SlotCreation.css';

// Types
interface TimeSlot {
  id: number;
  start: string;
  end: string;
}

interface SlotDay {
  day: string;
  date: string;
  slots: TimeSlot[];
  id?: number; // Optional ID for easier management
}

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  isEndTime?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, isEndTime = false }) => {
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

// Confirmation Dialog component
interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ onConfirm, onCancel, isOpen, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-buttons">
          <button 
            className="confirm-dialog-button confirm"
            onClick={onConfirm}
          >
            Đồng ý
          </button>
          <button 
            className="confirm-dialog-button cancel"
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock data cứng cho slot (tuần 23-29/06/2025)
const mockSlots: SlotDay[] = [
  {
    day: 'monday',
    date: '2025-06-23',
    slots: [
      { id: 1, start: '08:00', end: '09:00' },
      { id: 2, start: '09:30', end: '10:30' }
    ]
  },
  {
    day: 'tuesday',
    date: '2025-06-24',
    slots: [
      { id: 3, start: '13:00', end: '14:00' }
    ]
  },
  {
    day: 'wednesday',
    date: '2025-06-25',
    slots: [
      { id: 4, start: '15:00', end: '16:00' }
    ]
  },
  {
    day: 'thursday',
    date: '2025-06-26',
    slots: [
      { id: 5, start: '10:00', end: '11:00' }
    ]
  },
  {
    day: 'friday',
    date: '2025-06-27',
    slots: [
      { id: 6, start: '14:00', end: '15:00' }
    ]
  }
];

const SlotCreation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get date from query parameters if available
  const getDateFromQueryParams = (): string => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('date') || '';
  };
  
  // Get day of week from date string
  const getDayFromDate = (dateString: string): string => {
    if (!dateString) return '';
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date(dateString).getDay();
    return dayNames[dayIndex];
  };
  
  // State
  const [selectedDate, setSelectedDate] = useState<string>(getDateFromQueryParams());
  const [selectedDay, setSelectedDay] = useState<string>(getDayFromDate(getDateFromQueryParams()));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Working hours constraints
  const minWorkingHour = "08:00";
  const maxWorkingHour = "20:00";

  // Lấy slot mock data từ localStorage
  const getMockSlots = (): SlotDay[] => {
    const saved = localStorage.getItem('managedSlots');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  };

  // getExistingSlotsForDate chỉ lấy từ mockSlots
  const getExistingSlotsForDate = (): TimeSlot[] => {
    const existingSlotDay = mockSlots.find(slot => slot.date === selectedDate);
    return existingSlotDay ? [...existingSlotDay.slots].sort((a, b) => a.start.localeCompare(b.start)) : [];
  };

  // Check for overlap with all slots (new and existing)
  const checkForOverlap = (start: string, end: string): boolean => {
    // Check against new slots being added
    const newSlotsOverlap = timeSlots.some(slot => {
      return (start < slot.end && end > slot.start);
    });
    // Check against existing slots in mock data
    const existingSlotsOverlap = getExistingSlotsForDate().some(slot => {
      return (start < slot.end && end > slot.start);
    });
    return newSlotsOverlap || existingSlotsOverlap;
  };

  // Add time slot
  const addTimeSlot = () => {
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
    if (checkForOverlap(startTime, endTime)) {
      showNotification('error', 'Khoảng thời gian này trùng với một khoảng thời gian khác');
      return;
    }
    const newSlot: TimeSlot = {
      id: Date.now(),
      start: startTime,
      end: endTime
    };
    setTimeSlots([...timeSlots, newSlot]);
    setStartTime('');
    setEndTime('');
    showNotification('success', 'Đã thêm khoảng thời gian thành công');
  };

  // Remove time slot
  const removeTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  // Confirm slot creation
  const confirmCreateSlots = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirmation dialog result
  const handleConfirmCreateSlots = () => {
    setShowConfirmDialog(false);
    createSlots();
    // Navigate back to calendar view after successful creation
    navigate('/manager/slot-calendar?slotCreated=true');
  };

  // Create slots: cập nhật localStorage
  const createSlots = () => {
    if (!selectedDate) {
      showNotification('error', 'Vui lòng chọn ngày');
      return;
    }
    if (timeSlots.length === 0) {
      showNotification('error', 'Vui lòng thêm ít nhất một khoảng thời gian');
      return;
    }
    const allSlots = getMockSlots();
    const existingSlotDayIdx = allSlots.findIndex(slot => slot.date === selectedDate);
    if (existingSlotDayIdx !== -1) {
      // Gộp slot mới vào slot cũ (đã kiểm tra trùng nên không lo trùng)
      allSlots[existingSlotDayIdx].slots = [...allSlots[existingSlotDayIdx].slots, ...timeSlots].sort((a, b) => a.start.localeCompare(b.start));
    } else {
      const newSlotDay: SlotDay = {
        id: Date.now(),
        day: selectedDay,
        date: selectedDate,
        slots: [...timeSlots].sort((a, b) => a.start.localeCompare(b.start))
      };
      allSlots.push(newSlotDay);
    }
    localStorage.setItem('managedSlots', JSON.stringify(allSlots));
    showNotification('success', 'Đã tạo khung giờ làm việc thành công!');
    setSelectedDate('');
    setSelectedDay('');
    setTimeSlots([]);
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

  // Helper function to translate day name to Vietnamese
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

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        {selectedDate && (
          <div className="text-md text-gray-600 mb-4">
            Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
        
        <div className="form-group mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày:</label>
          <div className="date-input-container">
            <input 
              type="date" 
              id="date" 
              className="form-input w-full p-2 border border-gray-300 rounded-md date-input cursor-pointer" 
              value={selectedDate}
              onChange={(e) => {
                const date = e.target.value;
                setSelectedDate(date);
                setSelectedDay(getDayFromDate(date));
              }}
              min={new Date().toISOString().split('T')[0]} // Today or later
              placeholder="dd/mm/yyyy"
              onClick={(e) => {
                // Force the date picker to open when clicking anywhere on the input
                const input = e.target as HTMLInputElement;
                input.showPicker && input.showPicker();
              }}
              required
            />
            <div 
              className="calendar-icon-wrapper"
              onClick={() => {
                const input = document.getElementById('date') as HTMLInputElement;
                if (input) {
                  input.showPicker && input.showPicker();
                  // For browsers that don't support showPicker
                  if (!input.showPicker) {
                    input.focus();
                    input.click();
                  }
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="calendar-icon">
                <rect x="2" y="3" width="12" height="11" rx="1" stroke="white" strokeWidth="2"/>
                <path d="M2 6H14" stroke="white" strokeWidth="2"/>
                <path d="M6 2L6 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 2L10 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          {selectedDay && (
            <div className="text-sm text-gray-500 mt-1">
              Ngày: {translateDayName(selectedDay)}
            </div>
          )}
        </div>

        <div className="time-inputs-container mb-4">
          <div className="flex flex-wrap gap-4">
            <div className="form-group flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu:</label>
              <CustomTimePicker 
                value={startTime} 
                onChange={setStartTime} 
              />
              <div className="text-xs text-gray-500 mt-1">
                Từ {minWorkingHour} đến {maxWorkingHour}
              </div>
            </div>
            
            <div className="form-group flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc:</label>
              <CustomTimePicker 
                value={endTime} 
                onChange={setEndTime} 
                isEndTime={true}
              />
              <div className="text-xs text-gray-500 mt-1">
                Từ {minWorkingHour} đến {maxWorkingHour}
              </div>
            </div>
            
            <div className="form-group flex items-end">
              <button 
                className="add-slot-button px-4 py-2 rounded-md transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={addTimeSlot}
              >
                Thêm khung giờ
              </button>
            </div>
          </div>
        </div>

        {/* Display existing slots for the selected date */}
        {selectedDate && (
          <div className="existing-slots-section mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            {getExistingSlotsForDate().length > 0 ? (
              <>
                <div className="existing-slots-list">
                  {getExistingSlotsForDate().map((slot, index) => (
                    <div key={index} className="existing-slot-item flex justify-between items-center p-2 border border-gray-200 bg-white rounded-md mb-2">
                      <span className="time-range font-medium">
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Lưu ý: Không thể tạo khung giờ trùng với các khung giờ hiện có
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 p-2">
                Chưa có khung giờ nào cho ngày này
              </div>
            )}
          </div>
        )}

        <button 
          className="create-slots-button bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full"
          onClick={confirmCreateSlots}
        >
          Tạo khung giờ làm việc
        </button>
        
        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận tạo khung giờ"
          message={`Bạn có chắc chắn muốn tạo ${timeSlots.length} khung giờ làm việc cho ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}?`}
          onConfirm={handleConfirmCreateSlots}
          onCancel={() => setShowConfirmDialog(false)}
        />
      </div>
    </div>
  );
};

export default SlotCreation; 