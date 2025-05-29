import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
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

type TimeRangeType = 'week' | 'month' | 'year';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeType>('week');
  
  // Mock data - In a real application, this data would come from an API
  const stats = {
    totalUsers: 1245,
    activeConsultations: 28,
    pendingBookings: 37,
    completedTests: 143,
    blogPosts: 24,
    newUserGrowth: 12,
    totalRevenue: 52500000,
    revenueGrowth: 8.5,
  };

  const visitData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Visits',
          data: [65, 59, 80, 81, 56, 55, 72],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Visits',
          data: [280, 320, 290, 350],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Visits',
          data: [1200, 1300, 1400, 1350, 1460, 1500, 1610, 1590, 1700, 1850, 1900, 1950],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
  };

  // Data for pie chart
  const genderData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Users',
        data: [450, 750, 45],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
    datasets: [
      {
        label: 'Users',
        data: [350, 480, 220, 150, 45],
        backgroundColor: [
          'rgba(6, 182, 212, 0.7)',
          'rgba(124, 58, 237, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(6, 182, 212)',
          'rgb(124, 58, 237)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data - Bookings by week
  const bookingData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Bookings',
        data: [8, 12, 10, 15, 12, 8, 5],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
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

  // Bar chart configuration
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false,
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Recent activity data
  const recentActivities = [
    { action: 'New user registered', user: 'John Doe', time: '5 minutes ago', icon: 'user' },
    { action: 'Appointment booked', user: 'Sarah Johnson', time: '15 minutes ago', icon: 'calendar' },
    { action: 'Test result uploaded', user: 'Dr. Emily Davis', time: '45 minutes ago', icon: 'document' },
    { action: 'New blog post published', user: 'Admin', time: '1 hour ago', icon: 'blog' },
    { action: 'User updated profile', user: 'Michael Brown', time: '2 hours ago', icon: 'profile' }
  ];

  return (
    <div className="dashboard-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of health service center analytics
          </p>
        </div>
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          <button 
            onClick={() => setTimeRange('week')} 
            className={`px-3 py-1 text-xs font-medium ${timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-xs font-medium ${timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-xs font-medium ${timeRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {/* Total Users */}
        <div className="stats-card">
          <div className="dashboard-card stats-card-inner border-l-4 border-blue-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Total Users</h3>
                <span className="status-badge status-badge-blue">
                  +{stats.newUserGrowth}%
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-800">{stats.totalUsers}</span>
                <span className="text-xs text-gray-500 ml-1">users</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Updated 3 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Consultations */}
        <div className="stats-card">
          <div className="dashboard-card stats-card-inner border-l-4 border-green-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Active Consultations</h3>
                <span className="status-badge status-badge-green">
                  Live
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-800">{stats.activeConsultations}</span>
                <span className="text-xs text-gray-500 ml-1">sessions</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="stats-card">
          <div className="dashboard-card stats-card-inner border-l-4 border-amber-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Pending Bookings</h3>
                <span className="status-badge status-badge-amber">
                  Pending
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</span>
                <span className="text-xs text-gray-500 ml-1">appointments</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Updated 30 minutes ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="stats-card">
          <div className="dashboard-card stats-card-inner border-l-4 border-indigo-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Revenue</h3>
                <span className="status-badge status-badge-indigo">
                  +{stats.revenueGrowth}%
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</span>
                <span className="text-xs text-gray-500 ml-1">total</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Last calculated today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="dashboard-card lg:col-span-2">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Website Traffic</h3>
          </div>
          <div className="chart-container">
            <Line options={lineOptions} data={visitData[timeRange]} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Gender Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut options={doughnutOptions} data={genderData} />
          </div>
        </div>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Age Distribution */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Age Distribution</h3>
          </div>
          <div className="chart-container-sm">
            <Bar options={barOptions} data={ageData} />
          </div>
        </div>

        {/* Bookings by Day */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Weekly Appointments</h3>
          </div>
          <div className="chart-container-sm">
            <Bar options={barOptions} data={bookingData} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card mb-8">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Recent Activity</h3>
        </div>
        <div className="p-4">
          <div className="activity-scroll">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="flex items-start">
                  <div className={`activity-icon ${
                    activity.icon === 'user' ? 'activity-icon-blue' :
                    activity.icon === 'calendar' ? 'activity-icon-green' :
                    activity.icon === 'document' ? 'activity-icon-cyan' :
                    activity.icon === 'blog' ? 'activity-icon-amber' : 'activity-icon-purple'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 20 20" fill="currentColor">
                      {activity.icon === 'user' && <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />}
                      {activity.icon === 'calendar' && <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />}
                      {activity.icon === 'document' && <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />}
                      {activity.icon === 'blog' && <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />}
                      {activity.icon === 'profile' && <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />}
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.user}</p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;