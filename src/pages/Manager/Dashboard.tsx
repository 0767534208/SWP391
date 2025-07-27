import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import './Dashboard.css';
import { adminDashboardAPI } from '../../services/adminService';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

const Dashboard = () => {
  // State for dashboard data
  const [accountStats, setAccountStats] = useState({
    totalAccount: 0,
    managersAccount: 0,
    customersAccount: 0,
    staffsAccount: 0,
    consultantAccount: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState({
    totalAppointments: 0,
    totalAppointmentsAmount: 0,
  });
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSpanType, setTimeSpanType] = useState<'day' | 'week' | 'month'>('month');
  const [periodData, setPeriodData] = useState<any[]>([]);
  
  // Fetch data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch account statistics
        const accountsResponse = await adminDashboardAPI.getTotalAccounts();
        if (accountsResponse.statusCode === 200 && accountsResponse.data) {
          setAccountStats(accountsResponse.data);
        }
        
        // Fetch appointment statistics
        const appointmentsResponse = await adminDashboardAPI.getTotalAppointmentsAndAmount();
        if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
          setAppointmentStats(appointmentsResponse.data);
        }
        
        // Fetch weekly revenue
        const weeklyRevenueResponse = await adminDashboardAPI.getCurrentWeekRevenue();
        if (weeklyRevenueResponse.statusCode === 200 && weeklyRevenueResponse.data) {
          setWeeklyRevenue(weeklyRevenueResponse.data);
        }
        
        // Get period data with month timespan
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];
        
        const periodResponse = await adminDashboardAPI.getPeriodRevenue(
          startDateStr, 
          endDateStr, 
          timeSpanType
        );
        
        if (periodResponse.statusCode === 200 && periodResponse.data) {
          setPeriodData(periodResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeSpanType]);
  
  // Calculate stats for display
  const stats = {
    totalUsers: accountStats.totalAccount,
    activeConsultations: appointmentStats.totalAppointments,
    pendingBookings: accountStats.consultantAccount || 0, // Using consultant count as placeholder
    totalRevenue: appointmentStats.totalAppointmentsAmount,
  };

  // Prepare weekly revenue data for chart
  const visitData = {
    labels: weeklyRevenue?.map(item => {
      if (!item?.date) return '';
      const date = new Date(item.date);
      return `T${date.getDay() === 0 ? 'CN' : date.getDay() + 1}`;
    }) || [],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: weeklyRevenue?.map(item => item?.totalAppointmentsAmount || 0) || [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for pie chart - showing account distribution
  const accountData = {
    labels: ['Quản lý', 'Khách hàng', 'Nhân viên', 'Tư vấn viên'],
    datasets: [
      {
        label: 'Người dùng',
        data: [
          accountStats?.managersAccount || 0,
          accountStats?.customersAccount || 0,
          accountStats?.staffsAccount || 0,
          accountStats?.consultantAccount || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Line chart configuration
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 9
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 9
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  // Doughnut chart configuration
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          padding: 8,
          font: {
            size: 10
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Quản trị hệ thống</h1>
          <p className="page-subtitle">Xem tổng quan về dữ liệu và hoạt động của hệ thống</p>
        </div>
        <div className="time-span-selector">
          <label htmlFor="timeSpanType">Xem theo: </label>
          <select 
            id="timeSpanType" 
            value={timeSpanType} 
            onChange={(e) => setTimeSpanType(e.target.value as 'day' | 'week' | 'month')}
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Tổng người dùng</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon appointments">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.activeConsultations}</span>
            <span className="stat-label">Tư vấn đang diễn ra</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bookings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.pendingBookings}</span>
            <span className="stat-label">Lịch hẹn chờ xử lý</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
            <span className="stat-label">Tổng doanh thu</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="charts-container">
          <div className="chart-card visits-chart">
            <h3>Doanh thu theo ngày</h3>
            <div className="chart-container">
              {weeklyRevenue.length > 0 ? (
                <Line options={lineOptions} data={visitData} height={200} />
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>
          </div>

          <div className="chart-card gender-chart">
            <h3>Phân bổ người dùng</h3>
            <div className="chart-container doughnut-container">
              <Doughnut options={doughnutOptions} data={accountData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
