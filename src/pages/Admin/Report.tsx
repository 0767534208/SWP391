import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Report.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('general');

  // Mock data for reports
  const generalStats = {
    totalUsers: 1245,
    newUsersThisMonth: 83,
    totalConsultations: 567,
    consultationsThisMonth: 78,
    totalAppointments: 924,
    appointmentsThisMonth: 112,
    totalTestResults: 816,
    positiveResults: 132,
    totalConsultants: 24,
    activeConsultants: 18,
    totalRevenue: 452300000,
    revenueThisMonth: 86500000
  };

  // Chart data
  const monthlyUsersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 72, 86, 93, 105, 112, 98, 85, 91, 83, 77, 83],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (million VND)',
        data: [45, 52, 48, 65, 57, 63, 58, 72, 75, 82, 87, 86.5],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const appointmentTypeData = {
    labels: ['STI Consultation', 'HIV Testing', 'Sexual Health Consultation', 'STI Testing', 'Pre/Post Test Counseling'],
    datasets: [
      {
        label: 'Count',
        data: [324, 286, 152, 98, 64],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const testResultsData = {
    labels: ['Negative', 'Positive', 'Pending'],
    datasets: [
      {
        label: 'Test Results',
        data: [
          684, // Negative
          132, // Positive
          0,   // Pending (all completed)
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const serviceUsageData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Consultations',
        data: [35, 40, 38, 45, 42, 50, 48, 52, 55, 60, 58, 62],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Tests',
        data: [28, 32, 30, 36, 35, 42, 40, 45, 48, 52, 50, 54],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  // Format currency in VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
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
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
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
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const multiBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    maintainAspectRatio: false,
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Export functionality will be implemented in a future update.');
  };

  return (
    <div className="reports-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Reports</h1>
          <p className="text-sm text-gray-500">
            Analytics and statistics for your health services
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="export-button"
            onClick={handleExport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button 
            className="print-button"
            onClick={handlePrint}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="reports-control-row">
        <div>
          <select 
            className="report-filter-select"
            value={reportType}
            onChange={handleReportTypeChange}
          >
            <option value="general">General Statistics</option>
            <option value="users">User Reports</option>
            <option value="appointments">Appointment Reports</option>
            <option value="tests">Test Result Reports</option>
            <option value="revenue">Revenue Reports</option>
          </select>
        </div>
        <div>
          <select 
            className="report-filter-select"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* General Statistics Report */}
      {reportType === 'general' && (
        <>
          <div className="stats-grid">
            <div className="reports-card stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{generalStats.totalUsers}</div>
              <div className="stat-change stat-change-positive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>+{generalStats.newUsersThisMonth} new this month</span>
              </div>
            </div>
            <div className="reports-card stat-card">
              <div className="stat-label">Consultations</div>
              <div className="stat-value">{generalStats.totalConsultations}</div>
              <div className="stat-change stat-change-positive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>+{generalStats.consultationsThisMonth} this month</span>
              </div>
            </div>
            <div className="reports-card stat-card">
              <div className="stat-label">Appointments</div>
              <div className="stat-value">{generalStats.totalAppointments}</div>
              <div className="stat-change stat-change-positive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>+{generalStats.appointmentsThisMonth} this month</span>
              </div>
            </div>
            <div className="reports-card stat-card">
              <div className="stat-label">Revenue</div>
              <div className="stat-value">{formatCurrency(generalStats.totalRevenue)}</div>
              <div className="stat-change stat-change-positive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>+{formatCurrency(generalStats.revenueThisMonth)} this month</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="reports-card">
              <div className="chart-header">
                <h3 className="chart-title">Monthly Users</h3>
              </div>
              <div className="chart-container-sm">
                <Line options={lineOptions} data={monthlyUsersData} />
              </div>
            </div>
            <div className="reports-card">
              <div className="chart-header">
                <h3 className="chart-title">Monthly Revenue</h3>
              </div>
              <div className="chart-container-sm">
                <Bar options={barOptions} data={monthlyRevenueData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="reports-card">
              <div className="chart-header">
                <h3 className="chart-title">Appointment Types</h3>
              </div>
              <div className="chart-container-sm">
                <Doughnut options={pieOptions} data={appointmentTypeData} />
              </div>
            </div>
            <div className="reports-card">
              <div className="chart-header">
                <h3 className="chart-title">Test Results</h3>
              </div>
              <div className="chart-container-sm">
                <Doughnut options={pieOptions} data={testResultsData} />
              </div>
            </div>
          </div>

          <div className="reports-card mb-8">
            <div className="chart-header">
              <h3 className="chart-title">Service Usage Comparison</h3>
            </div>
            <div className="chart-container-sm">
              <Bar options={multiBarOptions} data={serviceUsageData} />
            </div>
          </div>
        </>
      )}

      {/* User Reports */}
      {reportType === 'users' && (
        <div className="reports-card p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Users</h3>
              <p className="text-2xl font-bold">{generalStats.totalUsers}</p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>7.2% growth rate</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Active Users</h3>
              <p className="text-2xl font-bold">862</p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>69.2% of total users</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">New Users (This Month)</h3>
              <p className="text-2xl font-bold">{generalStats.newUsersThisMonth}</p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                <span>12.4% increase from last month</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">User Growth Trend</h3>
            <div className="h-64">
              <Line options={lineOptions} data={monthlyUsersData} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Demographics</h3>
              <div className="space-y-3">
                <div className="summary-row">
                  <div className="summary-label">Gender Ratio</div>
                  <div className="summary-value">Male 42% / Female 56% / Other 2%</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Age Distribution</div>
                  <div className="summary-value">18-24 (36%), 25-34 (42%), 35-44 (15%), 45+ (7%)</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Location</div>
                  <div className="summary-value">Urban (72%), Suburban (23%), Rural (5%)</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Device Usage</div>
                  <div className="summary-value">Mobile (68%), Desktop (27%), Tablet (5%)</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">User Engagement</h3>
              <div className="space-y-3">
                <div className="summary-row">
                  <div className="summary-label">Average Visit Duration</div>
                  <div className="summary-value">8.3 minutes</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Return Rate</div>
                  <div className="summary-value">73%</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Service Utilization</div>
                  <div className="summary-value">2.4 services per user</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">User Satisfaction</div>
                  <div className="summary-value">4.6/5.0 (based on feedback)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other report types would be implemented similarly */}
    </div>
  );
};

export default Reports;