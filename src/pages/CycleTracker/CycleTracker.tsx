import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './CycleTracker.css'
import './loading-indicator.css'
import * as signalR from '@microsoft/signalr';
import { FaSave, FaSpinner, FaSync, FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { 
  menstrualCycleAPI, 
  cyclePredictionAPI,
  type MenstrualCycleData, 
  type CreateMenstrualCycleRequest, 
  type UpdateMenstrualCycleRequest 
} from '../../utils/api'
import { authUtils } from '../../utils/auth'

// Vietnamese day names for calendar formatting
// Vietnamese day names for calendar formatting - must include all 7 days
const viDaysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] // Monday to Sunday

// Status types for cycle tracking
type CycleStatus = 'period' | 'fertile' | 'ovulation' | 'next-period' | 'none'

// Notification types
type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
    type: NotificationType;
    message: string;
    onClose: () => void;
}

// Notification component to replace alerts
const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto dismiss after 5 seconds
        
        return () => clearTimeout(timer);
    }, [onClose]);
    
    const getIcon = () => {
        switch(type) {
            case 'success':
                return <FaCheck className="notification-icon" />;
            case 'error':
                return <FaExclamationCircle className="notification-icon" />;
            case 'info':
                return <FaInfoCircle className="notification-icon" />;
        }
    };
    
    return (
        <div className={`notification notification-${type}`}>
            {getIcon()}
            <div className="notification-message">{message}</div>
            <button className="notification-close" onClick={onClose}>
                <FaTimes />
            </button>
        </div>
    );
};

