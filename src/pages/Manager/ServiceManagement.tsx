import React, { useState, useEffect } from 'react';
import './ServiceManagement.css';

interface Service {
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
  isActive: boolean;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for services - in a real application, this would come from an API
  useEffect(() => {
    // Simulating API call to fetch services
    const mockServices: Service[] = [
      {
        id: 1,
        name: 'Xét nghiệm & Tư vấn HIV',
        shortDescription: 'Xét nghiệm HIV riêng tư và bảo mật với tư vấn chuyên nghiệp',
        category: 'Xét nghiệm HIV',
        price: '300.000 VNĐ',
        duration: '30-45 phút',
        longDescription: 'Dịch vụ xét nghiệm HIV của chúng tôi cung cấp một môi trường an toàn, riêng tư và không phán xét để xét nghiệm HIV. Bao gồm tư vấn trước và sau xét nghiệm với các chuyên gia có chuyên môn.',
        includes: ['Tư vấn trước xét nghiệm', 'Xét nghiệm HIV nhanh', 'Tư vấn sau xét nghiệm', 'Giới thiệu điều trị nếu cần'],
        preparations: ['Không cần chuẩn bị đặc biệt'],
        restrictions: ['Không có giới hạn'],
        image: 'https://hips.hearstapps.com/hmg-prod/images/young-man-taking-blood-test-royalty-free-image-1674046843.jpg',
        isActive: true
      },
      {
        id: 2,
        name: 'Kiểm tra STI toàn diện',
        shortDescription: 'Kiểm tra toàn diện các bệnh lây truyền qua đường tình dục phổ biến',
        category: 'Xét nghiệm STI',
        price: '850.000 VNĐ',
        duration: '1 giờ',
        longDescription: 'Gói kiểm tra STI toàn diện của chúng tôi bao gồm xét nghiệm cho tất cả các bệnh lây truyền qua đường tình dục chính bao gồm HIV, Giang mai, Lậu, Chlamydia, Herpes và Viêm gan B&C.',
        includes: ['Tư vấn với chuyên gia y tế', 'Thu thập mẫu máu và nước tiểu', 'Xét nghiệm cho 6+ loại STI'],
        preparations: ['Tránh đi tiểu 1 giờ trước cuộc hẹn', 'Mang theo hồ sơ y tế trước đây nếu có'],
        restrictions: ['Khuyến nghị kiêng quan hệ tình dục 24 giờ trước khi xét nghiệm'],
        image: 'https://madisonwomenshealth.com/wp-content/uploads/2023/10/getting-tested-for-stis-1030x687.jpg',
        isActive: true
      },
      {
        id: 3,
        name: 'Tư vấn sức khỏe tình dục',
        shortDescription: 'Tư vấn một-một với chuyên gia về sức khỏe tình dục',
        category: 'Tư vấn',
        price: '400.000 VNĐ',
        duration: '45-60 phút',
        longDescription: 'Phiên tư vấn riêng tư với các chuyên gia của chúng tôi cung cấp một không gian an toàn để thảo luận về mọi lo ngại về sức khỏe tình dục của bạn, từ vấn đề STI đến sức khỏe sinh sản và nhiều hơn nữa.',
        includes: ['Phiên tư vấn riêng tư', 'Tài liệu giáo dục', 'Kế hoạch hành động sức khỏe được cá nhân hóa'],
        preparations: ['Viết ra câu hỏi hoặc mối quan tâm trước'],
        restrictions: ['Không có giới hạn'],
        image: 'https://i0.wp.com/post.psychcentral.com/wp-content/uploads/sites/4/2021/12/female-therapy-session-crop-1294016090-1296x729-header-1.jpg',
        isActive: true
      },
      {
        id: 4,
        name: 'Gói khám sức khỏe sinh sản',
        shortDescription: 'Đánh giá toàn diện về sức khỏe sinh sản',
        category: 'Khám sức khỏe',
        price: '1.200.000 VNĐ',
        duration: '1.5 giờ',
        longDescription: 'Gói khám sức khỏe sinh sản toàn diện giúp phát hiện sớm các vấn đề về sinh sản và cung cấp tư vấn chuyên sâu về sức khỏe sinh sản, kế hoạch hóa gia đình và các biện pháp phòng ngừa.',
        includes: ['Khám phụ khoa/nam khoa', 'Xét nghiệm hormone sinh sản', 'Siêu âm', 'Tư vấn kết quả'],
        preparations: ['Không quan hệ tình dục 24 giờ trước khám', 'Không rửa vùng kín trước khi khám'],
        restrictions: ['Không khám trong kỳ kinh nguyệt (với nữ)'],
        image: 'https://www.shutterstock.com/image-photo/gynecologist-doctor-consulting-female-patient-600nw-2060612575.jpg',
        isActive: true
      },
      {
        id: 5,
        name: 'Tư vấn biện pháp tránh thai',
        shortDescription: 'Tư vấn cá nhân hóa về các biện pháp tránh thai phù hợp',
        category: 'Tư vấn',
        price: '350.000 VNĐ',
        duration: '30-45 phút',
        longDescription: 'Phiên tư vấn cung cấp thông tin đầy đủ về các biện pháp tránh thai hiện đại, giúp bạn hiểu rõ ưu nhược điểm của từng phương pháp và lựa chọn biện pháp phù hợp nhất với cơ thể và nhu cầu của bạn.',
        includes: ['Tư vấn cá nhân', 'Giới thiệu các phương pháp tránh thai', 'Kê đơn nếu cần'],
        preparations: ['Ghi chú về chu kỳ kinh nguyệt', 'Chuẩn bị câu hỏi'],
        restrictions: ['Không có giới hạn'],
        image: 'https://www.shutterstock.com/image-photo/contraception-methods-concept-birth-control-600nw-1905915291.jpg',
        isActive: true
      },
      {
        id: 6,
        name: 'Tiêm vắc-xin HPV',
        shortDescription: 'Phòng ngừa ung thư cổ tử cung và các bệnh liên quan đến HPV',
        category: 'Tiêm chủng',
        price: '1.500.000 VNĐ',
        duration: '15-20 phút',
        longDescription: 'Vắc-xin HPV giúp bảo vệ chống lại các chủng virus HPV nguy cơ cao có thể gây ung thư cổ tử cung, âm hộ, âm đạo, hậu môn và các bệnh lây truyền qua đường tình dục khác.',
        includes: ['Tư vấn trước tiêm', 'Tiêm vắc-xin HPV', 'Theo dõi sau tiêm'],
        preparations: ['Ăn đủ bữa trước khi tiêm', 'Mang theo sổ tiêm chủng nếu có'],
        restrictions: ['Không tiêm khi đang bị sốt', 'Thông báo nếu có thai hoặc cho con bú'],
        image: 'https://images.ctfassets.net/n5vgw6ikgq17/2iJzGTNdl6KSMgkMoKw2S2/3a064db7c7059048d2bf379cfed0dc0c/hpv-injection-pic-landscape.jpg',
        isActive: true
      },
      {
        id: 7,
        name: 'Gói chăm sóc thai sản',
        shortDescription: 'Chăm sóc toàn diện cho mẹ và bé trong thai kỳ',
        category: 'Thai sản',
        price: '2.500.000 VNĐ',
        duration: '2 giờ (lần khám đầu)',
        longDescription: 'Gói chăm sóc thai sản toàn diện bao gồm các dịch vụ cần thiết để theo dõi sức khỏe của mẹ và bé trong suốt thai kỳ, từ khi mới mang thai đến khi sinh nở, đảm bảo một thai kỳ khỏe mạnh.',
        includes: ['Khám thai định kỳ', 'Xét nghiệm máu, nước tiểu', 'Siêu âm 4D', 'Tư vấn dinh dưỡng'],
        preparations: ['Mang theo sổ khám thai', 'Không ăn quá no trước khi siêu âm'],
        restrictions: ['Thông báo về bất kỳ thuốc nào đang sử dụng'],
        image: 'https://img.freepik.com/premium-photo/pregnant-woman-doctor-appointment-hospital_53419-8243.jpg',
        isActive: true
      },
      {
        id: 8,
        name: 'Quản lý thời kỳ mãn kinh',
        shortDescription: 'Hỗ trợ phụ nữ trong giai đoạn mãn kinh',
        category: 'Sức khỏe phụ nữ',
        price: '500.000 VNĐ',
        duration: '45-60 phút',
        longDescription: 'Dịch vụ giúp phụ nữ hiểu và quản lý hiệu quả các triệu chứng của thời kỳ mãn kinh như bốc hỏa, thay đổi tâm trạng, mất ngủ. Bao gồm tư vấn về điều trị hormone, dinh dưỡng và lối sống.',
        includes: ['Đánh giá triệu chứng', 'Xét nghiệm hormone', 'Tư vấn điều trị', 'Kế hoạch chăm sóc cá nhân'],
        preparations: ['Ghi chép về các triệu chứng đang gặp phải'],
        restrictions: ['Không có giới hạn'],
        image: 'https://img.freepik.com/premium-photo/doctor-talking-with-mature-woman-patient-clinic_107420-65925.jpg',
        isActive: true
      },
      {
        id: 9,
        name: 'Sàng lọc sức khỏe tiền hôn nhân',
        shortDescription: 'Gói kiểm tra toàn diện dành cho các cặp đôi chuẩn bị kết hôn',
        category: 'Sàng lọc',
        price: '1.800.000 VNĐ',
        duration: '2 giờ',
        longDescription: 'Gói sàng lọc toàn diện này được thiết kế cho các cặp đôi chuẩn bị kết hôn, bao gồm xét nghiệm STI, tư vấn di truyền và thảo luận về kế hoạch gia đình.',
        includes: ['Xét nghiệm STI toàn diện', 'Tư vấn di truyền cơ bản', 'Tư vấn kế hoạch gia đình', 'Kiểm tra sức khỏe tổng quát'],
        preparations: ['Nhịn ăn 8 giờ (chỉ uống nước)', 'Mang theo bất kỳ hồ sơ y tế liên quan'],
        restrictions: ['Cả hai đối tác nên tham dự'],
        image: 'https://static.wixstatic.com/media/2cd43b_59b182d7d5c8449c88d437504488e1e1~mv2.png/v1/fill/w_940,h_627,fp_0.50_0.50,q_90,enc_auto/2cd43b_59b182d7d5c8449c88d437504488e1e1~mv2.png',
        isActive: false
      },
      {
        id: 10,
        name: 'Tư vấn di truyền',
        shortDescription: 'Tư vấn về các rủi ro di truyền và các lựa chọn sinh sản',
        category: 'Tư vấn',
        price: '900.000 VNĐ',
        duration: '1 giờ',
        longDescription: 'Dịch vụ tư vấn di truyền giúp các cặp đôi hiểu về nguy cơ di truyền của họ, đặc biệt là khi có tiền sử gia đình mắc các bệnh di truyền. Cung cấp thông tin về các lựa chọn sinh sản an toàn.',
        includes: ['Đánh giá tiền sử gia đình', 'Tư vấn về xét nghiệm di truyền', 'Thảo luận về các lựa chọn sinh sản'],
        preparations: ['Thu thập thông tin về tiền sử bệnh trong gia đình'],
        restrictions: ['Nên có sự tham gia của cả hai đối tác'],
        image: 'https://static01.nyt.com/images/2018/11/28/well/physed-genetic/physed-genetic-superJumbo.jpg',
        isActive: false
      },
      {
        id: 11,
        name: 'Điều trị vô sinh',
        shortDescription: 'Chẩn đoán và điều trị các vấn đề vô sinh',
        category: 'Điều trị',
        price: '2.000.000 VNĐ',
        duration: '1.5 giờ (buổi đầu)',
        longDescription: 'Dịch vụ điều trị vô sinh bao gồm đánh giá toàn diện, chẩn đoán nguyên nhân và phát triển kế hoạch điều trị cá nhân hóa. Hỗ trợ các cặp đôi gặp khó khăn trong việc thụ thai.',
        includes: ['Đánh giá y tế toàn diện', 'Xét nghiệm hormone', 'Kiểm tra tinh trùng', 'Siêu âm', 'Tư vấn điều trị'],
        preparations: ['Kiêng quan hệ tình dục 3-5 ngày trước xét nghiệm tinh trùng'],
        restrictions: ['Nên có sự tham gia của cả hai đối tác'],
        image: 'https://www.shutterstock.com/image-photo/infertility-treatment-consultation-doctor-couple-600nw-1727385365.jpg',
        isActive: false
      },
      {
        id: 12,
        name: 'Tư vấn sức khỏe thanh thiếu niên',
        shortDescription: 'Tư vấn sức khỏe sinh sản và tình dục cho thanh thiếu niên',
        category: 'Tư vấn',
        price: '350.000 VNĐ',
        duration: '45 phút',
        longDescription: 'Dịch vụ cung cấp không gian an toàn và bảo mật cho thanh thiếu niên để thảo luận về sức khỏe sinh sản, tình dục, và các vấn đề phát triển. Tư vấn bởi các chuyên gia được đào tạo về sức khỏe thanh thiếu niên.',
        includes: ['Tư vấn cá nhân', 'Giáo dục sức khỏe', 'Xét nghiệm nếu cần', 'Cung cấp tài liệu giáo dục'],
        preparations: ['Không có yêu cầu đặc biệt'],
        restrictions: ['Dịch vụ dành cho người từ 13-19 tuổi'],
        image: 'https://cdn.technologynetworks.com/tn/images/thumbs/jpeg/640_360/supporting-teen-mental-health-during-covid-19-343255.jpg',
        isActive: false
      }
    ];
    
    setServices(mockServices);
  }, []);

