import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaCheckCircle, FaTimesCircle, FaClock, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaUser, FaFileAlt, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { userAPI, appointmentAPI } from '../../utils/api';
import type { UserData } from '../../types';
import type { AppointmentData } from '../../utils/api';
import { format } from 'date-fns';

// Helper function to get status text based on status code
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ xác nhận';
    case 1: return 'Đã xác nhận';
    case 2: return 'Đang thực hiện';
    case 3: return 'Đợi kết quả';
    case 4: return 'Hoàn thành';
    case 5: return 'Đã hủy';
    case 6: return 'Yêu cầu hoàn tiền';
    case 7: return 'Yêu cầu hủy';
    default: return 'Không xác định';
  }
};

// Helper function to get payment status text
const getPaymentStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ thanh toán';
    case 1: return 'Đã đặt cọc';
    case 2: return 'Đã thanh toán';
    case 3: return 'Đã hoàn tiền';
    default: return 'Không xác định';
  }
};

// Helper function to get appointment type text
const getAppointmentTypeText = (type: number): string => {
  switch (type) {
    case 0: return 'Tư vấn';
    case 1: return 'Xét nghiệm';
    default: return 'Không xác định';
  }
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to format time
const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return format(date, 'HH:mm');
  } catch (error) {
    return 'Invalid time';
  }
};

const statusColor = (status: number) => {
  switch (status) {
    case 1: // Đã xác nhận
    case 3: // Hoàn thành
    case 5: // Đã thanh toán
      return '#16a34a'; // Green
    case 4: // Đã hủy
    case 6: // Yêu cầu hoàn tiền
    case 7: // Yêu cầu hủy
      return '#e53e3e'; // Red
    case 0: // Chờ xác nhận
    case 2: // Đang xử lý
      return '#f59e42'; // Orange
    default:
      return '#6b7280'; // Gray
  }
};

const statusIcon = (status: number) => {
  switch (status) {
    case 1: // Đã xác nhận
    case 3: // Hoàn thành
    case 5: // Đã thanh toán
      return <FaCheckCircle color="#16a34a" style={{marginRight: 4}} />;
    case 4: // Đã hủy
    case 6: // Yêu cầu hoàn tiền
    case 7: // Yêu cầu hủy
      return <FaTimesCircle color="#e53e3e" style={{marginRight: 4}} />;
    case 0: // Chờ xác nhận
    case 2: // Đang xử lý
      return <FaClock color="#f59e42" style={{marginRight: 4}} />;
    default:
      return <FaClock color="#6b7280" style={{marginRight: 4}} />;
  }
};

const infoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18,
  fontSize: 17,
  color: '#222',
  background: '#f7f8fa',
  borderRadius: 12,
  padding: '14px 22px',
  boxShadow: '0 2px 8px #e3e8f0',
};

const labelStyle = {
  minWidth: 120,
  color: '#2563eb',
  fontWeight: 600,
  fontSize: 16,
};

const paymentStatusColor = (status: number) => {
  switch (status) {
    case 2: // Đã thanh toán
      return '#16a34a'; // Green
    case 3: // Đã hoàn tiền
      return '#2563eb'; // Blue
    case 1: // Đã đặt cọc
      return '#f59e42'; // Orange
    case 0: // Chờ thanh toán
      return '#6b7280'; // Gray
    default:
      return '#6b7280'; // Gray
  }
};

const PaymentStatusBadge = ({ status }: { status: number }) => {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: paymentStatusColor(status),
    }}>
      {getPaymentStatusText(status)}
    </span>
  );
};

const appointmentTypeColor = (type: number) => {
  switch (type) {
    case 0: // Tư vấn
      return '#3b82f6'; // Blue
    case 1: // Xét nghiệm
      return '#8b5cf6'; // Purple
    default:
      return '#6b7280'; // Gray
  }
};

const AppointmentTypeBadge = ({ type }: { type: number }) => {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: appointmentTypeColor(type),
    }}>
      {getAppointmentTypeText(type)}
    </span>
  );
};

