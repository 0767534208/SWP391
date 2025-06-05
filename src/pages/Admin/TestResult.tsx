import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './TestResult.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface TestResultType {
  id: number;
  patientName: string;
  patientPhone: string;
  testType: string;
  date: string;
  result: 'negative' | 'positive' | 'pending';
  reviewed: boolean;
  reviewedBy: string;
  notes: string;
}

const TestResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTest, setFilterTest] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestResultType | null>(null);

  // Mock data
  const [testResults, setTestResults] = useState<TestResultType[]>([
    { id: 1, patientName: 'John Smith', patientPhone: '0901234567', testType: 'HIV', date: '10/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Dr. Robert Brown', notes: 'Negative result' },
    { id: 2, patientName: 'Sarah Johnson', patientPhone: '0912345678', testType: 'Syphilis', date: '11/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Dr. Emily Davis', notes: 'Immediate treatment required' },
    { id: 3, patientName: 'Michael Lee', patientPhone: '0923456789', testType: 'Chlamydia', date: '12/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Dr. James Wilson', notes: '' },
    { id: 4, patientName: 'Jessica Taylor', patientPhone: '0934567890', testType: 'Gonorrhea', date: '13/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: 'Waiting for lab results' },
    { id: 5, patientName: 'David Martinez', patientPhone: '0945678901', testType: 'HIV', date: '14/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Dr. Robert Brown', notes: '' },
    { id: 6, patientName: 'Jennifer Garcia', patientPhone: '0956789012', testType: 'Hepatitis B', date: '15/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Dr. Emily Davis', notes: 'Counseled and referred for treatment' },
    { id: 7, patientName: 'Thomas Rodriguez', patientPhone: '0967890123', testType: 'HIV', date: '16/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: '' },
    { id: 8, patientName: 'Lisa Anderson', patientPhone: '0978901234', testType: 'HPV', date: '17/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Dr. James Wilson', notes: 'Regular monitoring required' },
    { id: 9, patientName: 'William Thompson', patientPhone: '0989012345', testType: 'Syphilis', date: '18/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Dr. Robert Brown', notes: '' },
    { id: 10, patientName: 'Mary White', patientPhone: '0990123456', testType: 'HIV', date: '19/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Dr. Emily Davis', notes: '' },
    { id: 11, patientName: 'Daniel Harris', patientPhone: '0901234560', testType: 'Gonorrhea', date: '20/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: '' },
    { id: 12, patientName: 'Patricia Clark', patientPhone: '0912345670', testType: 'Chlamydia', date: '21/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Dr. James Wilson', notes: 'Counseled and prescribed treatment' },
  ]);

  // Form states
  const [reviewData, setReviewData] = useState({
    result: 'negative' as 'negative' | 'positive' | 'pending',
    reviewer: '',
    notes: '',
  });

  const [editData, setEditData] = useState({
    patientName: '',
    patientPhone: '',
    testType: '',
    date: '',
    result: 'negative' as 'negative' | 'positive' | 'pending',
    notes: '',
  });

  // Statistics data
  const stats = {
    totalTests: testResults.length,
    completedTests: testResults.filter(test => test.result !== 'pending').length,
    positiveTests: testResults.filter(test => test.result === 'positive').length,
    pendingTests: testResults.filter(test => test.result === 'pending').length,
    reviewedTests: testResults.filter(test => test.reviewed).length
  };

  // Chart data
  const testTypeData = {
    labels: ['HIV', 'Syphilis', 'Chlamydia', 'Gonorrhea', 'HPV', 'Hepatitis B'],
    datasets: [
      {
        label: 'Number of tests',
        data: [4, 2, 2, 2, 1, 1],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const resultData = {
    labels: ['Negative', 'Positive', 'Pending'],
    datasets: [
      {
        label: 'Test Results',
        data: [
          testResults.filter(test => test.result === 'negative').length,
          testResults.filter(test => test.result === 'positive').length,
          testResults.filter(test => test.result === 'pending').length,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyTestsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Tests',
        data: [8, 12, 15, 10, 8, 12, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  // Filter test results
  const filteredResults = testResults.filter(test => {
    const matchesSearch = 
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientPhone.includes(searchQuery) ||
      test.reviewedBy.toLowerCase().includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'positive' && test.result === 'positive') ||
      (filterStatus === 'negative' && test.result === 'negative') ||
      (filterStatus === 'pending' && test.result === 'pending') ||
      (filterStatus === 'reviewed' && test.reviewed) ||
      (filterStatus === 'unreviewed' && !test.reviewed);
    
    const matchesTest = filterTest === 'all' || test.testType === filterTest;
    
    return matchesSearch && matchesStatus && matchesTest;
  });

  // Pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get badge class based on result
  const getResultBadgeClass = (result: string) => {
    switch (result) {
      case 'negative':
        return 'status-badge status-badge-success';
      case 'positive':
        return 'status-badge status-badge-danger';
      case 'pending':
        return 'status-badge status-badge-warning';
      default:
        return 'status-badge status-badge-info';
    }
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Handle actions
  const handleViewTest = (test: TestResultType) => {
    setCurrentTest(test);
    setShowViewModal(true);
  };

  const handleReviewTest = (test: TestResultType) => {
    setCurrentTest(test);
    setReviewData({
      result: test.result,
      reviewer: '',
      notes: test.notes
    });
    setShowReviewModal(true);
  };

  const handleEditTest = (test: TestResultType) => {
    setCurrentTest(test);
    setEditData({
      patientName: test.patientName,
      patientPhone: test.patientPhone,
      testType: test.testType,
      date: test.date,
      result: test.result,
      notes: test.notes
    });
    setShowEditModal(true);
  };

  const handleDeleteTest = (test: TestResultType) => {
    setCurrentTest(test);
    setShowDeleteModal(true);
  };

  // Submit functions
  const submitReview = () => {
    if (!currentTest || !reviewData.reviewer) return;

    const updatedTests = testResults.map(test => {
      if (test.id === currentTest.id) {
        return {
          ...test,
          result: reviewData.result,
          reviewed: true,
          reviewedBy: reviewData.reviewer,
          notes: reviewData.notes
        };
      }
      return test;
    });

    setTestResults(updatedTests);
    setShowReviewModal(false);
  };

  const submitEdit = () => {
    if (!currentTest) return;

    const updatedTests = testResults.map(test => {
      if (test.id === currentTest.id) {
        return {
          ...test,
          patientName: editData.patientName,
          patientPhone: editData.patientPhone,
          testType: editData.testType,
          date: editData.date,
          result: editData.result,
          notes: editData.notes
        };
      }
      return test;
    });

    setTestResults(updatedTests);
    setShowEditModal(false);
  };

  const confirmDelete = () => {
    if (!currentTest) return;
    const updatedTests = testResults.filter(test => test.id !== currentTest.id);
    setTestResults(updatedTests);
    setShowDeleteModal(false);
  };

  return (
    <div className="test-results-container">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Quản Lý Kết Quả Xét Nghiệm STI</h1>
        <p className="text-sm text-gray-500">
          Xem và quản lý các kết quả xét nghiệm STI trong hệ thống
        </p>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid mb-8">
        <div className="stats-item">
          <div className="stats-item-icon icon-bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm.293 7.707a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              <path d="M10 4a1 1 0 00-1 1v6a1 1 0 002 0V5a1 1 0 00-1-1z" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Tổng Số Xét Nghiệm</div>
            <div className="stats-item-value">{stats.totalTests}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Đã Hoàn Thành</div>
            <div className="stats-item-value">{stats.completedTests}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-danger">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Kết Quả Dương Tính</div>
            <div className="stats-item-value">{stats.positiveTests}</div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon icon-bg-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stats-item-info">
            <div className="stats-item-title">Đang Chờ</div>
            <div className="stats-item-value">{stats.pendingTests}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="test-results-card">
        <div className="test-results-card-title">Tìm Kiếm & Bộ Lọc</div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số điện thoại, người xem xét..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-3">
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="positive">Dương Tính</option>
                <option value="negative">Âm Tính</option>
                <option value="pending">Đang Chờ</option>
                <option value="reviewed">Đã Xem Xét</option>
                <option value="unreviewed">Chưa Xem Xét</option>
              </select>
              
              <select 
                className="filter-select"
                value={filterTest}
                onChange={(e) => setFilterTest(e.target.value)}
              >
                <option value="all">Tất Cả Loại Xét Nghiệm</option>
                <option value="HIV">HIV</option>
                <option value="Syphilis">Giang Mai</option>
                <option value="Gonorrhea">Lậu</option>
                <option value="Chlamydia">Chlamydia</option>
                <option value="HPV">HPV</option>
                <option value="Hepatitis B">Viêm Gan B</option>
              </select>
            </div>
            
            <div className="text-right hidden md:block">
              <span className="text-sm text-gray-500">Tổng cộng: <span className="font-semibold text-gray-800">{filteredResults.length} kết quả</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="appointments-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="test-results-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Bệnh Nhân</th>
                <th>Loại Xét Nghiệm</th>
                <th>Ngày</th>
                <th>Kết Quả</th>
                <th>Người Xem Xét</th>
                <th className="w-20">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.length > 0 ? (
                currentResults.map(result => (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>
                      <div>{result.patientName}</div>
                      <div className="text-xs text-gray-500">{result.patientPhone}</div>
                    </td>
                    <td>{result.testType}</td>
                    <td>{result.date}</td>
                    <td>
                      <span className={getResultBadgeClass(result.result)}>
                        {result.result === 'negative' ? 'Âm Tính' : 
                         result.result === 'positive' ? 'Dương Tính' : 'Đang Chờ'}
                      </span>
                    </td>
                    <td>{result.reviewed ? result.reviewedBy : 'Chưa xem xét'}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleViewTest(result)}
                          className="action-button action-button-view"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {!result.reviewed && (
                          <button 
                            onClick={() => handleReviewTest(result)}
                            className="action-button action-button-review"
                            title="Đánh giá"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        )}

                        <button 
                          onClick={() => handleEditTest(result)}
                          className="action-button action-button-edit"
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteTest(result)}
                          className="action-button action-button-delete"
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">Không tìm thấy kết quả xét nghiệm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mb-8">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstResult + 1}-{Math.min(indexOfLastResult, filteredResults.length)} of {filteredResults.length} results
            </div>
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="pagination-button"
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                className="pagination-button"
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="pagination-button"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="test-results-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Monthly Tests</h3>
          </div>
          <div className="chart-container">
            <Bar options={barOptions} data={monthlyTestsData} />
          </div>
        </div>

        <div className="test-results-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Results Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut options={doughnutOptions} data={resultData} />
          </div>
        </div>
      </div>

      {/* Test Types Chart */}
      <div className="test-results-card mb-8">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Test Types Distribution</h3>
        </div>
        <div className="chart-container">
          <Doughnut options={doughnutOptions} data={testTypeData} />
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && (
        <div className="modal" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Kết Quả Xét Nghiệm</h2>
              <span className="close" onClick={() => setShowViewModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="test-details">
                <div className="detail-group">
                  <div className="detail-label">Bệnh Nhân:</div>
                  <div className="detail-value">{currentTest?.patientName}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Loại Xét Nghiệm:</div>
                  <div className="detail-value">{currentTest?.testType}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Ngày:</div>
                  <div className="detail-value">{currentTest?.date}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Kết Quả:</div>
                  <div className="detail-value">
                    <span className={getResultBadgeClass(currentTest?.result || '')}>
                      {currentTest?.result === 'negative' ? 'Âm Tính' : 
                       currentTest?.result === 'positive' ? 'Dương Tính' : 'Đang Chờ'}
                    </span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Trạng Thái Xem Xét:</div>
                  <div className="detail-value">
                    {currentTest?.reviewed ? 'Đã xem xét' : 'Chưa xem xét'}
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Người Xem Xét:</div>
                  <div className="detail-value">{currentTest?.reviewedBy || 'Chưa có'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Ghi Chú:</div>
                  <div className="detail-value">{currentTest?.notes || 'Không có'}</div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đánh Giá Kết Quả Xét Nghiệm</h2>
              <span className="close" onClick={() => setShowReviewModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="patient-info">
                <p><strong>Bệnh Nhân:</strong> {currentTest?.patientName}</p>
                <p><strong>Loại Xét Nghiệm:</strong> {currentTest?.testType}</p>
                <p><strong>Ngày:</strong> {currentTest?.date}</p>
              </div>
              
              <form>
                <div className="form-group">
                  <label>Kết Quả:</label>
                  <select 
                    value={reviewData.result}
                    onChange={(e) => setReviewData({ ...reviewData, result: e.target.value as 'negative' | 'positive' | 'pending' })}
                  >
                    <option value="negative">Âm Tính</option>
                    <option value="positive">Dương Tính</option>
                    <option value="pending">Đang Chờ</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Người Xem Xét:</label>
                  <input
                    type="text"
                    placeholder="Nhập tên người xem xét"
                    value={reviewData.reviewer}
                    onChange={(e) => setReviewData({ ...reviewData, reviewer: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Ghi Chú:</label>
                  <textarea
                    placeholder="Nhập ghi chú"
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowReviewModal(false)}>Hủy</button>
              <button className="save-button" onClick={submitReview}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh Sửa Kết Quả Xét Nghiệm</h2>
              <span className="close" onClick={() => setShowEditModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Tên Bệnh Nhân:</label>
                  <input
                    type="text"
                    placeholder="Nhập tên bệnh nhân"
                    value={editData.patientName}
                    onChange={(e) => setEditData({ ...editData, patientName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Số Điện Thoại:</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={editData.patientPhone}
                    onChange={(e) => setEditData({ ...editData, patientPhone: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Loại Xét Nghiệm:</label>
                  <select
                    value={editData.testType}
                    onChange={(e) => setEditData({ ...editData, testType: e.target.value })}
                  >
                    <option value="HIV">HIV</option>
                    <option value="Syphilis">Giang Mai</option>
                    <option value="Gonorrhea">Lậu</option>
                    <option value="Chlamydia">Chlamydia</option>
                    <option value="HPV">HPV</option>
                    <option value="Hepatitis B">Viêm Gan B</option>
                    <option value="STI Panel">Bộ Xét Nghiệm STI</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Ngày:</label>
                  <input
                    type="text"
                    placeholder="Nhập ngày (DD/MM/YYYY)"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Kết Quả:</label>
                  <select
                    value={editData.result}
                    onChange={(e) => setEditData({ ...editData, result: e.target.value as 'negative' | 'positive' | 'pending' })}
                  >
                    <option value="negative">Âm Tính</option>
                    <option value="positive">Dương Tính</option>
                    <option value="pending">Đang Chờ</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Ghi Chú:</label>
                  <textarea
                    placeholder="Nhập ghi chú"
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className="save-button" onClick={submitEdit}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xóa Kết Quả Xét Nghiệm</h2>
              <span className="close" onClick={() => setShowDeleteModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa kết quả xét nghiệm của <strong>{currentTest?.patientName}</strong>?</p>
              <p>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="delete-button" onClick={confirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults; 