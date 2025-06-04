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

const TestResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTest, setFilterTest] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Mock data
  const testResults = [
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
  ];

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

      {/* Results Table */}
      <div className="test-results-card">
        <div className="test-results-card-title">Bảng Kết Quả Xét Nghiệm</div>
        <div className="overflow-x-auto">
          <table className="test-results-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Bệnh Nhân</th>
                <th>Loại Xét Nghiệm</th>
                <th>Ngày</th>
                <th>Kết Quả</th>
                <th>Xem Xét</th>
                <th>Ghi Chú</th>
                <th className="w-20">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.length > 0 ? (
                currentResults.map(result => (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>
                      <div>
                        <div className="font-medium">{result.patientName}</div>
                        <div className="text-xs text-gray-500">{result.patientPhone}</div>
                      </div>
                    </td>
                    <td>{result.testType}</td>
                    <td>{result.date}</td>
                    <td>
                      <span className={getResultBadgeClass(result.result)}>
                        {result.result === 'negative' ? 'Âm Tính' : 
                         result.result === 'positive' ? 'Dương Tính' : 'Đang Chờ'}
                      </span>
                    </td>
                    <td>
                      {result.reviewed ? (
                        <div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Đã Xem Xét</span>
                          </div>
                          <div className="text-xs text-gray-500">{result.reviewedBy}</div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">Chờ Xem Xét</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {result.notes || <span className="text-gray-500 text-xs">Không có</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="action-button action-button-view"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span>Xem</span>
                        </button>
                        <button 
                          className="action-button action-button-edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Sửa</span>
                        </button>
                        <button 
                          className="action-button action-button-delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No test results found matching your filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default TestResults; 