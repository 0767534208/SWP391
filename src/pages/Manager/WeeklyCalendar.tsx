import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WeeklyCalendar.css';
import { slotAPI, workingHourAPI, consultantSlotAPI } from '../../utils/api';

// Custom Date Display component
interface CustomDateDisplayProps {
  date: Date;
}

const CustomDateDisplay: React.FC<CustomDateDisplayProps> = ({ date }) => {
  // Format date as DD/MM without timezone issues
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  
  return <span className="custom-date-display">{formattedDate}</span>;
};

// Types
interface Consultant {
  name: string;
  specialty: string;
  consultantID?: string;
}

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  consultants?: Consultant[];
  slotID?: string; // API ID
  maxConsultant?: number;
  maxTestAppointment?: number;
  workingHourID?: number; // Always number
}

interface SlotDay {
  day: string;
  date: string;
  slots: TimeSlot[];
  id?: number;
}


// CustomTimePicker copy từ SlotCreation
interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  isEndTime?: boolean;
  minTime?: string; // Added minTime prop
  maxTime?: string; // Added maxTime prop
}
const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, isEndTime = false, minTime, maxTime }) => {
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

  const hours = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 7;
    return hour < 10 ? `0${hour}` : `${hour}`;
  });
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));
  const availableMinutes = selectedHour === '17' ? ['00'] : minutes;

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
    if (hour === '17') {
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
  const [createdSlots, setCreatedSlots] = useState<SlotDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // Track selected week
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<null | { slot: TimeSlot; date: string; isFake: boolean }>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slotConsultants, setSlotConsultants] = useState<{ [slotId: string]: Consultant[] }>({});
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [editMaxConsultant, setEditMaxConsultant] = useState<number>(0);
  const [editMaxTestAppointment, setEditMaxTestAppointment] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string>(''); // 'update' or 'create'
  
  // Working Hour management states
  const [isWorkingHourModalOpen, setIsWorkingHourModalOpen] = useState<boolean>(false);
  const [isCreateWorkingHour, setIsCreateWorkingHour] = useState<boolean>(true);
  const [selectedWorkingHour, setSelectedWorkingHour] = useState<any>(null);
  const [workingHourForm, setWorkingHourForm] = useState({
    clinicID: 1,
    dayInWeek: 0, // 0 = Sunday, 1 = Monday, etc.
    shift: 0, // 0 = Morning, 1 = Afternoon
    openingTime: '',
    closingTime: '',
    status: true
  });

  useEffect(() => {
    // Fetch working hours using workingHourAPI
    const fetchWorkingHours = async () => {
      try {
        const response = await workingHourAPI.getAllWorkingHours();
        if (response.statusCode === 200 && Array.isArray(response.data)) {
          setWorkingHours(response.data);
        }
      } catch (error) {
        console.error('Error fetching working hours:', error);
      }
    };
    
    fetchWorkingHours();
  }, []);

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

  // Fetch slots from API when week changes
  useEffect(() => {
    fetchSlots();
  }, [currentWeekStart, selectedYear]);

  // Fetch all slots from API
  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      // Get the start and end dates of the current week
      const weekDates = getWeekDates(currentWeekStart);
      const startDate = formatDateForComparison(weekDates[0]);
      const endDate = formatDateForComparison(weekDates[6]);

      // Fetch slots using slotAPI
      const response = await slotAPI.getAllSlots();

      if (response.statusCode === 200 && response.data) {
        // Process the API response into our SlotDay format
        const processedSlots: SlotDay[] = [];

        // Group slots by date
        const slotsByDate: { [date: string]: TimeSlot[] } = {};

        response.data.forEach((slot: any) => {
          // Extract date from the slot's startTime
          const slotDate = new Date(slot.startTime);
          const dateString = formatDateForComparison(slotDate);

          // Extract time from the slot's startTime and endTime
          const startTime = new Date(slot.startTime).toTimeString().substring(0, 5);
          const endTime = new Date(slot.endTime).toTimeString().substring(0, 5);

          // Create TimeSlot object
          const timeSlot: TimeSlot = {
            id: slot.slotID,
            slotID: slot.slotID.toString(),
            start: startTime,
            end: endTime,
            maxConsultant: slot.maxConsultant,
            maxTestAppointment: slot.maxTestAppointment,
            consultants: [], // Will be populated later
            workingHourID: typeof slot.workingHourID === 'string' ? parseInt(slot.workingHourID) : slot.workingHourID // Ensure number
          };

          // Add to slotsByDate
          if (!slotsByDate[dateString]) {
            slotsByDate[dateString] = [];
          }
          slotsByDate[dateString].push(timeSlot);
        });

        // Create SlotDay objects from slotsByDate
        for (const [dateString, slots] of Object.entries(slotsByDate)) {
          const date = new Date(dateString);
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const day = dayNames[date.getDay()];

          processedSlots.push({
            day,
            date: dateString,
            slots: slots.sort((a, b) => a.start.localeCompare(b.start))
          });
        }

        setCreatedSlots(processedSlots);

        // Fetch consultants for each slot
        fetchConsultantsForSlots();
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch consultants for each slot
  const fetchConsultantsForSlots = async () => {
    try {
      // Get all consultants and their slots
      const response = await consultantSlotAPI.getAllConsultants();

      console.log("Consultant API response:", response.data);

      if (response.data) {
        const consultantsBySlot: { [slotId: string]: Consultant[] } = {};

        // Process the response data
        response.data.forEach((item: any) => {
          if (!item.slotID) return;

          const slotId = item.slotID.toString();

          if (!consultantsBySlot[slotId]) {
            consultantsBySlot[slotId] = [];
          }

          // Add consultant to the slot if it exists
          if (item.consultant) {
            consultantsBySlot[slotId].push({
              consultantID: item.consultantID,
              name: item.consultant.name || 'Consultant',
              specialty: item.consultant.specialization || ''
            });
          }
        });

        console.log("Processed consultant data:", consultantsBySlot);
        setSlotConsultants(consultantsBySlot);
      }
    } catch (error) {
      console.error('Error fetching consultants:', error);
    }
  };

  // Initial render - set to current week
  useEffect(() => {
    // Just to make sure we're starting with the current week
    const today = new Date();
    const weekStart = getWeekStartDate(today);
    const weekNum = getWeekNumber(weekStart);

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

  // Format date as YYYY-MM-DD without timezone issues
  function formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    if (!selectedDate) {
      // If no date is selected, show error notification
      setNotification({
        show: true,
        message: 'Vui lòng chọn một ngày trước khi tạo khung giờ!'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
      return;
    }
    
    // Format the date as YYYY-MM-DD for passing as a query parameter
    const formattedDate = formatDateForComparison(selectedDate);
    navigate(`/manager/slot-creation?date=${formattedDate}&clinicID=1`); // Default clinicID=1
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

  // Format date for display
  const formatDate = (date: Date): string => {
    // Use Vietnamese locale to ensure DD/MM format
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
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

      // Format dates as DD/MM
      const startFormatted = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
      const endFormatted = `${weekEnd.getDate().toString().padStart(2, '0')}/${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`;

      weeks.push({
        value: weekNumber,
        label: `${startFormatted} đến ${endFormatted}`
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

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateString = formatDateForComparison(date);
    const slotDay = createdSlots.find(slot => slot.date === dateString);

    if (slotDay) {
      // Add consultants to each slot
      return slotDay.slots.map(slot => {
        // Convert slot ID to string for matching
        const slotID = slot.slotID || slot.id.toString();

        if (slotID && slotConsultants[slotID]) {
          return {
            ...slot,
            consultants: slotConsultants[slotID]
          };
        }
        return slot;
      });
    }

    return [];
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

  // Handle slot click
  const handleSlotClick = (slot: TimeSlot, date: string) => {
    // Ensure slot has consultants property
    const slotID = slot.slotID || slot.id.toString();
    const slotWithConsultants = {
      ...slot,
      consultants: slotID && slotConsultants[slotID]
        ? slotConsultants[slotID]
        : []
    };

    setSelectedSlot({
      slot: slotWithConsultants,
      date,
      isFake: false
    });
    setEditStart(slot.start);
    setEditEnd(slot.end);
    setEditMaxConsultant(slot.maxConsultant ?? 0);
    setEditMaxTestAppointment(slot.maxTestAppointment ?? 0);
    setModalOpen(true);
    setModalError(null);
  };

  // Fix the type mismatch in the checkSlotOverlap function
  function checkSlotOverlap(slots: TimeSlot[], start: string, end: string, editingId: number | string) {
    return slots.some(slot => {
      const slotId = typeof slot.id === 'string' ? slot.id : slot.id.toString();
      const compareId = typeof editingId === 'string' ? editingId : editingId.toString();
      return slotId !== compareId && start < slot.end && end > slot.start;
    });
  }

  // Trong modal, lấy working hour tương ứng với ngày trong tuần của slot đang sửa
  const getWorkingHourForSelectedDate = () => {
    if (!selectedSlot) return null;
    
    // Convert the date string to a Date object
    const selectedDate = new Date(selectedSlot.date);
    
    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay();
    
    // Find the working hour for this day of week
    return workingHours.find(wh => wh.dayInWeek === dayOfWeek);
  };
  
  const editingWorkingHour = getWorkingHourForSelectedDate();
  const minTime = editingWorkingHour ? editingWorkingHour.openingTime.slice(0,5) : '07:00';
  const maxTime = editingWorkingHour ? editingWorkingHour.closingTime.slice(0,5) : '17:00';

  // Hiển thị modal xác nhận trước khi lưu
  const showUpdateConfirmation = () => {
    if (!selectedSlot) return;

    let error = '';
    if (editStart >= editEnd) error = 'Thời gian kết thúc phải sau thời gian bắt đầu!';
    const slotsInDay = getSlotsForDate(new Date(selectedSlot.date));

    // Use the correct type for the id
    const slotId = typeof selectedSlot.slot.id === 'string' ?
      selectedSlot.slot.id : selectedSlot.slot.id;

    if (checkSlotOverlap(slotsInDay, editStart, editEnd, slotId)) {
      error = 'Khoảng thời gian này trùng với một khung giờ khác!';
    }
    if (editStart < minTime || editEnd > maxTime) error = `Chỉ được chọn từ ${minTime} đến ${maxTime}!`;
    if (editStart === '' || editEnd === '') error = 'Vui lòng chọn đầy đủ thời gian!';
    if (editMaxConsultant < 1) error = 'Số lượng tư vấn viên tối đa phải lớn hơn 0!';
    if (editMaxTestAppointment < 1) error = 'Số lượng cuộc hẹn xét nghiệm tối đa phải lớn hơn 0!';

    if (error) {
      setModalError(error);
      return;
    }

    setConfirmAction('update');
    setShowConfirmModal(true);
  };

  // Lưu thay đổi thời gian slot
  const handleSaveSlot = async () => {
    if (!selectedSlot) return;

    try {
      setIsLoading(true);

      // Format date and time for API (local time, không có Z)
      const formatLocalDateTime = (date: string, time: string): string => {
        const [hours, minutes] = time.split(':');
        
        // Create date object without timezone issues
        const [year, month, day] = date.split('-').map(num => parseInt(num));
        const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;
      };
      const formattedStartTime = formatLocalDateTime(selectedSlot.date, editStart);
      const formattedEndTime = formatLocalDateTime(selectedSlot.date, editEnd);

      // Get the day of week from the selectedSlot date
      const selectedDate = new Date(selectedSlot.date);
      const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      // Find the working hour for this day of week
      const workingHourForDay = workingHours.find(wh => wh.dayInWeek === dayOfWeek);
      
      // Use the workingHourID from the found working hour, or fallback to the day number if not found
      const workingHourID = workingHourForDay ? workingHourForDay.workingHourID : (dayOfWeek === 0 ? 7 : dayOfWeek);

      if (selectedSlot.slot.slotID) {
        // Update slot using slotAPI
        await slotAPI.updateSlot(selectedSlot.slot.slotID, {
          workingHourID: workingHourID,
          maxConsultant: editMaxConsultant,
          maxTestAppointment: editMaxTestAppointment,
          startTime: formattedStartTime,
          endTime: formattedEndTime
        });

        // Refresh slots data
        await fetchSlots();

        setModalOpen(false);
        setShowConfirmModal(false);
        setNotification({
          show: true,
          message: 'Khung giờ đã được cập nhật thành công!'
        });

        setTimeout(() => {
          setNotification({ show: false, message: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      setModalError('Đã xảy ra lỗi khi cập nhật khung giờ');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Format date and time for API
  const formatDateTimeForApi = (date: string, time: string): string => {
    // Combine date and time into ISO format
    const [hours, minutes] = time.split(':');
    
    // Create date object without timezone issues
    const [year, month, day] = date.split('-').map(num => parseInt(num));
    const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Format as local time without timezone offset
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;
  };

  // Working Hour management functions
  const openCreateWorkingHourModal = () => {
    setIsCreateWorkingHour(true);
    setSelectedWorkingHour(null);
    setWorkingHourForm({
      clinicID: 1,
      dayInWeek: 0,
      shift: 0,
      openingTime: '',
      closingTime: '',
      status: true
    });
    setIsWorkingHourModalOpen(true);
  };

  const openEditWorkingHourModal = (workingHour: any) => {
    setIsCreateWorkingHour(false);
    setSelectedWorkingHour(workingHour);
    setWorkingHourForm({
      clinicID: workingHour.clinicID || 1,
      dayInWeek: workingHour.dayInWeek || 0,
      shift: workingHour.shift || 0,
      openingTime: workingHour.openingTime ? workingHour.openingTime.slice(0, 5) : '',
      closingTime: workingHour.closingTime ? workingHour.closingTime.slice(0, 5) : '',
      status: workingHour.status !== undefined ? workingHour.status : true
    });
    setIsWorkingHourModalOpen(true);
  };

  const handleSaveWorkingHour = async () => {
    try {
      setIsLoading(true);

      if (isCreateWorkingHour) {
        // Cho CREATE - gửi tất cả fields
        const createData = {
          clinicID: workingHourForm.clinicID,
          dayInWeek: workingHourForm.dayInWeek,
          shift: workingHourForm.shift,
          openingTime: workingHourForm.openingTime,
          closingTime: workingHourForm.closingTime,
          status: workingHourForm.status
        };
        await workingHourAPI.createWorkingHour(createData);
        setNotification({
          show: true,
          message: 'Giờ làm việc đã được tạo thành công!'
        });
      } else {
        // Cho UPDATE - chỉ gửi các fields theo UpdateWorkingHourRequest schema
        const updateData = {
          shift: workingHourForm.shift,
          openingTime: workingHourForm.openingTime,
          closingTime: workingHourForm.closingTime,
          status: workingHourForm.status
        };
        await workingHourAPI.updateWorkingHour(selectedWorkingHour.workingHourID, updateData);
        setNotification({
          show: true,
          message: 'Giờ làm việc đã được cập nhật thành công!'
        });
      }

      // Refresh working hours
      const response = await workingHourAPI.getAllWorkingHours();
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        setWorkingHours(response.data);
      }

      setIsWorkingHourModalOpen(false);
      
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error saving working hour:', error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi lưu giờ làm việc!'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="weekly-calendar-container">
      <div className="page-header">
        <h1 className="page-title">Lịch Làm Việc Theo Tuần</h1>
        <p className="page-subtitle">Quản lý và xem lịch làm việc của chuyên gia</p>
      </div>

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

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Đang tải...</span>
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
            <h2 className="modal-title">Chi tiết khung giờ</h2>
            <div className="modal-section">
              <strong>Thời gian khung giờ:</strong>
              <div className="modal-time-edit">
                <CustomTimePicker value={editStart} onChange={setEditStart} minTime={minTime} maxTime={maxTime} />
                <span style={{ margin: '0 8px' }}>-</span>
                <CustomTimePicker value={editEnd} onChange={setEditEnd} isEndTime minTime={minTime} maxTime={maxTime} />
              </div>
              {modalError && <div style={{ color: '#e11d48', marginTop: 4, fontSize: 13 }}>{modalError}</div>}
            </div>
            <div className="modal-section">
              <strong>Thông tin khung giờ:</strong>
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>
                  <label>Số lượng tư vấn viên tối đa: </label>
                  <input
                    type="number"
                    min={1}
                    value={editMaxConsultant}
                    onChange={e => setEditMaxConsultant(Number(e.target.value))}
                    style={{ width: 60, fontWeight: 600, marginLeft: 8 }}
                  />
                </div>
                <div>
                  <label>Số lượng cuộc hẹn xét nghiệm tối đa: </label>
                  <input
                    type="number"
                    min={1}
                    value={editMaxTestAppointment}
                    onChange={e => setEditMaxTestAppointment(Number(e.target.value))}
                    style={{ width: 60, fontWeight: 600, marginLeft: 8 }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-section">
              <strong>Danh sách consultant đã đăng ký:</strong>
              {selectedSlot.slot.consultants && selectedSlot.slot.consultants.length > 0 ? (
                <ul style={{ marginTop: 8 }}>
                  {selectedSlot.slot.consultants.map((c: Consultant, idx: number) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      {c.specialty && <span style={{ color: '#6366f1' }}> - {c.specialty}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#64748b', marginTop: 8 }}>Chưa có ai đăng ký</div>
              )}
            </div>
            <button
              className={`modal-save ${isLoading ? 'disabled' : ''}`}
              onClick={showUpdateConfirmation}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
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

      {/* Update the calendar grid section to display slots with correct consultant counts */}
      <div className="weekly-calendar">
        <div className="calendar-grid">
          {getWeekDates(currentWeekStart).map((date, index) => {
            // Check if this date is selected
            const isSelected = selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            const slotsForDate = getSlotsForDate(date);

            return (
              <div
                key={index}
                className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isSelectable(date) ? 'past-date' : 'selectable'}`}
                onClick={() => handleDaySelect(date)}
              >
                <div className="day-header">
                  <div className="day-name">{translateDayName(date.getDay())}</div>
                  <div className="day-date"><CustomDateDisplay date={date} /></div>
                </div>

                <div className="day-slots">
                  {slotsForDate.length > 0 ? (
                    slotsForDate.map((slot) => {
                      // Count consultants registered for this slot
                      const consultantCount = slot.consultants?.length || 0;
                      const maxConsultants = slot.maxConsultant || 0;

                      // Calculate fill percentage
                      const fillPercentage = maxConsultants > 0
                        ? Math.min(100, (consultantCount / maxConsultants) * 100)
                        : 0;

                      // Determine status color
                      let statusColor = 'bg-green-100 text-green-800'; // Default: Available
                      if (fillPercentage >= 100) {
                        statusColor = 'bg-red-100 text-red-800'; // Full
                      } else if (fillPercentage >= 70) {
                        statusColor = 'bg-yellow-100 text-yellow-800'; // Almost full
                      }

                      return (
                        <div
                          key={slot.id}
                          className={`time-slot ${statusColor}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(slot, formatDateForComparison(date));
                          }}
                        >
                          <span className="slot-time">{slot.start} - {slot.end}</span>
                          <div className="slot-capacity-container">
                            {maxConsultants > 0 ? (
                              <span className="slot-capacity">
                                {consultantCount}/{maxConsultants} tư vấn viên
                              </span>
                            ) : (
                              <span className="slot-capacity">
                                {consultantCount} tư vấn viên
                              </span>
                            )}
                            <span className="slot-capacity">
                              Tối đa {slot.maxTestAppointment} cuộc hẹn xét nghiệm
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-slots">Không có khung giờ</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Working Hours Management Section */}
      <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
            Giờ Làm Việc Hiện Tại
          </h2>
          <button
            onClick={openCreateWorkingHourModal}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tạo Giờ Làm Việc
          </button>
        </div>
        {workingHours.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Ngày</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Ca</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Giờ mở cửa</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Giờ đóng cửa</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {workingHours.map((wh, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][wh.dayInWeek]}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {wh.shift === 0 ? 'Sáng' : 'Chiều'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {wh.openingTime ? wh.openingTime.slice(0, 5) : ''}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {wh.closingTime ? wh.closingTime.slice(0, 5) : ''}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: wh.status ? '#dcfce7' : '#fef2f2',
                        color: wh.status ? '#16a34a' : '#dc2626'
                      }}>
                        {wh.status ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => openEditWorkingHourModal(wh)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Chưa có giờ làm việc nào được thiết lập.</p>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: '600', fontSize: '1.125rem' }}>
              Xác nhận cập nhật khung giờ?
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.875rem' }}>
              Bạn có chắc chắn muốn cập nhật thông tin khung giờ này?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSlot}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Working Hour Modal */}
      {isWorkingHourModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                {isCreateWorkingHour ? 'Tạo Giờ Làm Việc Mới' : 'Cập Nhật Giờ Làm Việc'}
              </h2>
              <button
                onClick={() => setIsWorkingHourModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Ngày trong tuần:
                </label>
                <select
                  value={workingHourForm.dayInWeek}
                  onChange={(e) => setWorkingHourForm({ ...workingHourForm, dayInWeek: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                >
                  <option value={0}>Chủ nhật</option>
                  <option value={1}>Thứ 2</option>
                  <option value={2}>Thứ 3</option>
                  <option value={3}>Thứ 4</option>
                  <option value={4}>Thứ 5</option>
                  <option value={5}>Thứ 6</option>
                  <option value={6}>Thứ 7</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Ca làm việc:
                </label>
                <select
                  value={workingHourForm.shift}
                  onChange={(e) => setWorkingHourForm({ ...workingHourForm, shift: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                >
                  <option value={0}>Ca sáng</option>
                  <option value={1}>Ca chiều</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Giờ mở cửa:
                </label>
                <input
                  type="time"
                  value={workingHourForm.openingTime}
                  onChange={(e) => setWorkingHourForm({ ...workingHourForm, openingTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Giờ đóng cửa:
                </label>
                <input
                  type="time"
                  value={workingHourForm.closingTime}
                  onChange={(e) => setWorkingHourForm({ ...workingHourForm, closingTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={workingHourForm.status}
                    onChange={(e) => setWorkingHourForm({ ...workingHourForm, status: e.target.checked })}
                  />
                  <span style={{ fontWeight: '500', color: '#374151' }}>Kích hoạt</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setIsWorkingHourModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveWorkingHour}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Đang lưu...' : (isCreateWorkingHour ? 'Tạo' : 'Cập nhật')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar; 