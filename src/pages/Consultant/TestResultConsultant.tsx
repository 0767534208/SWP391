import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaEye, FaDownload, FaPrint } from 'react-icons/fa';
import './TestResultConsultant.css';
import { testResultService } from '../../services';
import { toast } from 'react-hot-toast';

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
  // States
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailedResult, setDetailedResult] = useState<DetailedTestResult | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    unread: 0,
    normal: 0,
    abnormal: 0,
    critical: 0
  });

  // Fetch test results
  useEffect(() => {
    const fetchTestResults = async () => {
      setLoading(true);
      try {
        const consultantId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
        
        if (!consultantId) {
          toast.error('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }
        
        // Fetch lab tests for the consultant's treatments
        const response = await testResultService.getAllTestResults();
        
        if (response.statusCode === 200 && response.data) {
          // Transform API data to match our component's expected format
          const transformedResults = response.data.items.map(item => ({
            id: item.id,
            patientName: item.user?.name || 'Không xác định',
            patientId: item.userId,
            testType: item.testType,
            date: item.testDate,
            status: determineTestStatus(item),
            viewed: item.viewed || false,
            notes: item.notes
          }));
          
          setTestResults(transformedResults);
          
          // Calculate summary stats
          const stats = {
            total: transformedResults.length,
            unread: transformedResults.filter(result => !result.viewed).length,
            normal: transformedResults.filter(result => result.status === 'normal').length,
            abnormal: transformedResults.filter(result => result.status === 'abnormal').length,
            critical: transformedResults.filter(result => result.status === 'critical').length
          };
          setSummaryStats(stats);
          
          console.log('Test results loaded:', transformedResults);
        } else {
          toast.error(`Có lỗi khi tải dữ liệu: ${response.message}`);
          setError(`Có lỗi khi tải dữ liệu: ${response.message}`);
        }
      } catch (err) {
        console.error('Error fetching test results:', err);
        toast.error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  // Determine test status
  const determineTestStatus = (testResult: any): 'normal' | 'abnormal' | 'critical' => {
    if (!testResult) return 'normal';
    
    // Extract result from the test result data
    // This is just an example - adapt based on your actual API response structure
    const resultValue = testResult.result?.toLowerCase();
    
    if (resultValue?.includes('positive') || resultValue?.includes('dương tính')) {
      return 'abnormal';
    } else if (resultValue?.includes('critical') || resultValue?.includes('nguy hiểm')) {
      return 'critical';
    } else {
      return 'normal';
    }
  };

  // Filter test results based on search query and filters
  const filteredResults = testResults.filter(result => {
    // Search filter
    const matchesSearch = 
      searchQuery === '' || 
      result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (result.notes && result.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      result.status === filterStatus;
    
    // Date filter
    const resultDate = new Date(result.date);
    const matchesStartDate = 
      !filterDateRange.startDate || 
      resultDate >= new Date(filterDateRange.startDate);
    const matchesEndDate = 
      !filterDateRange.endDate || 
      resultDate <= new Date(filterDateRange.endDate + 'T23:59:59');
    
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Mark a test result as viewed
  const markAsViewed = async (id: string) => {
    try {
      // Call API to mark the result as viewed
      await testResultService.markTestResultAsViewed(id);
      
      // Update local state
      setTestResults(prev => 
        prev.map(result => 
          result.id === id ? { ...result, viewed: true } : result
        )
      );
      
      // Update summary stats
      setSummaryStats(prev => ({
        ...prev,
        unread: prev.unread - 1
      }));
      
      toast.success('Đã đánh dấu đã đọc');
    } catch (err) {
      console.error('Error marking test result as viewed:', err);
      toast.error('Có lỗi khi cập nhật trạng thái, vui lòng thử lại sau');
    }
  };

  // Fetch detailed test result
  const fetchDetailedTestResult = async (resultId: string) => {
    try {
      // Fetch the detailed test result from API
      const response = await testResultService.getTestResult(resultId);
      
      if (response.statusCode === 200 && response.data) {
        // Transform API data to match our component's expected format
        const testResult = response.data;
        
        // This is a simplified transformation - adjust based on actual API response
        const detailedData: DetailedTestResult = {
          id: testResult.id,
          patientInfo: {
            id: testResult.userId,
            name: testResult.user?.name || 'Không xác định',
            dob: testResult.user?.dateOfBirth || '',
            gender: testResult.user?.gender || 'Không xác định',
            email: testResult.user?.email,
            phone: testResult.user?.phone
          },
          testDate: testResult.testDate,
          reportDate: testResult.testDate, // Assuming same date for simplicity
          sampleType: testResult.testType,
          collectionDate: testResult.testDate,
          receivedDate: testResult.testDate,
          labId: testResult.id,
          categories: [
            {
              name: 'KẾT QUẢ XÉT NGHIỆM',
              results: [
                {
                  name: testResult.testType,
                  value: testResult.result,
                  status: determineTestStatus(testResult)
                }
              ]
            }
          ],
          notes: testResult.notes,
          doctorName: 'BS. Tư vấn'
        };
        
        return detailedData;
      } else {
        toast.error(`Không thể tải chi tiết kết quả: ${response.message}`);
        return null;
      }
    } catch (err) {
      console.error('Error fetching detailed test result:', err);
      toast.error('Có lỗi khi tải chi tiết kết quả, vui lòng thử lại sau');
      return null;
    }
  };

  // View test result details
  const viewResultDetails = async (result: TestResult) => {
    const detailedResult = await fetchDetailedTestResult(result.id);
    if (detailedResult) {
      setDetailedResult(detailedResult);
      setShowDetailModal(true);
      
      if (!result.viewed) {
        markAsViewed(result.id);
      }
    }
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailedResult(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDateRange({ startDate: '', endDate: '' });
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Get status badge class
  const getStatusBadgeClass = (status: 'normal' | 'abnormal' | 'critical'): string => {
    switch (status) {
      case 'normal':
        return 'status-badge normal';
      case 'abnormal':
        return 'status-badge abnormal';
      case 'critical':
        return 'status-badge critical';
      default:
        return 'status-badge';
    }
  };

  // Translate status
  const translateStatus = (status: 'normal' | 'abnormal' | 'critical'): string => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'abnormal':
        return 'Bất thường';
      case 'critical':
        return 'Nguy hiểm';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="test-results-consultant">
      {/* Header */}
      <div className="results-header">
        <div>
          <h1>Kết quả xét nghiệm</h1>
          <p>Quản lý và theo dõi kết quả xét nghiệm của bệnh nhân</p>
        </div>
      </div>

      {/* Summary Cards */}
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
          <div className="summary-label critical">Nguy hiểm</div>
        </div>
      </div>

      {/* Filters */}
      <div className="results-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã bệnh nhân, mã xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="normal">Bình thường</option>
              <option value="abnormal">Bất thường</option>
              <option value="critical">Nguy hiểm</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={filterDateRange.startDate}
              onChange={(e) => setFilterDateRange({...filterDateRange, startDate: e.target.value})}
              className="date-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={filterDateRange.endDate}
              onChange={(e) => setFilterDateRange({...filterDateRange, endDate: e.target.value})}
              className="date-input"
            />
          </div>
          
          <button className="clear-filters-button" onClick={clearFilters}>
            <FaTimes className="icon-left" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-retry"
          >
            Tải lại
          </button>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="results-list">
          <table className="results-table">
            <thead>
              <tr>
                <th>Mã xét nghiệm</th>
                <th>Tên bệnh nhân</th>
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
                  <td>{formatDate(result.date)}</td>
                  <td>
                    <span className={getStatusBadgeClass(result.status)}>
                      {translateStatus(result.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-button" 
                        onClick={() => viewResultDetails(result)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="download-button"
                        title="Tải xuống PDF"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <p>Không tìm thấy kết quả phù hợp</p>
          <button onClick={clearFilters}>Xóa bộ lọc</button>
        </div>
      )}

      {/* Detailed Result Modal */}
      {showDetailModal && detailedResult && (
        <div className="modal-overlay">
          <div className="result-detail-modal">
            <div className="modal-header">
              <h2>Chi tiết kết quả xét nghiệm - {detailedResult.id}</h2>
              <div className="modal-actions">
                <button className="print-button" onClick={handlePrint}>
                  <FaPrint /> In kết quả
                </button>
                <button className="download-button">
                  <FaDownload /> Tải PDF
                </button>
                <button className="close-button" onClick={closeDetailModal}>
                  ×
                </button>
              </div>
            </div>
            
            <div className="modal-content">
              <div className="test-info-section">
                <div className="patient-info-card">
                  <h3>Thông tin bệnh nhân</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Họ tên</div>
                      <div className="info-value">{detailedResult.patientInfo.name}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Mã bệnh nhân</div>
                      <div className="info-value">{detailedResult.patientInfo.id}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Ngày sinh</div>
                      <div className="info-value">{detailedResult.patientInfo.dob ? formatDate(detailedResult.patientInfo.dob) : 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Giới tính</div>
                      <div className="info-value">{detailedResult.patientInfo.gender}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Số điện thoại</div>
                      <div className="info-value">{detailedResult.patientInfo.phone || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Email</div>
                      <div className="info-value">{detailedResult.patientInfo.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="sample-info-card">
                  <h3>Thông tin mẫu xét nghiệm</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Mã xét nghiệm</div>
                      <div className="info-value">{detailedResult.id}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Mã phòng lab</div>
                      <div className="info-value">{detailedResult.labId}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Loại mẫu</div>
                      <div className="info-value">{detailedResult.sampleType}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Ngày lấy mẫu</div>
                      <div className="info-value">{formatDate(detailedResult.collectionDate)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Ngày nhận mẫu</div>
                      <div className="info-value">{formatDate(detailedResult.receivedDate)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Ngày báo cáo</div>
                      <div className="info-value">{formatDate(detailedResult.reportDate)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="test-results-section">
                <h3>Kết quả xét nghiệm</h3>
                
                {detailedResult.categories.map((category, index) => (
                  <div key={index} className="result-category">
                    <h4>{category.name}</h4>
                    {category.description && (
                      <div className="category-description">{category.description}</div>
                    )}
                    
                    <table className="results-detail-table">
                      <thead>
                        <tr>
                          <th>Tên xét nghiệm</th>
                          <th>Kết quả</th>
                          <th>Đơn vị</th>
                          <th>Giá trị tham chiếu</th>
                          <th>Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.results.map((result, idx) => (
                          <tr key={idx} className={`result-row ${result.status !== 'normal' ? result.status : ''}`}>
                            <td>{result.name}</td>
                            <td className="result-value">{result.value}</td>
                            <td>{result.unit || '-'}</td>
                            <td className="reference-range">{result.referenceRange || '-'}</td>
                            <td>
                              <span className={getStatusBadgeClass(result.status)}>
                                {translateStatus(result.status)}
                              </span>
                            </td>
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
                
                <div className="doctor-signature">
                  <p>Bác sĩ phụ trách</p>
                  <div className="doctor-name">{detailedResult.doctorName || 'N/A'}</div>
                </div>
              </div>
              
              <div className="consultant-actions">
                <button className="contact-patient">Liên hệ bệnh nhân</button>
                <button className="schedule-followup">Đặt lịch tái khám</button>
                <button className="add-notes">Thêm ghi chú</button>
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