import React, { useState } from 'react';
import './BlogManagement.css';

interface Blog {
  id: number;
  title: string;
  description: string;
  content: string[];
  imageUrl: string;
  publishedDate: string;
  author: string;
  status: 'published' | 'draft';
}

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      title: 'Giáo dục giới tính cho thanh thiếu niên',
      description: 'Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ.',
      content: [
        'Tìm hiểu các phương pháp hiệu quả trong giáo dục giới tính và xây dựng mối quan hệ lành mạnh cho giới trẻ. Hướng dẫn toàn diện này khám phá tầm quan trọng của giáo dục giới tính phù hợp với lứa tuổi và tác động của nó đến sự phát triển của thanh thiếu niên.',
        'Giáo dục giới tính đóng vai trò quan trọng trong việc giúp người trẻ đưa ra quyết định sáng suốt về sức khỏe và các mối quan hệ của họ. Thông qua các phương pháp dựa trên bằng chứng và đối thoại cởi mở, chúng ta có thể tạo ra một môi trường hỗ trợ cho việc học tập và phát triển.',
      ],
      imageUrl: '/blog1.jpg',
      publishedDate: '15 tháng 3, 2024',
      author: 'TS. Nguyễn Thị Hương',
      status: 'published'
    },
    {
      id: 2,
      title: 'Hiểu về sức khỏe sinh sản',
      description: 'Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn.',
      content: [
        'Hướng dẫn cần thiết để duy trì sức khỏe sinh sản và đưa ra quyết định chăm sóc sức khỏe đúng đắn. Tìm hiểu về các khía cạnh khác nhau của sức khỏe sinh sản và cách chăm sóc hệ sinh sản của bạn.',
        'Sức khỏe sinh sản bao gồm nhiều chủ đề, từ giải phẫu cơ bản đến các tình trạng y tế phức tạp. Hiểu về cơ thể và nhu cầu của nó là bước đầu tiên hướng tới việc duy trì sức khỏe sinh sản tối ưu.',
      ],
      imageUrl: '/blog2.jpg',
      publishedDate: '14 tháng 3, 2024',
      author: 'TS. Trần Minh Tuấn',
      status: 'published'
    },
    {
      id: 3,
      title: 'Hướng dẫn phòng ngừa STI',
      description: 'Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục.',
      content: [
        'Tìm hiểu về các phương pháp phòng ngừa và phát hiện sớm các bệnh lây truyền qua đường tình dục. Bài viết này cung cấp thông tin chi tiết về các biện pháp bảo vệ bản thân và người khác khỏi STIs.',
        'Phòng ngừa STIs đòi hỏi sự hiểu biết về các con đường lây truyền, các triệu chứng cần chú ý và các biện pháp bảo vệ hiệu quả. Bài viết này cung cấp thông tin toàn diện để giúp bạn giữ gìn sức khỏe tình dục.',
      ],
      imageUrl: '/blog3.jpg',
      publishedDate: '10 tháng 3, 2024',
      author: 'BS. Lê Văn C',
      status: 'draft'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Lọc blog theo trạng thái và từ khóa tìm kiếm
  const filteredBlogs = blogs.filter(blog => 
    (statusFilter === 'all' || blog.status === statusFilter) &&
    (blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     blog.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Mở modal để thêm blog mới
  const handleAddBlog = () => {
    setCurrentBlog({
      id: blogs.length + 1,
      title: '',
      description: '',
      content: [''],
      imageUrl: '',
      publishedDate: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: '',
      status: 'draft'
    });
    setIsModalOpen(true);
  };

  // Mở modal để chỉnh sửa blog
  const handleEditBlog = (blog: Blog) => {
    setCurrentBlog({ ...blog });
    setIsModalOpen(true);
  };

  // Lưu blog (thêm mới hoặc cập nhật)
  const handleSaveBlog = () => {
    if (!currentBlog) return;

    if (blogs.find(blog => blog.id === currentBlog.id)) {
      // Cập nhật blog hiện có
      setBlogs(blogs.map(blog => 
        blog.id === currentBlog.id ? currentBlog : blog
      ));
    } else {
      // Thêm blog mới
      setBlogs([...blogs, currentBlog]);
    }
    
    setIsModalOpen(false);
    setCurrentBlog(null);
  };

  // Xóa blog
  const handleDeleteBlog = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      setBlogs(blogs.filter(blog => blog.id !== id));
    }
  };

  // Thay đổi trạng thái blog (published/draft)
  const handleToggleStatus = (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    setBlogs(blogs.map(b => 
      b.id === blog.id ? { ...b, status: newStatus } : b
    ));
  };

  return (
    <div className="blog-management">
      <div className="page-header">
        <h1>Quản lý bài viết</h1>
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
            {filteredBlogs.map((blog) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa blog */}
      {isModalOpen && currentBlog && (
        <div className="modal-backdrop">
          <div className="blog-modal">
            <div className="modal-header">
              <h2>{currentBlog.id === blogs.length + 1 ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
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
                  value={currentBlog.content.join('\n\n')}
                  onChange={(e) => setCurrentBlog({...currentBlog, content: e.target.value.split('\n\n')})}
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