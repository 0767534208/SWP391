import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaCheckCircle, FaTimesCircle, FaClock, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const mockBookings = [
  { 
    id: 1, 
    date: '01/06/2024', 
    time: '09:00', 
    service: 'Xét nghiệm STI', 
    status: 'Đã xác nhận',
    hasResults: true,
    resultId: '123456'
  },
  { 
    id: 2, 
    date: '10/06/2024', 
    time: '14:00', 
    service: 'Tư vấn sức khỏe', 
    status: 'Đã hủy',
    hasResults: false
  },
  { 
    id: 3, 
    date: '30/05/2025', 
    time: '10:00', 
    service: 'Khám sức khỏe sinh sản', 
    status: 'Đang chờ',
    hasResults: false
  },
];

const statusColor = (status: string) => {
  if (status === 'Đã xác nhận') return '#16a34a';
  if (status === 'Đã hủy') return '#e53e3e';
  return '#f59e42';
};
const statusIcon = (status: string) => {
  if (status === 'Đã xác nhận') return <FaCheckCircle color="#16a34a" style={{marginRight: 4}} />;
  if (status === 'Đã hủy') return <FaTimesCircle color="#e53e3e" style={{marginRight: 4}} />;
  return <FaClock color="#f59e42" style={{marginRight: 4}} />;
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

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'profile' | 'history'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    address: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        dob: u.dob || '',
        address: u.address || '',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...form };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setEditMode(false);
  };

  if (!user) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Bạn chưa đăng nhập!</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '48px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #e3e8f0', padding: 40 }}>
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
        <button onClick={() => setTab('profile')} style={{ background: tab === 'profile' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'profile' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Hồ Sơ Cá Nhân</button>
        <button onClick={() => setTab('history')} style={{ background: tab === 'history' ? 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)' : '#f3f4f6', color: tab === 'history' ? '#fff' : '#333', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: tab === 'history' ? '0 2px 8px #e3e8f0' : 'none', transition: 'all 0.2s', letterSpacing: 1 }}>Lịch Sử Đặt Khám</button>
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
                  <div style={infoStyle}><FaPhone /><span style={labelStyle}>Điện thoại:</span> {user.phone || '0123 456 789'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={infoStyle}><FaBirthdayCake /><span style={labelStyle}>Ngày sinh:</span> {user.dob || '01/01/2000'}</div>
                  <div style={infoStyle}><FaMapMarkerAlt /><span style={labelStyle}>Địa chỉ:</span> {user.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={() => {
                  setForm({
                    name: user.name || '',
                    phone: user.phone || '',
                    dob: user.dob || '',
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
                    <input name="dob" value={form.dob} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, marginTop: 4 }} />
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
        <div style={{ padding: 24, background: 'linear-gradient(90deg,#f0f7ff 60%,#f3f4f6 100%)', borderRadius: 18, boxShadow: '0 2px 8px #e3e8f0' }}>
          <h2 style={{ marginBottom: 32, fontSize: 24, color: '#2563eb', letterSpacing: 1, textAlign: 'center', fontWeight: 700 }}>Lịch Sử Đặt Khám</h2>
          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <button onClick={() => window.location.href = '/booking'} style={{ background: 'linear-gradient(90deg,#3b82f6 60%,#60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e3e8f0', letterSpacing: 1 }}>
              Đặt Lịch Khám
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px #e3e8f0' }}>
              <thead>
                <tr style={{ background: '#e0e7ef' }}>
                  <th style={{ padding: 16, border: '1px solid #eee', fontWeight: 700, fontSize: 16 }}>Ngày</th>
                  <th style={{ padding: 16, border: '1px solid #eee', fontWeight: 700, fontSize: 16 }}>Giờ</th>
                  <th style={{ padding: 16, border: '1px solid #eee', fontWeight: 700, fontSize: 16 }}>Dịch vụ</th>
                  <th style={{ padding: 16, border: '1px solid #eee', fontWeight: 700, fontSize: 16 }}>Trạng thái</th>
                  <th style={{ padding: 16, border: '1px solid #eee', fontWeight: 700, fontSize: 16 }}>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {mockBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>{b.date}</td>
                    <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>{b.time}</td>
                    <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16 }}>{b.service}</td>
                    <td style={{ padding: 16, border: '1px solid #eee', color: statusColor(b.status), fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                      {statusIcon(b.status)}{b.status}
                    </td>
                    <td style={{ padding: 16, border: '1px solid #eee', fontSize: 16, textAlign: 'center' }}>
                      {b.hasResults && b.service === 'Xét nghiệm STI' ? (
                        <Link 
                          to={`/test-results/${b.resultId}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#4f46e5',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#4f46e5'}
                        >
                          <FaFileAlt /> Xem kết quả
                        </Link>
                      ) : (
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                          {b.status === 'Đã hủy' ? 'Không có' : 'Chưa có'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;