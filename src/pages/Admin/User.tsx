import React, { useState } from 'react';
import './User.css';

const User = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Mock data
  const users = [
    { id: 1, name: "John Smith", email: "johnsmith@example.com", phone: "0912345678", role: "user", status: "active", lastLogin: "10/05/2023 08:15" },
    { id: 2, name: "Sarah Johnson", email: "sarahjohnson@example.com", phone: "0923456789", role: "user", status: "active", lastLogin: "11/05/2023 14:20" },
    { id: 3, name: "Michael Brown", email: "michaelbrown@example.com", phone: "0934567890", role: "admin", status: "active", lastLogin: "12/05/2023 09:30" },
    { id: 4, name: "Emily Davis", email: "emilydavis@example.com", phone: "0945678901", role: "consultant", status: "inactive", lastLogin: "08/05/2023 16:45" },
    { id: 5, name: "David Wilson", email: "davidwilson@example.com", phone: "0956789012", role: "user", status: "active", lastLogin: "13/05/2023 10:10" },
    { id: 6, name: "Jennifer Taylor", email: "jennifertaylor@example.com", phone: "0967890123", role: "user", status: "blocked", lastLogin: "05/05/2023 11:25" },
    { id: 7, name: "Robert Martinez", email: "robertmartinez@example.com", phone: "0978901234", role: "consultant", status: "active", lastLogin: "14/05/2023 08:50" },
    { id: 8, name: "Lisa Anderson", email: "lisaanderson@example.com", phone: "0989012345", role: "user", status: "inactive", lastLogin: "07/05/2023 15:30" },
    { id: 9, name: "James Thomas", email: "jamesthomas@example.com", phone: "0990123456", role: "user", status: "active", lastLogin: "15/05/2023 12:40" },
    { id: 10, name: "Patricia White", email: "patriciawhite@example.com", phone: "0901234567", role: "admin", status: "active", lastLogin: "16/05/2023 09:15" },
    { id: 11, name: "Richard Harris", email: "richardharris@example.com", phone: "0912345670", role: "user", status: "active", lastLogin: "17/05/2023 14:20" },
    { id: 12, name: "Elizabeth Clark", email: "elizabethclark@example.com", phone: "0923456781", role: "user", status: "blocked", lastLogin: "02/05/2023 10:35" },
  ];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.phone.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Status badge color mapping
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge status-badge-success';
      case 'inactive':
        return 'status-badge status-badge-warning';
      case 'blocked':
        return 'status-badge status-badge-danger';
      default:
        return 'status-badge status-badge-info';
    }
  };

  // Role badge color mapping
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'status-badge status-badge-danger';
      case 'consultant':
        return 'status-badge status-badge-info';
      case 'user':
        return 'status-badge status-badge-success';
      default:
        return 'status-badge status-badge-info';
    }
  };

  // Handle user actions
  const handleEdit = (userId: number) => {
    console.log('Edit user', userId);
    // Open edit modal with user data
  };

  const handleDelete = (userId: number) => {
    console.log('Delete user', userId);
    // Show confirmation dialog
  };

  return (
    <div className="users-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Người Dùng</h1>
          <p className="text-sm text-gray-500">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <button 
          className="add-user-button"
          onClick={() => setIsAddModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Thêm Người Dùng</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="users-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tất Cả Vai Trò</option>
              <option value="admin">Quản Trị Viên</option>
              <option value="consultant">Tư Vấn Viên</option>
              <option value="user">Người Dùng</option>
            </select>
            
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="active">Hoạt Động</option>
              <option value="inactive">Không Hoạt Động</option>
              <option value="blocked">Đã Khóa</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="text-sm text-gray-500">Tổng: <span className="font-semibold text-gray-800">{filteredUsers.length} người dùng</span></span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="users-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Vai Trò</th>
                <th>Trạng Thái</th>
                <th>Đăng Nhập Cuối</th>
                <th className="w-20">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role === 'admin' ? 'Quản Trị Viên' : 
                         user.role === 'consultant' ? 'Tư Vấn Viên' : 'Người Dùng'}
                      </span>
                    </td>
                    <td>
                      <span className={getBadgeClass(user.status)}>
                        {user.status === 'active' ? 'Hoạt Động' : 
                         user.status === 'inactive' ? 'Không Hoạt Động' : 'Đã Khóa'}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="action-button action-button-edit"
                          onClick={() => handleEdit(user.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Sửa</span>
                        </button>
                        <button 
                          className="action-button action-button-delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">Không tìm thấy người dùng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-button"
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="pagination-button"
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Add User Modal - In a real app, this would be a separate component */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-gray-900">Thêm Người Dùng Mới</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <form>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Nhập họ tên đầy đủ"
                      />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai Trò</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="user">Người Dùng</option>
                      <option value="consultant">Tư Vấn Viên</option>
                      <option value="admin">Quản Trị Viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác Nhận Mật Khẩu</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Xác nhận mật khẩu"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsAddModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                onClick={() => {
                  // Logic to add user
                  setIsAddModalOpen(false);
                }}
              >
                Thêm Người Dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;