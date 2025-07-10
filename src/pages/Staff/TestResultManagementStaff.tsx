import React, { useState, useEffect } from 'react';
import './TestResultManagementStaff.css';
import { Link } from 'react-router-dom';
import { FaSearch, FaSync } from 'react-icons/fa';

// Types
interface TestResultDetail {
  testName: string;
  result: string;
  normalRange?: string;
  unit?: string;
  isNormal: boolean;
}

interface TestResult {
  id: number;
  appointmentId: number;
  patientId: string;
  patientName: string;
  testType: string;
  testDate: string;
  resultDate: string | null;
  status: 'completed' | 'pending' | 'cancelled';
  results: TestResultDetail[];
  notes: string;
}

const TestResultManagementStaff: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const resultsPerPage = 10;

  // Mock data for test results - in a real app, this would come from an API
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 1,
      appointmentId: 101,
      patientId: 'P-1001',
      patientName: 'Nguyễn Văn A',
      testType: 'Xét nghiệm STI toàn diện',
      testDate: '2023-06-15',
      resultDate: '2023-06-18',
      status: 'completed',
      results: [
        { testName: 'Kháng thể HIV', result: 'Âm tính', isNormal: true },
        { testName: 'Kháng nguyên bề mặt viêm gan B', result: 'Âm tính', isNormal: true },
        { testName: 'Syphilis RPR', result: 'Không phản ứng', isNormal: true },
        { testName: 'Gonorrhea PCR', result: 'Âm tính', isNormal: true },
        { testName: 'Chlamydia PCR', result: 'Âm tính', isNormal: true }
      ],
      notes: 'Tất cả các xét nghiệm đều bình thường. Khuyến nghị tái khám sau 6 tháng.'
    },
    {
      id: 2,
      appointmentId: 102,
      patientId: 'P-1042',
      patientName: 'Trần Thị B',
      testType: 'Xét nghiệm HIV',
      testDate: '2023-06-18',
      resultDate: '2023-06-20',
      status: 'completed',
      results: [
        { testName: 'Kháng thể/Kháng nguyên HIV', result: 'Âm tính', isNormal: true },
        { testName: 'Số lượng CD4', result: '850', unit: 'tế bào/mm³', normalRange: '500-1500', isNormal: true }
      ],
      notes: 'Không phát hiện vấn đề. Bệnh nhân được tư vấn về các biện pháp phòng ngừa.'
    },
    {
      id: 3,
      appointmentId: 103,
      patientId: 'P-1089',
      patientName: 'Lê Văn C',
      testType: 'Xét nghiệm viêm gan',
      testDate: '2023-06-20',
      resultDate: null,
      status: 'pending',
      results: [],
      notes: 'Mẫu đã được thu thập và gửi đến phòng xét nghiệm.'
    },
    {
      id: 4,
      appointmentId: 104,
      patientId: 'P-1112',
      patientName: 'Phạm Thị D',
      testType: 'Xét nghiệm STI toàn diện',
      testDate: '2023-06-21',
      resultDate: null,
      status: 'pending',
      results: [],
      notes: 'Yêu cầu xử lý nhanh.'
    },
    {
      id: 5,
      appointmentId: 105,
      patientId: 'P-1156',
      patientName: 'Hoàng Văn E',
      testType: 'Xét nghiệm Giang mai',
      testDate: '2023-06-19',
      resultDate: '2023-06-22',
      status: 'completed',
      results: [
        { testName: 'Syphilis RPR', result: 'Có phản ứng', isNormal: false },
        { testName: 'Xác nhận Syphilis (TPPA)', result: 'Dương tính', isNormal: false }
      ],
      notes: 'Kết quả dương tính. Đã liên hệ bệnh nhân để tư vấn điều trị.'
    },
    {
      id: 6,
      appointmentId: 106,
      patientId: 'P-1178',
      patientName: 'Vũ Thị F',
      testType: 'Xét nghiệm STI toàn diện',
      testDate: '2023-06-25',
      resultDate: '2023-06-28',
      status: 'completed',
      results: [
        { testName: 'Kháng thể HIV', result: 'Âm tính', isNormal: true },
        { testName: 'Kháng nguyên bề mặt viêm gan B', result: 'Âm tính', isNormal: true }
      ],
      notes: 'Kết quả bình thường.'
    },
    {
      id: 7,
      appointmentId: 107,
      patientId: 'P-1190',
      patientName: 'Đặng Văn G',
      testType: 'Xét nghiệm HIV',
      testDate: '2023-06-26',
      resultDate: '2023-06-29',
      status: 'completed',
      results: [
        { testName: 'Kháng thể/Kháng nguyên HIV', result: 'Âm tính', isNormal: true }
      ],
      notes: 'Không phát hiện vấn đề.'
    }
  ]);

  // Filter test results - only show completed tests and apply search query
  const filteredTestResults = testResults.filter(test => {
    const matchesSearch = 
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.appointmentId.toString().includes(searchQuery);
    
    // Only include completed tests
    return test.status === 'completed' && matchesSearch;
  });

  // Pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredTestResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredTestResults.length / resultsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call to refresh data
    setTimeout(() => {
      // In a real app, you would fetch fresh data from the server here
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="test-result-management-staff">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Kết Quả Xét Nghiệm</h1>
        <p className="page-subtitle">Quản lý và cập nhật kết quả xét nghiệm của bệnh nhân</p>
      </div>

      {/* Search Section with Refresh Button */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, ID, mã cuộc hẹn hoặc loại xét nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
        <table className="test-results-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã cuộc hẹn</th>
              <th>Bệnh nhân</th>
              <th>Loại xét nghiệm</th>
              <th>Ngày xét nghiệm</th>
              <th>Ngày có kết quả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length > 0 ? (
              currentResults.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>APT-{test.appointmentId}</td>
                  <td>
                    <div className="patient-info">
                      <span className="patient-name">{test.patientName}</span>
                      <span className="patient-id">{test.patientId}</span>
                    </div>
                  </td>
                  <td>{test.testType}</td>
                  <td>{test.testDate}</td>
                  <td>{test.resultDate || 'Chưa có'}</td>
                  <td className="actions-cell">
                    <Link to={`/staff/test-results/${test.id}`} className="action-button action-button-view" title="Xem kết quả">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link to={`/staff/test-results/edit/${test.id}`} className="action-button action-button-edit" title="Chỉnh sửa kết quả">
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &laquo; Trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default TestResultManagementStaff; 