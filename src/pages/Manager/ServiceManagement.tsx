import React, { useState, useEffect, useRef } from 'react';
import './ServiceManagement.css';
import { serviceAPI, categoryAPI } from '../../utils/api';
import { authService } from '../../services';

interface Service {
  servicesID: number;
  categoryID: number;
  category: string | null;
  servicesName: string;
  description: string;
  createAt: string;
  updateAt: string;
  servicesPrice: number;
  status: boolean;
  imageServices: string[];
  clinicID?: number; // Default to 1
  managerID?: string; // From logged-in user
  serviceType?: number; // 0: Tư vấn, 1: Xét nghiệm
  imageFiles?: File[]; // Thêm field để lưu file objects cho upload
}

interface Category {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerID, setManagerID] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch services and categories from API
  useEffect(() => {
    // Get manager ID from localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.userID) {
      setManagerID(currentUser.userID);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const serviceResponse = await serviceAPI.getServices();
        
        // Fetch categories
        const categoryResponse = await categoryAPI.getCategories();
        
        if (serviceResponse.statusCode === 200 && serviceResponse.data) {
          setServices(serviceResponse.data);
        } else {
          setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
        }
        
        if (categoryResponse.statusCode === 200 && categoryResponse.data) {
          setCategories(categoryResponse.data);
        } else {
          setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'VNĐ');
  };

  // Filter services based on search query and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.servicesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === null || service.categoryID === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle adding a new service
  const handleAddService = () => {
    setCurrentService({
      servicesID: 0, // ID sẽ được tạo bởi server
      categoryID: categories.length > 0 ? categories[0].categoryID : 1,
      category: null,
      servicesName: '',
      description: '',
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      servicesPrice: 0,
      status: true,
      imageServices: [],
      imageFiles: [], // Khởi tạo imageFiles array
      clinicID: 1, // Default to 1
      managerID: managerID, // From logged-in user
      serviceType: 0 // Default to consultation
    });
    setIsEditing(true);
    setIsAddingNew(true);
    setShowModal(true);
  };

  // Handle editing a service
  const handleEditService = (service: Service) => {
    // Ensure service has the required fields
    const serviceToEdit = {
      ...service,
      clinicID: service.clinicID || 1,
      managerID: service.managerID || managerID,
      serviceType: service.serviceType !== undefined ? service.serviceType : 0,
      imageFiles: service.imageFiles || [] // Khởi tạo imageFiles nếu chưa có
    };
    setCurrentService(serviceToEdit);
    setIsEditing(true);
    setIsAddingNew(false);
    setShowModal(true);
  };

  // Handle viewing service details
  const handleViewService = (service: Service) => {
    // Ensure service has the required fields
    const serviceToView = {
      ...service,
      clinicID: service.clinicID || 1,
      managerID: service.managerID || managerID,
      serviceType: service.serviceType !== undefined ? service.serviceType : 0,
      imageFiles: service.imageFiles || [] // Khởi tạo imageFiles nếu chưa có
    };
    setCurrentService(serviceToView);
    setIsEditing(false);
    setIsAddingNew(false);
    setShowModal(true);
  };

  // Handle saving a service (add or edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentService) return;
    
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu theo đúng định dạng API yêu cầu
      const serviceData = {
        ClinicID: currentService.clinicID || 1,
        CategoryID: currentService.categoryID,
        ManagerID: currentService.managerID || managerID,
        ServicesName: currentService.servicesName,
        Description: currentService.description,
        ServicesPrice: currentService.servicesPrice,
        ServiceType: currentService.serviceType !== undefined ? currentService.serviceType : 0,
        Status: currentService.status,
        Images: currentService.imageFiles || [] // Sử dụng file objects thay vì URLs
      };
      
      console.log('Sending data to API:', serviceData);
      
      if (!isAddingNew) {
        // Update existing service
        const response = await serviceAPI.updateService(
          currentService.servicesID, 
          serviceData
        );
        
        if (response.statusCode === 200 || response.statusCode === 201) {
          setServices(prevServices => 
            prevServices.map(service => 
              service.servicesID === currentService.servicesID ? response.data : service
            )
          );
          setShowModal(false);
          setCurrentService(null);
        } else {
          setError('Không thể cập nhật dịch vụ. Vui lòng thử lại sau.');
          console.error('API response error:', response);
        }
      } else {
        // Add new service
        const response = await serviceAPI.createService(serviceData);
        
        console.log('Create service response:', response);
        
        if (response.statusCode === 200 || response.statusCode === 201) {
          setServices(prevServices => [...prevServices, response.data]);
          setShowModal(false);
          setCurrentService(null);
        } else {
          setError('Không thể tạo dịch vụ mới. Vui lòng thử lại sau.');
          console.error('API response error:', response);
        }
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Đã xảy ra lỗi khi lưu dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling service active status
  const handleToggleActive = async (id: number) => {
    try {
      setLoading(true);
      
      // Find the service to toggle
      const service = services.find(s => s.servicesID === id);
      if (!service) return;
      
      // Call API to update status
      const response = await serviceAPI.updateService(
        id,
        { status: !service.status }
      );
      
      if (response.statusCode === 200 && response.data) {
    setServices(prevServices => 
          prevServices.map(s => 
            s.servicesID === id ? response.data : s
          )
        );
      } else {
        setError('Không thể cập nhật trạng thái dịch vụ. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError('Đã xảy ra lỗi khi cập nhật trạng thái dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a service
  const handleDeleteService = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      try {
        setLoading(true);
        
        // Call API to delete service
        const response = await serviceAPI.deleteService(id.toString());
        
        if (response.statusCode === 200) {
      setServices(prevServices => prevServices.filter(service => service.servicesID !== id));
        } else {
          setError('Không thể xóa dịch vụ. Vui lòng thử lại sau.');
        }
      } catch (err) {
        console.error('Error deleting service:', err);
        setError('Đã xảy ra lỗi khi xóa dịch vụ.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Upload image to server and get URL
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Sử dụng endpoint thực tế để upload ảnh
      const response = await fetch('/api/Service/UploadImage', {
        method: 'POST',
        body: formData,
        headers: {
          // Không cần set Content-Type khi dùng FormData
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      // Giả định rằng API trả về URL của ảnh đã tải lên
      return result.imageUrl || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle file selection for image upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !currentService) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const file = e.target.files[0];
      
      // Tạo URL tạm thời để hiển thị preview
      const previewUrl = URL.createObjectURL(file);
      
      // Lưu cả preview URL và file object
      setCurrentService({
        ...currentService,
        imageServices: [...currentService.imageServices, previewUrl],
        imageFiles: [...(currentService.imageFiles || []), file]
      });
      
    } catch (err) {
      console.error('Error handling file:', err);
      setError('Đã xảy ra lỗi khi xử lý hình ảnh.');
    } finally {
      setLoading(false);
      
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle removing an image URL
  const handleRemoveImage = (index: number) => {
    if (!currentService) return;
    
    const newImages = [...currentService.imageServices];
    const newFiles = [...(currentService.imageFiles || [])];
    
    // If the image is an object URL, revoke it to prevent memory leaks
    if (newImages[index].startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index]);
    }
    
    // Remove từ cả hai arrays
    newImages.splice(index, 1);
    if (newFiles.length > index) {
      newFiles.splice(index, 1);
    }
    
    setCurrentService({
      ...currentService,
      imageServices: newImages,
      imageFiles: newFiles
    });
  };

  // Handle service type change
  const handleServiceTypeChange = (value: number) => {
    if (!currentService) return;
    
    setCurrentService({
      ...currentService,
      serviceType: value
    });
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="service-management">
      <h1 className="page-title">Quản Lý Dịch Vụ</h1>
      
      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filterCategory === null ? '' : filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            className="category-filter"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.categoryID} value={category.categoryID}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button className="add-service-btn" onClick={handleAddService}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm dịch vụ mới
        </button>
      </div>
      
      <div className="services-table-container">
        <table className="services-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên dịch vụ</th>
              <th>Danh mục</th>
              <th>Loại dịch vụ</th>
              <th>Giá</th>
              <th>Ngày cập nhật</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => (
              <tr key={service.servicesID} className={service.status ? '' : 'inactive-service'}>
                <td>{service.servicesID}</td>
                <td>{service.servicesName}</td>
                <td>{categories.find(c => c.categoryID === service.categoryID)?.name || 'Không xác định'}</td>
                <td>{service.serviceType === 0 ? 'Tư vấn' : 'Xét nghiệm'}</td>
                <td>{formatPrice(service.servicesPrice)}</td>
                <td>{new Date(service.updateAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className={`status-badge ${service.status ? 'active' : 'inactive'}`}>
                    {service.status ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="view-details-button" 
                    onClick={() => handleViewService(service)}
                    title="Xem chi tiết"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEditService(service)}
                    title="Chỉnh sửa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    className="status-btn" 
                    onClick={() => handleToggleActive(service.servicesID)}
                    title={service.status ? "Vô hiệu hóa" : "Kích hoạt"}
                  >
                    {service.status ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteService(service.servicesID)}
                    title="Xóa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={8} className="no-services">
                  Không tìm thấy dịch vụ nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal for adding/editing/viewing service */}
      {showModal && currentService && (
        <div className="modal-overlay">
          <div className="service-modal">
            <div className="modal-header">
              <h2>
                {isAddingNew 
                  ? 'Thêm dịch vụ mới' 
                  : (isEditing ? 'Chỉnh sửa dịch vụ' : 'Chi tiết dịch vụ')}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveService} className="service-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="servicesName">Tên dịch vụ</label>
                  <input
                    type="text"
                    id="servicesName"
                    value={currentService.servicesName}
                    onChange={(e) => setCurrentService({...currentService, servicesName: e.target.value})}
                    required
                    readOnly={!isEditing}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="categoryID">Danh mục</label>
                  <select
                    id="categoryID"
                    value={currentService.categoryID}
                    onChange={(e) => setCurrentService({...currentService, categoryID: Number(e.target.value)})}
                    required
                    disabled={!isEditing}
                  >
                    {categories.map(category => (
                      <option key={category.categoryID} value={category.categoryID}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="serviceType">Loại dịch vụ</label>
                  <select
                    id="serviceType"
                    value={currentService.serviceType}
                    onChange={(e) => handleServiceTypeChange(Number(e.target.value))}
                    required
                    disabled={!isEditing}
                  >
                    <option value={0}>Tư vấn</option>
                    <option value={1}>Xét nghiệm</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="servicesPrice">Giá</label>
                  <input
                    type="number"
                    id="servicesPrice"
                    value={currentService.servicesPrice}
                    onChange={(e) => setCurrentService({...currentService, servicesPrice: Number(e.target.value)})}
                    required
                    readOnly={!isEditing}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    value={currentService.description}
                    onChange={(e) => setCurrentService({...currentService, description: e.target.value})}
                    required
                    readOnly={!isEditing}
                    rows={4}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Hình ảnh</label>
                  <div className="image-gallery">
                  {currentService.imageServices.map((image, index) => (
                      <div key={index} className="image-item">
                        {image && (
                          <>
                            <img 
                              src={image} 
                              alt={`Hình ảnh ${index + 1}`} 
                              className="image-thumbnail" 
                      />
                            {isEditing && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)}
                                className="remove-image-btn"
                                title="Xóa ảnh"
                        >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                        </button>
                            )}
                          </>
                      )}
                    </div>
                  ))}
                    
                    {isEditing && (
                      <div className="image-upload-container">
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          id="image-upload"
                          className="hidden-file-input"
                        />
                        <label htmlFor="image-upload" className="file-upload-label">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Thêm ảnh
                        </label>
                    </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group full-width status-toggle">
                  <label>Trạng thái</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status"
                      checked={currentService.status}
                      onChange={(e) => setCurrentService({...currentService, status: e.target.checked})}
                      disabled={!isEditing}
                    />
                    <label htmlFor="status" className="toggle-label">
                      {currentService.status ? 'Hoạt động' : 'Không hoạt động'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                {isEditing ? (
                  <>
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                    <button type="submit" className="save-btn">Lưu</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Đóng</button>
                    <button 
                      type="button" 
                      className="edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CSS for the new image upload UI */}
      <style>
        {`
        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        .image-item {
          position: relative;
          width: 100px;
          height: 100px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .image-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ff4d4f;
        }
        
        .hidden-file-input {
          display: none;
        }
        
        .image-upload-container {
          width: 100px;
          height: 100px;
          border: 2px dashed #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 100%;
          height: 100%;
          color: #666;
          font-size: 12px;
        }
        
        .file-upload-label svg {
          margin-bottom: 5px;
        }
        `}
      </style>
    </div>
  );
};

export default ServiceManagement; 