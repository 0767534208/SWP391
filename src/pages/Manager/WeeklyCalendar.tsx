import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WeeklyCalendar.css';

// Types
interface Consultant {
  name: string;
  specialty: string;
}

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  consultants?: Consultant[];
}

interface SlotDay {
  day: string;
  date: string;
  slots: TimeSlot[];
  id?: number;
}

// Thông tin consultant mock
const mockConsultant = {
  name: 'BS. Lê Văn C',
  specialty: 'Sức khỏe tình dục',
  education: 'Bác sĩ chuyên khoa II, Đại học Y Hà Nội',
  experience: '8 năm kinh nghiệm tư vấn sức khỏe tình dục và sinh sản',
  certificates: [
    {
      name: 'Chứng chỉ Tư vấn Sức khỏe tình dục',
      org: 'Tổ chức Y tế Thế giới (WHO)',
      year: '2017'
    },
    {
      name: 'Chứng nhận đào tạo về Giáo dục giới tính',
      org: 'Bộ Y tế',
      year: '2019'
    }
  ]
};

// CustomTimePicker copy từ SlotCreation
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

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    } else {
      setSelectedHour('');
      setSelectedMinute('');
    }
  }, [value]);

  const hours = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return hour < 10 ? `0${hour}` : `${hour}`;
  });
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));
  const availableMinutes = selectedHour === '20' ? ['00'] : minutes;

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

  const handleTimeSelection = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };
  const handleHourSelection = (hour: string) => {
    if (hour === '20') {
      handleTimeSelection(hour, '00');
    } else {
      setSelectedHour(hour);
      if (selectedMinute) {
        onChange(`${hour}:${selectedMinute}`);
      }
    }
  };
  return (
    <div className="custom-time-picker-container" ref={dropdownRef}>
      <div className="custom-time-input" onClick={() => setIsOpen(!isOpen)}>
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
                  <div key={hour} className={`time-option ${selectedHour === hour ? 'selected' : ''}`} onClick={() => handleHourSelection(hour)}>
                    {hour}
                  </div>
                ))}
              </div>
            </div>
            <div className="minute-column">
              <div className="column-header">Phút</div>
              <div className="time-options">
                {availableMinutes.map(minute => (
                  <div key={minute} className={`time-option ${selectedMinute === minute ? 'selected' : ''}`} onClick={() => handleTimeSelection(selectedHour, minute)}>
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

const WeeklyCalendar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // Initialize with the current week's Monday
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStartDate(currentDate));
  const [createdSlots, setCreatedSlots] = useState<SlotDay[]>([]); // This would come from API in a real app
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // Track selected week
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<null | { slot: TimeSlot; date: string; isFake: boolean }>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Check if we're coming from slot creation with new slots
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slotCreated = params.get('slotCreated');
    
    if (slotCreated === 'true') {
      // Show notification
      setNotification({ 
        show: true, 
        message: 'Khung giờ đã được tạo thành công và cập nhật trên lịch!' 
      });
      
      // Clear the URL parameter to avoid showing the notification on refresh
      navigate('/manager/slot-calendar', { replace: true });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
    }
  }, [location.search, navigate]);
  
  // Load slots from localStorage khi currentWeekStart hoặc selectedYear thay đổi
  useEffect(() => {
    const savedSlots = localStorage.getItem('managedSlots');
    if (savedSlots) {
      try {
        const parsedSlots = JSON.parse(savedSlots);
        if (Array.isArray(parsedSlots)) {
          setCreatedSlots(parsedSlots);
          return;
        }
      } catch (error) {
        console.error('Error parsing saved slots:', error);
      }
    }
    // Nếu không có dữ liệu thì setCreatedSlots([])
    setCreatedSlots([]);
  }, [currentWeekStart, selectedYear]);
  
  // Tự động chèn fake data nếu chưa có dữ liệu
  useEffect(() => {
    const savedSlots = localStorage.getItem('managedSlots');
    if (!savedSlots) {
      const fakeData = [
        {
          id: 1,
          day: 'monday',
          date: '2024-06-10',
          slots: [
            { id: 101, start: '08:00', end: '09:00' },
            { id: 102, start: '09:30', end: '10:30' }
          ]
        },
        {
          id: 2,
          day: 'tuesday',
          date: '2024-06-11',
          slots: [
            { id: 201, start: '13:00', end: '14:00' }
          ]
        },
        {
          id: 3,
          day: 'friday',
          date: '2024-06-14',
          slots: [
            { id: 301, start: '15:00', end: '16:00' }
          ]
        }
      ];
      localStorage.setItem('managedSlots', JSON.stringify(fakeData));
    }
  }, []);
  
  // Initial render - set to current week
  useEffect(() => {
    // Just to make sure we're starting with the current week
    const today = new Date();
    const weekStart = getWeekStartDate(today);
    const weekNum = getWeekNumber(weekStart);
    
    console.log('Current date:', today);
    console.log('Week start date:', weekStart);
    console.log('Week number:', weekNum);
    
    setCurrentWeekStart(weekStart);
    setSelectedWeek(weekNum);
    setIsInitialized(true);
  }, []);
  
  // Update when year changes (but skip the first render)
  useEffect(() => {
    if (!isInitialized) return;
    
    const today = new Date();
    
    // If the selected year is the current year, show the current week
    if (selectedYear === today.getFullYear()) {
      const weekStart = getWeekStartDate(today);
      const weekNum = getWeekNumber(weekStart);
      setCurrentWeekStart(weekStart);
      setSelectedWeek(weekNum);
    } else {
      // Otherwise, show the first week of the selected year
      setCurrentWeekStart(getDateOfWeek(1, selectedYear));
      setSelectedWeek(1);
    }
  }, [selectedYear, isInitialized]);

  // Get the first day (Monday) of the week for a given date
  function getWeekStartDate(date: Date): Date {
    // Create a clone to avoid modifying the original date
    const dateClone = new Date(date.getTime());
    dateClone.setHours(0, 0, 0, 0);
    
    const day = dateClone.getDay();
    // If Sunday (0), go back 6 days to get Monday
    // Otherwise, go back (day - 1) days to get to Monday
    const diff = day === 0 ? 6 : day - 1;
    
    // Create the Monday date
    const monday = new Date(dateClone);
    monday.setDate(dateClone.getDate() - diff);
    
    return monday;
  }

  // Generate array of dates for the current week
  function getWeekDates(startDate: Date): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  // Format date as YYYY-MM-DD
  function formatDateForComparison(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Get week number of the year - aligned with our calendar display
  const getWeekNumber = (date: Date): number => {
    const year = date.getFullYear();
    const dateClone = new Date(date.getTime());
    
    // Normalize the date to midnight to avoid time issues
    dateClone.setHours(0, 0, 0, 0);
    
    // Find the first Monday of the year
    let firstMonday = new Date(year, 0, 1);
    firstMonday.setHours(0, 0, 0, 0);
    
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    
    // If the date is before the first Monday of the year
    if (dateClone < firstMonday) {
      return 1;
    }
    
    // Calculate days between the first Monday and the given date
    const daysDiff = Math.round((dateClone.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000));
    
    // Calculate the week number
    return Math.floor(daysDiff / 7) + 1;
  };

  // Get the start date of a week by week number
  const getDateOfWeek = (weekNumber: number, year: number): Date => {
    // Make sure week number is valid
    const validWeekNumber = Math.max(1, weekNumber);
    
    // Get the first Monday of the year
    let firstMonday = new Date(year, 0, 1);
    firstMonday.setHours(0, 0, 0, 0);
    
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    
    // Calculate target date: first Monday + (weekNumber-1) * 7 days
    const targetDate = new Date(firstMonday);
    targetDate.setDate(firstMonday.getDate() + (validWeekNumber - 1) * 7);
    
    return targetDate;
  };

  // Handle week change
  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const weekNumber = parseInt(e.target.value);
    setSelectedWeek(weekNumber);
    const newStartDate = getDateOfWeek(weekNumber, selectedYear);
    setCurrentWeekStart(newStartDate);
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    
    // Keep the same week number but in the new year
    const currentWeekNumber = getWeekNumber(currentWeekStart);
    const newStartDate = getDateOfWeek(currentWeekNumber, year);
    setCurrentWeekStart(newStartDate);
  };

  // Navigate to slot creation page
  const navigateToSlotCreation = () => {
    if (selectedDate) {
      // Format the date as YYYY-MM-DD for passing as a query parameter
      const formattedDate = formatDateForComparison(selectedDate);
      navigate(`/manager/slot-creation?date=${formattedDate}`);
    } else {
      navigate('/manager/slot-creation');
    }
  };
  
  // Handle day selection
  const handleDaySelect = (date: Date) => {
    // Only allow selecting today or future dates
    if (isSelectable(date)) {
      setSelectedDate(date);
    }
  };

  // Generate years for dropdown (current year +/- 5 years)
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };
  
  // Format date as DD-MM
  const formatShortDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };
  
  // Get all weeks for the selected year, aligned with the calendar display
  const getWeeksForYear = (year: number): { value: number; label: string }[] => {
    const weeks: { value: number; label: string }[] = [];
    
    // First day of year
    const firstDay = new Date(year, 0, 1);
    
    // Find the first Monday of the year or the first day of the year
    let firstMonday = new Date(year, 0, 1);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
    
    // Generate all weeks starting from the first Monday
    let currentDate = new Date(firstMonday);
    let weekNumber = 1;
    
    while (currentDate.getFullYear() === year) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeks.push({
        value: weekNumber,
        label: `${formatShortDate(weekStart)} đến ${formatShortDate(weekEnd)}`
      });
      
      // Move to next Monday
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };
  
  // Update week start date when year changes
  useEffect(() => {
    const currentWeekNumber = getWeekNumber(currentWeekStart);
    // If the week number is greater than the number of weeks in the new year, set to last week
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    const totalWeeks = getWeekNumber(lastDayOfYear);
    
    const weekToUse = currentWeekNumber > totalWeeks ? totalWeeks : currentWeekNumber;
    const newStartDate = getDateOfWeek(weekToUse, selectedYear);
    setCurrentWeekStart(newStartDate);
  }, [selectedYear]);

  // Translate day name to Vietnamese
  const translateDayName = (day: number): string => {
    const translations = [
      'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 
      'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
    ];
    return translations[day];
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Hàm kiểm tra xem tuần hiện tại có phải là tuần 23-27/6/2025 không
  function isSpecialWeek(dates: Date[]): boolean {
    if (dates.length !== 7) return false;
    // Thứ 2 ngày 23/6/2025 đến Thứ 6 ngày 27/6/2025
    const monday = dates[0];
    return (
      monday.getFullYear() === 2025 &&
      monday.getMonth() === 5 && // Tháng 6 (0-based)
      monday.getDate() === 23
    );
  }

  // Fake data cho tuần đặc biệt
  const specialWeekFakeData: SlotDay[] = [
    {
      id: 1,
      day: 'monday',
      date: '2025-06-23',
      slots: [
        {
          id: 101, start: '08:00', end: '09:00',
          consultants: [
            { name: 'BS. Nguyễn Văn A', specialty: 'Tư vấn sức khỏe giới tính' },
            { name: 'BS. Trần Thị B', specialty: 'Tư vấn sức khỏe sinh sản' }
          ]
        },
        {
          id: 102, start: '09:30', end: '10:30',
          consultants: [
            { name: 'BS. Lê Văn C', specialty: 'Tư vấn HIV/AIDS' }
          ]
        }
      ]
    },
    {
      id: 2,
      day: 'tuesday',
      date: '2025-06-24',
      slots: [
        {
          id: 201, start: '13:00', end: '14:00',
          consultants: [
            { name: 'BS. Nguyễn Văn D', specialty: 'Tư vấn phòng tránh thai' }
          ]
        }
      ]
    },
    {
      id: 3,
      day: 'wednesday',
      date: '2025-06-25',
      slots: [
        {
          id: 301, start: '15:00', end: '16:00',
          consultants: [
            { name: 'BS. Phạm Thị E', specialty: 'Tư vấn sức khỏe tình dục vị thành niên' }
          ]
        }
      ]
    },
    {
      id: 4,
      day: 'thursday',
      date: '2025-06-26',
      slots: [
        {
          id: 401, start: '10:00', end: '11:00',
          consultants: [
            { name: 'BS. Hoàng Văn F', specialty: 'Tư vấn các bệnh lây truyền qua đường tình dục (STI)' }
          ]
        }
      ]
    },
    {
      id: 5,
      day: 'friday',
      date: '2025-06-27',
      slots: [
        {
          id: 501, start: '14:00', end: '15:00',
          consultants: [
            { name: 'BS. Nguyễn Thị G', specialty: 'Tư vấn tâm lý giới tính' }
          ]
        }
      ]
    }
  ];

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const weekDates = getWeekDates(currentWeekStart);
    if (isSpecialWeek(weekDates)) {
      // Nếu là tuần đặc biệt, trả về fake data cứng
      const dateString = formatDateForComparison(date);
      const slotDay = specialWeekFakeData.find(slot => slot.date === dateString);
      return slotDay ? slotDay.slots : [];
    }
    // Ngược lại, lấy từ localStorage
    const dateString = formatDateForComparison(date);
    const slotDay = createdSlots.find(slot => slot.date === dateString);
    return slotDay ? slotDay.slots : [];
  };

  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is selectable (today or future)
  const isSelectable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for proper comparison
    date.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Generate the weekly calendar
  const weekDates = getWeekDates(currentWeekStart);

  // Khi click vào slot
  const handleSlotClick = (slot: any, date: string, isFake: boolean) => {
    setSelectedSlot({ slot, date, isFake });
    setEditStart(slot.start);
    setEditEnd(slot.end);
    setModalOpen(true);
    setModalError(null);
  };

  // Validate overlap slot trong ngày (trừ chính slot đang chỉnh)
  function checkSlotOverlap(slots: TimeSlot[], start: string, end: string, editingId: number) {
    return slots.some(slot => slot.id !== editingId && start < slot.end && end > slot.start);
  }

  // Lưu thay đổi thời gian slot
  const handleSaveSlot = () => {
    if (!selectedSlot) return;
    let error = '';
    if (editStart >= editEnd) error = 'Thời gian kết thúc phải sau thời gian bắt đầu!';
    const slotsInDay = getSlotsForDate(new Date(selectedSlot.date));
    if (checkSlotOverlap(slotsInDay, editStart, editEnd, selectedSlot.slot.id)) error = 'Khoảng thời gian này trùng với một khung giờ khác!';
    if (editStart < '08:00' || editEnd > '20:00') error = 'Chỉ được chọn từ 08:00 đến 20:00!';
    if (editStart === '' || editEnd === '') error = 'Vui lòng chọn đầy đủ thời gian!';
    if (error) { setModalError(error); return; }
    if (selectedSlot.isFake) {
      // Cập nhật fake data trong biến tạm thời
      const weekDates = getWeekDates(currentWeekStart);
      if (isSpecialWeek(weekDates)) {
        const idx = specialWeekFakeData.findIndex(s => s.date === selectedSlot.date);
        if (idx !== -1) {
          const slotIdx = specialWeekFakeData[idx].slots.findIndex(s => s.id === selectedSlot.slot.id);
          if (slotIdx !== -1) {
            specialWeekFakeData[idx].slots[slotIdx].start = editStart;
            specialWeekFakeData[idx].slots[slotIdx].end = editEnd;
          }
        }
      }
      // Clone sâu để trigger re-render
      const deepClone = JSON.parse(JSON.stringify(specialWeekFakeData));
      setCreatedSlots(deepClone);
      setModalOpen(false);
      return;
    }
    // Tuần thường: cập nhật localStorage
    const allSlots = localStorage.getItem('managedSlots');
    if (!allSlots) return setModalOpen(false);
    let arr = JSON.parse(allSlots);
    const dayIdx = arr.findIndex((d: any) => d.date === selectedSlot.date);
    if (dayIdx !== -1) {
      const slotIdx = arr[dayIdx].slots.findIndex((s: any) => s.id === selectedSlot.slot.id);
      if (slotIdx !== -1) {
        arr[dayIdx].slots[slotIdx].start = editStart;
        arr[dayIdx].slots[slotIdx].end = editEnd;
        localStorage.setItem('managedSlots', JSON.stringify(arr));
      }
    }
    // Luôn đọc lại từ localStorage mới nhất
    const updated = localStorage.getItem('managedSlots');
    setCreatedSlots(updated ? JSON.parse(updated) : []);
    setModalOpen(false);
  };

  return (
    <div className="weekly-calendar-container">
      {/* Notification for successful slot creation */}
      {notification.show && (
        <div className="success-notification">
          <div className="notification-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}
      
      {/* Modal chi tiết slot */}
      {modalOpen && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setModalOpen(false)} title="Đóng">
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 className="modal-title">Chỉnh sửa khung giờ</h2>
            <div className="modal-section">
              <strong>Thời gian khung giờ:</strong>
              <div className="modal-time-edit">
                <CustomTimePicker value={editStart} onChange={setEditStart} />
                <span style={{ margin: '0 8px' }}>-</span>
                <CustomTimePicker value={editEnd} onChange={setEditEnd} isEndTime />
              </div>
              {modalError && <div style={{color:'#e11d48',marginTop:4,fontSize:13}}>{modalError}</div>}
            </div>
            <div className="modal-section">
              <strong>Danh sách consultant đã đăng ký:</strong>
              {selectedSlot.slot.consultants && selectedSlot.slot.consultants.length > 0 ? (
                <ul style={{marginTop:8}}>
                  {selectedSlot.slot.consultants.map((c: any, idx: number) => (
                    <li key={idx} style={{marginBottom:6}}>
                      <span style={{fontWeight:600}}>{c.name}</span> <span style={{color:'#6366f1'}}>- {c.specialty}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{color:'#64748b',marginTop:8}}>Chưa có ai đăng ký</div>
              )}
            </div>
            <button className="modal-save" onClick={handleSaveSlot}>Lưu thay đổi</button>
          </div>
        </div>
      )}

      <div className="calendar-header">
        <h1 className="text-2xl font-bold text-gray-800">Lịch khung giờ làm việc</h1>
        
                  <div className="calendar-controls">
            <div className="selectors-container">
              <div className="week-selector">
                <label htmlFor="week-select">Tuần:</label>
                <select 
                  id="week-select"
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  className="week-select"
                >
                  {getWeeksForYear(selectedYear).map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="year-selector">
                <label htmlFor="year-select">Năm:</label>
                <select 
                  id="year-select"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="year-select"
                >
                  {getYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className={`create-slot-button ${!selectedDate ? 'disabled' : ''}`}
              onClick={navigateToSlotCreation}
              disabled={!selectedDate}
              title={!selectedDate ? "Vui lòng chọn một ngày" : "Tạo khung giờ cho ngày đã chọn"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tạo khung giờ
            </button>
          </div>
      </div>

      <div className="weekly-calendar">
        <div className="calendar-grid">
          {weekDates.map((date, index) => {
            // Check if this date is selected
            const isSelected = selectedDate && 
                              date.getDate() === selectedDate.getDate() && 
                              date.getMonth() === selectedDate.getMonth() && 
                              date.getFullYear() === selectedDate.getFullYear();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isSelectable(date) ? 'past-date' : 'selectable'}`}
                onClick={() => handleDaySelect(date)}
              >
                <div className="day-header">
                  <div className="day-name">{translateDayName(date.getDay())}</div>
                  <div className="day-date">{formatDate(date)}</div>
                </div>
                
                <div className="day-slots">
                  {getSlotsForDate(date).length > 0 ? (
                    getSlotsForDate(date).map((slot) => (
                      <div key={slot.id} className="time-slot" onClick={() => handleSlotClick(slot, formatDateForComparison(date), isSpecialWeek(weekDates))}>
                        <span className="slot-time">{slot.start} - {slot.end}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-slots">Không có khung giờ</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar; 