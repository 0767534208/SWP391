import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import './StaffDashboard.css';
import { labTestAPI } from '../../utils/api';

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

interface LabTest {
  labTestID: number;
  customerID: string;
  staffID: string;
  treatmentID?: number;
  testName: string;
  result: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate: string;
}

const StaffDashboard = () => {
  // State for lab test data
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats derived from lab tests
  const [stats, setStats] = useState({
    totalTests: 0,
    positiveTests: 0,
    negativeTests: 0,
    pendingTests: 0,
    todayTests: 0,
    thisWeekTests: 0,
  });

  // Load lab test data
  useEffect(() => {
    const fetchLabTests = async () => {
      setLoading(true);
      try {
        // Get staff ID from localStorage
        // Check multiple possible keys where the user ID might be stored
        const userObj = localStorage.getItem('user');
        let staffId = null;
        
        if (userObj) {
          try {
            const userData = JSON.parse(userObj);
            staffId = userData.userID || userData.customerID || userData.AccountID;
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
        
        if (!staffId) {
          // Try other possible keys
          staffId = localStorage.getItem('userId') || 
                   localStorage.getItem('AccountID') || 
                   localStorage.getItem('userID');
        }
        
        if (!staffId) {
          // If still no staff ID, show friendly message instead of throwing error
          setError('Vui lòng đăng nhập lại để xem bảng điều khiển. Thông tin người dùng không tìm thấy.');
          setLabTests([]);
          calculateStats([]);
          setLoading(false);
          return;
        }
        
        // Fetch lab tests created by this staff
        const response = await labTestAPI.getLabTestByStaff(staffId);
        
        if (response.data) {
          setLabTests(response.data as LabTest[]);
          calculateStats(response.data as LabTest[]);
        } else {
          setLabTests([]);
          calculateStats([]);
        }
      } catch (err) {
        console.error('Error fetching lab tests:', err);
        setError('Không thể tải dữ liệu xét nghiệm. Vui lòng thử lại sau.');
        // Initialize with empty data when error occurs
        setLabTests([]);
        calculateStats([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabTests();
  }, []);

  // Calculate statistics from lab test data
  const calculateStats = (tests: LabTest[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const positiveTests = tests.filter(test => test.isPositive).length;
    const negativeTests = tests.filter(test => test.isPositive === false).length;
    const pendingTests = tests.filter(test => test.isPositive === undefined || test.isPositive === null).length;
    
    const todayTests = tests.filter(test => {
      const testDate = new Date(test.testDate);
      return testDate >= today;
    }).length;
    
    const thisWeekTests = tests.filter(test => {
      const testDate = new Date(test.testDate);
      return testDate >= oneWeekAgo;
    }).length;
    
    setStats({
      totalTests: tests.length,
      positiveTests,
      negativeTests,
      pendingTests,
      todayTests,
      thisWeekTests,
    });
  };

  // Group tests by date for the chart
  const getTestsByDate = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const testCounts = last7Days.map(date => {
      return labTests.filter(test => {
        return test.testDate.split('T')[0] === date;
      }).length;
    });
    
    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }),
      data: testCounts,
    };
  };

  // Group tests by type for the chart
  const getTestsByType = () => {
    const testTypes = labTests.reduce((acc, test) => {
      acc[test.testName] = (acc[test.testName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: Object.keys(testTypes),
      data: Object.values(testTypes),
    };
  };

  // Data for test results by date chart
  const testsByDateData = {
    labels: getTestsByDate().labels,
    datasets: [
      {
        label: 'Số xét nghiệm',
        data: getTestsByDate().data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for test results by type chart
  const testsByTypeData = {
    labels: getTestsByType().labels,
    datasets: [
      {
        label: 'Số lượng theo loại xét nghiệm',
        data: getTestsByType().data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for test results status chart
  const testStatusData = {
    labels: ['Dương tính', 'Âm tính', 'Chưa xác định'],
    datasets: [
      {
        label: 'Kết quả xét nghiệm',
        data: [stats.positiveTests, stats.negativeTests, stats.pendingTests],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',   // red for positive
          'rgba(75, 192, 192, 0.7)',   // green for negative
          'rgba(255, 206, 86, 0.7)',   // yellow for pending
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart configuration
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
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="page-header">
        <h1 className="page-title">Bảng Điều Khiển Nhân Viên</h1>
        <p className="page-subtitle">Quản lý công việc và theo dõi hoạt động xét nghiệm</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon all-appointments">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.totalTests}</span>
            <span className="stat-label">Tổng xét nghiệm</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon positive-tests">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.positiveTests}</span>
            <span className="stat-label">Dương tính</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon negative-tests">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.negativeTests}</span>
            <span className="stat-label">Âm tính</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today-tests">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.todayTests}</span>
            <span className="stat-label">Xét nghiệm hôm nay</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card tests-by-date-chart">
          <h3>Xét nghiệm theo ngày</h3>
          <div className="chart-container">
            <Line options={lineOptions} data={testsByDateData} height={200} />
          </div>
        </div>

        <div className="chart-card test-status-chart">
          <h3>Phân bổ kết quả xét nghiệm</h3>
          <div className="chart-container doughnut-container">
            <Doughnut options={doughnutOptions} data={testStatusData} />
          </div>
        </div>
      </div>

      <div className="chart-card tests-by-type-chart">
        <h3>Số lượng theo loại xét nghiệm</h3>
        <div className="chart-container">
          <Bar options={barOptions} data={testsByTypeData} height={200} />
        </div>
      </div>

      <div className="recent-tests">
        <h3>Xét nghiệm gần đây</h3>
        <div className="table-container">
          <table className="recent-tests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bệnh nhân</th>
                <th>Loại xét nghiệm</th>
                <th>Ngày xét nghiệm</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {labTests.length > 0 ? (
                labTests.slice(0, 5).map((test) => (
                  <tr key={test.labTestID}>
                    <td>{test.labTestID}</td>
                    <td>{test.customerID}</td>
                    <td>{test.testName}</td>
                    <td>{new Date(test.testDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {test.isPositive !== undefined ? (
                        <span className={`result-badge ${test.isPositive ? 'positive' : 'negative'}`}>
                          {test.isPositive ? 'Dương tính' : 'Âm tính'}
                        </span>
                      ) : (
                        'Chưa xác định'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-results">Không có dữ liệu xét nghiệm gần đây.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 