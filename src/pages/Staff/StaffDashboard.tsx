import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import './StaffDashboard.css';

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

const StaffDashboard = () => {
  // Mock data - In a real application, this data would come from an API
  const stats = {
    totalAppointments: 42,
    pendingAppointments: 15,
    inProgressAppointments: 8,
    completedAppointments: 19,
  };

  const appointmentData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Số lịch hẹn',
        data: [5, 7, 6, 8, 5, 3, 2],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for pie chart
  const statusData = {
    labels: ['Đang chờ', 'Đã xác nhận', 'Đang thực hiện', 'Đợi kết quả', 'Hoàn thành'],
    datasets: [
      {
        label: 'Trạng thái lịch hẹn',
        data: [15, 6, 8, 4, 19],
        backgroundColor: [
          'rgba(234, 179, 8, 0.7)',    // yellow for pending
          'rgba(59, 130, 246, 0.7)',   // blue for confirmed
          'rgba(168, 85, 247, 0.7)',   // purple for in progress
          'rgba(236, 72, 153, 0.7)',   // pink for awaiting results
          'rgba(34, 197, 94, 0.7)',    // green for completed
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
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

  return (
    <div className="staff-dashboard">
      <div className="page-header">
        <h1 className="page-title">Bảng Điều Khiển Nhân Viên</h1>
        <p className="page-subtitle">Quản lý công việc và theo dõi hoạt động</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon all-appointments">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.totalAppointments}</span>
            <span className="stat-label">Tổng lịch hẹn</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending-appointments">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.pendingAppointments}</span>
            <span className="stat-label">Lịch hẹn chờ xử lý</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.inProgressAppointments}</span>
            <span className="stat-label">Đang thực hiện</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.completedAppointments}</span>
            <span className="stat-label">Hoàn thành</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card appointments-chart">
          <h3>Lịch hẹn gần đây</h3>
          <div className="chart-container">
            <Line options={lineOptions} data={appointmentData} height={200} />
          </div>
        </div>

        <div className="chart-card status-chart">
          <h3>Phân bổ trạng thái lịch hẹn</h3>
          <div className="chart-container doughnut-container">
            <Doughnut options={doughnutOptions} data={statusData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 