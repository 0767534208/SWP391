import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogApproval.css';
import { blogAPI } from '../../utils/api';
import api from '../../utils/api';

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

const BlogApproval: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogDisplay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'approve' | 'reject',
    blog: BlogDisplay
  } | null>(null);

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

  // Hiển thị modal xác nhận trước khi phê duyệt
  const handleApproveClick = (blog: BlogDisplay) => {
    setPendingAction({
      type: 'approve',
      blog: blog
    });
    setIsConfirmModalOpen(true);
  };
  
  // Phê duyệt/xuất bản blog
  const handleApproveBlog = async (blog: BlogDisplay) => {
    try {
      console.log('🔄 Đang phê duyệt và xuất bản bài viết, ID:', blog.id);
      
      // Sử dụng updateBlog API thay vì ActivateBlog để giữ nguyên các thông tin khác
      const response = await blogAPI.updateBlog({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        author: blog.author,
        isPublished: true // Đặt isPublished thành true thay vì status
      });
      
      if (response && response.statusCode === 200) {
        console.log('✅ Phê duyệt và xuất bản bài viết thành công:', response);
        setNotification({ message: 'Phê duyệt và xuất bản bài viết thành công!', type: 'success' });
        
        // Cập nhật trạng thái trực tiếp trong mảng blogs
        setBlogs(prevBlogs => 
          prevBlogs.map(b => 
            b.id === blog.id ? {...b, status: 'published'} : b
          )
        );
      } else {
        console.log('❌ Phê duyệt và xuất bản bài viết thất bại:', response);
        setNotification({ message: 'Phê duyệt và xuất bản bài viết thất bại!', type: 'error' });
      }
      
      // Refresh blog list
      fetchBlogs();
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('❌ Lỗi khi phê duyệt bài viết:', error);
      setNotification({ message: 'Có lỗi xảy ra khi phê duyệt bài viết. Vui lòng thử lại.', type: 'error' });
    }
  };

  // Hiển thị modal xác nhận trước khi vô hiệu hóa
  const handleRejectClick = (blog: BlogDisplay) => {
    setPendingAction({
      type: 'reject',
      blog: blog
    });
    setIsConfirmModalOpen(true);
  };
  
  // Từ chối/vô hiệu hóa blog
  const handleRejectBlog = async (blog: BlogDisplay) => {
    try {
      console.log('🔄 Đang từ chối/vô hiệu hóa bài viết, ID:', blog.id);
      
      // Sử dụng updateBlog API thay vì DeactivateBlog để giữ nguyên các thông tin khác
      const response = await blogAPI.updateBlog({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        author: blog.author,
        isPublished: false // Đặt isPublished thành false thay vì status
      });
      
      if (response && response.statusCode === 200) {
        console.log('✅ Từ chối/vô hiệu hóa bài viết thành công:', response);
        setNotification({ message: 'Từ chối/vô hiệu hóa bài viết thành công!', type: 'success' });
        
        // Cập nhật trạng thái trực tiếp trong mảng blogs
        setBlogs(prevBlogs => 
          prevBlogs.map(b => 
            b.id === blog.id ? {...b, status: 'draft'} : b
          )
        );
      } else {
        console.log('❌ Từ chối/vô hiệu hóa bài viết thất bại:', response);
        setNotification({ message: 'Từ chối/vô hiệu hóa bài viết thất bại!', type: 'error' });
      }
      
      // Refresh blog list
      fetchBlogs();
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('❌ Lỗi khi từ chối/vô hiệu hóa bài viết:', error);
      setNotification({ message: 'Có lỗi xảy ra khi từ chối/vô hiệu hóa bài viết. Vui lòng thử lại.', type: 'error' });
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

  // Xem chi tiết blog
  const handleViewBlog = (blogId: string) => {
    // Chuyển đến trang chi tiết blog trong cùng tab
    navigate(`/blog/${blogId}`, { state: { fromManager: true } });
  };

  // Xử lý khi xác nhận thao tác
  const handleConfirmAction = async () => {
    if (pendingAction) {
      // Đóng modal trước để giao diện người dùng phản hồi nhanh chóng
      setIsConfirmModalOpen(false);
      
      // Hiển thị thông báo đang xử lý
      setNotification({ 
        message: pendingAction.type === 'approve' 
          ? 'Đang xử lý phê duyệt...' 
          : 'Đang xử lý vô hiệu hóa...', 
        type: 'success' 
      });
      
      // Thực hiện thao tác tương ứng
      if (pendingAction.type === 'approve') {
        await handleApproveBlog(pendingAction.blog);
      } else if (pendingAction.type === 'reject') {
        await handleRejectBlog(pendingAction.blog);
      }
      
      // Reset trạng thái
      setPendingAction(null);
    }
  };

  // Xử lý khi hủy thao tác
  const handleCancelAction = () => {
    setIsConfirmModalOpen(false);
    setPendingAction(null);
  };

  return (
    <div className="blog-approval-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✅ ' : '❌ '}
          {notification.message}
        </div>
      )}
      
      <div className="page-header">
        <h1 className="page-title">Quản Lý Phê Duyệt Bài Viết</h1>
        <p className="page-subtitle">Phê duyệt, từ chối hoặc vô hiệu hóa bài viết trên hệ thống</p>
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

                        {blog.status === 'draft' && (
                          <button 
                            className="approve-btn" 
                            title="Phê duyệt và xuất bản"
                            onClick={() => handleApproveClick(blog)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}

                        {blog.status === 'published' && (
                          <button 
                            className="reject-btn" 
                            title="Vô hiệu hóa bài viết"
                            onClick={() => handleRejectClick(blog)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        
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

      {/* Modal xác nhận phê duyệt hoặc vô hiệu hóa */}
      {isConfirmModalOpen && pendingAction && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>
                {pendingAction.type === 'approve' 
                  ? 'Xác nhận phê duyệt bài viết' 
                  : 'Xác nhận vô hiệu hóa bài viết'}
              </h3>
            </div>
            <div className="modal-body">
              <p>
                {pendingAction.type === 'approve'
                  ? `Bạn có chắc chắn muốn phê duyệt và xuất bản bài viết "${pendingAction.blog.title}" không?`
                  : `Bạn có chắc chắn muốn vô hiệu hóa bài viết "${pendingAction.blog.title}" không?`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelAction}>Hủy</button>
              <button 
                className={pendingAction.type === 'approve' ? 'confirm-approve-btn' : 'confirm-reject-btn'} 
                onClick={handleConfirmAction}
              >
                {pendingAction.type === 'approve' ? 'Phê duyệt' : 'Vô hiệu hóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogApproval;
