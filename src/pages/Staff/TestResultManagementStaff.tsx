import React, { useState, useEffect } from 'react';
import './TestResultManagementStaff.css';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaEye, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import type { LabTestData } from '../../utils/api';

// Types
interface TestResult {
  labTestID?: number;
  id?: number | string;
  customerID?: string;
  customerName?: string;
  patientId?: string;
  patientName?: string;
  staffName?: string;
  testName?: string;
  testType?: string;
  result?: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate?: string;
  resultDate?: string | null;
  staffID?: string;
  treatmentID?: number | null;
  status?: 'completed' | 'pending' | 'cancelled';
  notes?: string;
}

const TestResultManagementStaff: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch test results
  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await testResultService.getStaffCreatedResults({
        page: 1,
        limit: 100,
        pageNumber: 1,
        pageSize: 100,
        searchTerm: searchQuery
      });
      
      if (response.data) {
        setTestResults(response.data as unknown as TestResult[]);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error("Error fetching test results:", err);
      setError("Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.");
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTestResults();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchTestResults();
  };

  // Filter test results
  const filteredTestResults = testResults.filter(test => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (test.customerName?.toLowerCase().includes(searchLower)) ||
      (test.patientName?.toLowerCase().includes(searchLower)) ||
      (test.staffName?.toLowerCase().includes(searchLower)) ||
      (test.testName?.toLowerCase().includes(searchLower)) ||
      (test.testType?.toLowerCase().includes(searchLower)) ||
      (test.result?.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getPatientName = (test: TestResult) => {
    return test.customerName || test.patientName || `Bệnh nhân ${test.customerID || 'N/A'}`;
  };

  const getStaffName = (test: TestResult) => {
    return test.staffName || `Nhân viên ${test.staffID || 'N/A'}`;
  };

  // Xóa kết quả xét nghiệm
  const handleDelete = async (testId: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kết quả xét nghiệm này?')) return;
    setLoading(true);
    setError(null);
    try {
      const idNum = typeof testId === 'string' ? parseInt(testId, 10) : testId;
      if (isNaN(idNum)) throw new Error('ID không hợp lệ');
      await testResultService.deleteTestResult(idNum);
      await fetchTestResults();
    } catch {
      setError('Không thể xóa kết quả xét nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const handleViewDetails = async (testId: number | string) => {
    setModalLoading(true);
    try {
      const idNum = typeof testId === 'string' ? parseInt(testId, 10) : testId;
      if (isNaN(idNum)) throw new Error('ID không hợp lệ');
      const response = await testResultService.getTestResult(idNum);
      if (response && response.data) {
        // Map về TestResult nếu cần
        const result = response.data as any;
        const mappedResult: TestResult = {
          labTestID: result.labTestID,
          id: result.id || result.labTestID,
          customerID: result.customerID || undefined,
          customerName: result.customerName,
          patientId: result.patientId,
          patientName: result.patientName,
          staffName: result.staffName,
          testName: result.testName,
          testType: result.testType,
          result: result.result,
          referenceRange: result.referenceRange,
          unit: result.unit,
          isPositive: result.isPositive,
          testDate: result.testDate,
          resultDate: result.resultDate,
          staffID: result.staffID,
          treatmentID: result.treatmentID,
          status: result.status,
          notes: result.notes
        };
        setSelectedTest(mappedResult);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching test details:', err);
      setError('Không thể tải thông tin chi tiết');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTest(null);
  };

  return (
    <div className="test-results-staff">
      {/* Header */}
      <div className="results-header">
        <div>
          <h1>Quản lý kết quả xét nghiệm</h1>
          <p>Quản lý và cập nhật kết quả xét nghiệm của bệnh nhân</p>
        </div>
        <div className="header-actions">
          <Link to="/staff/test-results/new" className="create-result-btn">
            <FaPlus /> Thêm kết quả xét nghiệm mới
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="results-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, nhân viên, loại xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="clear-search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>❌ {error}</p>
            <button onClick={fetchTestResults} className="retry-btn">
              Thử lại
            </button>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bệnh nhân</th>
                <th>Nhân viên xét nghiệm</th>
                <th>Loại xét nghiệm</th>
                <th>Ngày xét nghiệm</th>
                <th>Kết quả</th>
                <th>Phạm vi tham chiếu</th>
                <th>Kết luận</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestResults.length > 0 ? (
                filteredTestResults.map((test) => (
                  <tr key={test.labTestID || test.id}>
                    <td>{test.labTestID || test.id}</td>
                    <td>{getPatientName(test)}</td>
                    <td>{getStaffName(test)}</td>
                    <td>{test.testName || test.testType || 'N/A'}</td>
                    <td>{formatDate(test.testDate || test.resultDate)}</td>
                    <td>{test.result || 'N/A'}</td>
                    <td>{test.referenceRange || 'N/A'}</td>
                    <td>
                      {test.isPositive !== undefined ? (
                        <span style={{ color: test.isPositive ? 'red' : 'green', fontWeight: 'bold' }}>
                          {test.isPositive ? 'Dương tính' : 'Âm tính'}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetails(test.labTestID || test.id || '')}
                          className="action-btn view-btn"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <Link
                          to={`/staff/test-results/edit/${test.labTestID || test.id}`}
                          className="action-btn edit-btn"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(test.labTestID || test.id || '')}
                          className="action-btn delete-btn"
                          title="Xóa"
                          style={{ color: 'red' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="no-data">
                    {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có kết quả xét nghiệm nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedTest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết kết quả xét nghiệm</h3>
              <button 
                onClick={closeModal}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>ID:</label>
                  <span>{selectedTest.labTestID || selectedTest.id}</span>
                </div>
                <div className="modal-info-item">
                  <label>Bệnh nhân:</label>
                  <span>{getPatientName(selectedTest)}</span>
                </div>
                <div className="modal-info-item">
                  <label>Nhân viên xét nghiệm:</label>
                  <span>{getStaffName(selectedTest)}</span>
                </div>
                <div className="modal-info-item">
                  <label>Loại xét nghiệm:</label>
                  <span>{selectedTest.testName || selectedTest.testType || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Ngày xét nghiệm:</label>
                  <span>{formatDate(selectedTest.testDate)}</span>
                </div>
                <div className="modal-info-item">
                  <label>Kết quả:</label>
                  <span>{selectedTest.result || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Phạm vi tham chiếu:</label>
                  <span>{selectedTest.referenceRange || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Kết luận:</label>
                  {selectedTest.isPositive !== undefined ? (
                    <span style={{ color: selectedTest.isPositive ? 'red' : 'green', fontWeight: 'bold' }}>
                      {selectedTest.isPositive ? 'Dương tính' : 'Âm tính'}
                    </span>
                  ) : 'N/A'}
                </div>
                {selectedTest.notes && (
                  <div className="modal-info-item full-width">
                    <label>Ghi chú:</label>
                    <span>{selectedTest.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultManagementStaff;
