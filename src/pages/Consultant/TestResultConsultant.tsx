import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaDownload, FaPrint, FaTimes, FaFilter } from 'react-icons/fa';
import './TestResultConsultant.css';

interface TestResult {
  id: string;
  patientName: string;
  patientId: string;
  testType: string;
  date: string;
  status: 'normal' | 'abnormal' | 'critical';
  viewed: boolean;
  notes?: string;
}

interface PatientInfo {
  id: string;
  name: string;
  dob: string;
  gender: string;
  email?: string;
  phone?: string;
}

interface TestCategory {
  name: string;
  description?: string;
  results: {
    name: string;
    value: string | number;
    unit?: string;
    referenceRange?: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
}

interface DetailedTestResult {
  id: string;
  patientInfo: PatientInfo;
  testDate: string;
  reportDate: string;
  sampleType: string;
  collectionDate: string;
  receivedDate: string;
  labId: string;
  categories: TestCategory[];
  notes?: string;
  doctorName?: string;
}

const TestResultConsultant: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{ 
    startDate: string; 
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailedResult, setDetailedResult] = useState<DetailedTestResult | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    unread: 0,
    normal: 0,
    abnormal: 0,
    critical: 0
  });

  // Mock data for test results
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 'TR-1001',
      patientName: 'Nguyễn Văn A',
      patientId: 'BN-5023',
      testType: 'STI Screening',
      date: '2023-06-25',
      status: 'normal',
      viewed: true,
      notes: '5/6/2025'
    },
    {
      id: 'TR-1002',
      patientName: 'Trần Thị B',
      patientId: 'BN-5045',
      testType: 'HIV & Hepatitis Panel',
      date: '2023-06-26',
      status: 'abnormal',
      viewed: true,
      notes: '5/6/2025'
    },
    {
      id: 'TR-1003',
      patientName: 'Lê Văn C',
      patientId: 'BN-5078',
      testType: 'Complete STI Panel',
      date: '2023-06-27',
      status: 'normal',
      viewed: false,
      notes: '5/6/2025'
    },
    {
      id: 'TR-1004',
      patientName: 'Phạm Thị D',
      patientId: 'BN-5102',
      testType: 'HPV Testing',
      date: '2023-06-28',
      status: 'critical',
      viewed: false,
      notes: '5/6/2025'
    },
    {
      id: 'TR-1005',
      patientName: 'Hoàng Văn E',
      patientId: 'BN-5134',
      testType: 'STI & Reproductive Health Panel',
      date: '2023-06-29',
      status: 'abnormal',
      viewed: false,
      notes: '5/6/2025'
    }
  ]);

  // Calculate summary statistics
  useEffect(() => {
    const stats = {
      total: testResults.length,
      unread: testResults.filter(r => !r.viewed).length,
      normal: testResults.filter(r => r.status === 'normal').length,
      abnormal: testResults.filter(r => r.status === 'abnormal').length,
      critical: testResults.filter(r => r.status === 'critical').length
    };
    setSummaryStats(stats);
  }, [testResults]);

  // Filter test results based on search query and filters
  const filteredResults = testResults.filter((result) => {
    // Search filter - search across multiple fields
    const searchFields = [
      result.patientName.toLowerCase(),
      result.patientId.toLowerCase(),
      result.testType.toLowerCase(),
      result.id.toLowerCase()
    ];
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => field.includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;

    // Date range filter
    let matchesDateRange = true;
    if (filterDateRange.startDate && filterDateRange.endDate) {
      const testDate = new Date(result.date);
      const startDate = new Date(filterDateRange.startDate);
      const endDate = new Date(filterDateRange.endDate);
      matchesDateRange = testDate >= startDate && testDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Mark result as viewed
  const markAsViewed = (id: string) => {
    setTestResults(
      testResults.map((result) =>
        result.id === id ? { ...result, viewed: true } : result
      )
    );
  };

  // Fetch detailed test result
  const fetchDetailedTestResult = (resultId: string) => {
    // In a real application, this would be an API call
    // Here we're simulating the API response with mock data
    const detailedData: DetailedTestResult = {
      id: resultId,
      patientInfo: {
        id: selectedResult?.patientId || '',
        name: selectedResult?.patientName || '',
        dob: '15/05/1992',
        gender: 'Nam',
        email: 'patient@example.com',
        phone: '0912345678'
      },
      testDate: selectedResult?.date || '',
      reportDate: selectedResult?.date || '',
      sampleType: 'Máu, Dịch niệu đạo',
      collectionDate: `${selectedResult?.date || ''} 09:49 AM`,
      receivedDate: `${selectedResult?.date || ''} 10:05 AM`,
      labId: 'LAB' + Math.floor(10000 + Math.random() * 90000),
      categories: [
        {
          name: 'SINH HÓA',
          results: [
            {
              name: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
              value: '0.00',
              referenceRange: '< 1',
              unit: 'RU',
              status: 'normal'
            }
          ]
        },
        {
          name: 'MIỄN DỊCH',
          results: [
            {
              name: 'HIV Combo Ag + Ab',
              value: '0.05',
              referenceRange: '< 1',
              unit: 'S/CO',
              status: 'normal'
            },
            {
              name: 'Syphilis',
              value: selectedResult?.status === 'abnormal' ? '1.11' : '0.11',
              referenceRange: 'Âm Tính: < 1.00\nDương Tính: ≥ 1.00',
              unit: 'S/CO',
              status: selectedResult?.status === 'abnormal' ? 'abnormal' : 'normal'
            }
          ]
        },
        {
          name: 'SINH HỌC PHÂN TỬ',
          description: 'Bộ STIs / STDs 13 Realtime PCR (Định Tính - CE-IVD)',
          results: [
            { name: 'Chlamydia trachomatis', value: selectedResult?.status === 'critical' ? 'Dương Tính' : 'Âm Tính', status: selectedResult?.status === 'critical' ? 'critical' : 'normal' },
            { name: 'Candida albicans', value: 'Âm Tính', status: 'normal' },
            { name: 'Treponema pallidum', value: 'Âm Tính', status: 'normal' },
            { name: 'Herpes Simplex Virus 1', value: 'Âm Tính', status: 'normal' },
            { name: 'Herpes Simplex Virus 2', value: 'Âm Tính', status: 'normal' },
            { name: 'Ureaplasma parvum', value: 'Âm Tính', status: 'normal' },
            { name: 'Trichomonas vaginalis', value: 'Âm Tính', status: 'normal' },
            { name: 'Mycoplasma genitalium', value: selectedResult?.status === 'abnormal' ? 'Dương Tính' : 'Âm Tính', status: selectedResult?.status === 'abnormal' ? 'abnormal' : 'normal' },
            { name: 'Mycoplasma hominis', value: 'Âm Tính', status: 'normal' },
            { name: 'Neisseria gonorrhoeae', value: 'Âm Tính', status: 'normal' },
            { name: 'Ureaplasma urealyticum', value: 'Âm Tính', status: 'normal' },
            { name: 'Haemophilus ducreyi', value: 'Âm Tính', status: 'normal' },
            { name: 'Gardnerella vaginalis', value: 'Âm Tính', status: 'normal' }
          ]
        }
      ],
      notes: 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu.',
      doctorName: 'BS. Trần Văn B'
    };

    setDetailedResult(detailedData);
  };

  // View test result details
  const viewResultDetails = (result: TestResult) => {
    setSelectedResult(result);
    fetchDetailedTestResult(result.id);
    setShowDetailModal(true);
    markAsViewed(result.id);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
    setDetailedResult(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDateRange({ startDate: '', endDate: '' });
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="test-results-consultant">
      {/* Header */}
      <div className="results-header">
        <div className="header-left">
          <h1>Kết quả xét nghiệm</h1>
          <p>Quản lý và xem kết quả xét nghiệm bệnh nhân</p>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="test-results-summary">
        <div className="summary-card">
          <div className="summary-value">{summaryStats.total}</div>
          <div className="summary-label">Tổng số kết quả</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summaryStats.unread}</div>
          <div className="summary-label unread">Chưa đọc</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summaryStats.normal}</div>
          <div className="summary-label normal">Bình thường</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summaryStats.abnormal}</div>
          <div className="summary-label abnormal">Bất thường</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summaryStats.critical}</div>
          <div className="summary-label critical">Cần chú ý</div>
        </div>
      </div>

      {/* Filters */}
      <div className="results-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên bệnh nhân, ID, loại xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Trạng thái kết quả</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả kết quả</option>
              <option value="normal">Bình thường</option>
              <option value="abnormal">Bất thường</option>
              <option value="critical">Cần chú ý</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Từ ngày</label>
            <input
              type="date"
              className="date-input"
              value={filterDateRange.startDate}
              onChange={(e) =>
                setFilterDateRange({ ...filterDateRange, startDate: e.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày</label>
            <input
              type="date"
              className="date-input"
              value={filterDateRange.endDate}
              onChange={(e) =>
                setFilterDateRange({ ...filterDateRange, endDate: e.target.value })
              }
            />
          </div>
          <button className="clear-filters-button" onClick={clearFilters}>
            <FaFilter className="icon-left" /> Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Results list */}
      <div className="results-list">
        {filteredResults.length > 0 ? (
          <table className="results-table">
            <thead>
              <tr>
                <th>ID xét nghiệm</th>
                <th>Bệnh nhân</th>
                <th>Loại xét nghiệm</th>
                <th>Ngày xét nghiệm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className={!result.viewed ? 'unread' : ''}>
                  <td>{result.id}</td>
                  <td>
                    <div className="patient-info">
                      <span className="patient-name">{result.patientName}</span>
                      <span className="patient-id">{result.patientId}</span>
                    </div>
                  </td>
                  <td>{result.testType}</td>
                  <td>{new Date(result.date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`status-badge ${result.status}`}>
                      {result.status === 'normal' && 'Bình thường'}
                      {result.status === 'abnormal' && 'Bất thường'}
                      {result.status === 'critical' && 'Cần chú ý'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button" onClick={() => viewResultDetails(result)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      <button className="print-button" onClick={handlePrint} title="In kết quả">
                        <FaPrint />
                      </button>
                      <button className="download-button" title="Tải PDF">
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>Không tìm thấy kết quả phù hợp với bộ lọc đã chọn.</p>
            <button onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
        )}
      </div>

      {/* Detailed result modal */}
      {showDetailModal && detailedResult && (
        <div className="modal-overlay">
          <div className="result-detail-modal">
            <div className="modal-header">
              <h2>
                Kết quả xét nghiệm #{detailedResult.id}
              </h2>
              <div className="modal-actions">
                <button className="print-button" onClick={handlePrint}>
                  <FaPrint /> In kết quả
                </button>
                <button className="download-button">
                  <FaDownload /> Tải PDF
                </button>
                <button className="close-button" onClick={closeDetailModal}>
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="modal-content">
              <div className="test-info-section">
                <div className="patient-info-card">
                  <h3>Thông tin bệnh nhân</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Họ tên</span>
                      <span className="info-value">{detailedResult.patientInfo.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mã bệnh nhân</span>
                      <span className="info-value">{detailedResult.patientInfo.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày sinh</span>
                      <span className="info-value">{detailedResult.patientInfo.dob}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Giới tính</span>
                      <span className="info-value">{detailedResult.patientInfo.gender}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{detailedResult.patientInfo.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Điện thoại</span>
                      <span className="info-value">{detailedResult.patientInfo.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="sample-info-card">
                  <h3>Thông tin mẫu xét nghiệm</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Mã xét nghiệm</span>
                      <span className="info-value">{detailedResult.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mã phòng lab</span>
                      <span className="info-value">{detailedResult.labId}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Loại mẫu</span>
                      <span className="info-value">{detailedResult.sampleType}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày lấy mẫu</span>
                      <span className="info-value">{detailedResult.collectionDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày nhận mẫu</span>
                      <span className="info-value">{detailedResult.receivedDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày báo cáo</span>
                      <span className="info-value">{detailedResult.reportDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="test-results-section">
                <h3>Kết quả xét nghiệm</h3>
                
                {detailedResult.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="result-category">
                    <h4>{category.name}</h4>
                    {category.description && (
                      <div className="category-description">{category.description}</div>
                    )}
                    <table className="results-detail-table">
                      <thead>
                        <tr>
                          <th>Xét nghiệm</th>
                          <th>Kết quả</th>
                          <th>Đơn vị</th>
                          <th>Giá trị tham chiếu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.results.map((result, resultIndex) => (
                          <tr 
                            key={resultIndex} 
                            className={`result-row ${result.status !== 'normal' ? result.status : ''}`}
                          >
                            <td>{result.name}</td>
                            <td className="result-value">{result.value}</td>
                            <td>{result.unit || '-'}</td>
                            <td className="reference-range">{result.referenceRange || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                
                {detailedResult.notes && (
                  <div className="result-notes">
                    <strong>Ghi chú:</strong> {detailedResult.notes}
                  </div>
                )}
                
                {detailedResult.doctorName && (
                  <div className="doctor-signature">
                    <p>Bác sĩ phụ trách</p>
                    <div className="doctor-name">{detailedResult.doctorName}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="close-button-footer" onClick={closeDetailModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultConsultant; 