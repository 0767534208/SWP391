import React, { useState } from 'react';
import './BlogManagement.css';

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
      category: 'Health',
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {post ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
          </h3>
          <button 
            className="modal-close-button"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu Đề</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh Mục</label>
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
                  <option value="Hepatitis">Hepatitis</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác Giả</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="published">Đã Xuất Bản</option>
                  <option value="draft">Bản Nháp</option>
                  <option value="scheduled">Đã Lên Lịch</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội Dung</label>
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
          <div className="modal-footer">
            <button 
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="modal-save-button"
            >
              {post ? 'Cập Nhật' : 'Thêm Bài Viết'}
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const postsPerPage = 10;

  // Mock data
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id: 1, title: "Understanding HIV/AIDS and prevention methods", category: "HIV", author: "Dr. John Smith", status: "published", views: 1240, date: "15/06/2023", featured: true },
    { id: 2, title: "Common STIs and their symptoms", category: "STI", author: "Dr. Sarah Johnson", status: "published", views: 950, date: "10/06/2023", featured: false },
    { id: 3, title: "The importance of regular testing", category: "Health", author: "Dr. Michael Lee", status: "draft", views: 0, date: "12/06/2023", featured: false },
    { id: 4, title: "Healthy lifestyle and sexual health", category: "Health", author: "Dr. Jessica Taylor", status: "published", views: 820, date: "05/06/2023", featured: false },
    { id: 5, title: "Understanding HPV and preventive vaccines", category: "HPV", author: "Dr. David Martinez", status: "published", views: 1560, date: "01/06/2023", featured: true },
    { id: 6, title: "Safe contraception methods", category: "Health", author: "Dr. Jennifer Garcia", status: "published", views: 1100, date: "28/05/2023", featured: false },
    { id: 7, title: "Hepatitis B and C: Causes and prevention", category: "Hepatitis", author: "Dr. Thomas Rodriguez", status: "draft", views: 0, date: "25/05/2023", featured: false },
    { id: 8, title: "Syphilis and its treatment", category: "STI", author: "Dr. Lisa Anderson", status: "published", views: 780, date: "20/05/2023", featured: false },
    { id: 9, title: "Gonorrhea and its dangerous complications", category: "STI", author: "Dr. William Thompson", status: "scheduled", views: 0, date: "25/06/2023", featured: false },
    { id: 10, title: "Men's reproductive health", category: "Health", author: "Dr. Mary White", status: "published", views: 920, date: "15/05/2023", featured: false },
    { id: 11, title: "Women's reproductive health", category: "Health", author: "Dr. Daniel Harris", status: "draft", views: 0, date: "18/05/2023", featured: false },
    { id: 12, title: "HIV prevention in high-risk groups", category: "HIV", author: "Dr. Patricia Clark", status: "published", views: 870, date: "12/05/2023", featured: false },
  ]);

  // Filter blog posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-badge status-badge-success';
      case 'draft':
        return 'status-badge status-badge-warning';
      case 'scheduled':
        return 'status-badge status-badge-info';
      default:
        return 'status-badge status-badge-info';
    }
  };

  // CRUD operations
  const handleEdit = (id: number) => {
    const postToEdit = blogPosts.find(post => post.id === id);
    if (postToEdit) {
      setEditingPost(postToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const postToDelete = blogPosts.find(post => post.id === id);
    if (postToDelete) {
      setCurrentPost(postToDelete);
      setIsDeleteModalOpen(true);
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
        id: blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.id)) + 1 : 1,
        title: postData.title || '',
        category: postData.category || 'Health',
        author: postData.author || '',
        status: postData.status as 'published' | 'draft' | 'scheduled',
        views: 0,
        date: new Date().toLocaleDateString('en-GB'), // Format as DD/MM/YYYY
        featured: postData.featured || false,
        content: postData.content
      };
      setBlogPosts([...blogPosts, newPost]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (currentPost) {
      setBlogPosts(blogPosts.filter(post => post.id !== currentPost.id));
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="blog-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Bài Viết</h1>
          <p className="text-sm text-gray-500">
            Thêm, sửa và quản lý bài viết trên trang web
          </p>
        </div>
        <button 
          className="add-blog-button"
          onClick={handleAddNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Thêm Bài Viết</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="blog-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by title or author..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="HIV">HIV</option>
              <option value="STI">STI</option>
              <option value="HPV">HPV</option>
              <option value="Hepatitis">Hepatitis</option>
              <option value="Health">Health</option>
            </select>
            
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-800">{filteredPosts.length} posts</span></span>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="blog-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="blog-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.length > 0 ? (
                currentPosts.map(post => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.title}</span>
                        {post.featured && (
                          <span className="featured-badge">Featured</span>
                        )}
                      </div>
                    </td>
                    <td>{post.category}</td>
                    <td>{post.author}</td>
                    <td>
                      <span className={getStatusBadgeClass(post.status)}>
                        {post.status}
                      </span>
                    </td>
                    <td>{post.views}</td>
                    <td>{post.date}</td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleToggleFeatured(post.id)}
                          className={`action-button action-button-star ${post.featured ? 'featured' : ''}`}
                          title={post.featured ? "Bỏ bài nổi bật" : "Đánh dấu nổi bật"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEdit(post.id)}
                          className="action-button action-button-edit"
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="action-button action-button-delete"
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">No posts found matching your filter criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
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

      {/* Add/Edit Post Modal */}
      {isModalOpen && (
        <BlogPostModal
          post={editingPost}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePost}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                Xác Nhận Xóa Bài Viết
              </h3>
              <button 
                className="modal-close-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="modal-cancel-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                type="button"
                className="modal-save-button"
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;