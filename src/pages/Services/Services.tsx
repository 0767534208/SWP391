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
      name: 'Xét nghiệm & Tư vấn HIV',
      shortDescription: 'Xét nghiệm HIV bảo mật với tư vấn chuyên nghiệp',
      category: 'Xét nghiệm STI',
      price: '300.000 VNĐ',
      duration: '30-45 phút',
      longDescription: 'Dịch vụ xét nghiệm HIV của chúng tôi cung cấp kết quả nhanh, chính xác với sự riêng tư hoàn toàn. Mỗi buổi kiểm tra bao gồm tư vấn trước xét nghiệm để giải quyết các lo ngại và tư vấn sau xét nghiệm để thảo luận về kết quả và các bước tiếp theo.',
      includes: ['Tư vấn trước xét nghiệm', 'Thu thập mẫu máu', 'Xét nghiệm kháng thể HIV', 'Tư vấn sau xét nghiệm', 'Dịch vụ giới thiệu nếu cần'],
      preparations: ['Không cần chuẩn bị đặc biệt', 'Mang CCCD hoặc CMND để đăng ký'],
      restrictions: ['Phải từ 16 tuổi trở lên', 'Trẻ vị thành niên phải có sự đồng ý của người giám hộ'],
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
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
      id: 3,
      name: 'Tư vấn sức khỏe tình dục',
      shortDescription: 'Tư vấn riêng tư về các vấn đề sức khỏe tình dục',
      category: 'Tư vấn',
      price: '400.000 VNĐ',
      duration: '45-60 phút',
      longDescription: 'Dịch vụ tư vấn sức khỏe tình dục của chúng tôi cung cấp không gian an toàn để thảo luận về các vấn đề riêng tư với các chuyên gia y tế có kinh nghiệm. Nhận lời khuyên chuyên nghiệp về biện pháp tránh thai, phòng ngừa STI, rối loạn chức năng tình dục hoặc các vấn đề sức khỏe sinh sản khác.',
      includes: ['Tư vấn trực tiếp với chuyên gia', 'Lời khuyên và thông tin cá nhân hóa', 'Kế hoạch điều trị nếu áp dụng', 'Đơn thuốc nếu cần thiết', 'Các khuyến nghị theo dõi'],
      preparations: ['Liệt kê các mối quan tâm và câu hỏi của bạn trước', 'Mang theo thông tin về thuốc hiện tại'],
      restrictions: ['Không có'],
      image: 'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
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
      id: 5,
      name: 'Tư vấn biện pháp tránh thai',
      shortDescription: 'Tư vấn chuyên nghiệp về các lựa chọn tránh thai',
      category: 'Tư vấn',
      price: '350.000 VNĐ',
      duration: '30-45 phút',
      longDescription: 'Dịch vụ tư vấn tránh thai của chúng tôi cung cấp lời khuyên cá nhân hóa về các phương pháp tránh thai phù hợp với lối sống và tình trạng sức khỏe của bạn. Buổi tư vấn bao gồm thảo luận về hiệu quả, tác dụng phụ và cách sử dụng đúng các phương pháp tránh thai khác nhau.',
      includes: ['Xem xét tiền sử y tế', 'Thảo luận về các phương pháp tránh thai hiện có', 'Khuyến nghị cá nhân hóa', 'Kê đơn nếu có thể', 'Lập kế hoạch theo dõi'],
      preparations: ['Mang theo hồ sơ về các biện pháp tránh thai đã sử dụng trước đây', 'Ghi chú bất kỳ tác dụng phụ nào đã gặp phải'],
      restrictions: ['Không có'],
      image: 'https://ogaidaho.com/wp-content/uploads/2019/10/obgyn-contraceptive-consultation.jpg'
    },
    {
      id: 6,
      name: 'Tiêm vắc-xin HPV',
      shortDescription: 'Bảo vệ chống lại nhiễm HPV và các bệnh ung thư liên quan',
      category: 'Chăm sóc dự phòng',
      price: '1.500.000 VNĐ mỗi liều',
      duration: '15-20 phút',
      longDescription: 'Dịch vụ tiêm vắc-xin HPV của chúng tôi cung cấp biện pháp bảo vệ chống lại virus papilloma ở người, có thể gây ung thư cổ tử cung và mụn cóc sinh dục. Vắc-xin được tiêm thành một loạt liều để bảo vệ tối ưu.',
      includes: ['Tư vấn trước khi tiêm vắc-xin', 'Tiêm liều vắc-xin HPV', 'Theo dõi sau tiêm', 'Chứng nhận tiêm chủng', 'Nhắc nhở cho các liều tiếp theo'],
      preparations: ['Thông báo về dị ứng hoặc phản ứng trước đây với vắc-xin', 'Mặc quần áo rộng rãi để dễ dàng tiếp cận cánh tay trên'],
      restrictions: ['Không khuyến nghị trong thời kỳ mang thai', 'Nên hoãn lại trong thời gian bị bệnh cấp tính có sốt'],
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2024/3/10/vaccine-hpv-17100534453571730023931.jpg'
    },
    {
      id: 7,
      name: 'Gói chăm sóc thai sản',
      shortDescription: 'Chăm sóc toàn diện trong thai kỳ',
      category: 'Sức khỏe sinh sản',
      price: '2.500.000 VNĐ',
      duration: '2 giờ (lần khám đầu)',
      longDescription: 'Gói chăm sóc thai sản của chúng tôi đảm bảo sức khỏe của cả mẹ và bé trong suốt thai kỳ. Dịch vụ bao gồm khám định kỳ, siêu âm, tư vấn dinh dưỡng và chuẩn bị cho việc sinh nở.',
      includes: ['Khám ban đầu toàn diện', 'Các cuộc hẹn theo dõi thường xuyên', 'Siêu âm', 'Xét nghiệm máu và nước tiểu', 'Tư vấn dinh dưỡng'],
      preparations: ['Mang theo hồ sơ thai sản trước đây nếu có', 'Đến với bàng quang đầy để siêu âm'],
      restrictions: ['Không có'],
      image: 'https://thedailyhostess.com//wp-content/uploads/2017/04/Pregnancy-Care-Package-e1493209249282.jpg'
    },
    {
      id: 8,
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