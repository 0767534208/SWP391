import React, { useState, useEffect } from 'react';
import './CategoryManagement.css';
import { categoryAPI } from '../../utils/api';

// Interface cho dữ liệu danh mục
interface Category {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getCategories();
        if (response.statusCode === 200 && response.data) {
          setCategories(response.data);
        } else {
          setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Đã xảy ra lỗi khi tải danh sách danh mục.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filtered categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new category
  const handleAddCategory = () => {
    setCurrentCategory({
      categoryID: 0,
      name: '',
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      status: true
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle saving a category (add or edit)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Update existing category
        const response = await categoryAPI.updateCategory(
          currentCategory.categoryID.toString(),
          { name: currentCategory.name, status: currentCategory.status }
        );
        
        if (response.statusCode === 200) {
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.categoryID === currentCategory.categoryID ? response.data : cat
            )
          );
        } else {
          setError('Không thể cập nhật danh mục. Vui lòng thử lại sau.');
        }
      } else {
        // Add new category
        const response = await categoryAPI.createCategory(
          { name: currentCategory.name, status: currentCategory.status }
        );
        
        if (response.statusCode === 200) {
          setCategories(prevCategories => [...prevCategories, response.data]);
        } else {
          setError('Không thể tạo danh mục mới. Vui lòng thử lại sau.');
        }
      }
      
      setShowModal(false);
      setCurrentCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Đã xảy ra lỗi khi lưu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling category status
  const handleToggleStatus = async (categoryId: number) => {
    try {
      const category = categories.find(cat => cat.categoryID === categoryId);
      if (!category) return;
      
      const updatedStatus = !category.status;
      
      const response = await categoryAPI.updateCategory(
        categoryId.toString(),
        { status: updatedStatus }
      );
      
      if (response.statusCode === 200) {
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.categoryID === categoryId ? { ...cat, status: updatedStatus } : cat
          )
        );
      } else {
        setError('Không thể cập nhật trạng thái danh mục. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
      setError('Đã xảy ra lỗi khi cập nhật trạng thái danh mục.');
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        const response = await categoryAPI.deleteCategory(categoryId.toString());
        
        if (response.statusCode === 200) {
          setCategories(prevCategories => 
            prevCategories.filter(cat => cat.categoryID !== categoryId)
          );
        } else {
          setError('Không thể xóa danh mục. Vui lòng thử lại sau.');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Đã xảy ra lỗi khi xóa danh mục.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="category-management">
      <h1 className="page-title">Quản Lý Danh Mục</h1>
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Đóng</button>
        </div>
      )}
      
      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button className="add-category-btn" onClick={handleAddCategory}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>
      
      {/* Categories Table */}
      <div className="categories-table-container">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && filteredCategories.length === 0 ? (
          <div className="no-categories">Không tìm thấy danh mục nào</div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Ngày tạo</th>
                <th>Cập nhật lần cuối</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.categoryID} className={!category.status ? 'inactive-category' : ''}>
                  <td>{category.categoryID}</td>
                  <td>{category.name}</td>
                  <td>{formatDate(category.createAt)}</td>
                  <td>{formatDate(category.updateAt)}</td>
                  <td>
                    <span className={`status-badge ${category.status ? 'active' : 'inactive'}`}>
                      {category.status ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit-btn" 
                        title="Chỉnh sửa"
                        onClick={() => handleEditCategory(category)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="status-btn" 
                        title={category.status ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        onClick={() => handleToggleStatus(category.categoryID)}
                      >
                        {category.status ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button 
                        className="delete-button" 
                        title="Xóa"
                        onClick={() => handleDeleteCategory(category.categoryID)}
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
        )}
      </div>
      
      {/* Category Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="category-form">
              <div className="form-group">
                <label htmlFor="name">Tên danh mục</label>
                <input
                  type="text"
                  id="name"
                  value={currentCategory?.name || ''}
                  onChange={(e) => setCurrentCategory(curr => curr ? {...curr, name: e.target.value} : null)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  value={currentCategory?.status ? 'active' : 'inactive'}
                  onChange={(e) => setCurrentCategory(curr => curr ? {...curr, status: e.target.value === 'active'} : null)}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="save-btn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 