const CycleTracker: React.FC = () => {
    // Chỉ lưu states cần thiết - không có dữ liệu fix cứng
    const [cycleLength, setCycleLength] = useState<number | ''>('')
    const [periodLength, setPeriodLength] = useState<number | ''>('')
    const [lastPeriodStart, setLastPeriodStart] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    // API related states
    const [menstrualCycleFromDB, setMenstrualCycleFromDB] = useState<MenstrualCycleData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isPredictionLoading, setIsPredictionLoading] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    
    // Notification system
    interface NotificationData {
        id: number;
        type: NotificationType;
        message: string;
    }
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    
    // Helper function to show notifications
    const showNotification = (type: NotificationType, message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
        return id;
    }
    
    // Helper function to remove a notification
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
    
    // Status message in the form
    const [formStatus, setFormStatus] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({
        message: '',
        type: null
    });
    
    // Store processed cycle prediction dates
    const [cyclePhases, setCyclePhases] = useState<{
        periodDates: Date[];
        fertileDates: Date[];
        ovulationDates: Date[];
        nextPeriodDates: Date[];
    }>({
        periodDates: [],
        fertileDates: [],
        ovulationDates: [],
        nextPeriodDates: []
    })

    // SignalR connection for notification from Hangfire
    useEffect(() => {
        if (!currentUserId) return;

        // Kết nối tới NotificationHub ở backend
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7084/notificationHub", {
                withCredentials: true
                // Nếu cần JWT: accessTokenFactory: () => "JWT_TOKEN"
            })
            .withAutomaticReconnect()
            .build();

        // Đăng ký handler trước khi start để không bị miss event
        const notificationHandler = (data: { Message: string }) => {
            console.log("[SignalR] Received event: Receive Notification", data, "currentUserId:", currentUserId);
            showNotification('success', data?.Message || 'Bạn có thông báo mới về dự đoán chu kỳ!');
            loadCyclePredictionData(currentUserId);
        };
        connection.on("Receive Notification", notificationHandler);

        connection.onclose((err) => {
            console.warn("SignalR connection closed", err);
        });
        connection.onreconnecting((err) => {
            console.warn("SignalR reconnecting", err);
        });
        connection.onreconnected((connectionId) => {
            console.log("SignalR reconnected", connectionId);
        });

        connection.start()
            .then(() => {
                console.log("SignalR connected to notificationHub (userId:", currentUserId, ")");
            })
            .catch(err => {
                console.error("SignalR connection error:", err);
                showNotification('error', 'Không thể kết nối tới hệ thống dự đoán tự động');
            });

        return () => {
            connection.off("Receive Notification", notificationHandler);
            connection.stop();
        };
    }, [currentUserId]);

    // Debug logging for state changes
    useEffect(() => {
        console.log('State changed - cycleLength:', cycleLength);
    }, [cycleLength]);

    useEffect(() => {
        console.log('State changed - periodLength:', periodLength);
    }, [periodLength]);

    useEffect(() => {
        console.log('State changed - lastPeriodStart:', lastPeriodStart);
    }, [lastPeriodStart]);

    useEffect(() => {
        console.log('State changed - currentUserId:', currentUserId);
        // Load cycle prediction data when user ID changes
        if (currentUserId) {
            loadCyclePredictionData(currentUserId);
        }
    }, [currentUserId]);
    
    // Load cycle prediction data from API
    type CyclePrediction = {
        cyclePredictionID: number;
        menstrualCycleID: number;
        customerID: string;
        customerName: string;
        ovulationDate: string;
        fertileStartDate: string;
        fertileEndDate: string;
        nextPeriodStartDate: string;
        cycleStartDate: string;
        cycleLength: number;
    };
    const loadCyclePredictionData = async (userId: string) => {
        try {
            setIsPredictionLoading(true);
            console.log('Đang tải dữ liệu dự đoán chu kỳ cho user:', userId);
            const response = await cyclePredictionAPI.getCyclePredictionByCustomer(userId);
            console.log('Response dự đoán từ API:', response);
            if (response.statusCode === 200 && response.data) {
                const predictionData = response.data as CyclePrediction | CyclePrediction[];
                let singlePrediction: CyclePrediction | null = null;
                if (Array.isArray(predictionData) && predictionData.length > 0) {
                    predictionData.sort((a, b) => {
                        return new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime();
                    });
                    singlePrediction = predictionData[0];
                } else if (!Array.isArray(predictionData) && predictionData) {
                    singlePrediction = predictionData;
                } else {
                    singlePrediction = null;
                }
                if (!singlePrediction) {
                    console.log('Không có dữ liệu dự đoán chu kỳ');
                    setCyclePhases({
                        periodDates: [],
                        fertileDates: [],
                        ovulationDates: [],
                        nextPeriodDates: []
                    });
                    return;
                }
                console.log('Đã tải dữ liệu dự đoán từ API:', singlePrediction);
                const processedDates = processPredictionDates(singlePrediction);
                setCyclePhases(processedDates);
            } else {
                console.log('Không có dữ liệu dự đoán chu kỳ');
                setCyclePhases({
                    periodDates: [],
                    fertileDates: [],
                    ovulationDates: [],
                    nextPeriodDates: []
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu dự đoán chu kỳ:', error);
            setCyclePhases({
                periodDates: [],
                fertileDates: [],
                ovulationDates: [],
                nextPeriodDates: []
            });
        } finally {
            setIsPredictionLoading(false);
        }
    };
    
    // Process the prediction dates from API to array of Date objects
    const processPredictionDates = (prediction: CyclePrediction | null): { periodDates: Date[], fertileDates: Date[], ovulationDates: Date[], nextPeriodDates: Date[] } => {
        const result = {
            periodDates: [],
            fertileDates: [],
            ovulationDates: [],
            nextPeriodDates: []
        } as { periodDates: Date[], fertileDates: Date[], ovulationDates: Date[], nextPeriodDates: Date[] };
        
        if (!prediction) return result;
        
        try {
            // Process period dates (from cycle start date to period length)
            const cycleStartDate = new Date(prediction.cycleStartDate);
            const periodLength = menstrualCycleFromDB?.periodLength || 5; // Default to 5 if not available
            
            for (let i = 0; i < periodLength; i++) {
                const periodDate = new Date(cycleStartDate);
                periodDate.setDate(cycleStartDate.getDate() + i);
                result.periodDates.push(periodDate);
            }
            
            // Process fertile dates
            if (prediction.fertileStartDate && prediction.fertileEndDate) {
                const fertileStartDate = new Date(prediction.fertileStartDate);
                const fertileEndDate = new Date(prediction.fertileEndDate);
                
                // Loop through all dates in the fertile window
                const currentDate = new Date(fertileStartDate);
                while (currentDate <= fertileEndDate) {
                    result.fertileDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            
            // Process ovulation date - chỉ hiển thị đúng 1 ngày rụng trứng
            if (prediction.ovulationDate) {
                const ovulationDate = new Date(prediction.ovulationDate);
                result.ovulationDates.push(ovulationDate);
                // Không thêm ngày trước và sau nữa
            }
            
            // Process next period date - chỉ hiển thị đúng 1 ngày bắt đầu kỳ kinh nguyệt tiếp theo
            if (prediction.nextPeriodStartDate) {
                const nextPeriodStartDate = new Date(prediction.nextPeriodStartDate);
                result.nextPeriodDates.push(nextPeriodStartDate);
                // Không thêm các ngày tiếp theo nữa
            }
            
            console.log('Processed cycle phases:', result);
            return result;
        } catch (error) {
            console.error('Error processing prediction dates:', error);
            return result;
        }
    };

    // Load menstrual cycle data from API only
    const loadMenstrualCycleFromAPI = async (userId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Đang tải dữ liệu chu kỳ cho user:', userId);
            const response = await menstrualCycleAPI.getMenstrualCycleByCustomer(userId);
            console.log('Response từ API:', response);
            
            if (response.statusCode === 200 && response.data) {
                // Handle both single object and array response
                let dbData = response.data;
                
                // If data is an array, take the first item
                if (Array.isArray(dbData) && dbData.length > 0) {
                    dbData = dbData[0];
                } else if (Array.isArray(dbData) && dbData.length === 0) {
                    // Empty array - no data
                    console.log('Mảng dữ liệu rỗng - không có chu kỳ nào');
                    setMenstrualCycleFromDB(null);
                    setCycleLength('');
                    setPeriodLength('');
                    setLastPeriodStart(null);
                    return;
                }
                
                setMenstrualCycleFromDB(dbData);
                console.log('Đã tải dữ liệu từ DB:', dbData);
                
                // Update local states with data from API only
                console.log('Setting cycleLength:', dbData.cycleLength);
                console.log('Setting periodLength:', dbData.periodLength);
                console.log('Setting startDate:', dbData.startDate);
                
                setCycleLength(dbData.cycleLength);
                setPeriodLength(dbData.periodLength);
                
                // Safely parse the start date
                try {
                    // Handle ISO datetime string from API
                    let dateString = dbData.startDate;
                    if (dateString.includes('T')) {
                        // Extract just the date part if it's a full datetime
                        dateString = dateString.split('T')[0];
                    }
                    const startDate = new Date(dateString);
                    console.log('Parsed date:', startDate);
                    
                    if (isNaN(startDate.getTime())) {
                        console.error('Invalid date from API:', dbData.startDate);
                        setLastPeriodStart(null);
                    } else {
                        setLastPeriodStart(startDate);
                    }
                } catch (error) {
                    console.error('Error parsing date:', error);
                    setLastPeriodStart(null);
                }
            } else {
                console.log('Không có dữ liệu chu kỳ trong DB - form trống');
                // Clear all form data - no fallback to default values
                setMenstrualCycleFromDB(null);
                setCycleLength('');
                setPeriodLength('');
                setLastPeriodStart(null);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu chu kỳ từ API:', error);
            setError('Không thể tải dữ liệu chu kỳ. Vui lòng thử lại sau.');
            // Clear all data on error - no fallback
            setMenstrualCycleFromDB(null);
            setCycleLength('');
            setPeriodLength('');
            setLastPeriodStart(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Save menstrual cycle data to API
    const saveMenstrualCycleToAPI = async () => {
        if (!currentUserId || !lastPeriodStart || !cycleLength || !periodLength) {
            console.log('Thiếu thông tin: Vui lòng điền đầy đủ thông tin trước khi lưu.');
            showNotification('error', 'Vui lòng điền đầy đủ thông tin trước khi lưu');
            setFormStatus({
                message: 'Vui lòng điền đầy đủ thông tin trước khi lưu',
                type: 'error'
            });
            return;
        }

        // Validate date
        if (isNaN(lastPeriodStart.getTime())) {
            console.log('Lỗi: Ngày bắt đầu kỳ kinh không hợp lệ.');
            showNotification('error', 'Ngày bắt đầu kỳ kinh không hợp lệ');
            setFormStatus({
                message: 'Ngày bắt đầu kỳ kinh không hợp lệ',
                type: 'error'
            });
            return;
        }

        try {
            setIsSaving(true);
            setFormStatus({
                message: 'Đang lưu cài đặt...',
                type: 'info'
            });
            
            const cycleData = {
                customerID: currentUserId,
                startDate: lastPeriodStart.toISOString().split('T')[0],
                periodLength: typeof periodLength === 'number' ? periodLength : parseInt(String(periodLength)),
                cycleLength: typeof cycleLength === 'number' ? cycleLength : parseInt(String(cycleLength))
            };

            console.log('Đang lưu dữ liệu chu kỳ:', cycleData);

            let response;
            
            if (menstrualCycleFromDB?.menstrualCycleID) {
                // Update existing cycle
                const updateData: UpdateMenstrualCycleRequest = {
                    menstrualCycleID: menstrualCycleFromDB.menstrualCycleID,
                    ...cycleData
                };
                response = await menstrualCycleAPI.updateMenstrualCycle(updateData);
            } else {
                // Create new cycle
                const createData: CreateMenstrualCycleRequest = cycleData;
                response = await menstrualCycleAPI.createMenstrualCycle(createData);
            }

            if (response.statusCode === 200) {
                if (response.data) {
                    setMenstrualCycleFromDB(response.data);
                    console.log('Đã lưu cài đặt thành công!', response.data);
                    showNotification('success', 'Đã lưu cài đặt chu kỳ thành công!');
                    setFormStatus({
                        message: 'Đã lưu cài đặt chu kỳ thành công!',
                        type: 'success'
                    });
                } else {
                    console.log('Đã lưu cài đặt thành công!');
                    showNotification('success', 'Đã lưu cài đặt chu kỳ thành công!');
                    setFormStatus({
                        message: 'Đã lưu cài đặt chu kỳ thành công!',
                        type: 'success'
                    });
                }
            } else {
                console.error('Có lỗi xảy ra khi lưu dữ liệu:', response);
                showNotification('error', 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
                setFormStatus({
                    message: 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu chu kỳ:', error);
            showNotification('error', 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
            setFormStatus({
                message: 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
            
            // Clear form status after 5 seconds
            setTimeout(() => {
                setFormStatus({
                    message: '',
                    type: null
                });
            }, 5000);
        }
    };

    // Reset to database data only
    const resetToDBData = async () => {
        if (!currentUserId) {
            console.log('Không thể tải dữ liệu: Không tìm thấy thông tin người dùng.');
            showNotification('error', 'Không thể tải dữ liệu: Không tìm thấy thông tin người dùng');
            setFormStatus({
                message: 'Không thể tải dữ liệu: Không tìm thấy thông tin người dùng',
                type: 'error'
            });
            return;
        }

        console.log('Đang tải lại dữ liệu từ cơ sở dữ liệu...');
        showNotification('info', 'Đang tải lại dữ liệu từ cơ sở dữ liệu...');
        setFormStatus({
            message: 'Đang tải lại dữ liệu từ cơ sở dữ liệu...',
            type: 'info'
        });
        
        try {
            await loadMenstrualCycleFromAPI(currentUserId);
            await loadCyclePredictionData(currentUserId);
            console.log('Đã tải lại dữ liệu từ cơ sở dữ liệu thành công.');
            showNotification('success', 'Đã tải lại dữ liệu từ cơ sở dữ liệu thành công');
            setFormStatus({
                message: 'Đã tải lại dữ liệu từ cơ sở dữ liệu thành công',
                type: 'success'
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showNotification('error', 'Có lỗi xảy ra khi tải dữ liệu');
            setFormStatus({
                message: 'Có lỗi xảy ra khi tải dữ liệu',
                type: 'error'
            });
        }
        
        // Clear form status after 5 seconds
        setTimeout(() => {
            setFormStatus({
                message: '',
                type: null
            });
        }, 5000);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Get current user ID from auth system only
        const userId = authUtils.getCurrentUserId();
        
        if (userId) {
            setCurrentUserId(userId);
            // Only load from API - no default/sample data
            loadMenstrualCycleFromAPI(userId);
            // Note: loadCyclePredictionData is now called when currentUserId changes
        } else {
            console.log('Không có user ID - không thể tải dữ liệu');
            // Clear everything if no user
            setCurrentUserId(null);
            setCycleLength('');
            setPeriodLength('');
            setLastPeriodStart(null);
            setCyclePhases({
                periodDates: [],
                fertileDates: [],
                ovulationDates: [],
                nextPeriodDates: []
            });
        }
    }, [])

    // Function to get cycle status for a date based on API prediction data
    const getPredictedStatus = (date: Date): CycleStatus => {
        // Compare dates without time
        const compareDate = (date1: Date, date2: Date): boolean => {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        };
        
        // First check if date is in any of the API-based phases
        // Check if date is an ovulation day
        if (cyclePhases.ovulationDates.some(d => compareDate(d, date))) {
            return 'ovulation';
        }
        
        // Check if date is a period day
        if (cyclePhases.periodDates.some(d => compareDate(d, date))) {
            return 'period';
        }
        
        // Check if date is a fertile day (excluding ovulation days which take precedence)
        if (cyclePhases.fertileDates.some(d => compareDate(d, date))) {
            return 'fertile';
        }
        
        // Check if date is a next period day
        if (cyclePhases.nextPeriodDates.some(d => compareDate(d, date))) {
            return 'next-period';
        }
        
        // If we don't have API prediction data, fall back to calculation based on user input
        if (cyclePhases.periodDates.length === 0 && lastPeriodStart && cycleLength && periodLength) {
            // Validate date objects
            if (isNaN(date.getTime()) || isNaN(lastPeriodStart.getTime())) {
                return 'none';
            }
            
            const cycleLen = typeof cycleLength === 'number' ? cycleLength : parseInt(String(cycleLength));
            const periodLen = typeof periodLength === 'number' ? periodLength : parseInt(String(periodLength));
            
            // Validate parsed numbers
            if (isNaN(cycleLen) || isNaN(periodLen) || cycleLen <= 0 || periodLen <= 0) {
                return 'none';
            }

            // Calculate days since period start
            const daysSincePeriodStart = Math.floor((date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
            
            // For multiple cycles, find which cycle we're in
            const cycleNumber = Math.floor(daysSincePeriodStart / cycleLen);
            const dayInCurrentCycle = daysSincePeriodStart - (cycleNumber * cycleLen);
            
            // Handle future cycles too
            let adjustedDayInCycle = dayInCurrentCycle;
            if (adjustedDayInCycle < 0) {
                // For past dates
                adjustedDayInCycle = cycleLen + (daysSincePeriodStart % cycleLen);
            }
            
            // Period days (days 0 to periodLen-1)
            if (adjustedDayInCycle >= 0 && adjustedDayInCycle < periodLen) {
                return 'period';
            }
            
            // Ovulation typically occurs 14 days before next period
            const ovulationDay = cycleLen - 14;
            if (adjustedDayInCycle >= ovulationDay - 1 && adjustedDayInCycle <= ovulationDay + 1) {
                return 'ovulation';
            }
            
            // Fertile window: 5 days before ovulation through 1 day after
            const fertileStart = Math.max(0, ovulationDay - 5);
            const fertileEnd = ovulationDay + 1;
            if (adjustedDayInCycle >= fertileStart && adjustedDayInCycle <= fertileEnd) {
                return 'fertile';
            }
        }
        
        return 'none';
    }

    // Custom tile content for the calendar - prioritizes API data, falls back to calculations
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null
        
        // Always return a minimal div for empty days to ensure layout consistency
        const emptyContent = <div className="tile-content empty-day"></div>
        
        // Get prediction status (this now handles both API data and manual calculations)
        const predictedStatus = getPredictedStatus(date);
        
        // Return empty content if no prediction is available
        if (predictedStatus === 'none') {
            return emptyContent;
        }
        
        let className = ''
        let content = ''
        
        switch (predictedStatus) {
            case 'period':
                className = 'period-day'
                content = '🩸'
                break
            case 'ovulation':
                className = 'ovulation-day'
                content = '⭐'
                break
            case 'fertile':
                className = 'fertile-day'
                content = '🌿'
                break
            case 'next-period':
                className = 'next-period-day'
                content = '�'
                break
            default:
                return emptyContent;
        }
        
        return (
            <div className={`tile-content ${className}`}>
                <span className="status-icon">{content}</span>
            </div>
        )
    }

    // Thêm nút thông báo nổi (bell) ở góc phải
    const [showNotificationList, setShowNotificationList] = useState(false);
    const unreadCount = notifications.length;

    return (
        <div className="cycle-tracker">
            {/* Notification bell button */}
            <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
                <button
                    style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        cursor: 'pointer',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28
                    }}
                    aria-label="Thông báo"
                    onClick={() => setShowNotificationList(v => !v)}
                >
                    <FaInfoCircle color="#6366f1" />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>{unreadCount}</span>
                    )}
                </button>
                {/* Notification popup list */}
                {showNotificationList && (
                    <div style={{
                        position: 'absolute',
                        bottom: 70,
                        right: 0,
                        width: 320,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        padding: 16,
                        maxHeight: 400,
                        overflowY: 'auto'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Thông báo của bạn</div>
                        {notifications.length === 0 ? (
                            <div style={{ color: '#6b7280', fontSize: 14 }}>Không có thông báo nào.</div>
                        ) : (
                            notifications.slice().reverse().map(n => (
                                <div key={n.id} style={{
                                    background: '#f3f4f6',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: 15
                                }}>
                                    <span>{n.message}</span>
                                    <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }} onClick={() => removeNotification(n.id)}><FaTimes /></button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {/* Notification system */}
            <div className="notification-container">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        message={notification.message}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
            <div className="cycle-tracker-container">
                <h1 className="cycle-tracker-title">Theo Dõi Chu Kỳ Kinh Nguyệt</h1>
                
                <div className="main-layout">
                    {/* Phần bên trái - CHỈ Cài đặt thông tin từ API */}
                    <div className="settings-panel">
                        <h3>Cài Đặt Theo Dõi Chu Kỳ</h3>
                        
                        {isLoading && (
                            <div className="loading-indicator">
                                <FaSpinner className="spinner" />
                                <span>Đang tải dữ liệu từ API...</span>
                            </div>
                        )}
                        
                        {error && (
                            <div className="error-message" style={{ 
                                backgroundColor: '#fef2f2', 
                                border: '1px solid #fecaca', 
                                color: '#dc2626', 
                                padding: '12px', 
                                borderRadius: '8px', 
                                marginBottom: '16px' 
                            }}>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {!currentUserId && !isLoading && (
                            <div className="no-user-message">
                                <p>Vui lòng đăng nhập để sử dụng tính năng theo dõi chu kỳ.</p>
                            </div>
                        )}
                        
                        {currentUserId && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cycleLength">Độ dài chu kỳ (ngày):</label>
                                    <input
                                        type="number"
                                        id="cycleLength"
                                        min="21"
                                        max="35"
                                        value={cycleLength}
                                        placeholder="Nhập độ dài chu kỳ (21-35 ngày)"
                                        onChange={(e) => setCycleLength(e.target.value ? parseInt(e.target.value) : '')}
                                        disabled={isLoading || isSaving}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="periodLength">Độ dài kinh nguyệt (ngày):</label>
                                    <input
                                        type="number"
                                        id="periodLength"
                                        min="3"
                                        max="7"
                                        value={periodLength}
                                        placeholder="Nhập độ dài kinh nguyệt (3-7 ngày)"
                                        onChange={(e) => setPeriodLength(e.target.value ? parseInt(e.target.value) : '')}
                                        disabled={isLoading || isSaving}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="lastPeriodStart">Ngày bắt đầu kỳ kinh cuối:</label>
                                    <input
                                        type="date"
                                        id="lastPeriodStart"
                                        value={lastPeriodStart ? lastPeriodStart.toISOString().split('T')[0] : ''}
                                        onChange={(e) => setLastPeriodStart(e.target.value ? new Date(e.target.value) : null)}
                                        disabled={isLoading || isSaving}
                                    />
                                </div>
                                
                                {/* Form status message */}
                                {formStatus.type && formStatus.message && (
                                    <div className={`form-status form-status-${formStatus.type}`}>
                                        {formStatus.type === 'success' && <FaCheck />}
                                        {formStatus.type === 'error' && <FaExclamationCircle />}
                                        {formStatus.type === 'info' && <FaInfoCircle />}
                                        <span>{formStatus.message}</span>
                                    </div>
                                )}
                                
                                <div className="form-actions">
                                    <div className="settings-buttons">
                                        <button 
                                            className={`btn ${!lastPeriodStart || !cycleLength || !periodLength || isLoading || isSaving ? 'btn-disabled' : 'btn-save'}`}
                                            onClick={saveMenstrualCycleToAPI}
                                            disabled={!lastPeriodStart || !cycleLength || !periodLength || isLoading || isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <FaSpinner className="spinner" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave />
                                                    Lưu Cài Đặt Chu Kỳ
                                                </>
                                            )}
                                        </button>
                                        
                                        <button 
                                            className={`btn ${!currentUserId || isLoading || isSaving ? 'btn-disabled' : 'btn-reset'}`}
                                            onClick={resetToDBData}
                                            disabled={!currentUserId || isLoading || isSaving}
                                        >
                                            <FaSync />
                                            Tải Lại Dữ Liệu
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Phần bên phải - Lịch và Hướng dẫn cạnh nhau */}
                    <div className="calendar-panel">
                        <div className="calendar-main-content">
                            {/* Lịch theo dõi chu kỳ - bên TRÁI */}
                            <div className="calendar-section">
                                <h2>Lịch Theo Dõi Chu Kỳ</h2>
                                {currentUserId ? (
                                    <>
                                        {cyclePhases.periodDates.length > 0 ? (
                                            <div className="calendar-info">
                                                <p>Hiển thị dự đoán dựa trên dữ liệu</p>
                                                {isPredictionLoading && (
                                                    <div className="loading-indicator-inline">
                                                        <FaSpinner className="fa-spin" style={{fontSize: '14px'}} /> 
                                                        <span>Đang tải dữ liệu dự đoán...</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : lastPeriodStart && cycleLength && periodLength ? (
                                            <div className="calendar-info">
                                                <p>Hiển thị dự đoán dựa trên dữ liệu nhập</p>
                                                <small>(Lưu cài đặt để tạo dự đoán từ API)</small>
                                            </div>
                                        ) : (
                                            <div className="calendar-info">
                                                <p>Vui lòng nhập đầy đủ thông tin để xem dự đoán chu kỳ</p>
                                            </div>
                                        )}
                                        <div className="calendar-wrapper">
                                            <Calendar
                                                tileContent={tileContent}
                                                className="large-calendar"
                                                locale="vi-VN"
                                                calendarType="iso8601"
                                                showNeighboringMonth={true}
                                                showFixedNumberOfWeeks={true}
                                                formatShortWeekday={(_, date) => {
                                                    // Return Vietnamese day abbreviation (T2-CN)
                                                    return viDaysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
                                                }}
                                                view="month"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="calendar-placeholder">
                                        <p>Đăng nhập để xem lịch theo dõi chu kỳ</p>
                                    </div>
                                )}
                            </div>

                            {/* Hướng dẫn sử dụng - bên PHẢI của lịch */}
                            <div className="calendar-guide">
                                <h4>Hướng dẫn sử dụng:</h4>
                                <ul>
                                    <li>
                                        <div className="guide-indicator-wrapper">
                                            <div className="guide-color period-color-sample">
                                                <span className="status-icon">🩸</span>
                                            </div>
                                            <span>Kỳ kinh nguyệt hiện tại</span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="guide-indicator-wrapper">
                                            <div className="guide-color ovulation-color-sample">
                                                <span className="status-icon">⭐</span>
                                            </div>
                                            <span>Ngày rụng trứng</span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="guide-indicator-wrapper">
                                            <div className="guide-color fertile-color-sample">
                                                <span className="status-icon">🌿</span>
                                            </div>
                                            <span>Thời kỳ dễ thụ thai</span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="guide-indicator-wrapper">
                                            <div className="guide-color next-period-color-sample">
                                                <span className="status-icon">�</span>
                                            </div>
                                            <span>Kỳ kinh nguyệt tiếp theo</span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="guide-note">
                                    <p><strong>Lưu ý:</strong></p>
                                    <ul>
                                        <li>Dự đoán dựa trên dữ liệu cá nhân</li>
                                        <li>Chỉ mang tính chất tham khảo</li>
                                        <li>Nên tham khảo ý kiến bác sĩ</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CycleTracker;
