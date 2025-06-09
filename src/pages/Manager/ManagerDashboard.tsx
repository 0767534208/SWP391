import React, { useState } from 'react';
import './ManagerDashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Đăng ký các thành phần Chart.js
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

const ManagerDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for dashboard stats
  const stats = [
    { id: 1, title: 'Dịch vụ', value: 12, change: '+3', changeType: 'increase' },
    { id: 2, title: 'Lịch hẹn', value: 48, change: '+12', changeType: 'increase' },
    { id: 3, title: 'Doanh thu', value: '24.5M', change: '+8%', changeType: 'increase' },
    { id: 4, title: 'Đánh giá', value: '4.8', change: '+0.2', changeType: 'increase' },
  ];

  // Mock data for recent appointments
  const recentAppointments = [
    { id: 1, patientName: 'Nguyễn Văn A', service: 'Xét nghiệm & Tư vấn HIV', date: '15/06/2023', time: '10:00', status: 'completed', phone: '0912345678', email: 'nguyenvana@email.com', consultant: 'BS. Trần Thị B' },
    { id: 2, patientName: 'Trần Thị B', service: 'Tư vấn sức khỏe tình dục', date: '16/06/2023', time: '14:30', status: 'upcoming', phone: '0923456789', email: 'tranthib@email.com', consultant: 'BS. Lê Văn C' },
    { id: 3, patientName: 'Lê Văn C', service: 'Kiểm tra STI toàn diện', date: '16/06/2023', time: '15:45', status: 'upcoming', phone: '0934567890', email: 'levanc@email.com', consultant: 'BS. Nguyễn Văn A' },
    { id: 4, patientName: 'Phạm Thị D', service: 'Sàng lọc sức khỏe tiền hôn nhân', date: '14/06/2023', time: '09:15', status: 'cancelled', phone: '0945678901', email: 'phamthid@email.com', consultant: 'BS. Hoàng Thị E' },
    { id: 5, patientName: 'Hoàng Văn E', service: 'Xét nghiệm & Tư vấn HIV', date: '15/06/2023', time: '16:00', status: 'completed', phone: '0956789012', email: 'hoangvane@email.com', consultant: 'BS. Trần Thị B' },
    { id: 6, patientName: 'Vũ Thị F', service: 'Tư vấn biện pháp tránh thai', date: '17/06/2023', time: '11:30', status: 'upcoming', phone: '0967890123', email: 'vuthif@email.com', consultant: 'BS. Vũ Văn F' },
    { id: 7, patientName: 'Đặng Văn G', service: 'Gói chăm sóc thai sản', date: '18/06/2023', time: '09:00', status: 'upcoming', phone: '0978901234', email: 'dangvang@email.com', consultant: 'BS. Hoàng Thị E' },
  ];

  // Mock data for popular services
  const popularServices = [
    { id: 1, name: 'Xét nghiệm & Tư vấn HIV', count: 28, percentage: 35 },
    { id: 2, name: 'Kiểm tra STI toàn diện', count: 22, percentage: 27 },
    { id: 3, name: 'Tư vấn sức khỏe tình dục', count: 18, percentage: 22 },
    { id: 4, name: 'Sàng lọc sức khỏe tiền hôn nhân', count: 13, percentage: 16 },
  ];

  // Mock data cho biểu đồ doanh thu theo tháng
  const monthlyRevenueData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: [18.5, 19.2, 21.5, 22.1, 23.4, 24.5, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Mock data cho biểu đồ phân bố dịch vụ
  const serviceDistributionData = {
    labels: ['HIV', 'STI', 'Tư vấn tình dục', 'Thai sản', 'Khác'],
    datasets: [
      {
        data: [35, 27, 22, 10, 6],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Cấu hình cho biểu đồ
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu theo tháng (triệu VNĐ)',
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
      title: {
        display: true,
        text: 'Phân bố dịch vụ',
      },
    },
    maintainAspectRatio: false,
  };

  // Lọc lịch hẹn theo trạng thái và tìm kiếm
  const filteredAppointments = recentAppointments
    .filter(appointment => 
      statusFilter === 'all' || appointment.status === statusFilter
    )
    .filter(appointment => 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.consultant.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="manager-dashboard">
      <h1 className="dashboard-title">Bảng điều khiển</h1>

      {/* Stats overview */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
            <div className={`stat-change ${stat.changeType}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h2>Doanh thu theo tháng</h2>
          </div>
          <div className="chart-container">
            <Line options={lineOptions} data={monthlyRevenueData} />
          </div>
        </div>

        {/* Service Distribution Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h2>Phân bố dịch vụ</h2>
          </div>
          <div className="chart-container">
            <Doughnut options={pieOptions} data={serviceDistributionData} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Lịch hẹn gần đây</h2>
            <button className="view-all-btn">Xem tất cả</button>
          </div>
          
          <div className="appointments-filters">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, dịch vụ, bác sĩ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="filter-container">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="upcoming">Sắp tới</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
          
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Dịch vụ</th>
                  <th>Tư vấn viên</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientName}</td>
                    <td>
                      <div className="contact-info">
                        <div>{appointment.phone}</div>
                        <div className="email">{appointment.email}</div>
                      </div>
                    </td>
                    <td>{appointment.service}</td>
                    <td>{appointment.consultant}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status === 'completed' && 'Hoàn thành'}
                        {appointment.status === 'upcoming' && 'Sắp tới'}
                        {appointment.status === 'cancelled' && 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="Xem chi tiết">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="action-btn edit-btn" title="Chỉnh sửa">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular services */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Dịch vụ phổ biến</h2>
            <button className="view-all-btn" onClick={() => window.location.href = '/manager/services'}>Quản lý dịch vụ</button>
          </div>
          
          <div className="services-list">
            {popularServices.map((service) => (
              <div key={service.id} className="service-item">
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.count} lịch hẹn</p>
                </div>
                <div className="service-percentage">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                  <span>{service.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 