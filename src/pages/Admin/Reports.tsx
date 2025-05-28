import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

  // Mock data cho báo cáo
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

  // Dữ liệu biểu đồ
  const monthlyUsersData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Người dùng mới',
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
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: [45, 52, 48, 65, 57, 63, 58, 72, 75, 82, 87, 86.5],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const appointmentTypeData = {
    labels: ['Tư vấn STI', 'Xét nghiệm HIV', 'Tư vấn sức khỏe tình dục', 'Xét nghiệm STI', 'Tư vấn trước/sau xét nghiệm'],
    datasets: [
      {
        label: 'Số lượng',
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
    labels: ['Âm tính', 'Dương tính', 'Đang chờ'],
    datasets: [
      {
        label: 'Kết quả xét nghiệm',
        data: [
          684, // Âm tính
          132, // Dương tính
          0,   // Đang chờ (đã hoàn thành tất cả)
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
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Tư vấn',
        data: [35, 40, 38, 45, 42, 50, 48, 52, 55, 60, 58, 62],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Xét nghiệm',
        data: [28, 32, 30, 36, 35, 42, 40, 45, 48, 52, 50, 54],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Các tùy chọn cho biểu đồ
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  // Xử lý thay đổi loại báo cáo
  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value);
  };

  return (
    <div className="admin-dashboard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Báo cáo & Thống kê</h1>
          <p className="admin-text-muted admin-text-sm">
            Phân tích dữ liệu và báo cáo chi tiết về hoạt động của hệ thống
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
            <option value="all">Tất cả thời gian</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={reportType}
            onChange={handleReportTypeChange}
          >
            <option value="general">Tổng quan</option>
            <option value="users">Người dùng</option>
            <option value="services">Dịch vụ</option>
            <option value="finance">Tài chính</option>
          </select>
          <button className="admin-quick-action-btn bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
            </svg>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="admin-stats-summary mb-5">
        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Người dùng</div>
            <div className="admin-stats-item-value">{generalStats.totalUsers}</div>
            <div className="admin-stats-item-trend admin-text-success">
              +{generalStats.newUsersThisMonth} tháng này
            </div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Tư vấn</div>
            <div className="admin-stats-item-value">{generalStats.totalConsultations}</div>
            <div className="admin-stats-item-trend admin-text-success">
              +{generalStats.consultationsThisMonth} tháng này
            </div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Lịch hẹn</div>
            <div className="admin-stats-item-value">{generalStats.totalAppointments}</div>
            <div className="admin-stats-item-trend admin-text-success">
              +{generalStats.appointmentsThisMonth} tháng này
            </div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Doanh thu</div>
            <div className="admin-stats-item-value">{formatCurrency(generalStats.totalRevenue)}</div>
            <div className="admin-stats-item-trend admin-text-success">
              +{formatCurrency(generalStats.revenueThisMonth)} tháng này
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Content - Tổng quan */}
      {reportType === 'general' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="admin-card lg:col-span-2">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Người dùng mới theo tháng</h3>
              </div>
              <div className="p-3 admin-chart-container">
                <Line options={lineOptions} data={monthlyUsersData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Phân bố kết quả xét nghiệm</h3>
              </div>
              <div className="p-3 admin-chart-container">
                <Doughnut options={doughnutOptions} data={testResultsData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="admin-card">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Doanh thu theo tháng</h3>
              </div>
              <div className="p-3 admin-chart-container">
                <Bar options={barOptions} data={monthlyRevenueData} />
              </div>
            </div>

            <div className="admin-card">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Các loại dịch vụ phổ biến</h3>
              </div>
              <div className="p-3 admin-chart-container">
                <Doughnut options={doughnutOptions} data={appointmentTypeData} />
              </div>
            </div>
          </div>

          <div className="admin-card mb-4">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold">Sử dụng dịch vụ theo tháng</h3>
            </div>
            <div className="p-3 admin-chart-container">
              <Bar options={multiBarOptions} data={serviceUsageData} />
            </div>
          </div>
        </>
      )}

      {/* Báo cáo về người dùng */}
      {reportType === 'users' && (
        <div className="admin-card p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Báo cáo người dùng</h3>
          <p className="mb-8">Đây là nơi hiển thị báo cáo chi tiết về người dùng, bao gồm thông tin về đăng ký mới, tương tác, và các xu hướng người dùng.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="admin-chart-container">
              <Line options={lineOptions} data={monthlyUsersData} />
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium mb-2">Thống kê người dùng</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tổng số người dùng:</span>
                  <span className="font-medium">{generalStats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Người dùng mới tháng này:</span>
                  <span className="font-medium text-green-600">+{generalStats.newUsersThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tỷ lệ người dùng quay lại:</span>
                  <span className="font-medium">76.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tỷ lệ tương tác:</span>
                  <span className="font-medium">64.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tỷ lệ chuyển đổi dịch vụ:</span>
                  <span className="font-medium">28.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo về dịch vụ */}
      {reportType === 'services' && (
        <div className="admin-card p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Báo cáo dịch vụ</h3>
          <p className="mb-8">Đây là nơi hiển thị báo cáo chi tiết về các dịch vụ, bao gồm thông tin về mức độ phổ biến, hiệu quả và đánh giá của dịch vụ.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="admin-chart-container">
              <Bar options={multiBarOptions} data={serviceUsageData} />
            </div>
            
            <div className="admin-chart-container">
              <Doughnut options={doughnutOptions} data={appointmentTypeData} />
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md col-span-1 lg:col-span-2">
              <h4 className="font-medium mb-2">Thống kê dịch vụ</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tổng số tư vấn:</span>
                  <span className="font-medium">{generalStats.totalConsultations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tổng số lịch hẹn:</span>
                  <span className="font-medium">{generalStats.totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tổng số xét nghiệm:</span>
                  <span className="font-medium">{generalStats.totalTestResults}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tỷ lệ hoàn thành dịch vụ:</span>
                  <span className="font-medium">92.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Đánh giá trung bình:</span>
                  <span className="font-medium flex items-center">
                    4.8/5.0
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-yellow-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo tài chính */}
      {reportType === 'finance' && (
        <div className="admin-card p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Báo cáo tài chính</h3>
          <p className="mb-8">Đây là nơi hiển thị báo cáo chi tiết về tài chính, bao gồm thông tin về doanh thu, chi phí và lợi nhuận.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="admin-chart-container">
              <Bar options={barOptions} data={monthlyRevenueData} />
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h4 className="font-medium mb-2">Thống kê tài chính</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="admin-text-muted">Tổng doanh thu:</span>
                  <span className="font-medium">{formatCurrency(generalStats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Doanh thu tháng này:</span>
                  <span className="font-medium text-green-600">{formatCurrency(generalStats.revenueThisMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Chi phí vận hành:</span>
                  <span className="font-medium">{formatCurrency(152400000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Lợi nhuận ròng:</span>
                  <span className="font-medium">{formatCurrency(299900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="admin-text-muted">Biên lợi nhuận:</span>
                  <span className="font-medium">66.3%</span>
                </div>
              </div>
            </div>
            
            <div className="admin-card p-4 col-span-1 lg:col-span-2">
              <h4 className="font-medium mb-2">Phân tích doanh thu theo dịch vụ</h4>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Loại dịch vụ</th>
                      <th className="px-4 py-2">Số lượng</th>
                      <th className="px-4 py-2">Doanh thu</th>
                      <th className="px-4 py-2">% Tổng doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-2">Tư vấn STI</td>
                      <td className="px-4 py-2">324</td>
                      <td className="px-4 py-2">{formatCurrency(162000000)}</td>
                      <td className="px-4 py-2">35.8%</td>
                    </tr>
                    <tr className="bg-gray-50 border-b">
                      <td className="px-4 py-2">Xét nghiệm HIV</td>
                      <td className="px-4 py-2">286</td>
                      <td className="px-4 py-2">{formatCurrency(143000000)}</td>
                      <td className="px-4 py-2">31.6%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-2">Tư vấn sức khỏe tình dục</td>
                      <td className="px-4 py-2">152</td>
                      <td className="px-4 py-2">{formatCurrency(76000000)}</td>
                      <td className="px-4 py-2">16.8%</td>
                    </tr>
                    <tr className="bg-gray-50 border-b">
                      <td className="px-4 py-2">Xét nghiệm STI</td>
                      <td className="px-4 py-2">98</td>
                      <td className="px-4 py-2">{formatCurrency(49000000)}</td>
                      <td className="px-4 py-2">10.8%</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-2">Tư vấn trước/sau xét nghiệm</td>
                      <td className="px-4 py-2">64</td>
                      <td className="px-4 py-2">{formatCurrency(22300000)}</td>
                      <td className="px-4 py-2">4.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 