const AppointmentStatusBadge = ({ status }: { status: number }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      backgroundColor: statusColor(status),
    }}>
      {statusIcon(status)} {getStatusText(status)}
    </span>
  );
};

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'profile' | 'history'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });

  // Function to create sample user
  const createSampleUser = () => {
    const sampleUser = {
      userID: "73539b7a-f7e5-4889-a662-b71c9bbf7e88",
      customerID: "73539b7a-f7e5-4889-a662-b71c9bbf7e88",
      userName: "customer",
      email: "customer@gmail.com",
      name: "Customer Sample",
      address: "Sample Address",
      phone: "0786014911",
      dateOfBirth: "2000-01-01",
      isActive: true,
      roles: ["Customer"],
      token: "sample-token",
      refreshToken: "sample-refresh-token"
    };
    
    localStorage.setItem('user', JSON.stringify(sampleUser));
    localStorage.setItem('token', "sample-token");
    localStorage.setItem('isLoggedIn', "true");
    localStorage.setItem('userRole', "Customer");
    
    setUser(sampleUser);
    setForm({
      name: sampleUser.name || '',
      phone: sampleUser.phone || '',
      dateOfBirth: sampleUser.dateOfBirth || '',
      address: sampleUser.address || '',
    });
    setError(null);
    
    alert("Đã tạo người dùng mẫu. Hãy tải lại dữ liệu.");
  };

  // Function to reload data
  const reloadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Ưu tiên sử dụng customerID, nếu không có thì dùng userID
        const customerId = parsedUser.customerID || parsedUser.userID;
        if (customerId) {
          const appointmentsResponse = await appointmentAPI.getAppointmentsByCustomerId(customerId);
          console.log("Reloaded appointments:", appointmentsResponse);
          if (appointmentsResponse.data) {
            setAppointments(appointmentsResponse.data);
          } else {
            setError("Không tìm thấy dữ liệu cuộc hẹn.");
          }
        } else {
          setError("Không tìm thấy ID khách hàng. Vui lòng thiết lập ID mẫu trước.");
        }
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("User data from localStorage:", parsedUser);
          
          setForm({
            name: parsedUser.name || '',
            phone: parsedUser.phone || '',
            dateOfBirth: parsedUser.dateOfBirth || '',
            address: parsedUser.address || '',
          });
          
          // Fetch appointments using customer ID from localStorage
          // Ưu tiên sử dụng customerID, nếu không có thì dùng userID
          const customerId = parsedUser.customerID || parsedUser.userID;
          console.log("Customer ID from localStorage:", customerId);
          
          if (customerId) {
            try {
              console.log("Fetching appointments for customerId:", customerId);
              const appointmentsResponse = await appointmentAPI.getAppointmentsByCustomerId(customerId);
              console.log("Appointments API response:", appointmentsResponse);
              if (appointmentsResponse.data) {
                setAppointments(appointmentsResponse.data);
              } else {
                console.warn("No appointment data found in response");
                setError("Không tìm thấy dữ liệu cuộc hẹn cho tài khoản này.");
              }
            } catch (userIdError) {
              console.error("Error fetching with customer ID:", userIdError);
              setError("Có lỗi khi lấy dữ liệu cuộc hẹn. Vui lòng thử lại sau.");
            }
          } else {
            console.warn("No customerID found in localStorage");
            setError("Không tìm thấy ID khách hàng. Vui lòng thiết lập ID mẫu để xem dữ liệu.");
          }
        } else {
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!user) return;
      
      // Update user profile
      const updatedUserData = {
        ...user,
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      };
      
      // Call API to update profile
      await userAPI.updateProfile(updatedUserData);
      
      // Update local state and localStorage
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: 'profile' | 'history') => {
    setTab(newTab);
    
    // Automatically reload appointments data when switching to history tab
    if (newTab === 'history' && user && (user.customerID || user.userID)) {
      reloadData();
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ marginBottom: 20, fontSize: 20, color: '#4b5563' }}>Bạn chưa đăng nhập!</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={createSampleUser} 
            style={{ 
              background: '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '12px 32px', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)'
            }}
          >
            Tạo người dùng mẫu
          </button>
        </div>
        <div style={{ marginTop: 16, color: '#ef4444', fontSize: 14 }}>
          {error && <p>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #e3e8f0', padding: 40 }}>
      {/* Avatar + name/email */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
        <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa 60%,#a5b4fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, color: '#fff', boxShadow: '0 4px 16px #e3e8f0', marginBottom: 18 }}>
          <FaUserCircle style={{ width: 110, height: 110 }} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, color: '#2563eb', letterSpacing: 1 }}>{user.name || 'Tên của bạn'}</div>
        <div style={{ color: '#555', marginBottom: 2, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><FaEnvelope style={{ color: '#3b82f6' }} /> {user.email}</div>
      </div>
      {/* Tab switch */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 36, justifyContent: 'center' }}>
        <button onClick={() => handleTabChange('profile')} style={{ background: tab === 'profile' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'profile' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Hồ Sơ Cá Nhân</button>
        <button onClick={() => handleTabChange('history')} style={{ background: tab === 'history' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'history' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'history' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Lịch Sử Đặt Khám</button>
      </div>
      {/* Tab Profile */}
      {tab === 'profile' && (
        <div style={{ padding: 24, background: 'linear-gradient(90deg,#f0f7ff 60%,#f3f4f6 100%)', borderRadius: 18, boxShadow: '0 2px 8px #e3e8f0', marginBottom: 12 }}>
          <h2 style={{ marginBottom: 32, fontSize: 24, color: '#2563eb', letterSpacing: 1, textAlign: 'center', fontWeight: 700 }}>Thông Tin Hồ Sơ</h2>
          {!editMode ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={infoStyle}><FaUser /><span style={labelStyle}>Họ tên:</span> {user.name || 'Chưa cập nhật'}</div>
                  <div style={infoStyle}><FaEnvelope /><span style={labelStyle}>Email:</span> {user.email}</div>
                  <div style={infoStyle}><FaPhone /><span style={labelStyle}>Điện thoại:</span> {user.phone || 'Chưa cập nhật'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={infoStyle}><FaBirthdayCake /><span style={labelStyle}>Ngày sinh:</span> {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Chưa cập nhật'}</div>
                  <div style={infoStyle}><FaMapMarkerAlt /><span style={labelStyle}>Địa chỉ:</span> {user.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={() => {
                  setForm({
                    name: user.name || '',
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                  });
                  setEditMode(true);
                }} style={{ background: 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e3e8f0', letterSpacing: 1 }}>Chỉnh Sửa</button>
              </div>
            </>
          ) : (
            <form style={{ maxWidth: 600, margin: '0 auto', marginTop: 16 }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Họ tên:</label>
                    <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Điện thoại:</label>
                    <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Ngày sinh:</label>
                    <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} placeholder="YYYY-MM-DD" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Địa chỉ:</label>
                    <input name="address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button type="submit" style={{ background: 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e3e8f0', letterSpacing: 1, marginRight: 16 }}>Lưu</button>
                <button type="button" onClick={() => setEditMode(false)} style={{ background: '#e5e7eb', color: '#333', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', letterSpacing: 1 }}>Hủy</button>
              </div>
            </form>
          )}
        </div>
      )}
      {/* Tab Booking History */}
      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Lịch Sử Đặt Lịch</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={reloadData} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: '#3b82f6', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 16px', 
                  fontWeight: 600, 
                  fontSize: 14, 
                  cursor: 'pointer' 
                }}
              >
                <FaSync /> Tải lại dữ liệu
              </button>
              <Link 
                to="/booking"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: '#10b981', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 16px', 
                  fontWeight: 600, 
                  fontSize: 14, 
                  textDecoration: 'none',
                  cursor: 'pointer' 
                }}
              >
                <FaClock /> Đặt lịch khám
              </Link>
            </div>
          </div>
          
          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#b91c1c', 
              padding: '12px 16px', 
              borderRadius: 8, 
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FaTimesCircle />
              <p style={{ margin: 0, fontSize: 16 }}>{error}</p>
            </div>
          )}

          {appointments.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Mã</th>
                    <th style={{ padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ngày</th>
                    <th style={{ padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Giờ</th>
                    <th style={{ padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Tư vấn viên</th>
                    <th style={{ padding: 16, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Loại</th>
                    <th style={{ padding: 16, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Tổng tiền</th>
                    <th style={{ padding: 16, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Trạng thái</th>
                    <th style={{ padding: 16, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.appointmentID}>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>#{appointment.appointmentID}</td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>{formatDate(appointment.appointmentDate)}</td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>
                        {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                      </td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>{appointment.consultant.name}</td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16, textAlign: 'center' }}>
                        <AppointmentTypeBadge type={appointment.appointmentType} />
                      </td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appointment.totalAmount)}
                      </td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16, textAlign: 'center' }}>
                        <AppointmentStatusBadge status={appointment.status} />
                      </td>
                      <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16, textAlign: 'center' }}>
                        <PaymentStatusBadge status={appointment.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '32px 0', 
              textAlign: 'center', 
              color: '#6b7280',
              background: '#f9fafb',
              borderRadius: 8,
              border: '1px dashed #d1d5db'
            }}>
              <FaFileAlt style={{ fontSize: 48, color: '#9ca3af', marginBottom: 16 }} />
              <p style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Không có lịch sử đặt lịch</p>
              <p style={{ fontSize: 14, margin: '8px 0 0' }}>Các cuộc hẹn của bạn sẽ xuất hiện ở đây</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;