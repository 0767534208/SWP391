import React, { useState, useEffect } from 'react';
import './BlogManagement.css';
import { blogService } from '../../services';
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
  const [blogs, setBlogs] = useState<BlogDisplay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<BlogDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await blogService.getAllBlogs();
      if (response.data && response.data.items) {
        const formattedBlogs: BlogDisplay[] = response.data.items.map(blog => ({
          id: blog.id,
          title: blog.title,
          description: blog.summary,
          content: blog.content,
          imageUrl: blog.image || '',
          publishedDate: new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
          author: blog.author?.name || 'Unknown',
          status: blog.isPublished ? 'published' : 'draft'
        }));
        setBlogs(formattedBlogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
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
      author: '',
      status: 'draft'
    });
    setIsModalOpen(true);
  };

  // Mở modal để chỉnh sửa blog
  const handleEditBlog = (blog: BlogDisplay) => {
    setCurrentBlog({ ...blog });
    setIsModalOpen(true);
  };

  // Lưu blog (thêm mới hoặc cập nhật)
  const handleSaveBlog = async () => {
    if (!currentBlog) return;

    try {
      const blogData: BlogCreationRequest = {
        title: currentBlog.title,
        content: currentBlog.content,
        summary: currentBlog.description,
        image: currentBlog.imageUrl,
        isPublished: currentBlog.status === 'published',
      };

      if (currentBlog.id) {
        // Update existing blog
        await blogService.updateBlog(currentBlog.id, blogData);
      } else {
        // Create new blog
        await blogService.createBlog(blogData);
      }
      
      // Refresh blog list
      fetchBlogs();
      setIsModalOpen(false);
      setCurrentBlog(null);
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  // Xóa blog
  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await blogService.deleteBlog(id);
        // Refresh blog list
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Thay đổi trạng thái blog (published/draft)
  const handleToggleStatus = async (blog: BlogDisplay) => {
    try {
      if (blog.status === 'published') {
        await blogService.deactivateBlog(blog.id);
      } else {
        await blogService.activateBlog(blog.id);
      }
      // Refresh blog list
      fetchBlogs();
    } catch (error) {
      console.error('Error toggling blog status:', error);
    }
  };

  return (
    <div className="blog-management-container">
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
            <option value="draft">Bản nháp</option>
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
                        {blog.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-details-button" 
                          title="Xem chi tiết"
                          onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
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
                        <button 
                          className="status-btn" 
                          title={blog.status === 'published' ? 'Chuyển sang bản nháp' : 'Xuất bản'}
                          onClick={() => handleToggleStatus(blog)}
                        >
                          {blog.status === 'published' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          )}
                        </button>
                        <button 
                          className="delete-button" 
                          title="Xóa"
                          onClick={() => handleDeleteBlog(blog.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select 
                  id="status"
                  value={currentBlog.status}
                  onChange={(e) => setCurrentBlog({...currentBlog, status: e.target.value as 'published' | 'draft'})}
                >
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button className="save-btn" onClick={handleSaveBlog}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 