import React, { useState, useEffect } from 'react';
import './ServiceManagement.css';

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
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<{categoryID: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for services - in a real application, this would come from an API
  useEffect(() => {
    // Simulating API call to fetch services
    const mockCategories = [
      { categoryID: 1, name: "Xét nghiệm HIV" },
      { categoryID: 2, name: "Xét nghiệm STI" },
      { categoryID: 3, name: "Tư vấn" },
      { categoryID: 4, name: "Khám sức khỏe" },
      { categoryID: 5, name: "Tiêm chủng" },
    ];
    
    const mockServices: Service[] = [
      {
        servicesID: 1,
        categoryID: 1,
        category: null,
        servicesName: "Xét nghiệm & Tư vấn HIV",
        description: "Dịch vụ xét nghiệm HIV của chúng tôi cung cấp một môi trường an toàn, riêng tư và không phán xét để xét nghiệm HIV. Bao gồm tư vấn trước và sau xét nghiệm với các chuyên gia có chuyên môn.",
        createAt: "2023-06-21T01:14:16.582",
        updateAt: "2023-06-21T01:14:16.582",
        servicesPrice: 300000,
        status: true,
        imageServices: ["https://hips.hearstapps.com/hmg-prod/images/young-man-taking-blood-test-royalty-free-image-1674046843.jpg"]
      },
      {
        servicesID: 2,
        categoryID: 2,
        category: null,
        servicesName: "Kiểm tra STI toàn diện",
        description: "Gói kiểm tra STI toàn diện của chúng tôi bao gồm xét nghiệm cho tất cả các bệnh lây truyền qua đường tình dục chính bao gồm HIV, Giang mai, Lậu, Chlamydia, Herpes và Viêm gan B&C.",
        createAt: "2023-06-21T01:14:16.582",
        updateAt: "2023-06-21T01:14:16.582",
        servicesPrice: 850000,
        status: true,
        imageServices: ["https://madisonwomenshealth.com/wp-content/uploads/2023/10/getting-tested-for-stis-1030x687.jpg"]
      },
      {
        servicesID: 3,
        categoryID: 3,
        category: null,
        servicesName: "Tư vấn sức khỏe tình dục",
        description: "Phiên tư vấn riêng tư với các chuyên gia của chúng tôi cung cấp một không gian an toàn để thảo luận về mọi lo ngại về sức khỏe tình dục của bạn, từ vấn đề STI đến sức khỏe sinh sản và nhiều hơn nữa.",
        createAt: "2023-06-21T01:14:16.582",
        updateAt: "2023-06-21T01:14:16.582",
        servicesPrice: 400000,
        status: true,
        imageServices: ["https://i0.wp.com/post.psychcentral.com/wp-content/uploads/sites/4/2021/12/female-therapy-session-crop-1294016090-1296x729-header-1.jpg"]
      },
      {
        servicesID: 4,
        categoryID: 4,
        category: null,
        servicesName: "Gói khám sức khỏe sinh sản",
        description: "Gói khám sức khỏe sinh sản toàn diện giúp phát hiện sớm các vấn đề về sinh sản và cung cấp tư vấn chuyên sâu về sức khỏe sinh sản, kế hoạch hóa gia đình và các biện pháp phòng ngừa.",
        createAt: "2023-06-21T01:14:16.582",
        updateAt: "2023-06-21T01:14:16.582",
        servicesPrice: 1200000,
        status: true,
        imageServices: ["https://www.shutterstock.com/image-photo/gynecologist-doctor-consulting-female-patient-600nw-2060612575.jpg"]
      },
      {
        servicesID: 5,
        categoryID: 5,
        category: null,
        servicesName: "Tiêm vắc-xin HPV",
        description: "Vắc-xin HPV giúp bảo vệ chống lại các chủng virus HPV nguy cơ cao có thể gây ung thư cổ tử cung, âm hộ, âm đạo, hậu môn và các bệnh lây truyền qua đường tình dục khác.",
        createAt: "2023-06-21T01:14:16.582",
        updateAt: "2023-06-21T01:14:16.582",
        servicesPrice: 1500000,
        status: false,
        imageServices: ["https://images.ctfassets.net/n5vgw6ikgq17/2iJzGTNdl6KSMgkMoKw2S2/3a064db7c7059048d2bf379cfed0dc0c/hpv-injection-pic-landscape.jpg"]
      }
    ];
    
    setCategories(mockCategories);
    setServices(mockServices);
    setLoading(false);
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
      servicesID: services.length > 0 ? Math.max(...services.map(s => s.servicesID)) + 1 : 1,
      categoryID: 1,
      category: null,
      servicesName: '',
      description: '',
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      servicesPrice: 0,
      status: true,
      imageServices: []
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Handle editing a service
  const handleEditService = (service: Service) => {
    setCurrentService({...service});
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle saving a service (add or edit)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentService) return;
    
    if (isEditing) {
      // Update existing service
      setServices(prevServices => 
        prevServices.map(service => 
          service.servicesID === currentService.servicesID ? currentService : service
        )
      );
    } else {
      // Add new service
      setServices(prevServices => [...prevServices, currentService]);
    }
    
    setShowModal(false);
    setCurrentService(null);
  };

  // Handle toggling service active status
  const handleToggleActive = (id: number) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.servicesID === id ? {...service, status: !service.status} : service
      )
    );
  };

  // Handle deleting a service
  const handleDeleteService = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      setServices(prevServices => prevServices.filter(service => service.servicesID !== id));
    }
  };

  // Handle adding an image URL
  const handleAddImage = () => {
    if (!currentService) return;
    
    setCurrentService({
      ...currentService,
      imageServices: [...currentService.imageServices, '']
    });
  };

  // Handle updating an image URL
  const handleImageChange = (index: number, value: string) => {
    if (!currentService) return;
    
    const newImages = [...currentService.imageServices];
    newImages[index] = value;
    
    setCurrentService({
      ...currentService,
      imageServices: newImages
    });
  };

  // Handle removing an image URL
  const handleRemoveImage = (index: number) => {
    if (!currentService) return;
    
    const newImages = [...currentService.imageServices];
    newImages.splice(index, 1);
    
    setCurrentService({
      ...currentService,
      imageServices: newImages
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
                    onClick={() => {
                      setCurrentService(service);
                      setIsEditing(false);
                      setShowModal(true);
                    }}
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
                <td colSpan={7} className="no-services">
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
              <h2>{isEditing ? 'Chỉnh sửa dịch vụ' : (currentService.servicesName ? 'Chi tiết dịch vụ' : 'Thêm dịch vụ mới')}</h2>
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
                    readOnly={!isEditing && currentService.servicesName !== ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="categoryID">Danh mục</label>
                  <select
                    id="categoryID"
                    value={currentService.categoryID}
                    onChange={(e) => setCurrentService({...currentService, categoryID: Number(e.target.value)})}
                    required
                    disabled={!isEditing && currentService.servicesName !== ''}
                  >
                    {categories.map(category => (
                      <option key={category.categoryID} value={category.categoryID}>
                        {category.name}
                      </option>
                    ))}
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
                    readOnly={!isEditing && currentService.servicesName !== ''}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    value={currentService.description}
                    onChange={(e) => setCurrentService({...currentService, description: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.servicesName !== ''}
                    rows={4}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Hình ảnh</label>
                  {currentService.imageServices.map((image, index) => (
                    <div key={index} className="array-input-group">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        readOnly={!isEditing && currentService.servicesName !== ''}
                        placeholder="URL hình ảnh"
                      />
                      {(isEditing || currentService.servicesName === '') && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)}
                          className="remove-item-btn"
                        >
                          <i className="fas fa-minus-circle"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {(isEditing || currentService.servicesName === '') && (
                    <button 
                      type="button" 
                      onClick={handleAddImage}
                      className="add-item-btn"
                    >
                      <i className="fas fa-plus-circle"></i> Thêm hình ảnh
                    </button>
                  )}
                </div>
                
                {/* Image preview */}
                {currentService.imageServices.length > 0 && currentService.imageServices[0] && (
                  <div className="form-group full-width">
                    <label>Xem trước hình ảnh</label>
                    <div className="image-preview">
                      <img src={currentService.imageServices[0]} alt={currentService.servicesName} />
                    </div>
                  </div>
                )}
                
                <div className="form-group full-width status-toggle">
                  <label>Trạng thái</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status"
                      checked={currentService.status}
                      onChange={(e) => setCurrentService({...currentService, status: e.target.checked})}
                      disabled={!isEditing && currentService.servicesName !== ''}
                    />
                    <label htmlFor="status" className="toggle-label">
                      {currentService.status ? 'Hoạt động' : 'Không hoạt động'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                {(isEditing || currentService.servicesName === '') ? (
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
    </div>
  );
};

export default ServiceManagement; 