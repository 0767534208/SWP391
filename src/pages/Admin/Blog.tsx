import React, { useState } from 'react';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  author: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  date: string;
  featured: boolean;
  content?: string;
}

interface BlogPostModalProps {
  post?: BlogPost;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<BlogPost>) => void;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>(
    post || {
      title: '',
      category: 'Sức khỏe',
      author: '',
      status: 'draft',
      featured: false,
      content: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-3 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {post ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="HIV">HIV</option>
                  <option value="STI">STI</option>
                  <option value="HPV">HPV</option>
                  <option value="Viêm gan">Viêm gan</option>
                  <option value="Sức khỏe">Sức khỏe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                <input 
                  type="text" 
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tên tác giả"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                  <option value="scheduled">Đã lên lịch</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center mt-5">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Đánh dấu là bài viết nổi bật
                  </label>
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập nội dung bài viết"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
            >
              {post ? 'Cập nhật' : 'Thêm bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);
  const postsPerPage = 10;

  // Mock data
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id: 1, title: "Hiểu về HIV/AIDS và cách phòng ngừa", category: "HIV", author: "Bs. Nguyễn Văn A", status: "published", views: 1240, date: "15/06/2023", featured: true },
    { id: 2, title: "Các bệnh STI phổ biến và triệu chứng", category: "STI", author: "Bs. Trần Thị B", status: "published", views: 950, date: "10/06/2023", featured: false },
    { id: 3, title: "Tầm quan trọng của việc xét nghiệm định kỳ", category: "Sức khỏe", author: "Bs. Lê Văn C", status: "draft", views: 0, date: "12/06/2023", featured: false },
    { id: 4, title: "Lối sống lành mạnh và sức khỏe tình dục", category: "Sức khỏe", author: "Bs. Phạm Thị D", status: "published", views: 820, date: "05/06/2023", featured: false },
    { id: 5, title: "Hiểu đúng về HPV và vaccine phòng ngừa", category: "HPV", author: "Bs. Hoàng Văn E", status: "published", views: 1560, date: "01/06/2023", featured: true },
    { id: 6, title: "Các phương pháp tránh thai an toàn", category: "Sức khỏe", author: "Bs. Ngô Thị F", status: "published", views: 1100, date: "28/05/2023", featured: false },
    { id: 7, title: "Viêm gan B và C: Nguyên nhân và phòng ngừa", category: "Viêm gan", author: "Bs. Đỗ Văn G", status: "draft", views: 0, date: "25/05/2023", featured: false },
    { id: 8, title: "Giang mai và cách điều trị", category: "STI", author: "Bs. Lý Thị H", status: "published", views: 780, date: "20/05/2023", featured: false },
    { id: 9, title: "Lậu và biến chứng nguy hiểm", category: "STI", author: "Bs. Vũ Văn I", status: "scheduled", views: 0, date: "25/06/2023", featured: false },
    { id: 10, title: "Sức khỏe sinh sản nam giới", category: "Sức khỏe", author: "Bs. Mai Thị K", status: "published", views: 920, date: "15/05/2023", featured: false },
    { id: 11, title: "Sức khỏe sinh sản nữ giới", category: "Sức khỏe", author: "Bs. Trịnh Văn L", status: "published", views: 1050, date: "10/05/2023", featured: false },
    { id: 12, title: "Chlamydia: Triệu chứng và điều trị", category: "STI", author: "Bs. Đinh Thị M", status: "draft", views: 0, date: "05/05/2023", featured: false },
  ]);

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'admin-badge admin-badge-success';
      case 'draft':
        return 'admin-badge admin-badge-warning';
      case 'scheduled':
        return 'admin-badge admin-badge-info';
      default:
        return 'admin-badge admin-badge-info';
    }
  };

  // Handle post actions
  const handleEdit = (id: number) => {
    const post = blogPosts.find(p => p.id === id);
    if (post) {
      setEditingPost(post);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này không?')) {
      setBlogPosts(blogPosts.filter(post => post.id !== id));
    }
  };
  
  const handleToggleFeatured = (id: number) => {
    setBlogPosts(blogPosts.map(post => 
      post.id === id ? { ...post, featured: !post.featured } : post
    ));
  };

  const handleAddNew = () => {
    setEditingPost(undefined);
    setIsModalOpen(true);
  };

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (editingPost) {
      // Update existing post
      setBlogPosts(blogPosts.map(post => 
        post.id === editingPost.id ? { ...post, ...postData } : post
      ));
    } else {
      // Add new post
      const newPost: BlogPost = {
        id: Math.max(...blogPosts.map(p => p.id)) + 1,
        title: postData.title || '',
        category: postData.category || 'Sức khỏe',
        author: postData.author || '',
        status: postData.status as 'published' | 'draft' | 'scheduled',
        views: 0,
        date: new Date().toLocaleDateString('vi-VN'),
        featured: postData.featured || false,
        content: postData.content
      };
      setBlogPosts([...blogPosts, newPost]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="admin-dashboard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1">Quản lý bài viết</h1>
          <p className="admin-text-muted admin-text-sm">
            Tạo và quản lý nội dung bài viết về sức khỏe giới tính
          </p>
        </div>
        <button 
          className="admin-quick-action-btn bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
          onClick={handleAddNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-white">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Thêm bài viết mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, tác giả..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="admin-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="HIV">HIV</option>
              <option value="STI">STI</option>
              <option value="HPV">HPV</option>
              <option value="Viêm gan">Viêm gan</option>
              <option value="Sức khỏe">Sức khỏe</option>
            </select>
            
            <select 
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="scheduled">Đã lên lịch</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="admin-text-sm admin-text-muted">Tổng số: <span className="font-semibold text-gray-800">{filteredPosts.length} bài viết</span></span>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="admin-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Ngày</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Nổi bật</th>
                <th className="w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.length > 0 ? (
                currentPosts.map(post => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td className="max-w-xs truncate font-medium">{post.title}</td>
                    <td>{post.category}</td>
                    <td>{post.author}</td>
                    <td>{post.date}</td>
                    <td>{post.views}</td>
                    <td>
                      <span className={getStatusBadgeClass(post.status)}>
                        {post.status === 'published' ? 'Đã xuất bản' : 
                         post.status === 'draft' ? 'Bản nháp' : 'Đã lên lịch'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(post.id)}
                        className="focus:outline-none"
                        title={post.featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
                      >
                        {post.featured ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-gray-400 hover:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          onClick={() => handleEdit(post.id)}
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          onClick={() => handleDelete(post.id)}
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 admin-text-muted">
                    Không tìm thấy bài viết nào phù hợp với điều kiện lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="admin-text-sm admin-text-muted">
            Hiển thị {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, filteredPosts.length)} trên {filteredPosts.length} bài viết
          </div>
          <div className="admin-pagination">
            <button
              className={`admin-pagination-btn rounded-l-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(num => (num <= 2 || num > totalPages - 2 || Math.abs(num - currentPage) <= 1))
              .map((number, idx, arr) => (
                <React.Fragment key={number}>
                  {idx > 0 && arr[idx - 1] !== number - 1 && (
                    <span className="px-3 py-1 text-gray-400">...</span>
                  )}
                  <button
                    className={`admin-pagination-btn ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}
            <button
              className={`admin-pagination-btn rounded-r-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
      
      {/* Blog Post Modal */}
      <BlogPostModal 
        post={editingPost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default Blog; 