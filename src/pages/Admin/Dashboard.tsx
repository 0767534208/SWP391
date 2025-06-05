import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import './Dashboard.css';

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
  // Mock data - In a real application, this data would come from an API
  const stats = {
    totalUsers: 1245,
    activeConsultations: 28,
    pendingBookings: 37,
    totalRevenue: 52500000,
  };

  const visitData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Số lượt truy cập',
        data: [65, 59, 80, 81, 56, 55, 72],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for pie chart
  const genderData = {
    labels: ['Nam', 'Nữ'],
    datasets: [
      {
        label: 'Người dùng',
        data: [450, 750],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
         
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
      <div className="dashboard-header">
        <h1>Quản trị hệ thống</h1>
        <p>Xem tổng quan về dữ liệu và hoạt động của hệ thống</p>
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

      <div className="charts-container">
        <div className="chart-card visits-chart">
          <h3>Lượt truy cập gần đây</h3>
          <div className="chart-container">
            <Line options={lineOptions} data={visitData} height={200} />
          </div>
        </div>

        <div className="chart-card gender-chart">
          <h3>Phân bổ theo giới tính</h3>
          <div className="chart-container doughnut-container">
            <Doughnut options={doughnutOptions} data={genderData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;