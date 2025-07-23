import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

interface UpdateServiceData {
  servicesName: string;
  description: string;
  serviceType: number;
  status: boolean;
  servicesPrice?: number; // Optional cho consultation services
}

interface CreateServiceData {
  ClinicID: number;
  CategoryID: number;
  ManagerID: string;
  ServicesName: string;
  Description: string;
  ServiceType: number;
  Status: boolean;
  Images: File[];
  ServicesPrice?: number; // Optional cho consultation services
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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

  // Debounce search query để giảm lag khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Đợi 300ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
          // Transform the API response to match our interface
          const transformedServices = serviceResponse.data.map((service: any) => ({
            ...service,
            // Transform imageServices from array of objects to array of strings
            imageServices: service.imageServices?.map((img: any) => img.image || img) || []
          }));
          setServices(transformedServices);
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

  // Format price to VND - tối ưu với useMemo
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'VNĐ');
  }, []);

  // Filter services based on search query and category - tối ưu với useMemo và debounced search
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.servicesName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory = filterCategory === null || service.categoryID === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, debouncedSearchQuery, filterCategory]);

  // Handle adding a new service - tối ưu với useCallback
  const handleAddService = useCallback(() => {
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
  }, [categories, managerID]);

  // Handle editing a service - tối ưu với useCallback
  const handleEditService = useCallback((service: Service) => {
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
  }, [managerID]);

  // Handle viewing service details - tối ưu với useCallback
  const handleViewService = useCallback((service: Service) => {
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
  }, [managerID]);

  // Handle saving a service (add or edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentService) return;
    
    try {
      setLoading(true);
      
      if (!isAddingNew) {
        // Update existing service - chỉ gửi các fields được hỗ trợ
        const updateData: UpdateServiceData = {
          servicesName: currentService.servicesName,
          description: currentService.description,
          serviceType: currentService.serviceType !== undefined ? currentService.serviceType : 0,
          status: currentService.status
          // Note: không gửi categoryID vì API UpdateService không hỗ trợ
        };
        
        // Chỉ thêm servicesPrice nếu serviceType không phải là Consultation (0)
        // Kiểm tra serviceType hiện tại của currentService (giá trị mới)
        if (currentService.serviceType !== 0) {
          if (!currentService.servicesPrice || currentService.servicesPrice <= 0) {
            setError('Giá dịch vụ là bắt buộc và phải lớn hơn 0 đối với dịch vụ Xét nghiệm STI.');
            return;
          }
          updateData.servicesPrice = currentService.servicesPrice;
        }
        
        console.log('Updating service with data:', updateData);
        
        const response = await serviceAPI.updateService(
          currentService.servicesID, 
          updateData
        );
        
        if (response.statusCode === 200 || response.statusCode === 201) {
          // Refresh lại toàn bộ danh sách services để đảm bảo dữ liệu đồng bộ
          const serviceResponse = await serviceAPI.getServices();
          if (serviceResponse.statusCode === 200 && serviceResponse.data) {
            // Transform the API response to match our interface
            const transformedServices = serviceResponse.data.map((service: any) => ({
              ...service,
              // Transform imageServices from array of objects to array of strings
              imageServices: service.imageServices?.map((img: any) => img.image || img) || []
            }));
            setServices(transformedServices);
          }
          
          setShowModal(false);
          setCurrentService(null);
        } else {
          setError('Không thể cập nhật dịch vụ. Vui lòng thử lại sau.');
          console.error('API response error:', response);
        }
      } else {
        // Add new service - gửi đầy đủ dữ liệu cho CreateService
        const serviceData: CreateServiceData = {
          ClinicID: currentService.clinicID || 1,
          CategoryID: currentService.categoryID,
          ManagerID: currentService.managerID || managerID,
          ServicesName: currentService.servicesName,
          Description: currentService.description,
          ServiceType: currentService.serviceType !== undefined ? currentService.serviceType : 0,
          Status: currentService.status,
          Images: currentService.imageFiles || []
        };
        
        // Chỉ thêm ServicesPrice nếu serviceType không phải là Consultation (0)
        if (currentService.serviceType !== 0) {
          serviceData.ServicesPrice = currentService.servicesPrice;
        }
        
        console.log('Creating service with data:', serviceData);
        
        const response = await serviceAPI.createService(serviceData);
        
        if (response.statusCode === 200 || response.statusCode === 201) {
          // Refresh lại toàn bộ danh sách services
          const serviceResponse = await serviceAPI.getServices();
          if (serviceResponse.statusCode === 200 && serviceResponse.data) {
            // Transform the API response to match our interface
            const transformedServices = serviceResponse.data.map((service: any) => ({
              ...service,
              // Transform imageServices from array of objects to array of strings
              imageServices: service.imageServices?.map((img: any) => img.image || img) || []
            }));
            setServices(transformedServices);
          }
          
          setShowModal(false);
          setCurrentService(null);
        } else {
          setError('Không thể tạo dịch vụ mới. Vui lòng thử lại sau.');
          console.error('API response error:', response);
        }
      }
    } catch (err) {
      console.error('Error saving service:', err);
      // Hiển thị lỗi cụ thể từ API nếu có
      if (err instanceof Error) {
        if (err.message.includes('Không có quyền tạo dịch vụ')) {
          setError(err.message);
        } else if (err.message.includes('API error: 400')) {
          setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.');
        } else if (err.message.includes('API error: 500')) {
          setError('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ admin.');
        } else {
          setError('Đã xảy ra lỗi khi lưu dịch vụ: ' + err.message);
        }
      } else {
        setError('Đã xảy ra lỗi khi lưu dịch vụ.');
      }
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
      
      // Call API to update status (provide full service data to match UpdateServiceRequest schema)
      const updateData: UpdateServiceData = {
        servicesName: service.servicesName,
        description: service.description,
        serviceType: service.serviceType || 0,
        status: !service.status
      };
      
      // Chỉ thêm servicesPrice nếu serviceType không phải là Consultation (0)
      if (service.serviceType !== 0) {
        updateData.servicesPrice = service.servicesPrice;
      }
      
      const response = await serviceAPI.updateService(id, updateData);
      
      if (response.statusCode === 200) {
        // Refresh lại toàn bộ danh sách services để đảm bảo dữ liệu đồng bộ
        const serviceResponse = await serviceAPI.getServices();
        if (serviceResponse.statusCode === 200 && serviceResponse.data) {
          // Transform the API response to match our interface
          const transformedServices = serviceResponse.data.map((service: any) => ({
            ...service,
            // Transform imageServices from array of objects to array of strings
            imageServices: service.imageServices?.map((img: any) => img.image || img) || []
          }));
          setServices(transformedServices);
        }
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
      serviceType: value,
      // Nếu là dịch vụ tư vấn (type 0), set price về 0
      // Nếu là dịch vụ xét nghiệm (type 1) và chưa có giá, set giá mặc định
      servicesPrice: value === 0 ? 0 : (currentService.servicesPrice || 100000)
    });
    
    // Clear error khi thay đổi service type
    setError(null);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="service-management-container">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Dịch Vụ</h1>
        <p className="page-subtitle">Tạo và quản lý các dịch vụ trên hệ thống</p>
      </div>
      
      {/* Service Management Toolbar */}
      <div className="toolbar">
        <button className="add-service-btn" onClick={handleAddService}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Search and Filter */}
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
                  <label htmlFor="categoryID">
                    Danh mục
                    {isEditing && !isAddingNew && (
                      <span style={{fontSize: '12px', color: '#666', fontWeight: 'normal'}}>
                        {' '}(Không thể thay đổi danh mục sau khi tạo)
                      </span>
                    )}
                  </label>
                  <select
                    id="categoryID"
                    value={currentService.categoryID}
                    onChange={(e) => setCurrentService({...currentService, categoryID: Number(e.target.value)})}
                    required
                    disabled={!isEditing || !isAddingNew}
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
                    readOnly={!isEditing || currentService.serviceType === 0}
                    disabled={currentService.serviceType === 0}
                    placeholder={currentService.serviceType === 0 ? "Dịch vụ tư vấn không có phí" : "Nhập giá dịch vụ"}
                  />
                  {currentService.serviceType === 0 && (
                    <small className="text-muted">Dịch vụ tư vấn không tính phí</small>
                  )}
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
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Đóng</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement; 