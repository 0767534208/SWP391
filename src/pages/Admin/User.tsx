import { useState, useEffect, type ChangeEvent } from 'react';
import { authAPI } from '../../utils/api';
import './User.css';

interface UserType {
  userID?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string;
  isActive?: boolean;
  userName?: string;
  address?: string;
  roles?: string[];
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
  confirmPassword: string;
}

const User = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Form states for adding user
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  // State variables for API data
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getAllAccounts();
        
        console.log('API Response:', response);
        
        if (response && Array.isArray(response)) {
          // Transform the array response to match our UserType interface
          const transformedUsers = response.map(user => ({
            userID: user.userID || '',
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : 'Customer',
            status: user.isActive ? 'active' : 'inactive',
            lastLogin: user.lastLogin || 'N/A',
            isActive: user.isActive,
            userName: user.userName,
            address: user.address,
            roles: user.roles
          }));
          
          setUsers(transformedUsers);
        } else {
          setError('Failed to fetch users data');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

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

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // No longer need handleEdit and handleDelete functions since we're only toggling status
  
  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userEmail: string) => {
    try {
      const user = users.find(u => u.email === userEmail);
      if (!user) return;
      
      const newStatus = !user.isActive;
      const response = await authAPI.updateAccountStatus(userEmail, { status: newStatus });
      
      if (response.statusCode === 200) {
        // Update the local state
        setUsers(users.map(u => 
          u.email === userEmail 
            ? { ...u, isActive: newStatus, status: newStatus ? 'active' : 'inactive' }
            : u
        ));
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('An error occurred while updating user status');
    }
  };

  const handleAddUser = () => {
    // Reset form data
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      password: '',
      confirmPassword: ''
    });
    setIsAddModalOpen(true);
  };

  // CRUD operations
  const addUser = async () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      // Create account using the API - match format from screenshot
      const accountData = {
        userName: formData.email, // Using email as username
        email: formData.email,
        name: formData.name,
        password: formData.password,
        address: formData.role, // Using role as address temporarily
        phone: formData.phone,
        role: formData.role,
        dateOfBirth: new Date().toISOString().split('T')[0] // Use current date as default
      };
      
      const response = await authAPI.createAccount(accountData);
      
      if (response.statusCode === 200) {
        // Refresh the user list after successful creation
        alert('Tạo người dùng thành công');
        
        // Fetch users again to refresh the list
        const updatedResponse = await authAPI.getAllAccounts();
        if (updatedResponse && Array.isArray(updatedResponse)) {
          const transformedUsers = updatedResponse.map(user => ({
            userID: user.userID || '',
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : 'Customer',
            status: user.isActive ? 'active' : 'inactive',
            lastLogin: user.lastLogin || 'N/A',
            isActive: user.isActive,
            userName: user.userName,
            address: user.address,
            roles: user.roles
          }));
          
          setUsers(transformedUsers);
        }
        
        setIsAddModalOpen(false);
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      alert('An error occurred while creating the user');
    }
  };

  // We're not updating users, only toggling their status

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
          onClick={handleAddUser}
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
        {loading ? (
          <div className="p-4 text-center">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p>Đang tải dữ liệu người dùng...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p>{error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="users-table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Đăng Nhập Cuối</th>
                  <th className="w-16">Thay Đổi Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user.email || index}>
                      <td>{user.userID?.substring(0, 6) || index+1}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role === 'Admin' ? 'Quản Trị Viên' : 
                           user.role === 'Consultant' ? 'Tư Vấn Viên' : 
                           user.role === 'Staff' ? 'Nhân Viên' : 'Người Dùng'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`status-toggle status-${user.status}`} 
                          onClick={() => toggleUserStatus(user.email)}
                          title="Click để thay đổi trạng thái"
                        >
                          {user.status === 'active' ? 'Hoạt Động' : 
                           user.status === 'inactive' ? 'Không Hoạt Động' : 'Đã Khóa'}
                        </button>
                      </td>
                      <td>{user.lastLogin}</td>
                      <td>
                        <button 
                          className="action-button action-button-toggle" 
                          style={{ backgroundColor: user.status === 'active' ? '#fee2e2' : '#d1fae5', border: '1px solid', borderColor: user.status === 'active' ? '#fecaca' : '#a7f3d0' }}
                          onClick={() => toggleUserStatus(user.email)}
                          title={user.status === 'active' ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
                        >
                          {user.status === 'active' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#dc2626" style={{ display: 'block', visibility: 'visible' }}>
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#059669" style={{ display: 'block', visibility: 'visible' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
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
        )}
        
        {/* Pagination */}
        {!loading && !error && filteredUsers.length > 0 && (
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

      {/* Add User Modal */}
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
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập họ tên đầy đủ"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập địa chỉ email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai Trò</label>
                    <select 
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="user">Người Dùng</option>
                      <option value="consultant">Tư Vấn Viên</option>
                      <option value="admin">Quản Trị Viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select 
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Hoạt Động</option>
                      <option value="inactive">Không Hoạt Động</option>
                      <option value="blocked">Đã Khóa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu</label>
                    <input 
                      type="password" 
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác Nhận Mật Khẩu</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
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
                onClick={addUser}
              >
                Thêm Người Dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal removed since we no longer need it */}

      {/* Delete Confirmation Modal removed since we no longer need it */}
    </div>
  );
};

export default User;