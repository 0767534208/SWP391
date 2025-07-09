import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  FaCalendarAlt, FaClipboardList, FaFlask, FaCheckCircle, 
  FaClock, FaBell, FaCalendarCheck
} from 'react-icons/fa';
import './ConsultantDashboard.css';
import { consultantService, testResultService } from '../../services';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript interfaces
interface Activity {
  id: string;
  description: string;
  time: string;
  type: 'appointment' | 'test' | 'result' | 'system';
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}

interface Appointment {
  appointmentID: string;
  customerID: string;
  consultantID: string;
  appointmentDate: string;
  status: number;
  appointmentType: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string;
  slot?: {
    startTime: string;
    endTime: string;
  };
  consultant?: {
    name: string;
  };
  customer?: {
    name: string;
  };
}

interface TreatmentOutcome {
  id: number;
  customerId: string;
  consultantId: string;
  appointmentId: number;
  diagnosis: string;
  treatmentPlan: string;
  status: string;
  createdDate: string;
}

const ConsultantDashboard: React.FC = () => {
  const [currentDate] = useState<string>(new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }));

  const [stats, setStats] = useState<StatCard[]>([
    {
      label: "Lịch hẹn hôm nay",
      value: 0,
      icon: <FaCalendarAlt />,
      iconClass: "today-appointments",
    },
    {
      label: "Lịch hẹn chờ xác nhận",
      value: 0,
      icon: <FaClock />,
      iconClass: "pending-appointments",
    },
    {
      label: "Đang chờ kết quả",
      value: 0,
      icon: <FaFlask />,
      iconClass: "waiting-results",
    },
    {
      label: "Đã hoàn thành",
      value: 0,
      icon: <FaCheckCircle />,
      iconClass: "completed",
    },
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<TreatmentOutcome[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [consultantProfile, setConsultantProfile] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        if (!userId) {
          toast.error('Không tìm thấy thông tin người dùng');
          return;
        }

        // Fetch consultant's profile
        try {
          const profileResponse = await consultantService.getConsultantById(userId);
          if (profileResponse.statusCode === 200 && profileResponse.data) {
            setConsultantProfile(profileResponse.data);
          }
        } catch (error) {
          console.error('Error fetching consultant profile:', error);
        }

        // Fetch consultant's appointments
        try {
          const appointmentsResponse = await consultantService.getConsultantAppointments(userId);
          if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
            setAppointments(appointmentsResponse.data);
            updateStats(appointmentsResponse.data);
            generateActivities(appointmentsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
          toast.error('Có lỗi khi tải dữ liệu lịch hẹn');
        }

        // Fetch consultant's treatment outcomes
        try {
          const treatmentOutcomesResponse = await consultantService.getConsultantTreatmentOutcomes(userId);
          if (treatmentOutcomesResponse.statusCode === 200 && treatmentOutcomesResponse.data) {
            setTreatmentOutcomes(treatmentOutcomesResponse.data);
          }
        } catch (error) {
          console.error('Error fetching treatment outcomes:', error);
        }
        
        // Fetch test results
        try {
          const testResultsResponse = await testResultService.getAllTestResults();
          if (testResultsResponse.statusCode === 200 && testResultsResponse.data) {
            setTestResults(testResultsResponse.data.items || []);
          }
        } catch (error) {
          console.error('Error fetching test results:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Có lỗi khi tải dữ liệu, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update stats based on appointments
  const updateStats = (appointmentsData: Appointment[]) => {
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];
    
    // Count appointments by status
    const todayAppointments = appointmentsData.filter(
      app => app.appointmentDate.split('T')[0] === today
    ).length;
    
    const pendingAppointments = appointmentsData.filter(
      app => app.status === 0 // Assuming 0 is pending status
    ).length;
    
    const awaitingResults = appointmentsData.filter(
      app => app.status === 2 // Assuming 2 is awaiting results status
    ).length;
    
    const completed = appointmentsData.filter(
      app => app.status === 3 // Assuming 3 is completed status
    ).length;

    // Update stats state
    setStats([
      {
        label: "Lịch hẹn hôm nay",
        value: todayAppointments,
        icon: <FaCalendarAlt />,
        iconClass: "today-appointments",
      },
      {
        label: "Lịch hẹn chờ xác nhận",
        value: pendingAppointments,
        icon: <FaClock />,
        iconClass: "pending-appointments",
      },
      {
        label: "Đang chờ kết quả",
        value: awaitingResults,
        icon: <FaFlask />,
        iconClass: "waiting-results",
      },
      {
        label: "Đã hoàn thành",
        value: completed,
        icon: <FaCheckCircle />,
        iconClass: "completed",
      },
    ]);
  };

  // Generate activities from appointments
  const generateActivities = (appointmentsData: Appointment[]) => {
    // Sort appointments by date (newest first)
    const sortedAppointments = [...appointmentsData].sort(
      (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );

    // Take latest 5 appointments and convert to activities
    const latestActivities: Activity[] = sortedAppointments.slice(0, 5).map((app, index) => {
      // Format the time difference
      const appointmentTime = new Date(app.appointmentDate);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60));
      
      let timeText = '';
      if (diffInMinutes < 60) {
        timeText = `${diffInMinutes} phút trước`;
      } else if (diffInMinutes < 1440) {
        timeText = `${Math.floor(diffInMinutes / 60)} giờ trước`;
      } else {
        timeText = `${Math.floor(diffInMinutes / 1440)} ngày trước`;
      }

      // Generate description based on status
      let description = '';
      let type: 'appointment' | 'test' | 'result' | 'system' = 'appointment';
      
      const customerName = app.customer?.name || 'Khách hàng';
      
      switch(app.status) {
        case 0: // Pending
          description = `Yêu cầu lịch hẹn mới từ ${customerName}`;
          break;
        case 1: // Confirmed
          description = `Lịch hẹn với ${customerName} đã được xác nhận`;
          break;
        case 2: // Awaiting results
          description = `Đang chờ kết quả xét nghiệm của ${customerName}`;
          type = 'test';
          break;
        case 3: // Completed
          description = `Đã hoàn thành cuộc hẹn với ${customerName}`;
          break;
        case 4: // Cancelled
          description = `Lịch hẹn với ${customerName} đã bị hủy`;
          break;
        default:
          description = `Cập nhật lịch hẹn với ${customerName}`;
      }

      return {
        id: `activity-${app.appointmentID}-${index}`,
        description,
        time: timeText,
        type
      };
    });

    setActivities(latestActivities);
  };

  // Prepare chart data
  const getWeeklyAppointmentData = () => {
    // Get dates for the past 7 days
    const dates = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      dates.push(date.toLocaleDateString('vi-VN', { weekday: 'short' }));
      
      // Count appointments on this day
      const count = appointments.filter(app => 
        app.appointmentDate.split('T')[0] === dateString
      ).length;
      
      counts.push(count);
    }
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Số lịch hẹn',
          data: counts,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };
  
  const getTestResultsData = () => {
    // Count test results by status
    let normalCount = 0;
    let abnormalCount = 0;
    let criticalCount = 0;

    // Count based on the result field if it exists
    testResults.forEach(result => {
      const resultValue = result.result?.toLowerCase();
      if (resultValue) {
        if (resultValue.includes('positive') || resultValue.includes('dương tính') || 
            resultValue.includes('abnormal') || resultValue.includes('bất thường')) {
          abnormalCount++;
        } else if (resultValue.includes('critical') || resultValue.includes('nguy hiểm') ||
                 resultValue.includes('cần chú ý')) {
          criticalCount++;
        } else {
          normalCount++;
        }
      } else {
        // Default to normal if no result specified
        normalCount++;
      }
    });

    return {
      labels: ['Bình thường', 'Bất thường', 'Nguy hiểm'],
      datasets: [
        {
          data: [normalCount, abnormalCount, criticalCount],
          backgroundColor: [
            'rgba(34, 197, 94, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'appointment':
        return <FaCalendarCheck className="activity-icon appointment" />;
      case 'test':
        return <FaFlask className="activity-icon test" />;
      case 'result':
        return <FaClipboardList className="activity-icon result" />;
      case 'system':
        return <FaBell className="activity-icon system" />;
      default:
        return <FaBell className="activity-icon" />;
    }
  };

  return (
    <div className="consultant-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Xin chào, {consultantProfile?.consultant?.name || "Tư vấn viên"}</h1>
          <p className="current-date">{currentDate}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="stat-cards">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card ${stat.iconClass}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-content">
            <div className="dashboard-charts">
              <div className="chart-card appointments-chart">
                <h3>Lịch hẹn trong 7 ngày qua</h3>
                <div className="chart-container">
                  <Line 
                    data={getWeeklyAppointmentData()} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              
              <div className="chart-card results-chart">
                <h3>Kết quả xét nghiệm</h3>
                <div className="chart-container">
                  <Doughnut 
                    data={getTestResultsData()} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                      cutout: '60%',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-panels">
              <div className="panel recent-activities">
                <h3>Hoạt động gần đây</h3>
                <div className="activities-list">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon-container">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                          <p className="activity-description">{activity.description}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data-message">Chưa có hoạt động nào gần đây</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultantDashboard; 