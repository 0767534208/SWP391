import React, { useState, useRef, useEffect } from 'react';
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

const SlotCreation = () => {
  // State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [createdSlots, setCreatedSlots] = useState<SlotDay[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Working hours constraints
  const minWorkingHour = "08:00";
  const maxWorkingHour = "20:00";

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Calculate day of week
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date(date).getDay();
    setSelectedDay(dayNames[dayIndex]);
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

  // Add time slot
  const addTimeSlot = () => {
    if (!startTime || !endTime) {
      showNotification('error', 'Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    // Validate time - compare as strings to avoid issues with time comparison
    if (startTime >= endTime) {
      showNotification('error', 'Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    // Validate working hours
    if (startTime < minWorkingHour || endTime > maxWorkingHour) {
      showNotification('error', `Thời gian phải trong khung giờ làm việc (${minWorkingHour} - ${maxWorkingHour})`);
      return;
    }

    // Check for overlaps
    const hasOverlap = timeSlots.some(slot => {
      return (startTime < slot.end && endTime > slot.start);
    });

    if (hasOverlap) {
      showNotification('error', 'Khoảng thời gian này trùng với một khoảng thời gian khác');
      return;
    }

    const newSlot: TimeSlot = {
      id: Date.now(),
      start: startTime,
      end: endTime
    };

    setTimeSlots([...timeSlots, newSlot]);
    
    // Clear time inputs after adding a slot
    setStartTime('');
    setEndTime('');
    
    // Show success message
    showNotification('success', 'Đã thêm khoảng thời gian thành công');
  };

  // Remove time slot
  const removeTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  // We've removed the editing functionality
  
  // Delete a specific time slot
  const deleteTimeSlotFromDay = (slotDayId: number, slotId: number) => {
    setCreatedSlots(prevSlots => 
      prevSlots.map(day => {
        if (day.id === slotDayId) {
          const updatedSlots = day.slots.filter(slot => slot.id !== slotId);
          return { ...day, slots: updatedSlots };
        }
        return day;
      }).filter(day => day.slots.length > 0) // Remove days with no slots
    );
    
    showNotification('success', 'Đã xóa khung giờ');
  };

    // Create slots
  const createSlots = () => {
    if (!selectedDate) {
      showNotification('error', 'Vui lòng chọn ngày');
      return;
    }

    if (timeSlots.length === 0) {
      showNotification('error', 'Vui lòng thêm ít nhất một khoảng thời gian');
      return;
    }

    // Check if slots already exist for this date
    const existingSlotDay = createdSlots.find(slot => slot.date === selectedDate);
    
    if (existingSlotDay) {
      // Update existing slots
      setCreatedSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.date === selectedDate 
            ? { 
                ...slot, 
                // Combine and sort slots by start time
                slots: [...slot.slots, ...timeSlots].sort((a, b) => 
                  a.start.localeCompare(b.start)
                ) 
              } 
            : slot
        )
      );
    } else {
      // Add new slots (already sorted by time)
      const newSlotDay: SlotDay = {
        id: Date.now(),
        day: selectedDay,
        date: selectedDate,
        slots: [...timeSlots].sort((a, b) => a.start.localeCompare(b.start))
      };
      
      setCreatedSlots([...createdSlots, newSlotDay]);
    }
    
    showNotification('success', 'Đã tạo khung giờ làm việc thành công!');
    
    // Reset form
    setSelectedDate('');
    setSelectedDay('');
    setTimeSlots([]);
  };

  // Delete created slot day
  const deleteSlotDay = (slotDayId: number) => {
    setCreatedSlots(createdSlots.filter(slot => slot.id !== slotDayId));
    showNotification('success', 'Đã xóa ngày làm việc');
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
        
        <div className="form-group mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày:</label>
          <div className="date-input-container">
            <input 
              type="date" 
              id="date" 
              className="form-input w-full p-2 border border-gray-300 rounded-md date-input cursor-pointer" 
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              placeholder="dd/mm/yyyy"
              onClick={(e) => {
                // Force the date picker to open when clicking anywhere on the input
                const input = e.target as HTMLInputElement;
                input.showPicker && input.showPicker();
              }}
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

        {/* Time slots list */}
        {timeSlots.length > 0 && (
          <div className="time-slots-preview mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Danh sách khung giờ:</h3>
            <div className="time-slots-list">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="time-slot-item flex justify-between items-center p-2 border border-gray-200 rounded-md mb-2">
                  <span className="time-range font-medium">
                    {slot.start} - {slot.end}
                  </span>
                  <button 
                    className="remove-slot-button text-red-500 hover:text-red-700"
                    onClick={() => removeTimeSlot(slot.id)}
                  >
                    <span className="text-lg font-medium">×</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          className="create-slots-button bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full"
          onClick={createSlots}
        >
          Tạo khung giờ làm việc
        </button>
      </div>

      {/* Created slots list */}
      {createdSlots.length > 0 && (
        <div className="created-slots bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Khung giờ đã tạo</h2>
          
          <div className="created-slots-list">
            {createdSlots.map((slotDay) => (
              <div key={slotDay.date} className="slot-day-item border border-gray-200 rounded-md p-4 mb-4">
                <div className="slot-day-header flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {translateDayName(slotDay.day)} - {formatDate(slotDay.date)}
                    </h3>
                    <p className="text-sm text-gray-500">{slotDay.slots.length} khung giờ</p>
                  </div>
                  <button 
                    className="delete-slot-day text-red-500 hover:text-red-700 text-xl font-bold"
                    onClick={() => deleteSlotDay(slotDay.id || Date.now())}
                  >
                    ×
                  </button>
                </div>
                
                <div className="slot-day-slots grid grid-cols-2 md:grid-cols-3 gap-2">
                  {slotDay.slots.map((slot) => (
                    <div key={slot.id} className="slot-time bg-indigo-50 p-2 rounded-md">
                      <div className="text-center font-medium">{slot.start} - {slot.end}</div>
                      <div className="flex justify-end mt-2">
                        <button 
                          className="delete-button text-red-600 hover:text-red-800 p-1"
                          onClick={() => deleteTimeSlotFromDay(slotDay.id || Date.now(), slot.id)}
                          title="Xóa khung giờ"
                        >
                          <span className="text-lg font-medium">×</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotCreation; 