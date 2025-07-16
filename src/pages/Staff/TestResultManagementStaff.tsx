import React, { useState, useEffect } from 'react';
import './TestResultManagementStaff.css';
import { Link } from 'react-router-dom';
import { FaSearch, FaSync } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import type { LabTestData } from '../../utils/api';

// Types - Sử dụng LabTestData từ swagger thay vì tự định nghĩa
type TestResult = LabTestData;

const TestResultManagementStaff: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const resultsPerPage = 10;

  // Fetch test results
  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await testResultService.getStaffCreatedResults({
        page: currentPage,
        limit: resultsPerPage,
        pageNumber: currentPage,
        pageSize: resultsPerPage,
        searchTerm: searchQuery
      });
      
      if (response.data) {
        // Dữ liệu đã đúng định dạng LabTestData từ swagger
        setTestResults(response.data);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error("Error fetching test results:", err);
      setError("Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.");
      setTestResults([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTestResults();
  }, [currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTestResults();
  };

  // Filter test results - only show completed tests
  const filteredTestResults = testResults.filter(test => test !== null);

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTestResults();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getPatientName = (test: TestResult) => {
    // Sử dụng customer.name từ API nếu có, ngược lại dùng customerID
    return test.customer?.name || 
           `BN-${test.customerID || 'Unknown'}`;
  };

  return (
    <div className="test-result-management-staff">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Kết Quả Xét Nghiệm</h1>
        <p className="page-subtitle">Quản lý và cập nhật kết quả xét nghiệm của bệnh nhân</p>
      </div>

      {/* Search Section with Refresh Button */}
      <div className="search-filter-container">
        <form className="search-box" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, loại xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <button 
          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <FaSync className="refresh-icon" />
        </button>
      </div>

      {/* Test Results Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu kết quả xét nghiệm...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">Thử lại</button>
          </div>
        ) : (
          <table className="test-results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã điều trị</th>
                <th>Bệnh nhân</th>
                <th>Loại xét nghiệm</th>
                <th>Ngày xét nghiệm</th>
                <th>Kết quả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestResults.length > 0 ? (
                filteredTestResults.map((test) => (
                  <tr key={test.labTestID || test.id}>
                    <td>{test.labTestID || test.id}</td>
                    <td>{test.treatmentID ? `APT-${test.treatmentID}` : 'N/A'}</td>
                    <td>
                      <div className="patient-info">
                        <span className="patient-name">{getPatientName(test)}</span>
                        <span className="patient-id">{test.customerID}</span>
                      </div>
                    </td>
                    <td>{test.testName || 'N/A'}</td>
                    <td>{formatDate(test.testDate)}</td>
                    <td>
                      {test.isPositive !== undefined ? (
                        <span className={`result-badge ${test.isPositive ? 'positive' : 'negative'}`}>
                          {test.isPositive ? 'Dương tính' : 'Âm tính'}
                        </span>
                      ) : (
                        test.result || 'Chưa có'
                      )}
                    </td>
                    <td className="actions-cell">
                      <Link to={`/staff/test-results/${test.labTestID}`} className="action-button action-button-view" title="Xem kết quả">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link to={`/staff/test-results/edit/${test.labTestID}`} className="action-button action-button-edit" title="Chỉnh sửa kết quả">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-results">Không tìm thấy kết quả xét nghiệm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Test Result Button */}
      <div className="action-buttons">
        <Link to="/staff/test-results/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm kết quả xét nghiệm mới
        </Link>
      </div>

      {/* Pagination */}
      {!loading && filteredTestResults.length > 0 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            &laquo; Trước
          </button>
          
          <span className="pagination-info">
            Trang {currentPage}
          </span>
          
          <button 
            className="pagination-btn" 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default TestResultManagementStaff; 