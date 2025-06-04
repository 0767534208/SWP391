import React, { useState } from 'react';
import './Services.css';

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<null | ServiceType>(null);
  const [showModal, setShowModal] = useState(false);

  interface ServiceType {
    id: number;
    name: string;
    shortDescription: string;
    category: string;
    price: string;
    duration: string;
    longDescription: string;
    includes: string[];
    preparations: string[];
    restrictions: string[];
    image: string;
  }

  // Mock data for services
  const services: ServiceType[] = [
    {
      id: 1,
      name: 'Kiểm tra STI toàn diện',
      shortDescription: 'Kiểm tra toàn diện các bệnh lây truyền qua đường tình dục phổ biến',
      category: 'Xét nghiệm STI',
      price: '850.000 VNĐ',
      duration: '1 giờ',
      longDescription: 'Gói kiểm tra STI toàn diện của chúng tôi bao gồm xét nghiệm cho tất cả các bệnh lây truyền qua đường tình dục chính bao gồm HIV, Giang mai, Lậu, Chlamydia, Herpes và Viêm gan B&C. Nhận sự an tâm hoàn toàn với gói xét nghiệm kỹ lưỡng của chúng tôi.',
      includes: ['Tư vấn với chuyên gia y tế', 'Thu thập mẫu máu và nước tiểu', 'Xét nghiệm cho 6+ loại STI', 'Tư vấn kết quả', 'Kê đơn điều trị nếu cần'],
      preparations: ['Tránh đi tiểu 1 giờ trước cuộc hẹn', 'Mang theo hồ sơ y tế trước đây nếu có'],
      restrictions: ['Khuyến nghị kiêng quan hệ tình dục 24 giờ trước khi xét nghiệm'],
      image: 'https://madisonwomenshealth.com/wp-content/uploads/2023/10/getting-tested-for-stis-1030x687.jpg'
    },
    {
      id: 2,
      name: 'Gói khám sức khỏe sinh sản',
      shortDescription: 'Kiểm tra toàn diện sức khỏe hệ thống sinh sản',
      category: 'Sức khỏe sinh sản',
      price: '1.200.000 VNĐ',
      duration: '1.5 giờ',
      longDescription: 'Gói khám sức khỏe sinh sản của chúng tôi cung cấp việc kiểm tra toàn diện để đảm bảo hệ thống sinh sản của bạn khỏe mạnh. Dịch vụ bao gồm khám thể chất, siêu âm, xét nghiệm Pap cho phụ nữ, và các xét nghiệm máu liên quan để phát hiện sớm bất kỳ vấn đề tiềm ẩn nào.',
      includes: ['Khám thể chất', 'Siêu âm', 'Xét nghiệm Pap (cho phụ nữ)', 'Xét nghiệm máu', 'Báo cáo chi tiết và khuyến nghị'],
      preparations: ['Lên lịch hẹn ngoài thời kỳ kinh nguyệt (đối với phụ nữ)', 'Tránh quan hệ tình dục 48 giờ trước cuộc hẹn'],
      restrictions: ['Phụ nữ mang thai nên thông báo cho nhân viên trước'],
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: 'Quản lý thời kỳ mãn kinh',
      shortDescription: 'Hỗ trợ và điều trị các triệu chứng mãn kinh',
      category: 'Tư vấn',
      price: '500.000 VNĐ',
      duration: '45-60 phút',
      longDescription: 'Dịch vụ quản lý mãn kinh của chúng tôi giúp phụ nữ vượt qua những thay đổi về thể chất và tinh thần của thời kỳ mãn kinh. Dịch vụ bao gồm đánh giá triệu chứng, xét nghiệm nội tiết tố nếu cần và các lựa chọn điều trị cá nhân hóa.',
      includes: ['Đánh giá triệu chứng', 'Xét nghiệm nội tiết tố (nếu cần)', 'Thảo luận về các lựa chọn điều trị', 'Khuyến nghị về lối sống', 'Lập kế hoạch chăm sóc theo dõi'],
      preparations: ['Theo dõi các triệu chứng trong 2-4 tuần trước cuộc hẹn', 'Ghi lại tần suất và mức độ nghiêm trọng của các triệu chứng như bốc hỏa, rối loạn giấc ngủ, v.v.'],
      restrictions: ['Không có'],
      image: 'https://images.contentstack.io/v3/assets/blt5f400315f9e4f0b3/blt370c09b99f72573f/6674e1813ff93c1732aba712/TCM_Menopause_Symptoms_Treatment.jpg?branch=production'
    }
  ];

  // Filter services based on search query and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(services.map(service => service.category)))];

  // Handle view service details
  const handleViewDetails = (service: ServiceType) => {
    setSelectedService(service);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
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
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-button ${filterCategory === category ? 'active' : ''}`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'Tất cả dịch vụ' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-card-image">
                <img src={service.image} alt={service.name} />
                <div className="service-card-category">{service.category}</div>
              </div>
              <div className="service-card-content">
                <h3 className="service-card-title">{service.name}</h3>
                <p className="service-card-description">{service.shortDescription}</p>
                <div className="service-card-details">
                  <div className="service-card-price">{service.price}</div>
                  <div className="service-card-duration">{service.duration}</div>
                </div>
              </div>
              <div className="service-card-actions">
                <button 
                  className="service-action-button book-button"
                  onClick={() => window.location.href = '/booking'}
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

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="service-modal-overlay" onClick={handleCloseModal}>
          <div className="service-modal-content" onClick={e => e.stopPropagation()}>
            <button className="service-modal-close" onClick={handleCloseModal}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="service-modal-header">
              <img src={selectedService.image} alt={selectedService.name} />
              <div className="service-modal-badge">{selectedService.category}</div>
            </div>
            
            <div className="service-modal-body">
              <h2 className="service-modal-title">{selectedService.name}</h2>
              
              <div className="service-modal-meta">
                <div className="service-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedService.price}</span>
                </div>
                <div className="service-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedService.duration}</span>
                </div>
              </div>
              
              <div className="service-modal-description">
                <h3>Mô tả</h3>
                <p>{selectedService.longDescription}</p>
              </div>
              
              <div className="service-modal-section">
                <h3>Bao gồm</h3>
                <ul>
                  {selectedService.includes.map((item, index) => (
                    <li key={index}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="service-modal-section">
                <h3>Chuẩn bị</h3>
                <ul>
                  {selectedService.preparations.map((item, index) => (
                    <li key={index}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedService.restrictions.length > 0 && (
                <div className="service-modal-section">
                  <h3>Hạn chế</h3>
                  <ul>
                    {selectedService.restrictions.map((item, index) => (
                      <li key={index}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="service-modal-actions">
                <button 
                  className="service-modal-book-button"
                  onClick={() => window.location.href = '/booking'}
                >
                  Đặt lịch ngay
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