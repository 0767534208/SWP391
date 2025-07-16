import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';
import { serviceAPI, categoryAPI } from '../../utils/api';

interface ServiceType {
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
  // Additional fields for UI display
  duration?: string;
  includes?: string[];
  preparations?: string[];
  restrictions?: string[];
}

interface CategoryType {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<null | ServiceType>(null);
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const serviceResponse = await serviceAPI.getServices();
        
        // Fetch categories
        const categoryResponse = await categoryAPI.getCategories();
        
        if (serviceResponse.statusCode === 200 && serviceResponse.data) {
          // Use only the data from the API without adding default values
          setServices(serviceResponse.data);
        } else {
          setError('Failed to fetch services');
        }
        
        if (categoryResponse.statusCode === 200 && categoryResponse.data) {
          setCategories(categoryResponse.data);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services based on search query and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.servicesName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           service.categoryID.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.categoryID === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Get unique categories for filter
  const categoryOptions = [
    { id: 'all', name: 'Tất cả dịch vụ' },
    ...categories.map(category => ({
      id: category.categoryID.toString(),
      name: category.name
    }))
  ];

  // Handle view service details
  const handleViewDetails = (service: ServiceType) => {
    setSelectedService(service);
    setShowModal(true);
  };

  // Handle navigation to booking
  const handleBookService = (serviceId: number) => {
    navigate('/booking', { state: { serviceId } });
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'VNĐ');
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dịch vụ của chúng tôi</h1>
          <p className="text-sm text-gray-500">
            Khám phá các dịch vụ chăm sóc sức khỏe sinh sản và tình dục
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="services-filter-bar mb-6">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="category-filter">
          {categoryOptions.map((category, index) => (
            <button
              key={index}
              className={`category-button ${filterCategory === category.id ? 'active' : ''}`}
              onClick={() => setFilterCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dịch vụ...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>Có lỗi xảy ra khi tải dịch vụ. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Services Grid */}
      {!loading && !error && (
        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.servicesID} className="service-card">
                <div className="service-card-image">
                  <img 
                    src={service.imageServices && service.imageServices.length > 0 
                      ? service.imageServices[0] 
                      : "https://madisonwomenshealth.com/wp-content/uploads/2023/10/getting-tested-for-stis-1030x687.jpg"} 
                    alt={service.servicesName} 
                  />
                  <div className="service-card-category">
                    {getCategoryName(service.categoryID)}
                  </div>
                </div>
                <div className="service-card-content">
                  <h3 className="service-card-title">{service.servicesName}</h3>
                  <p className="service-card-description">{service.description}</p>
                  <div className="service-card-details">
                    <div className="service-card-price">{formatPrice(service.servicesPrice)}</div>
                  </div>
                </div>
                <div className="service-card-actions">
                  <button 
                    className="service-action-button book-button"
                    onClick={() => handleBookService(service.servicesID)}
                  >
                    Đặt lịch
                  </button>
                  <button 
                    className="service-action-button menu-button"
                    onClick={() => handleViewDetails(service)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-services-found">
              <p>Không tìm thấy dịch vụ nào phù hợp. Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
            </div>
          )}
        </div>
      )}

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="service-modal-overlay" onClick={handleCloseModal}>
          <div className="service-modal-content" onClick={e => e.stopPropagation()}>
            <button className="service-modal-close" onClick={handleCloseModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="service-modal-header">
              <img 
                src={selectedService.imageServices && selectedService.imageServices.length > 0 
                  ? selectedService.imageServices[0] 
                  : "https://madisonwomenshealth.com/wp-content/uploads/2023/10/getting-tested-for-stis-1030x687.jpg"} 
                alt={selectedService.servicesName} 
              />
              <div className="service-modal-badge">
                {getCategoryName(selectedService.categoryID)}
              </div>
            </div>
            
            <div className="service-modal-body">
              <h2 className="service-modal-title">{selectedService.servicesName}</h2>
              
              <div className="service-modal-meta">
                <div className="service-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatPrice(selectedService.servicesPrice)}</span>
                </div>
              </div>
              
              <div className="service-modal-description">
                <h3>Mô tả</h3>
                <p>{selectedService.description}</p>
              </div>
              
              <div className="service-modal-actions">
                <button 
                  className="service-modal-book-button"
                  onClick={() => {
                    handleCloseModal();
                    handleBookService(selectedService.servicesID);
                  }}
                >
                  Đặt lịch dịch vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services; 