import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

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
    { id: 1, patientName: 'Nguyễn Văn A', patientPhone: '0901234567', testType: 'HIV', date: '10/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Bs. Trần Văn C', notes: 'Kết quả âm tính' },
    { id: 2, patientName: 'Trần Thị B', patientPhone: '0912345678', testType: 'Syphilis', date: '11/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Bs. Lê Thị D', notes: 'Cần điều trị ngay' },
    { id: 3, patientName: 'Lê Văn C', patientPhone: '0923456789', testType: 'Chlamydia', date: '12/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Bs. Phạm Văn F', notes: '' },
    { id: 4, patientName: 'Phạm Thị D', patientPhone: '0934567890', testType: 'Gonorrhea', date: '13/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: 'Đang chờ kết quả từ phòng lab' },
    { id: 5, patientName: 'Hoàng Văn E', patientPhone: '0945678901', testType: 'HIV', date: '14/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Bs. Trần Văn C', notes: '' },
    { id: 6, patientName: 'Ngô Thị F', patientPhone: '0956789012', testType: 'Hepatitis B', date: '15/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Bs. Lê Thị D', notes: 'Đã tư vấn và chuyển điều trị' },
    { id: 7, patientName: 'Đỗ Văn G', patientPhone: '0967890123', testType: 'HIV', date: '16/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: '' },
    { id: 8, patientName: 'Lý Thị H', patientPhone: '0978901234', testType: 'HPV', date: '17/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Bs. Phạm Văn F', notes: 'Cần theo dõi định kỳ' },
    { id: 9, patientName: 'Vũ Văn I', patientPhone: '0989012345', testType: 'Syphilis', date: '18/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Bs. Trần Văn C', notes: '' },
    { id: 10, patientName: 'Mai Thị K', patientPhone: '0990123456', testType: 'HIV', date: '19/06/2023', result: 'negative', reviewed: true, reviewedBy: 'Bs. Lê Thị D', notes: '' },
    { id: 11, patientName: 'Trịnh Văn L', patientPhone: '0901234560', testType: 'Gonorrhea', date: '20/06/2023', result: 'pending', reviewed: false, reviewedBy: '', notes: '' },
    { id: 12, patientName: 'Đinh Thị M', patientPhone: '0912345670', testType: 'Chlamydia', date: '21/06/2023', result: 'positive', reviewed: true, reviewedBy: 'Bs. Phạm Văn F', notes: 'Đã tư vấn và kê đơn' },
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
        label: 'Số lượng xét nghiệm',
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
    labels: ['Âm tính', 'Dương tính', 'Đang chờ'],
    datasets: [
      {
        label: 'Kết quả xét nghiệm',
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
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Xét nghiệm theo tháng',
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
        return 'admin-badge admin-badge-success';
      case 'positive':
        return 'admin-badge admin-badge-danger';
      case 'pending':
        return 'admin-badge admin-badge-warning';
      default:
        return 'admin-badge admin-badge-info';
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
    <div className="admin-dashboard">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">Quản lý kết quả xét nghiệm STI</h1>
        <p className="admin-text-muted admin-text-sm">
          Xem và quản lý các xét nghiệm STI trong hệ thống
        </p>
      </div>

      {/* Stats Summary */}
      <div className="admin-stats-summary mb-5">
        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm.293 7.707a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              <path d="M10 4a1 1 0 00-1 1v6a1 1 0 002 0V5a1 1 0 00-1-1z" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Tổng xét nghiệm</div>
            <div className="admin-stats-item-value">{stats.totalTests}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Hoàn thành</div>
            <div className="admin-stats-item-value">{stats.completedTests}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-danger">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Dương tính</div>
            <div className="admin-stats-item-value">{stats.positiveTests}</div>
          </div>
        </div>

        <div className="admin-stats-item">
          <div className="admin-stats-item-icon admin-icon-bg-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="admin-stats-item-info">
            <div className="admin-stats-item-title">Đang chờ</div>
            <div className="admin-stats-item-value">{stats.pendingTests}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="admin-card lg:col-span-2">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Xét nghiệm theo tháng</h3>
          </div>
          <div className="p-3 admin-chart-container">
            <Bar options={barOptions} data={monthlyTestsData} />
          </div>
        </div>

        <div className="admin-card">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Phân bố kết quả</h3>
          </div>
          <div className="p-3 admin-chart-container">
            <Doughnut options={doughnutOptions} data={resultData} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, người phụ trách..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="positive">Dương tính</option>
              <option value="negative">Âm tính</option>
              <option value="pending">Đang chờ</option>
              <option value="reviewed">Đã xem xét</option>
              <option value="unreviewed">Chưa xem xét</option>
            </select>
            
            <select 
              className="admin-select"
              value={filterTest}
              onChange={(e) => setFilterTest(e.target.value)}
            >
              <option value="all">Tất cả loại xét nghiệm</option>
              <option value="HIV">HIV</option>
              <option value="Syphilis">Giang mai</option>
              <option value="Gonorrhea">Lậu</option>
              <option value="Chlamydia">Chlamydia</option>
              <option value="HPV">HPV</option>
              <option value="Hepatitis B">Viêm gan B</option>
            </select>
          </div>
          
          <div className="text-right hidden md:block">
            <span className="admin-text-sm admin-text-muted">Tổng số: <span className="font-semibold text-gray-800">{filteredResults.length} kết quả</span></span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="admin-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-12">ID</th>
                <th>Bệnh nhân</th>
                <th>Loại xét nghiệm</th>
                <th>Ngày</th>
                <th>Kết quả</th>
                <th>Kiểm duyệt</th>
                <th>Ghi chú</th>
                <th className="w-20">Thao tác</th>
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
                        <div className="admin-text-xs admin-text-muted">{result.patientPhone}</div>
                      </div>
                    </td>
                    <td>{result.testType}</td>
                    <td>{result.date}</td>
                    <td>
                      <span className={getResultBadgeClass(result.result)}>
                        {result.result === 'negative' ? 'Âm tính' : 
                         result.result === 'positive' ? 'Dương tính' : 'Đang chờ'}
                      </span>
                    </td>
                    <td>
                      {result.reviewed ? (
                        <div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="admin-check-icon mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="admin-text-sm">Đã kiểm duyệt</span>
                          </div>
                          <div className="admin-text-xs admin-text-muted">{result.reviewedBy}</div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon-xs text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="admin-text-sm">Chưa kiểm duyệt</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {result.notes || <span className="admin-text-muted admin-text-xs">Không có</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon-sm" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon-sm" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-indigo-500 hover:bg-indigo-50 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon-sm" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 admin-text-muted">
                    Không tìm thấy kết quả xét nghiệm nào phù hợp với điều kiện lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="admin-text-sm admin-text-muted">
            Hiển thị {indexOfFirstResult + 1}-{Math.min(indexOfLastResult, filteredResults.length)} trên {filteredResults.length} kết quả
          </div>
          <div className="admin-pagination">
            <button
              className={`admin-pagination-btn rounded-l-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(num => (num <= 2 || num > totalPages - 2 || Math.abs(num - currentPage) <= 1))
              .map((number, idx, arr) => (
                <React.Fragment key={number}>
                  {idx > 0 && arr[idx - 1] !== number - 1 && (
                    <span className="px-3 py-1 text-gray-400">...</span>
                  )}
                  <button
                    className={`admin-pagination-btn ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}
            <button
              className={`admin-pagination-btn rounded-r-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Test Types Chart */}
      <div className="admin-card mt-4">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold">Phân bố loại xét nghiệm</h3>
        </div>
        <div className="p-3 admin-chart-container">
          <Doughnut options={doughnutOptions} data={testTypeData} />
        </div>
      </div>
    </div>
  );
};

export default TestResults; 