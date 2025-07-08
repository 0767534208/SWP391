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
  
  // Pagination state - fixed at 10 items per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Fixed at 10 items per page
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch categories from API
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchCategories();
  };

  // Filtered categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        // Update existing category with both name and status
        // Note: API uses id as a query parameter, not in the body
        const response = await categoryAPI.updateCategory(
          currentCategory.categoryID.toString(),
          { 
            name: currentCategory.name, 
            status: currentCategory.status 
          }
        );
        
        if (response.statusCode === 200) {
          // Refresh categories after successful update
          await fetchCategories();
        } else {
          setError('Không thể cập nhật danh mục. Vui lòng thử lại sau.');
        }
      } else {
        // Add new category with clinicID=1, without status
        const response = await categoryAPI.createCategory(
          { clinicID: 1, name: currentCategory.name }
        );
        
        if (response.statusCode === 201) {
          // Refresh categories after successful creation
          await fetchCategories();
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
        { name: category.name, status: updatedStatus }
      );
      
      if (response.statusCode === 200) {
        // Refresh categories after successful status update
        await fetchCategories();
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
          // Refresh categories after successful deletion
          await fetchCategories();
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

  // Generate pagination buttons - simplified to show fewer buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Add "Previous" button
    buttons.push(
      <button 
        key="prev" 
        onClick={goToPreviousPage} 
        disabled={currentPage === 1}
        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
      >
        &laquo;
      </button>
    );
    
    // Simplified pagination: show up to 5 pages
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Add first page button and ellipsis if needed
    if (startPage > 1) {
      buttons.push(
        <button 
          key={1} 
          onClick={() => paginate(1)}
          className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="pagination-ellipsis">...</span>
        );
      }
    }
    
    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => paginate(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis and last page button if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="pagination-ellipsis">...</span>
        );
      }
      
      buttons.push(
        <button 
          key={totalPages} 
          onClick={() => paginate(totalPages)}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Add "Next" button
    buttons.push(
      <button 
        key="next" 
        onClick={goToNextPage} 
        disabled={currentPage === totalPages}
        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
      >
        &raquo;
      </button>
    );
    
    return buttons;
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
        
        <div className="controls-buttons">
          <button className="refresh-btn" onClick={handleRefresh} title="Làm mới dữ liệu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="add-category-btn" onClick={handleAddCategory}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm danh mục mới
          </button>
        </div>
      </div>
      
      {/* Categories Table */}
      <div className="categories-table-container">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && filteredCategories.length === 0 ? (
          <div className="no-categories">Không tìm thấy danh mục nào</div>
        ) : (
          <>
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
                {currentItems.map((category) => (
                  <tr key={category.categoryID} className={!category.status ? 'inactive-category' : ''}>
                    <td>{category.categoryID}</td>
                    <td>{category.name}</td>
                    <td>{category.createAt === "Invalid Date" ? "Invalid Date" : formatDate(category.createAt)}</td>
                    <td>{category.updateAt === "Invalid Date" ? "Invalid Date" : formatDate(category.updateAt)}</td>
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
            
            {/* Pagination */}
            {filteredCategories.length > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  Hiển thị {indexOfFirstItem ==0?indexOfFirstItem + 1:indexOfFirstItem + 2}-{Math.min(indexOfLastItem, filteredCategories.length)+1} trên {filteredCategories.length+1} danh mục
                </div>
                <div className="pagination-controls">
                  {renderPaginationButtons()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Category Modal - Exact match to screenshot */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h2 className="modal-title">{isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              
              <form onSubmit={handleSaveCategory} className="category-form">
                <div className="form-group">
                  <label htmlFor="name">Tên danh mục</label>
                  <input
                    type="text"
                    id="name"
                    value={currentCategory?.name || ''}
                    onChange={(e) => setCurrentCategory(curr => curr ? {...curr, name: e.target.value} : null)}
                    required
                    placeholder="Nhập tên danh mục"
                    className="form-input"
                  />
                </div>
                
                {/* Only show status field when editing */}
                {isEditing && (
                  <div className="form-group">
                    <label htmlFor="status">Trạng thái</label>
                    <div className="select-wrapper">
                      <select
                        id="status"
                        value={currentCategory?.status ? 'active' : 'inactive'}
                        onChange={(e) => setCurrentCategory(curr => curr ? {...curr, status: e.target.value === 'active'} : null)}
                        className="form-input"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                      <div className="select-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="form-divider"></div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="save-btn">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 