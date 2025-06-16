import React, { useState } from 'react';
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

const ConsultantDashboard: React.FC = () => {
  const [currentDate] = useState<string>(new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }));

  const [stats] = useState<StatCard[]>([
    {
      label: "Lịch hẹn hôm nay",
      value: 8,
      icon: <FaCalendarAlt />,
      iconClass: "today-appointments",
    },
    {
      label: "Lịch hẹn chờ xác nhận",
      value: 12,
      icon: <FaClock />,
      iconClass: "pending-appointments",
    },
    {
      label: "Đang chờ kết quả",
      value: 5,
      icon: <FaFlask />,
      iconClass: "waiting-results",
    },
    {
      label: "Đã hoàn thành",
      value: 24,
      icon: <FaCheckCircle />,
      iconClass: "completed",
    },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: "ACT-001",
      description: "Hoàn thành cuộc hẹn với Nguyễn Văn A",
      time: "10 phút trước",
      type: "appointment",
    },
    {
      id: "ACT-002",
      description: "Có kết quả xét nghiệm mới của Trần Thị B",
      time: "25 phút trước",
      type: "result",
    },
    {
      id: "ACT-003",
      description: "Đã lên lịch tái khám cho Lê Văn C",
      time: "1 giờ trước",
      type: "appointment",
    },
    {
      id: "ACT-004",
      description: "Bảo trì hệ thống đã hoàn tất",
      time: "2 giờ trước",
      type: "system",
    },
    {
      id: "ACT-005",
      description: "Yêu cầu lịch hẹn mới từ Phạm Thị D",
      time: "3 giờ trước",
      type: "appointment",
    },
  ]);

  // Appointment data for line chart
  const appointmentData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Lịch hẹn',
        data: [5, 8, 6, 9, 7, 3, 4],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Test results data for doughnut chart
  const testResultsData = {
    labels: ['Bình thường', 'Bất thường', 'Đang chờ'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10,
          },
        },
      },
    },
    cutout: '70%',
  };

  // Function to get activity icon
  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'appointment':
        return <FaCalendarCheck />;
      case 'test':
        return <FaFlask />;
      case 'result':
        return <FaClipboardList />;
      case 'system':
        return <FaBell />;
      default:
        return <FaCalendarAlt />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Bảng Điều Khiển Tư Vấn Viên</h1>
          <p>Chào mừng trở lại! Đây là tổng quan các hoạt động của bạn</p>
        </div>
        <div className="date-display">
          <span className="calendar-icon"><FaCalendarAlt /></span>
          {currentDate}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className={`stat-icon ${stat.iconClass}`}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="charts-container">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Xu Hướng Lịch Hẹn</h3>
                <Link to="/consultant/appointments" className="view-all-link">Xem tất cả</Link>
              </div>
              <div className="chart-container">
                <Line data={appointmentData} options={lineOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Tổng Quan Kết Quả Xét Nghiệm</h3>
                <Link to="/consultant/test-results" className="view-all-link">Xem tất cả</Link>
              </div>
              <div className="doughnut-container">
                <Doughnut data={testResultsData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="dashboard-row">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3>Hoạt Động Gần Đây</h3>
                <Link to="#" className="view-all">Xem tất cả</Link>
              </div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard; 