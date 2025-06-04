import React from 'react';
import './ManagerDashboard.css';

const ManagerDashboard: React.FC = () => {
  // Mock data for dashboard stats
  const stats = [
    { id: 1, title: 'Dịch vụ', value: 12, change: '+3', changeType: 'increase' },
    { id: 2, title: 'Lịch hẹn', value: 48, change: '+12', changeType: 'increase' },
    { id: 3, title: 'Doanh thu', value: '24.5M', change: '+8%', changeType: 'increase' },
    { id: 4, title: 'Đánh giá', value: '4.8', change: '+0.2', changeType: 'increase' },
  ];

  // Mock data for recent appointments
  const recentAppointments = [
    { id: 1, patientName: 'Nguyễn Văn A', service: 'Xét nghiệm & Tư vấn HIV', date: '15/06/2023', time: '10:00', status: 'completed' },
    { id: 2, patientName: 'Trần Thị B', service: 'Tư vấn sức khỏe tình dục', date: '16/06/2023', time: '14:30', status: 'upcoming' },
    { id: 3, patientName: 'Lê Văn C', service: 'Kiểm tra STI toàn diện', date: '16/06/2023', time: '15:45', status: 'upcoming' },
    { id: 4, patientName: 'Phạm Thị D', service: 'Sàng lọc sức khỏe tiền hôn nhân', date: '14/06/2023', time: '09:15', status: 'cancelled' },
    { id: 5, patientName: 'Hoàng Văn E', service: 'Xét nghiệm & Tư vấn HIV', date: '15/06/2023', time: '16:00', status: 'completed' },
  ];

  // Mock data for popular services
  const popularServices = [
    { id: 1, name: 'Xét nghiệm & Tư vấn HIV', count: 28, percentage: 35 },
    { id: 2, name: 'Kiểm tra STI toàn diện', count: 22, percentage: 27 },
    { id: 3, name: 'Tư vấn sức khỏe tình dục', count: 18, percentage: 22 },
    { id: 4, name: 'Sàng lọc sức khỏe tiền hôn nhân', count: 13, percentage: 16 },
  ];

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

      <div className="dashboard-grid">
        {/* Recent appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Lịch hẹn gần đây</h2>
            <button className="view-all-btn">Xem tất cả</button>
          </div>
          
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.service}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status === 'completed' && 'Hoàn thành'}
                        {appointment.status === 'upcoming' && 'Sắp tới'}
                        {appointment.status === 'cancelled' && 'Đã hủy'}
                      </span>
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