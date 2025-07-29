import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogManagement.css';
import { blogAPI } from '../../utils/api';
import api from '../../utils/api';
import type { Blog, BlogCreationRequest } from '../../types';

interface BlogDisplay {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  publishedDate: string;
  author: string;
  status: 'published' | 'draft';
}

const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogDisplay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<BlogDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Đang tải danh sách bài viết...');
      const response = await blogAPI.getBlogs();
      
      // Handle different response scenarios
      if (response.statusCode === 200 && response.data) {
        console.log('✅ Tải danh sách bài viết thành công:', response);
        
        const formattedBlogs: BlogDisplay[] = Array.isArray(response.data) ? response.data.map((blog: any) => ({
          id: blog.blogID?.toString() || '',
          title: blog.title || '',
          description: blog.summary || blog.content?.substring(0, 100) || '',
          content: blog.content || '',
          imageUrl: blog.imageBlogs?.[0]?.image || blog.image || '',
          publishedDate: blog.createAt ? new Date(blog.createAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Invalid Date',
          author: blog.author || 'Unknown',
          status: blog.status ? 'published' : 'draft'
        })) : [];
        
        setBlogs(formattedBlogs);
        console.log(`📊 Đã tải ${formattedBlogs.length} bài viết`);
      } else if (response.statusCode === 502) {
        // Handle server error
        console.error('❌ Lỗi máy chủ:', response.message);
        setBlogs([]); // Set empty array for now
      } else {
        console.error('❌ Phản hồi không mong đợi:', response);
        setBlogs([]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách bài viết:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc blog theo trạng thái và từ khóa tìm kiếm
  const filteredBlogs = blogs.filter(blog => 
    (statusFilter === 'all' || blog.status === statusFilter) &&
    (blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     blog.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Mở modal để thêm blog mới
  const handleAddBlog = () => {
    setCurrentBlog({
      id: '',
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      publishedDate: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: 'Staff', // Default author for staff
      status: 'draft' // Always draft for new blogs
    });
    setIsModalOpen(true);
  };

  // Mở modal để chỉnh sửa blog
  const handleEditBlog = (blog: BlogDisplay) => {
    setCurrentBlog({ ...blog });
    setIsModalOpen(true);
  };

  // Hiển thị modal xác nhận trước khi lưu
  const handleSaveClick = () => {
    if (!currentBlog) return;

    // Validate required fields before showing confirmation
    if (!currentBlog.title.trim()) {
      alert('Vui lòng nhập tiêu đề blog');
      return;
    }
    if (!currentBlog.author.trim()) {
      alert('Vui lòng nhập tên tác giả');
      return;
    }
    if (!currentBlog.content.trim()) {
      alert('Vui lòng nhập nội dung blog');
      return;
    }

    // Show confirmation modal
    setIsConfirmModalOpen(true);
  };

  // Lưu blog (thêm mới hoặc cập nhật) sau khi đã xác nhận
  const handleSaveBlog = async () => {
    if (!currentBlog) return;

    try {
      if (currentBlog.id) {
        // Update existing blog
        console.log('Đang cập nhật bài viết với ID:', currentBlog.id);
        const response = await blogAPI.updateBlog({
          id: currentBlog.id,
          title: currentBlog.title.trim(),
          content: currentBlog.content.trim(),
          author: currentBlog.author.trim(),
          status: currentBlog.status === 'published'
        });
        
        if (response && response.statusCode === 200) {
          console.log('✅ Cập nhật bài viết thành công:', response);
          setNotification({ message: 'Cập nhật bài viết thành công!', type: 'success' });
        } else {
          console.log('❌ Cập nhật bài viết thất bại:', response);
          setNotification({ message: 'Cập nhật bài viết thất bại!', type: 'error' });
          throw new Error('Cập nhật bài viết thất bại');
        }
      } else {
        // Create new blog - always set to draft status
        console.log('Đang tạo bài viết mới với dữ liệu:', {
          title: currentBlog.title.trim(),
          content: currentBlog.content.trim(),
          author: currentBlog.author.trim(),
          isPublished: false, // Always set to draft
          image: currentBlog.imageUrl
        });
        
        const response = await blogAPI.createBlog({
          title: currentBlog.title.trim(),
          content: currentBlog.content.trim(),
          author: currentBlog.author.trim(),
          isPublished: false, // Always set to draft
          image: currentBlog.imageUrl
        });
        
        if (response && response.statusCode === 200) {
          console.log('✅ Tạo bài viết thành công:', response);
          setNotification({ message: 'Tạo bài viết thành công!', type: 'success' });
        } else {
          console.log('❌ Tạo bài viết thất bại:', response);
          setNotification({ message: 'Tạo bài viết thất bại!', type: 'error' });
          throw new Error('Tạo bài viết thất bại');
        }
      }
      
      // Refresh blog list
      fetchBlogs();
      setIsConfirmModalOpen(false);
      setIsModalOpen(false);
      setCurrentBlog(null);
      
      // Show success message in console
      console.log('✅ Thao tác thành công - Bài viết đã được lưu và danh sách đã được cập nhật');

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('❌ Lỗi khi lưu bài viết:', error);
      setIsConfirmModalOpen(false);
      setNotification({ message: 'Có lỗi xảy ra khi lưu blog. Vui lòng thử lại.', type: 'error' });
    }
  };

  // Xóa blog
  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        console.log('Đang xóa bài viết với ID:', id);
        // Use the generic delete method from api
        const response = await api.delete(`/api/blog/DeleteBlog?blogId=${id}`);
        
        if (response && response.statusCode === 200) {
          console.log('✅ Xóa bài viết thành công:', response);
          setNotification({ message: 'Xóa bài viết thành công!', type: 'success' });
        } else {
          console.log('❌ Xóa bài viết thất bại:', response);
          setNotification({ message: 'Xóa bài viết thất bại!', type: 'error' });
        }
        
        // Refresh blog list
        fetchBlogs();
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      } catch (error) {
        console.error('❌ Lỗi khi xóa bài viết:', error);
        setNotification({ message: 'Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại.', type: 'error' });
      }
    }
  };

  // Thay đổi trạng thái blog (published/draft)
  const handleToggleStatus = async (blog: BlogDisplay) => {
    try {
      if (blog.status === 'published') {
        // Deactivate blog (set to draft)
        console.log('Đang chuyển bài viết sang chế độ chưa xuất bản, ID:', blog.id);
        const response = await api.put(`/api/blog/DeactivateBlog?blogId=${blog.id}`);
        
        if (response && response.statusCode === 200) {
          console.log('✅ Chuyển trạng thái thành chưa xuất bản thành công:', response);
          setNotification({ message: 'Chuyển trạng thái thành chưa xuất bản thành công!', type: 'success' });
        } else {
          console.log('❌ Chuyển trạng thái thành chưa xuất bản thất bại:', response);
          setNotification({ message: 'Chuyển trạng thái thành chưa xuất bản thất bại!', type: 'error' });
        }
      } else {
        // Activate blog (set to published)
        console.log('Đang xuất bản bài viết, ID:', blog.id);
        const response = await api.put(`/api/blog/ActivateBlog?blogId=${blog.id}`);
        
        if (response && response.statusCode === 200) {
          console.log('✅ Xuất bản bài viết thành công:', response);
          setNotification({ message: 'Xuất bản bài viết thành công!', type: 'success' });
        } else {
          console.log('❌ Xuất bản bài viết thất bại:', response);
          setNotification({ message: 'Xuất bản bài viết thất bại!', type: 'error' });
        }
      }
      
      // Refresh blog list
      fetchBlogs();
      console.log('✅ Thay đổi trạng thái bài viết thành công - Danh sách đã được cập nhật');
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('❌ Lỗi khi thay đổi trạng thái bài viết:', error);
      setNotification({ message: 'Có lỗi xảy ra khi thay đổi trạng thái bài viết. Vui lòng thử lại.', type: 'error' });
    }
  };

  // Xem chi tiết blog
  const handleViewBlog = (blogId: string) => {
    // Chuyển đến trang chi tiết blog trong cùng tab
    navigate(`/blog/${blogId}`, { state: { fromStaff: true } });
  };

  return (
    <div className="blog-management-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✅ ' : '❌ '}
          {notification.message}
        </div>
      )}
      
      <div className="page-header">
        <h1 className="page-title">Quản Lý Bài Viết</h1>
        <p className="page-subtitle">Tạo và quản lý các bài viết trên hệ thống</p>
      </div>
      
      {/* Toolbar */}
      <div className="toolbar">
        <button className="add-blog-btn" onClick={handleAddBlog}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm bài viết mới
        </button>
      </div>

      <div className="filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tiêu đề, tác giả..." 
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
            <option value="published">Đã xuất bản</option>
            <option value="draft">Chưa xuất bản</option>
          </select>
        </div>
      </div>

      <div className="blogs-table-container">
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="blogs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày xuất bản</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>{blog.id}</td>
                    <td className="blog-title-cell">{blog.title}</td>
                    <td>{blog.author}</td>
                    <td>{blog.publishedDate}</td>
                    <td>
                      <span className={`status-badge ${blog.status}`}>
                        {blog.status === 'published' ? 'Đã xuất bản' : 'Chưa xuất bản'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-details-button" 
                          title="Xem chi tiết"
                          onClick={() => handleViewBlog(blog.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="edit-btn" 
                          title="Chỉnh sửa"
                          onClick={() => handleEditBlog(blog)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-data">Không có bài viết nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal thêm/sửa blog */}
      {isModalOpen && currentBlog && (
        <div className="modal-backdrop">
          <div className="blog-modal">
            <div className="modal-header">
              <h2>{currentBlog.id ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input 
                  type="text" 
                  id="title"
                  value={currentBlog.title}
                  onChange={(e) => setCurrentBlog({...currentBlog, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả ngắn</label>
                <textarea 
                  id="description"
                  value={currentBlog.description}
                  onChange={(e) => setCurrentBlog({...currentBlog, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Nội dung</label>
                <textarea 
                  id="content"
                  value={currentBlog.content}
                  onChange={(e) => setCurrentBlog({...currentBlog, content: e.target.value})}
                  required
                  className="content-textarea"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="author">Tác giả</label>
                  <input 
                    type="text" 
                    id="author"
                    value={currentBlog.author}
                    onChange={(e) => setCurrentBlog({...currentBlog, author: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageUrl">URL Hình ảnh</label>
                  <input 
                    type="text" 
                    id="imageUrl"
                    value={currentBlog.imageUrl}
                    onChange={(e) => setCurrentBlog({...currentBlog, imageUrl: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button className="save-btn" onClick={handleSaveClick}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {isConfirmModalOpen && currentBlog && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <div className="confirm-header">
              <h2>Xác nhận</h2>
            </div>
            <div className="confirm-body">
              <p>
                {currentBlog.id 
                  ? "Bạn có chắc chắn muốn cập nhật bài viết này không?" 
                  : "Bạn có chắc chắn muốn tạo bài viết mới không?"}
              </p>
            </div>
            <div className="confirm-footer">
              <button className="cancel-btn" onClick={() => setIsConfirmModalOpen(false)}>Hủy</button>
              <button className="confirm-btn" onClick={handleSaveBlog}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
