import React, { useState, useEffect } from 'react';
import './ConsultantSlotRegistration.css';
import { consultantSlotAPI } from '../../utils/api';
import { authUtils } from '../../utils/auth';

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
interface TimeSlot {
  id: number;
  slotID?: number;
  start: string;
  end: string;
  date?: string;
  isRegistered?: boolean;
  maxConsultant?: number;
  currentConsultants?: number;
  maxAppointment?: number;
}

interface SlotDay {
  day: string;
  date: string;
  slots: TimeSlot[];
}

interface RegisteredSlot {
  id: number;
  slotID: number;
  date: string;
  startTime: string;
  endTime: string;
  maxAppointment: number;
}

const ConsultantSlotRegistration: React.FC = () => {
  const consultantId = authUtils.getCurrentUserId();
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStartDate(currentDate));
  const [availableSlots, setAvailableSlots] = useState<SlotDay[]>([]);
  const [registeredSlots, setRegisteredSlots] = useState<RegisteredSlot[]>([]);
  const [notification, setNotification] = useState<{ show: boolean, message: string, isError?: boolean }>({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [maxAppointmentValues, setMaxAppointmentValues] = useState<{[key: number]: number}>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // Track selected week
  const [slotConsultants, setSlotConsultants] = useState<{[slotId: string]: any[]}>({});
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Fetch slots from API when week changes
  useEffect(() => {
    if (consultantId) {
      // First fetch registered slots, then available slots to ensure proper comparison
      const fetchData = async () => {
        const registeredSlotsData = await fetchRegisteredSlots();
        console.log('Registered slots for useEffect:', registeredSlotsData);
        
        await fetchConsultantsForSlots();
        
        // Use the fresh data for comparison
        const registeredSlotIds = registeredSlotsData.map(slot => slot.slotID);
        console.log('Using these slotIDs for comparison in fetchSlots:', registeredSlotIds);
        
        await fetchSlots(registeredSlotIds);
      };
      
      fetchData();
    }
  }, [currentWeekStart, selectedYear, consultantId]);

  // Initial render - set to current week
  useEffect(() => {
    if (!isInitialized) {
      const today = new Date();
      const currentWeekStart = getWeekStartDate(today);
      setCurrentWeekStart(currentWeekStart);
      setSelectedYear(today.getFullYear());
      setIsInitialized(true);
      
      // Calculate current week number
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weekNumber = Math.ceil(
        ((today.getTime() - startOfYear.getTime()) / millisecondsPerWeek) + 
        (startOfYear.getDay() / 7)
      );
      
      setSelectedWeek(weekNumber);
    }
  }, [isInitialized]);

  // Update when year changes (but skip the first render)
  useEffect(() => {
    if (isInitialized && selectedWeek > 0) {
      // Calculate first day of the selected week
      const firstDayOfYear = new Date(selectedYear, 0, 1);
      const daysOffset = (selectedWeek - 1) * 7 - (firstDayOfYear.getDay() === 0 ? 6 : firstDayOfYear.getDay() - 1);
      const weekStartDate = new Date(selectedYear, 0, 1 + daysOffset);
      
      setCurrentWeekStart(weekStartDate);
    }
  }, [selectedYear, selectedWeek, isInitialized]);

  // Fetch available slots
  const fetchSlots = async (explicitRegisteredSlotIds?: any[]) => {
    setIsLoading(true);
    try {
      // Get the dates of the current week
      const weekDates = getWeekDates(currentWeekStart);
      
      // Fetch all available slots from API
      const response = await consultantSlotAPI.getAvailableSlots();
      
      // Debug: Log the API response
      console.log('API Response - Available Slots:', response.data);
      
      if (response.data) {
        // Process the API response into our SlotDay format
        const processedSlots: SlotDay[] = [];
        
        // Prepare empty days structure
        weekDates.forEach((date) => {
          try {
            const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
            const formattedDate = formatDateForComparison(date);
            
            processedSlots.push({
              day: dayName,
              date: formattedDate,
              slots: []
            });
          } catch (error) {
            console.error('Error formatting date:', date, error);
          }
        });
        
        // Add available slots to corresponding days
        if (Array.isArray(response.data)) {
          // Use explicitly provided registered slot IDs if available, otherwise use the state
          const registeredSlotIds = explicitRegisteredSlotIds || registeredSlots.map(slot => slot.slotID);
          console.log('Using registered slot IDs for comparison in fetchSlots:', registeredSlotIds);
          console.log('Registered Slot IDs for comparison:', registeredSlotIds);
          
          response.data.forEach((slot: any) => {
            try {
              // Extract date from the slot's startTime (similar to WeeklyCalendar.tsx)
              const slotDate = new Date(slot.startTime);
              const dateString = formatDateForComparison(slotDate);
              
              // Extract time from startTime and endTime
              const startTime = new Date(slot.startTime).toTimeString().substring(0, 5);
              const endTime = new Date(slot.endTime).toTimeString().substring(0, 5);
              
              const dayIndex = processedSlots.findIndex(day => day.date === dateString);
              
              // Only include slots that are today or in the future
              const currentDay = new Date();
              currentDay.setHours(0, 0, 0, 0);
              
              if (dayIndex !== -1 && slotDate >= currentDay) {
                // Debug the comparison to ensure it works correctly
                console.log(`Comparing slot ID ${slot.slotID} (${typeof slot.slotID}) with registered IDs:`, 
                  registeredSlotIds.map(id => `${id} (${typeof id})`));
                
                // Convert both to strings for comparison to ensure type consistency
                // Add additional check with slot.id as some APIs might return different field names
                const currentSlotId = String(slot.slotID || slot.id);
                const isRegistered = registeredSlotIds.some(id => String(id) === currentSlotId);
                
                // Extra debug to confirm if a slot is marked as registered
                if (isRegistered) {
                  console.log(`Slot ${currentSlotId} is marked as registered`);
                }
                
                // Skip past slots on today
                const now = new Date();
                const slotEndDate = new Date(slot.endTime);
                
                if (slotDate.getDate() !== currentDay.getDate() || slotEndDate > now) {
                  processedSlots[dayIndex].slots.push({
                    id: slot.slotID,
                    slotID: slot.slotID,
                    start: startTime,
                    end: endTime,
                    date: dateString,
                    isRegistered: isRegistered,
                    maxConsultant: slot.maxConsultant,
                    currentConsultants: slot.currentConsultants
                  });
                }
              }
            } catch (error) {
              console.error('Error processing slot:', slot, error);
            }
          });
        }
        
        console.log('Processed Available Slots:', processedSlots);
        setAvailableSlots(processedSlots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      showNotification('Lỗi khi tải dữ liệu khung giờ. Vui lòng thử lại sau.', true);
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
        const consultantsBySlot: { [slotId: string]: any[] } = {};
        
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
      console.error('Error fetching consultant data:', error);
    }
  };

  // Fetch registered slots for the consultant
  const fetchRegisteredSlots = async () => {
    if (!consultantId) return [];
    
    setIsLoading(true);
    try {
      const response = await consultantSlotAPI.getConsultantSlots(consultantId);
      
      // Debug: Log the API response in a more readable format
      console.log('API Response - Registered Slots:', response);
      if (response.data && Array.isArray(response.data)) {
        console.log('Response data structure:', response.data.map(slot => ({
          id: slot.id || slot.consultantSlotID,
          slotID: slot.slotID || (slot.slot && slot.slot.slotID),
          slot: slot.slot,
          startTime: slot.startTime || (slot.slot && slot.slot.startTime),
          endTime: slot.endTime || (slot.slot && slot.slot.endTime)
        })));
      }
      
      if (response.data) {
        // Filter out past slots
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredSlots = response.data
          .filter((slot: any) => {
            try {
              // Use the date from slot.startTime similar to fetchSlots
              const slotDate = new Date(slot.slot?.startTime || slot.startTime);
              return slotDate >= today;
            } catch (error) {
              console.error('Error processing registered slot date:', slot, error);
              return false;
            }
          })
          .map((slot: any) => {
            // Format the data according to what we're receiving
            const slotData = slot.slot || slot; // Handle different response formats
            const startTime = slotData.startTime ? 
              (typeof slotData.startTime === 'string' && slotData.startTime.includes('T')) ? 
                new Date(slotData.startTime).toTimeString().substring(0, 5) : slotData.startTime 
              : '';
            
            const endTime = slotData.endTime ? 
              (typeof slotData.endTime === 'string' && slotData.endTime.includes('T')) ? 
                new Date(slotData.endTime).toTimeString().substring(0, 5) : slotData.endTime 
              : '';
            
            // Extract date more safely
            let date = '';
            try {
              if (slotData.startTime) {
                const dateObj = new Date(slotData.startTime);
                if (!isNaN(dateObj.getTime())) {
                  // Use yyyy-mm-dd format first then format for display
                  date = formatDateForDisplay(dateObj.toISOString().split('T')[0]);
                }
              } else if (slot.date) {
                date = formatDateForDisplay(slot.date);
              } else {
                console.warn('No valid date found in slot data:', slot);
              }
            } catch (error) {
              console.error('Error extracting date from slot:', slot, error);
            }
            
            // Make sure we have a valid ID
            const id = slot.id || slot.consultantSlotID || slot.consultantSlot?.id;
            
            // Extract the correct slotID value from all possible paths
            const slotID = slot.slot?.slotID || slotData.slotID || slot.slotID;
            
            console.log('Extracted slotID from registered slot:', slotID, 'From slot data:', slot);
            
            if (!id) {
              console.warn('Missing ID in slot data:', slot);
            }
            
            if (!slotID) {
              console.warn('Missing slotID in slot data:', slot);
            }
            
            return {
              id: id,
              slotID: slotID,
              date: date,
              startTime: startTime,
              endTime: endTime,
              maxAppointment: slot.maxAppointment || 1
            };
          });
        
        console.log('Processed Registered Slots:', filteredSlots);
        
        // Log all slotIDs from registered slots for debugging
        const extractedSlotIds = filteredSlots.map(slot => slot.slotID);
        console.log('All registered slotIDs for comparison:', extractedSlotIds);
        
        setRegisteredSlots(filteredSlots);
        return filteredSlots;
      }
      return [];
    } catch (error) {
      console.error('Error fetching registered slots:', error);
      showNotification('Lỗi khi tải dữ liệu đăng ký. Vui lòng thử lại sau.', true);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Register for a slot
  const registerForSlot = async () => {
    if (!consultantId || !selectedSlot) {
      showNotification('Bạn cần đăng nhập và chọn khung giờ để đăng ký.', true);
      return;
    }

    const slotId = selectedSlot.id;
    const maxAppointment = maxAppointmentValues[slotId] || 1;
    
    if (maxAppointment <= 0) {
      showNotification('Số lượng cuộc hẹn phải lớn hơn 0.', true);
      return;
    }
    
    setShowConfirmation(false);
    setIsLoading(true);
    try {
      console.log('Attempting to register slot with ID:', slotId, 'and maxAppointment:', maxAppointment);
      const response = await consultantSlotAPI.registerSlot(slotId, maxAppointment);
      console.log('Register response:', response);
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        // Get registered slot details from response if available
        const newRegisteredSlot = response.data || {
          slotID: slotId,
          maxAppointment: maxAppointment
        };
        
        // Update the registeredSlots array with the new slot
        const updatedRegisteredSlots = [...registeredSlots, {
          id: newRegisteredSlot.id || newRegisteredSlot.consultantSlotID || Date.now(), // Fallback to timestamp if no ID
          slotID: slotId,
          date: selectedSlot.date || '',
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          maxAppointment: maxAppointment
        }];
        setRegisteredSlots(updatedRegisteredSlots);
        
        // Immediately mark the slot as registered in the UI
        const updatedSlots = [...availableSlots];
        for (const day of updatedSlots) {
          for (const slot of day.slots) {
            if (slot.id === slotId || slot.slotID === slotId) {
              slot.isRegistered = true;
              console.log(`Marked slot ${slotId} as registered in UI`);
            }
          }
        }
        setAvailableSlots(updatedSlots);
        
        showNotification('Đăng ký khung giờ thành công!');
        
        // Refresh data from server (but keep our UI updates)
        setTimeout(() => {
          fetchRegisteredSlots();
          // Pass our updated registered slot IDs to ensure they're properly marked
          fetchSlots([...updatedRegisteredSlots.map(slot => slot.slotID)]);
        }, 500);
      } else {
        showNotification('Lỗi khi đăng ký khung giờ. Vui lòng thử lại sau.', true);
      }
    } catch (error) {
      console.error('Error registering slot:', error);
      showNotification('Lỗi khi đăng ký khung giờ. Vui lòng thử lại sau.', true);
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setSelectedSlot(null);
    }
  };

  // Unregister from a slot
  const unregisterSlot = async (slotId: string) => {
    if (!slotId) {
      showNotification('ID khung giờ không hợp lệ.', true);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to unregister slot with ID:', slotId);
      const response = await consultantSlotAPI.unregisterSlot(slotId);
      console.log('Unregister response:', response);
      
      if (response.statusCode === 200) {
        showNotification('Hủy đăng ký khung giờ thành công!');
        fetchSlots();
        fetchRegisteredSlots();
      } else {
        showNotification('Lỗi khi hủy đăng ký khung giờ. Vui lòng thử lại sau.', true);
      }
    } catch (error) {
      console.error('Error unregistering slot:', error);
      showNotification('Lỗi khi hủy đăng ký khung giờ. Vui lòng thử lại sau.', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (message: string, isError = false) => {
    setNotification({
      show: true,
      message,
      isError
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Handle max appointment input change
  const handleMaxAppointmentChange = (slotId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setMaxAppointmentValues({
      ...maxAppointmentValues,
      [slotId]: numValue
    });
  };

  // Handle week selection change
  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(event.target.value));
  };

  // Handle year selection change
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // Select a slot for registration
  const handleSlotSelect = (slot: TimeSlot) => {
    // Check if the slot is already registered or full
    if (slot.isRegistered || (slot.currentConsultants && slot.maxConsultant && slot.currentConsultants >= slot.maxConsultant)) {
      return;
    }
    
    setSelectedSlot(slot);
    // Initialize max appointment value for this slot
    if (!maxAppointmentValues[slot.id]) {
      setMaxAppointmentValues({
        ...maxAppointmentValues,
        [slot.id]: 1
      });
    }
    // Open modal for registration
    setShowModal(true);
  };

  // Get the first day (Monday) of the week for a given date
  function getWeekStartDate(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Get all dates in a week starting from Monday
  function getWeekDates(startDate: Date): Date[] {
    const dates = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  // Format date for comparison (YYYY-MM-DD)
  function formatDateForComparison(date: Date): string {
    // Format manually to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display (DD/MM/YYYY)
  function formatDateForDisplay(dateString: string): string {
    try {
      // Check if dateString is a valid date
      if (!dateString || dateString === 'undefined' || dateString === 'NaN/NaN/NaN') {
        return 'Invalid date';
      }
      
      // Handle different date formats
      let date: Date;
      if (dateString.includes('-')) {
        // If it's already in YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('/')) {
        // If it's already in DD/MM/YYYY format
        const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
        date = new Date(year, month - 1, day);
      } else {
        // Try to parse it as a standard date string
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  }

  // Format time for display (HH:MM)
  function formatTimeForDisplay(time: string): string {
    return time;
  }

  // Get available weeks for the selected year
  function getAvailableWeeks() {
    const weeks = [];
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    
    let weekStart = getWeekStartDate(firstDayOfYear);
    
    while (weekStart <= lastDayOfYear) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Calculate week number
      const weekNumber = Math.ceil(
        ((weekStart.getTime() - firstDayOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 
        (firstDayOfYear.getDay() / 7)
      );
      
      const weekLabel = `Tuần ${weekNumber}: ${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')} - ${weekEnd.getDate().toString().padStart(2, '0')}/${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`;
      
      weeks.push({
        value: weekNumber,
        label: weekLabel
      });
      
      weekStart.setDate(weekStart.getDate() + 7);
    }
    
    return weeks;
  }

  // Get available years (current year and next year)
  function getAvailableYears() {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1];
  }

  // Check if a date is today
  function isToday(dateString: string): boolean {
    const today = formatDateForComparison(new Date());
    return dateString === today;
  }

  // Check if a date is in the past
  function isPastDate(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  }

  return (
    <div className="consultant-calendar-container">
      <h1 className="text-2xl font-semibold mb-6">Đăng ký lịch làm việc</h1>
      
      <div className="calendar-header">
        <div className="calendar-controls">
          <div className="selectors-container">
            <div className="week-selector">
              <span>Tuần:</span>
              <select className="week-select" value={selectedWeek} onChange={handleWeekChange}>
                {getAvailableWeeks().map((week) => (
                  <option key={week.value} value={week.value}>{week.label}</option>
                ))}
              </select>
            </div>
            <div className="year-selector">
              <span>Năm:</span>
              <select className="year-select" value={selectedYear} onChange={handleYearChange}>
                {getAvailableYears().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar with available and registered slots */}
      <h2 className="section-title">Lịch khung giờ</h2>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Khung giờ có sẵn</span>
        </div>
        <div className="legend-item">
          <div className="legend-color registered"></div>
          <span>Đã đăng ký</span>
        </div>
        <div className="legend-item">
          <div className="legend-color full"></div>
          <span>Đã đầy</span>
        </div>
      </div>
      <div className="weekly-calendar">
        <div className="calendar-grid">
          {availableSlots.map((day) => (
            <div
              key={day.date}
              className={`calendar-day ${isToday(day.date) ? 'today' : ''} ${isPastDate(day.date) ? 'past-date' : ''}`}
            >
              <div className="day-header">
                <div className="day-name">{day.day}</div>
                <div className="day-date">
                  <CustomDateDisplay date={new Date(day.date)} />
                </div>
              </div>
              
              <div className="day-slots">
                {day.slots.length > 0 ? (
                  day.slots.map((slot) => {
                    // Determine slot status
                    const slotStatus = slot.isRegistered
                      ? 'registered'
                      : (slot.currentConsultants && slot.maxConsultant && slot.currentConsultants >= slot.maxConsultant)
                        ? 'full'
                        : 'available';
                    
                    return (
                      <div
                        key={slot.id}
                        className={`time-slot ${slotStatus} ${slotStatus === 'available' ? 'clickable' : ''}`}
                        onClick={() => {
                          if (slotStatus === 'available') {
                            handleSlotSelect(slot);
                          }
                        }}
                      >
                        <div className="slot-time">
                          {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                        </div>
                        <div className="slot-capacity-container">
                          {slotStatus === 'registered' ? (
                            <>
                              <span className="slot-capacity">
                                {(() => {
                                  // Get consultant count from either the fetched data or the API response
                                  const consultantCount = slotConsultants[slot.id?.toString()] 
                                    ? slotConsultants[slot.id?.toString()].length 
                                    : (slot.currentConsultants || 0);
                                  
                                  // Get max consultants
                                  const maxConsultants = slot.maxConsultant || 0;
                                  
                                  // Display in the same format as WeeklyCalendar.tsx
                                  return maxConsultants > 0 
                                    ? `${consultantCount}/${maxConsultants} tư vấn viên`
                                    : `${consultantCount} tư vấn viên`;
                                })()}
                              </span>
                              <span className="slot-max-appointment">
                                Số cuộc hẹn tối đa: {(() => {
                                  // Find the matching registered slot to get the maxAppointment value
                                  const registeredSlot = registeredSlots.find(rs => rs.slotID === slot.slotID);
                                  return registeredSlot?.maxAppointment || "1";
                                })()}
                              </span>
                            </>
                          ) : (
                            <span className="slot-capacity">
                              {(() => {
                                // Get consultant count from either the fetched data or the API response
                                const consultantCount = slotConsultants[slot.id?.toString()] 
                                  ? slotConsultants[slot.id?.toString()].length 
                                  : (slot.currentConsultants || 0);
                                
                                // Get max consultants
                                const maxConsultants = slot.maxConsultant || 0;
                                
                                // Display in the same format as WeeklyCalendar.tsx
                                return maxConsultants > 0 
                                  ? `${consultantCount}/${maxConsultants} tư vấn viên`
                                  : `${consultantCount} tư vấn viên`;
                              })()}
                            </span>
                          )}
                        </div>
                        

                      </div>
                    );
                  })
                ) : (
                  <div className="no-slots">Không có khung giờ</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Note: Registered slots are now shown directly in the calendar with a different color */}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification.show && (
        <div className={notification.isError ? "error-notification" : "success-notification"}>
          <div className="notification-icon">
            {notification.isError ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {notification.message}
        </div>
      )}
      
      {/* Registration Modal */}
      {showModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Đăng ký khung giờ</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Khung giờ: {selectedSlot.start} - {selectedSlot.end}</p>
              {selectedSlot.date && <p>Ngày: {formatDateForDisplay(selectedSlot.date)}</p>}
              
              <div className="form-group">
                <label htmlFor="maxAppointment">Số cuộc hẹn tối đa:</label>
                <input
                  id="maxAppointment"
                  type="number"
                  min="1"
                  max="10"
                  className="max-appointment-input"
                  value={maxAppointmentValues[selectedSlot.id] || 1}
                  onChange={(e) => handleMaxAppointmentChange(selectedSlot.id, e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowModal(false)}>Hủy</button>
              <button 
                className={`register-button ${maxAppointmentValues[selectedSlot.id] <= 0 ? 'disabled' : ''}`}
                onClick={() => maxAppointmentValues[selectedSlot.id] > 0 && setShowConfirmation(true)}
                disabled={maxAppointmentValues[selectedSlot.id] <= 0}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmation && selectedSlot && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-header">
              <h3>Xác nhận đăng ký</h3>
            </div>
            <div className="confirm-body">
              <p>Bạn có chắc chắn muốn đăng ký khung giờ này?</p>
              <p><strong>Khung giờ:</strong> {selectedSlot.start} - {selectedSlot.end}</p>
              {selectedSlot.date && <p><strong>Ngày:</strong> {formatDateForDisplay(selectedSlot.date)}</p>}
              <p><strong>Số cuộc hẹn tối đa:</strong> {maxAppointmentValues[selectedSlot.id] || 1}</p>
            </div>
            <div className="confirm-footer">
              <button className="cancel-button" onClick={() => setShowConfirmation(false)}>Hủy</button>
              <button className="confirm-button" onClick={registerForSlot}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantSlotRegistration;
