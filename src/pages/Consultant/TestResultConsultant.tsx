import React, { useState, useEffect } from 'react';
import './TestResultConsultant.css';
import { FaSearch, FaFilter, FaEye, FaFilePdf, FaShareAlt, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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

const TestResultConsultant: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{ 
    startDate: string; 
    endDate: string;
    endTestDate: string;
  }>({
    startDate: '',
    endDate: '',
    endTestDate: ''
  });
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

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
    if (filterDateRange.startDate || filterDateRange.endDate || filterDateRange.endTestDate) {
      const testStartDate = new Date(result.date);
      const testEndDate = new Date(result.notes || '');
      
      if (filterDateRange.startDate) {
        const startDate = new Date(filterDateRange.startDate);
        matchesDateRange = matchesDateRange && testStartDate >= startDate;
      }
      
      if (filterDateRange.endDate) {
        const endDate = new Date(filterDateRange.endDate);
        matchesDateRange = matchesDateRange && testStartDate <= endDate;
      }

      if (filterDateRange.endTestDate) {
        const endTestDate = new Date(filterDateRange.endTestDate);
        matchesDateRange = matchesDateRange && testEndDate <= endTestDate;
      }
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

  // View test result details
  const viewResultDetails = (result: TestResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
    if (!result.viewed) {
      markAsViewed(result.id);
    }
  };

  // Close the detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDateRange({
      startDate: '',
      endDate: '',
      endTestDate: ''
    });
  };

  return (
    <div className="test-results-consultant-container">
      <div className="test-results-header">
        <h1>Quản Lý Kết Quả Xét Nghiệm</h1>
        <p>Xem và quản lý kết quả xét nghiệm của bệnh nhân</p>
      </div>

      <div className="test-results-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, ID hoặc loại xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-row">
            <div className="filter-group">
              <div className="filter-item">
                <label>Trạng thái:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="normal">Bình thường</option>
                  <option value="abnormal">Bất thường</option>
                  <option value="critical">Nguy hiểm</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Ngày bắt đầu từ:</label>
                <input
                  type="date"
                  value={filterDateRange.startDate}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="filter-item">
                <label>đến:</label>
                <input
                  type="date"
                  value={filterDateRange.endDate}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="filter-item">
                <label>Ngày kết thúc trước:</label>
                <input
                  type="date"
                  value={filterDateRange.endTestDate}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, endTestDate: e.target.value }))}
                />
              </div>

              <div className="filter-item">
                <label>&nbsp;</label>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <FaFilter /> Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="test-results-summary">
        <div className="summary-card">
          <div className="summary-value">{testResults.length}</div>
          <div className="summary-label">Tổng số kết quả</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">
            {testResults.filter((r) => r.status === 'normal').length}
          </div>
          <div className="summary-label normal">Bình thường</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">
            {testResults.filter((r) => r.status === 'abnormal').length}
          </div>
          <div className="summary-label abnormal">Bất thường</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">
            {testResults.filter((r) => r.status === 'critical').length}
          </div>
          <div className="summary-label critical">Nguy hiểm</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">
            {testResults.filter((r) => !r.viewed).length}
          </div>
          <div className="summary-label unviewed">Chưa xem</div>
        </div>
      </div>

      <div className="test-results-table">
        <table>
          <thead>
            <tr>
              <th>Mã xét nghiệm</th>
              <th>Bệnh nhân</th>
              <th>Loại xét nghiệm</th>
              <th>Ngày bắt đầu</th>
              <th>Trạng thái</th>
              <th>Ngày kết thúc</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <tr key={result.id} className={!result.viewed ? 'unread' : ''}>
                  <td>{result.id}</td>
                  <td>
                    <div className="patient-info">
                      <span className="patient-name">{result.patientName}</span>
                      <span className="patient-id">{result.patientId}</span>
                    </div>
                  </td>
                  <td>{result.testType}</td>
                  <td>{new Date(result.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${result.status}`}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </td>
                  <td>{result.notes || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/consultant/test-results/${result.id}`}
                        className="action-btn view"
                        title="Xem chi tiết"
                        onClick={() => markAsViewed(result.id)}
                      >
                        <FaEye />
                      </Link>
                      <button className="action-btn download" title="Download PDF">
                        <FaDownload />
                      </button>
                      <button className="action-btn share" title="Share">
                        <FaShareAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-results">
                  No test results found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Test Result Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="test-result-modal-overlay">
          <div className="test-result-modal">
            <div className="test-result-modal-header">
              <h2>Test Result Details</h2>
              <button className="close-btn" onClick={closeDetailModal}>
                &times;
              </button>
            </div>
            <div className="test-result-modal-content">
              <div className="test-info-header">
                <div>
                  <h3>{selectedResult.testType}</h3>
                  <p>Test ID: {selectedResult.id}</p>
                </div>
                <span className={`status-badge ${selectedResult.status}`}>
                  {selectedResult.status.charAt(0).toUpperCase() + selectedResult.status.slice(1)}
                </span>
              </div>

              <div className="patient-details">
                <h4>Patient Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedResult.patientName}</span>
                  </div>
                  <div className="info-item">
                    <label>ID:</label>
                    <span>{selectedResult.patientId}</span>
                  </div>
                  <div className="info-item">
                    <label>Test Date:</label>
                    <span>{new Date(selectedResult.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="test-results-detail">
                <h4>Test Results</h4>
                <p className="note">
                  This is a simplified view. Click "View Full Report" to see all test details.
                </p>

                <div className="result-actions">
                  <Link to={`/consultant/test-results/${selectedResult.id}`} className="btn primary">
                    Xem Báo Cáo Đầy Đủ
                  </Link>
                  <button className="btn secondary">
                    <FaDownload /> Tải PDF
                  </button>
                  <button className="btn secondary">
                    <FaShareAlt /> Chia Sẻ Với Bệnh Nhân
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultConsultant; 