  // Filter services based on search query and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(services.map(service => service.category))];

  // Handle adding a new service
  const handleAddService = () => {
    setCurrentService({
      id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
      name: '',
      shortDescription: '',
      category: '',
      price: '',
      duration: '',
      longDescription: '',
      includes: [''],
      preparations: [''],
      restrictions: [''],
      image: '',
      isActive: true
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
          service.id === currentService.id ? currentService : service
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
        service.id === id ? {...service, isActive: !service.isActive} : service
      )
    );
  };

  // Handle deleting a service
  const handleDeleteService = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      setServices(prevServices => prevServices.filter(service => service.id !== id));
    }
  };

  // Handle array input changes (includes, preparations, restrictions)
  const handleArrayChange = (
    field: 'includes' | 'preparations' | 'restrictions',
    index: number,
    value: string
  ) => {
    if (!currentService) return;
    
    const newArray = [...currentService[field]];
    newArray[index] = value;
    
    setCurrentService({
      ...currentService,
      [field]: newArray
    });
  };

  // Handle adding an item to array fields
  const handleAddArrayItem = (field: 'includes' | 'preparations' | 'restrictions') => {
    if (!currentService) return;
    
    setCurrentService({
      ...currentService,
      [field]: [...currentService[field], '']
    });
  };

  // Handle removing an item from array fields
  const handleRemoveArrayItem = (field: 'includes' | 'preparations' | 'restrictions', index: number) => {
    if (!currentService) return;
    
    const newArray = [...currentService[field]];
    newArray.splice(index, 1);
    
    setCurrentService({
      ...currentService,
      [field]: newArray
    });
  };

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
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Tất cả danh mục' : category}
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
              <th>Thời lượng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => (
              <tr key={service.id} className={service.isActive ? '' : 'inactive-service'}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>{service.price}</td>
                <td>{service.duration}</td>
                <td>
                  <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Hoạt động' : 'Không hoạt động'}
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
                    onClick={() => handleToggleActive(service.id)}
                    title={service.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                  >
                    {service.isActive ? (
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
                    onClick={() => handleDeleteService(service.id)}
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
              <h2>{isEditing ? 'Chỉnh sửa dịch vụ' : (currentService.name ? 'Chi tiết dịch vụ' : 'Thêm dịch vụ mới')}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveService} className="service-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Tên dịch vụ</label>
                  <input
                    type="text"
                    id="name"
                    value={currentService.name}
                    onChange={(e) => setCurrentService({...currentService, name: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <input
                    type="text"
                    id="category"
                    value={currentService.category}
                    onChange={(e) => setCurrentService({...currentService, category: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Giá</label>
                  <input
                    type="text"
                    id="price"
                    value={currentService.price}
                    onChange={(e) => setCurrentService({...currentService, price: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration">Thời lượng</label>
                  <input
                    type="text"
                    id="duration"
                    value={currentService.duration}
                    onChange={(e) => setCurrentService({...currentService, duration: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="shortDescription">Mô tả ngắn</label>
                  <input
                    type="text"
                    id="shortDescription"
                    value={currentService.shortDescription}
                    onChange={(e) => setCurrentService({...currentService, shortDescription: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="longDescription">Mô tả đầy đủ</label>
                  <textarea
                    id="longDescription"
                    value={currentService.longDescription}
                    onChange={(e) => setCurrentService({...currentService, longDescription: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                    rows={4}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="image">URL hình ảnh</label>
                  <input
                    type="text"
                    id="image"
                    value={currentService.image}
                    onChange={(e) => setCurrentService({...currentService, image: e.target.value})}
                    required
                    readOnly={!isEditing && currentService.name !== ''}
                  />
                </div>
                
                {/* Image preview */}
                {currentService.image && (
                  <div className="form-group full-width">
                    <label>Xem trước hình ảnh</label>
                    <div className="image-preview">
                      <img src={currentService.image} alt={currentService.name} />
                    </div>
                  </div>
                )}
                
                {/* Array fields */}
                <div className="form-group full-width">
                  <label>Bao gồm</label>
                  {currentService.includes.map((item, index) => (
                    <div key={index} className="array-input-group">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('includes', index, e.target.value)}
                        readOnly={!isEditing && currentService.name !== ''}
                      />
                      {(isEditing || currentService.name === '') && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveArrayItem('includes', index)}
                          className="remove-item-btn"
                        >
                          <i className="fas fa-minus-circle"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {(isEditing || currentService.name === '') && (
                    <button 
                      type="button" 
                      onClick={() => handleAddArrayItem('includes')}
                      className="add-item-btn"
                    >
                      <i className="fas fa-plus-circle"></i> Thêm mục
                    </button>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Chuẩn bị</label>
                  {currentService.preparations.map((item, index) => (
                    <div key={index} className="array-input-group">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('preparations', index, e.target.value)}
                        readOnly={!isEditing && currentService.name !== ''}
                      />
                      {(isEditing || currentService.name === '') && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveArrayItem('preparations', index)}
                          className="remove-item-btn"
                        >
                          <i className="fas fa-minus-circle"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {(isEditing || currentService.name === '') && (
                    <button 
                      type="button" 
                      onClick={() => handleAddArrayItem('preparations')}
                      className="add-item-btn"
                    >
                      <i className="fas fa-plus-circle"></i> Thêm mục
                    </button>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Hạn chế</label>
                  {currentService.restrictions.map((item, index) => (
                    <div key={index} className="array-input-group">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('restrictions', index, e.target.value)}
                        readOnly={!isEditing && currentService.name !== ''}
                      />
                      {(isEditing || currentService.name === '') && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveArrayItem('restrictions', index)}
                          className="remove-item-btn"
                        >
                          <i className="fas fa-minus-circle"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {(isEditing || currentService.name === '') && (
                    <button 
                      type="button" 
                      onClick={() => handleAddArrayItem('restrictions')}
                      className="add-item-btn"
                    >
                      <i className="fas fa-plus-circle"></i> Thêm mục
                    </button>
                  )}
                </div>
                
                <div className="form-group full-width status-toggle">
                  <label>Trạng thái</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status"
                      checked={currentService.isActive}
                      onChange={(e) => setCurrentService({...currentService, isActive: e.target.checked})}
                      disabled={!isEditing && currentService.name !== ''}
                    />
                    <label htmlFor="status" className="toggle-label">
                      {currentService.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                {(isEditing || currentService.name === '') ? (
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