import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './CycleTracker.css'
import { FaCalendarAlt, FaChartLine, FaInfoCircle, FaBell, FaTimes, FaSave, FaRegCircle, FaCheckCircle, FaTrash } from 'react-icons/fa'

// Status types for cycle tracking
type CycleStatus = 'period' | 'fertile' | 'ovulation' | 'none'

// Data structure for storing cycle information
interface CycleData {
    date: string // ISO string format
    status: CycleStatus
    notes: string
    symptoms: string[]
    flow?: 'light' | 'medium' | 'heavy' | null
}

const CycleTracker: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [cycleData, setCycleData] = useState<CycleData[]>([])
    const [currentData, setCurrentData] = useState<CycleData>({
        date: '',
        status: 'none',
        notes: '',
        symptoms: [],
        flow: null
    })
    const [activeTab, setActiveTab] = useState('calendar')
    const [cycleLength, setCycleLength] = useState(28)
    const [periodLength, setPeriodLength] = useState(5)
    const [lastPeriodStart, setLastPeriodStart] = useState<Date | null>(null)

    // Common symptoms list
    const commonSymptoms = [
        'Đau bụng', 'Đau đầu', 'Đầy hơi', 'Mệt mỏi', 
        'Thay đổi tâm trạng', 'Đau ngực', 'Đau lưng', 'Mụn'
    ]

    // Generate sample data for demonstration
    const generateSampleData = () => {
        // Tạo dữ liệu mẫu hợp lý hơn
        // Tính toán ngày bắt đầu chu kỳ gần nhất để hiển thị trên lịch hiện tại
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Chu kỳ gần nhất (đang diễn ra hoặc vừa kết thúc)
        const lastPeriodDate = new Date(currentYear, currentMonth, 3); // Ngày 3 của tháng hiện tại
        
        // Chu kỳ trước đó
        const previousPeriodDate = new Date(lastPeriodDate);
        previousPeriodDate.setDate(previousPeriodDate.getDate() - 28);
        
        // Chu kỳ trước nữa
        const olderPeriodDate = new Date(previousPeriodDate);
        olderPeriodDate.setDate(olderPeriodDate.getDate() - 28);
        
        // Sample data array
        const sampleData: CycleData[] = [];
        
        // Thêm dữ liệu cho chu kỳ cũ nhất (đã hoàn thành)
        for (let i = 0; i < 5; i++) {
            const currentDate = new Date(olderPeriodDate);
            currentDate.setDate(olderPeriodDate.getDate() + i);
            
            // Cường độ kinh nguyệt theo ngày
            let flow: 'light' | 'medium' | 'heavy' | null = 'medium';
            if (i === 0) flow = 'light';
            if (i === 1 || i === 2) flow = 'heavy';
            if (i === 4) flow = 'light';
            
            // Triệu chứng phù hợp với từng ngày
            const daySymptoms = [];
            if (i < 3) daySymptoms.push('Đau bụng');
            if (i === 1 || i === 2) daySymptoms.push('Đau đầu');
            if (i > 0 && i < 4) daySymptoms.push('Đầy hơi');
            if (i < 3) daySymptoms.push('Mệt mỏi');
            
            sampleData.push({
                date: currentDate.toISOString(),
                status: 'period',
                notes: i === 0 ? 'Chu kỳ bắt đầu. Đau bụng nhẹ.' : 
                      i === 1 ? 'Đau bụng nhiều, uống thuốc giảm đau.' :
                      i === 2 ? 'Vẫn đau bụng và đau đầu.' : '',
                symptoms: daySymptoms,
                flow
            });
        }
        
        // Thêm dữ liệu cho chu kỳ trước (đã hoàn thành)
        for (let i = 0; i < 5; i++) {
            const currentDate = new Date(previousPeriodDate);
            currentDate.setDate(previousPeriodDate.getDate() + i);
            
            // Cường độ kinh nguyệt
            let flow: 'light' | 'medium' | 'heavy' | null = 'medium';
            if (i === 0) flow = 'light';
            if (i === 1 || i === 2) flow = 'heavy';
            if (i === 4) flow = 'light';
            
            // Triệu chứng
            const daySymptoms = [];
            if (i < 2) daySymptoms.push('Đau bụng');
            if (i === 1) daySymptoms.push('Đau đầu');
            if (i > 0 && i < 4) daySymptoms.push('Đầy hơi');
            if (i < 2) daySymptoms.push('Thay đổi tâm trạng');
            
            sampleData.push({
                date: currentDate.toISOString(),
                status: 'period',
                notes: i === 0 ? 'Chu kỳ bắt đầu, nhẹ hơn tháng trước.' : 
                      i === 1 ? 'Đau bụng nhiều, khó tập trung làm việc.' : '',
                symptoms: daySymptoms,
                flow
            });
        }
        
        // Thêm dữ liệu cho chu kỳ hiện tại (đang diễn ra)
        const currentPeriodLength = Math.min(today.getDate() - lastPeriodDate.getDate() + 1, 5);
        for (let i = 0; i < currentPeriodLength; i++) {
            const currentDate = new Date(lastPeriodDate);
            currentDate.setDate(lastPeriodDate.getDate() + i);
            
            // Cường độ kinh nguyệt
            let flow: 'light' | 'medium' | 'heavy' | null = 'medium';
            if (i === 0) flow = 'light';
            if (i === 1) flow = 'heavy';
            if (i >= 3) flow = 'light';
            
            // Triệu chứng
            const daySymptoms = [];
            if (i < 2) daySymptoms.push('Đau bụng');
            if (i === 1) daySymptoms.push('Mệt mỏi');
            if (i === 1) daySymptoms.push('Đầy hơi');
            if (i === 0) daySymptoms.push('Thay đổi tâm trạng');
            
            sampleData.push({
                date: currentDate.toISOString(),
                status: 'period',
                notes: i === 0 ? 'Chu kỳ bắt đầu. Cảm thấy mệt mỏi và thay đổi tâm trạng.' : 
                      i === 1 ? 'Đau bụng dữ dội, cần nghỉ ngơi nhiều hơn.' : '',
                symptoms: daySymptoms,
                flow
            });
        }
        
        // Thêm dữ liệu về thời kỳ rụng trứng của chu kỳ trước
        const ovulationDate = new Date(previousPeriodDate);
        ovulationDate.setDate(previousPeriodDate.getDate() + 14);
        
        sampleData.push({
            date: ovulationDate.toISOString(),
            status: 'ovulation',
            notes: 'Ngày rụng trứng. Cảm thấy đau nhẹ ở bụng dưới bên phải.',
            symptoms: ['Cramps'],
            flow: null
        });
        
        // Thêm dữ liệu về cửa sổ thụ thai xung quanh ngày rụng trứng
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue; // Bỏ qua ngày rụng trứng vì đã thêm ở trên
            
            const fertileDate = new Date(ovulationDate);
            fertileDate.setDate(ovulationDate.getDate() + i);
            
            sampleData.push({
                date: fertileDate.toISOString(),
                status: 'fertile',
                notes: i < 0 ? 'Thời kỳ dễ thụ thai trước rụng trứng.' : 'Thời kỳ dễ thụ thai sau rụng trứng.',
                symptoms: [],
                flow: null
            });
        }
        
        return {
            data: sampleData,
            lastPeriod: lastPeriodDate
        };
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Try to load data from localStorage first
        const savedData = localStorage.getItem('cycleData');
        const savedCycleLength = localStorage.getItem('cycleLength');
        const savedPeriodLength = localStorage.getItem('periodLength');
        const savedLastPeriod = localStorage.getItem('lastPeriodStart');
        
        // If we have saved data, use it
        if (savedData && savedCycleLength && savedPeriodLength && savedLastPeriod) {
            setCycleData(JSON.parse(savedData));
            setCycleLength(parseInt(savedCycleLength));
            setPeriodLength(parseInt(savedPeriodLength));
            setLastPeriodStart(new Date(savedLastPeriod));
        } else {
            // Otherwise, initialize with sample data
            const { data, lastPeriod } = generateSampleData();
            setCycleData(data);
            setLastPeriodStart(lastPeriod);
        }
    }, [])

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (cycleData.length > 0) {
            localStorage.setItem('cycleData', JSON.stringify(cycleData))
        }
        
        if (cycleLength) {
            localStorage.setItem('cycleLength', cycleLength.toString())
        }
        
        if (periodLength) {
            localStorage.setItem('periodLength', periodLength.toString())
        }
        
        if (lastPeriodStart) {
            localStorage.setItem('lastPeriodStart', lastPeriodStart.toISOString())
        }
    }, [cycleData, cycleLength, periodLength, lastPeriodStart])

    const handleDayClick = (date: Date) => {
        setSelectedDate(date)
        
        // Check if we already have data for this date
        const dateString = date.toISOString().split('T')[0]
        const existingData = cycleData.find(data => data.date.startsWith(dateString))
        
        if (existingData) {
            setCurrentData(existingData)
        } else {
            setCurrentData({
                date: date.toISOString(),
                status: 'none',
                notes: '',
                symptoms: [],
                flow: null
            })
        }
        
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedDate(null)
    }

    const handleSave = () => {
        if (!selectedDate) return
        
        // Update or add the current data
        const dateString = selectedDate.toISOString().split('T')[0]
        const updatedData = cycleData.filter(data => !data.date.startsWith(dateString))
        
        // Only save if there's actual data
        if (currentData.status !== 'none' || currentData.notes || currentData.symptoms.length > 0 || currentData.flow) {
            updatedData.push(currentData)
            setCycleData(updatedData)
            
            // If this is a period start, update the last period start date
            if (currentData.status === 'period' && currentData.flow) {
                setLastPeriodStart(selectedDate)
            }
        }
        
        setShowModal(false)
        setSelectedDate(null)
    }

    const handleDeleteData = () => {
        if (!selectedDate) return
        
        // Xác nhận trước khi xóa
        if (window.confirm('Bạn có chắc chắn muốn xóa dữ liệu cho ngày này không?')) {
            const dateString = selectedDate.toISOString().split('T')[0]
            
            // Lọc ra dữ liệu không thuộc ngày đang chọn
            const updatedData = cycleData.filter(data => !data.date.startsWith(dateString))
            setCycleData(updatedData)
            
            // Lưu vào localStorage
            localStorage.setItem('cycleData', JSON.stringify(updatedData))
            
            // Đóng modal
            setShowModal(false)
            setSelectedDate(null)
        }
    }

    const handleResetToSampleData = () => {
        // Reset to sample data
        const { data, lastPeriod } = generateSampleData();
        setCycleData(data);
        setLastPeriodStart(lastPeriod);
        
        // Save to localStorage
        localStorage.setItem('cycleData', JSON.stringify(data));
        localStorage.setItem('cycleLength', cycleLength.toString());
        localStorage.setItem('periodLength', periodLength.toString());
        localStorage.setItem('lastPeriodStart', lastPeriod.toISOString());
        
        // Show confirmation
        alert('Dữ liệu đã được đặt lại về dữ liệu mẫu để minh họa.');
    };

    const toggleSymptom = (symptom: string) => {
        if (currentData.symptoms.includes(symptom)) {
            setCurrentData({
                ...currentData,
                symptoms: currentData.symptoms.filter(s => s !== symptom)
            })
        } else {
            setCurrentData({
                ...currentData,
                symptoms: [...currentData.symptoms, symptom]
            })
        }
    }

    // Function to predict cycle phases based on last period
    const getPredictedStatus = (date: Date): CycleStatus => {
        if (!lastPeriodStart) return 'none'
        
        const dayDiff = Math.floor((date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24))
        const dayInCycle = ((dayDiff % cycleLength) + cycleLength) % cycleLength
        
        if (dayInCycle < periodLength) {
            return 'period'
        } else if (dayInCycle >= cycleLength - 14 - 2 && dayInCycle <= cycleLength - 14 + 2) {
            return 'ovulation'
        } else if (dayInCycle >= cycleLength - 19 && dayInCycle <= cycleLength - 9) {
            return 'fertile'
        }
        
        return 'none'
    }

    // Custom tile content for the calendar
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null
        
        const dateString = date.toISOString().split('T')[0]
        const existingData = cycleData.find(data => data.date.startsWith(dateString))
        const predictedStatus = getPredictedStatus(date)
        
        // If we have actual data, show that, otherwise show prediction
        const status = existingData?.status || predictedStatus
        
        let className = ''
        switch (status) {
            case 'period':
                className = 'period-day'
                break
            case 'fertile':
                className = 'fertile-day'
                break
            case 'ovulation':
                className = 'ovulation-day'
                break
            default:
                className = ''
        }
        
        return (
            <div className={`day-marker ${className} ${existingData ? 'has-data' : ''}`}>
                {existingData?.symptoms.length ? <div className="symptom-indicator"></div> : null}
                {existingData && <div className="data-indicator"></div>}
            </div>
        )
    }

    // Generate next predicted periods
    const getNextPeriods = () => {
        if (!lastPeriodStart) return []
        
        const periods = []
        const today = new Date()
        
        for (let i = 0; i < 3; i++) {
            const nextPeriod = new Date(lastPeriodStart)
            nextPeriod.setDate(nextPeriod.getDate() + cycleLength * (i + 1))
            
            if (nextPeriod > today) {
                periods.push({
                    start: new Date(nextPeriod),
                    end: new Date(new Date(nextPeriod).setDate(nextPeriod.getDate() + periodLength - 1))
                })
            }
        }
        
        return periods
    }

    return (
        <div className="cycle-tracker-container">
            <h1 className="cycle-tracker-title">Theo Dõi Chu Kỳ Sinh Sản</h1>
            
            <div className="cycle-tracker-tabs">
                <button 
                    className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    <FaCalendarAlt /> Lịch
                </button>
                <button 
                    className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                >
                    <FaChartLine /> Phân Tích
                </button>
                <button 
                    className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    <FaBell /> Dự Đoán
                </button>
                <button 
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <FaInfoCircle /> Cài Đặt
                </button>
            </div>
            
            <div className="cycle-tracker-content">
                {activeTab === 'calendar' && (
                    <div className="calendar-section">
                        <div className="calendar-guide">
                            <h4>Hướng dẫn sử dụng:</h4>
                            <ul>
                                <li><span className="guide-color period-color-sample"></span> Dự đoán ngày có kinh nguyệt</li>
                                <li><span className="guide-color fertile-color-sample"></span> Dự đoán thời kỳ dễ thụ thai</li>
                                <li><span className="guide-color ovulation-color-sample"></span> Dự đoán ngày rụng trứng</li>
                            
                                <li>
                                    <div className="guide-indicator-wrapper">
                                        <div className="guide-indicator">
                                            <div className="data-indicator"></div>
                                        </div> 
                                        Ngày đã có dữ liệu
                                    </div>
                                </li>
                                <li>
                                    <div className="guide-indicator-wrapper">
                                        <div className="guide-indicator">
                                            <div className="symptom-indicator"></div>
                                        </div> 
                                        Ngày có ghi nhận triệu chứng
                                    </div>
                                </li>
                            </ul>
                            <p className="guide-tip">Nhấp vào bất kỳ ngày nào để thêm hoặc chỉnh sửa thông tin.</p>
                        </div>
                        
            <div className="calendar-wrapper">
                            <Calendar 
                                onClickDay={handleDayClick} 
                                className="large-calendar" 
                                tileContent={tileContent}
                            />
                        </div>
                    </div>
                )}
                
                {activeTab === 'insights' && (
                    <div className="insights-section">
                        <h3>Phân Tích Chu Kỳ</h3>
                        {cycleData.length > 0 ? (
                            <div className="insights-content">
                                <div className="insights-stats">
                                    <div className="stat-card">
                                        <h4>Độ Dài Chu Kỳ Trung Bình</h4>
                                        <p className="stat-value">{cycleLength} ngày</p>
                                    </div>
                                    <div className="stat-card">
                                        <h4>Thời Gian Hành Kinh Trung Bình</h4>
                                        <p className="stat-value">{periodLength} ngày</p>
                                    </div>
                                </div>
                                
                                <div className="insights-history">
                                    <h4>Lịch Sử Gần Đây</h4>
                                    <div className="history-list">
                                        {cycleData
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .slice(0, 5)
                                            .map((data, index) => {
                                                // Dịch trạng thái sang tiếng Việt
                                                let statusText = '';
                                                switch(data.status) {
                                                    case 'period':
                                                        statusText = 'Kinh nguyệt';
                                                        break;
                                                    case 'fertile':
                                                        statusText = 'Dễ thụ thai';
                                                        break;
                                                    case 'ovulation':
                                                        statusText = 'Rụng trứng';
                                                        break;
                                                    default:
                                                        statusText = 'Không xác định';
                                                }
                                                
                                                // Dịch cường độ kinh nguyệt
                                                let flowText = '';
                                                if (data.flow) {
                                                    switch(data.flow) {
                                                        case 'light':
                                                            flowText = 'nhẹ';
                                                            break;
                                                        case 'medium':
                                                            flowText = 'vừa';
                                                            break;
                                                        case 'heavy':
                                                            flowText = 'nặng';
                                                            break;
                                                    }
                                                }
                                                
                                                return (
                                                    <div key={index} className="history-item">
                                                        <div className="history-date">
                                                            {new Date(data.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="history-details">
                                                            <div className="history-status">
                                                                {statusText}
                                                                {data.flow ? ` (mức độ ${flowText})` : ''}
                                                            </div>
                                                            {data.symptoms.length > 0 && (
                                                                <div className="history-symptoms">
                                                                    Triệu chứng: {data.symptoms.join(', ')}
                                                                </div>
                                                            )}
                                                            {data.notes && (
                                                                <div className="history-notes">
                                                                    Ghi chú: {data.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data-message">
                                Bắt đầu theo dõi chu kỳ của bạn để xem phân tích tại đây.
                            </p>
                        )}
                    </div>
                )}
                
                {activeTab === 'predictions' && (
                    <div className="predictions-section">
                        <h3>Dự Đoán Chu Kỳ</h3>
                        {lastPeriodStart ? (
                            <div className="predictions-content">
                                <div className="next-periods">
                                    <h4>Chu Kỳ Sắp Tới</h4>
                                    {getNextPeriods().map((period, index) => (
                                        <div key={index} className="prediction-card period-prediction">
                                            <div className="prediction-icon period-icon"></div>
                                            <div className="prediction-details">
                                                <div className="prediction-title">Chu kỳ #{index + 1}</div>
                                                <div className="prediction-dates">
                                                    {period.start.toLocaleDateString()} - {period.end.toLocaleDateString()}
                                                </div>
                                                <div className="days-away">
                                                    {Math.ceil((period.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày nữa
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="fertility-window">
                                    <h4>Thời Kỳ Dễ Thụ Thai</h4>
                                    {getNextPeriods().map((period, index) => {
                                        const ovulationDate = new Date(period.start)
                                        ovulationDate.setDate(ovulationDate.getDate() - 14)
                                        
                                        const fertileStart = new Date(ovulationDate)
                                        fertileStart.setDate(fertileStart.getDate() - 5)
                                        
                                        const fertileEnd = new Date(ovulationDate)
                                        fertileEnd.setDate(fertileEnd.getDate() + 5)
                                        
                                        return (
                                            <div key={index} className="prediction-card fertile-prediction">
                                                <div className="prediction-icon fertile-icon"></div>
                                                <div className="prediction-details">
                                                    <div className="prediction-title">Thời kỳ dễ thụ thai #{index + 1}</div>
                                                    <div className="prediction-dates">
                                                        {fertileStart.toLocaleDateString()} - {fertileEnd.toLocaleDateString()}
                                                    </div>
                                                    <div className="ovulation-date">
                                                        Rụng trứng khoảng: {ovulationDate.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="no-data-message">
                                Vui lòng thiết lập ngày bắt đầu chu kỳ gần nhất trong phần Cài Đặt để xem dự đoán.
                            </p>
                        )}
                    </div>
                )}
                
                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h3>Cài Đặt Theo Dõi</h3>
                        
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Độ Dài Chu Kỳ Trung Bình (ngày)</label>
                                <input 
                                    type="number" 
                                    min="21" 
                                    max="35"
                                    value={cycleLength}
                                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                                    className="settings-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Thời Gian Hành Kinh Trung Bình (ngày)</label>
                                <input 
                                    type="number" 
                                    min="2" 
                                    max="10"
                                    value={periodLength}
                                    onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                                    className="settings-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Ngày Bắt Đầu Chu Kỳ Gần Nhất</label>
                                <input 
                                    type="date" 
                                    value={lastPeriodStart ? lastPeriodStart.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setLastPeriodStart(new Date(e.target.value))}
                                    className="settings-input"
                                />
                            </div>
                            
                            <button 
                                className="save-settings-btn"
                                onClick={() => {
                                    localStorage.setItem('cycleLength', cycleLength.toString());
                                    localStorage.setItem('periodLength', periodLength.toString());
                                    if (lastPeriodStart) {
                                        localStorage.setItem('lastPeriodStart', lastPeriodStart.toISOString());
                                    }
                                    alert('Đã lưu cài đặt thành công!');
                                }}
                            >
                                <FaSave /> Lưu Cài Đặt
                            </button>
                            
                            <button 
                                className="reset-data-btn"
                                onClick={handleResetToSampleData}
                                style={{
                                    background: '#f87171',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    marginTop: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                <FaTrash /> Đặt lại dữ liệu mẫu
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {showModal && selectedDate && (
                <div className="cycle-modal-overlay">
                    <div className={`cycle-modal ${cycleData.find(data => data.date.startsWith(selectedDate.toISOString().split('T')[0])) ? 'has-existing-data' : ''}`}>
                        <div className="modal-header">
                            <h3>Ghi Lại Chu Kỳ</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-date">
                            {selectedDate.toLocaleDateString(undefined, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                            {cycleData.find(data => data.date.startsWith(selectedDate.toISOString().split('T')[0])) && 
                                <div className="existing-data-badge">Dữ liệu đã ghi</div>
                            }
                        </div>
                        
                        <div className="modal-content">
                            <div className="status-selector">
                                <h4>Chọn Trạng Thái:</h4>
                                <div className="status-options">
                                    <button 
                                        className={`status-btn ${currentData.status === 'period' ? 'active' : ''}`}
                                        onClick={() => setCurrentData({...currentData, status: 'period'})}
                                    >
                                        Kinh Nguyệt
                                    </button>
                                    <button 
                                        className={`status-btn ${currentData.status === 'fertile' ? 'active' : ''}`}
                                        onClick={() => setCurrentData({...currentData, status: 'fertile'})}
                                    >
                                        Dễ Thụ Thai
                                    </button>
                                    <button 
                                        className={`status-btn ${currentData.status === 'ovulation' ? 'active' : ''}`}
                                        onClick={() => setCurrentData({...currentData, status: 'ovulation'})}
                                    >
                                        Rụng Trứng
                                    </button>
                                    <button 
                                        className={`status-btn ${currentData.status === 'none' ? 'active' : ''}`}
                                        onClick={() => setCurrentData({...currentData, status: 'none'})}
                                    >
                                        Không
                                    </button>
                                </div>
                            </div>
                            
                            {currentData.status === 'period' && (
                                <div className="flow-selector">
                                    <h4>Mức Độ:</h4>
                                    <div className="flow-options">
                                        <button 
                                            className={`flow-btn light ${currentData.flow === 'light' ? 'active' : ''}`}
                                            onClick={() => setCurrentData({...currentData, flow: 'light'})}
                                        >
                                            Nhẹ
                                        </button>
                                        <button 
                                            className={`flow-btn medium ${currentData.flow === 'medium' ? 'active' : ''}`}
                                            onClick={() => setCurrentData({...currentData, flow: 'medium'})}
                                        >
                                            Vừa
                                        </button>
                                        <button 
                                            className={`flow-btn heavy ${currentData.flow === 'heavy' ? 'active' : ''}`}
                                            onClick={() => setCurrentData({...currentData, flow: 'heavy'})}
                                        >
                                            Nặng
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="symptoms-selector">
                                <h4>Triệu Chứng:</h4>
                                <div className="symptoms-grid">
                                    {commonSymptoms.map((symptom, index) => (
                                        <div 
                                            key={index}
                                            className={`symptom-item ${currentData.symptoms.includes(symptom) ? 'active' : ''}`}
                                            onClick={() => toggleSymptom(symptom)}
                                        >
                                            {currentData.symptoms.includes(symptom) ? <FaCheckCircle /> : <FaRegCircle />}
                                            <span>{symptom}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="notes-input">
                                <h4>Ghi Chú:</h4>
                                <textarea
                                    value={currentData.notes}
                                    onChange={(e) => setCurrentData({...currentData, notes: e.target.value})}
                                    placeholder="Thêm ghi chú ở đây..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            {cycleData.find(data => data.date.startsWith(selectedDate.toISOString().split('T')[0])) && (
                                <button className="delete-btn" onClick={handleDeleteData}>
                                    <FaTrash /> Xóa
                                </button>
                            )}
                            <button className="cancel-btn" onClick={handleCloseModal}>Đóng</button>
                            <button className="save-btn" onClick={handleSave}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CycleTracker;