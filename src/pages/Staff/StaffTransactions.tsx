import React, { useState, useEffect } from 'react';
import { FaSync, FaDownload, FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './StaffTransactions.css';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Define TransactionData interface based on the API response
interface TransactionData {
  responseId: string;
  appointment: {
    appointmentID: number;
    customerID: string;
    customer: {
      name: string;
      address: string;
      phone: string;
      status: boolean;
      dateOfBirth: {
        year: number;
        month: number;
        day: number;
      };
    };
    consultantID: string;
    consultant: {
      name: string;
    };
    appointmentCode: string;
    appointmentDate: string;
    totalAmount: number;
    remainingBalance: number;
    consultationFee: number;
    stIsTestFee: number;
    status: number;
    paymentStatus: number;
  };
  account: {
    userID: string;
    userName: string;
    email: string;
    name: string;
    phone: string;
  };
  tmnCode: string;
  txnRef: string;
  amount: number;
  orderInfo: string;
  responseCode: string;
  message: string;
  bankTranNo: string;
  payDate: string;
  finishDate: string;
  bankCode: string;
  transactionNo: string;
  transactionType: string;
  transactionStatus: string;
  transactionKind: number;
  statusTransaction: number;
}

// Toast notification type
interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to get payment status text
const getPaymentStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ thanh toán';
    case 1: return 'Đã đặt cọc';
    case 2: return 'Đã thanh toán';
    case 3: return 'Đã hoàn tiền';
    case 4: return 'Hoàn tiền một phần';
    default: return 'Không xác định';
  }
};

// Helper function for appointment status text
const getAppointmentStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Đang chờ';
    case 1: return 'Đã xác nhận';
    case 2: return 'Đang thực hiện';
    case 3: return 'Yêu cầu xét nghiệm STIs';
    case 4: return 'Đợi kết quả';
    case 5: return 'Hoàn thành';
    case 6: return 'Đã hủy';
    case 7: return 'Yêu cầu hoàn tiền';
    case 8: return 'Yêu cầu hủy';
    default: return 'Không xác định';
  }
};

// Helper function to get transaction status text
const getTransactionStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Chờ xác nhận';
    case 1: return 'Đã hoàn thành';
    case 2: return 'Đã hủy';
    case 3: return 'Yêu cầu hoàn tiền';
    case 4: return 'Đã hoàn tiền';
    case 5: return 'Yêu cầu hủy';
    default: return 'Không xác định';
  }
};

// Helper function to get transaction type text
const getTransactionKindText = (kind: number): string => {
  switch (kind) {
    case 0: return 'Đặt cọc';
    case 1: return 'Thanh toán';
    case 2: return 'Hoàn tiền';
    default: return 'Không xác định';
  }
};

// Helper function for status color
const getStatusColor = (status: number): string => {
  switch (status) {
    case 1: // Đã hoàn thành
      return '#16a34a'; // Green
    case 2: // Đã hủy
      return '#e53e3e'; // Red
    case 3: // Yêu cầu hoàn tiền
      return '#f59e42'; // Orange
    case 4: // Đã hoàn tiền
      return '#3b82f6'; // Blue
    case 5: // Yêu cầu hủy
      return '#8b5cf6'; // Purple
    case 0: // Chờ xác nhận
      return '#f97316'; // Orange
    default:
      return '#6b7280'; // Gray
  }
};

// Component to display a status badge
const StatusBadge = ({ status, text }: { status: number; text: string }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 600,
        color: 'white',
        backgroundColor: getStatusColor(status),
      }}
    >
      {text}
    </span>
  );
};

// Format currency as VND
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const StaffTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionData | null>(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Fetch transactions data
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7084/api/Transaction/GetAllTransactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        setTransactions(data.data);
        setTotalPages(Math.ceil(data.data.length / transactionsPerPage));
      } else {
        showToast(`Lỗi khi tải dữ liệu: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters and search to transactions
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        transaction.appointment?.customer?.name?.toLowerCase().includes(query) ||
        transaction.account?.name?.toLowerCase().includes(query) ||
        transaction.txnRef?.toLowerCase().includes(query) ||
        transaction.bankTranNo?.toLowerCase().includes(query) ||
        transaction.appointment?.appointmentCode?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const statusNumber = parseInt(filterStatus);
      result = result.filter(transaction => transaction.statusTransaction === statusNumber);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      const typeNumber = parseInt(filterType);
      result = result.filter(transaction => transaction.transactionKind === typeNumber);
    }
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(transaction => {
        if (!transaction.payDate) return false;
        
        const payDate = new Date(transaction.payDate);
        return payDate >= startDate && payDate <= endDate;
      });
    }
    
    setFilteredTransactions(result);
    setTotalPages(Math.ceil(result.length / transactionsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, searchQuery, filterStatus, filterType, dateRange, transactionsPerPage]);

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterType('all');
    setDateRange({ startDate: '', endDate: '' });
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  // Handle view transaction details
  const handleViewDetails = (transaction: TransactionData) => {
    setCurrentTransaction(transaction);
    setIsDetailModalOpen(true);
  };
  
  // Handle status update
  const handleStatusUpdate = (transaction: TransactionData) => {
    setCurrentTransaction(transaction);
    setIsStatusUpdateModalOpen(true);
  };

  // Date range handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, endDate: e.target.value });
  };

  // Handle refresh with visual feedback
  const handleRefreshWithFeedback = () => {
    setIsRefreshing(true);
    showToast('Đang tải lại dữ liệu...', 'info');
    fetchTransactions();
  };

  return (
    <div className="staff-transactions-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-notification ${toast.type}`}>
            <div className="toast-content">
              {toast.type === 'success' ? (
                <FaCheckCircle className="toast-icon" />
              ) : toast.type === 'error' ? (
                <FaTimesCircle className="toast-icon" />
              ) : (
                <FaEye className="toast-icon" />
              )}
              <span>{toast.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="page-header">
        <h1 className="page-title">Quản Lý Giao Dịch</h1>
        <p className="page-subtitle">Theo dõi và quản lý các giao dịch thanh toán và hoàn tiền</p>
      </div>

      {/* Filter Bar - Simple design to match the screenshot */}
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search Input */}
          <div className="relative w-full border border-gray-300 rounded-sm shadow-sm">
            
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, bác sĩ, dịch vụ..."
              className="w-full pl-10 pr-4 py-2 rounded-sm border-none focus:outline-none focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Transaction Status Dropdown */}
            <div className="flex-1 min-w-[200px]">
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white focus:outline-none appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="0">Chờ xác nhận</option>
                <option value="1">Đã hoàn thành</option>
                <option value="2">Đã hủy</option>
                <option value="3">Yêu cầu hoàn tiền</option>
                <option value="4">Đã hoàn tiền</option>
                <option value="5">Yêu cầu hủy</option>
              </select>
            </div>
            
            {/* Transaction Type Dropdown */}
            <div className="flex-1 min-w-[200px]">
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white focus:outline-none appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Loại giao dịch</option>
                <option value="0">Đặt cọc</option>
                <option value="1">Thanh toán</option>
                <option value="2">Hoàn tiền</option>
              </select>
            </div>
          
            {/* Date Range */}
            <div className="flex items-center flex-1 space-x-2 min-w-[350px]">
              <div className="flex-1">
                <input
                  type="date"
                  id="start-date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none"
                  value={dateRange.startDate}
                  onChange={handleStartDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="text-gray-400">đến</div>
              <div className="flex-1">
                <input
                  type="date"
                  id="end-date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none"
                  value={dateRange.endDate}
                  onChange={handleEndDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-sm hover:bg-gray-200 min-w-[120px] text-center"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-card mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="loading-container p-8 text-center">
              <div className="loading-spinner"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu giao dịch...</p>
            </div>
          ) : (
            <table className="transactions-table w-full">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Mã đặt lịch</th>
                  <th>Khách hàng</th>
                  <th>Loại GD</th>
                  <th>Số tiền</th>
                  <th>Ngân hàng</th>
                  <th>Ngày thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction, index) => (
                    <tr key={transaction.responseId || index}>
                      <td className="font-medium">{transaction.txnRef || 'N/A'}</td>
                      <td>{transaction.appointment?.appointmentCode || 'N/A'}</td>
                      <td>
                        <div>{transaction.appointment?.customer?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{transaction.appointment?.customer?.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded-full text-xs font-medium" 
                              style={{ 
                                backgroundColor: 
                                  transaction.transactionKind === 0 ? '#e6f4ea' : 
                                  transaction.transactionKind === 1 ? '#e8f0fe' : 
                                  '#fee2e2', 
                                color: 
                                  transaction.transactionKind === 0 ? '#137333' : 
                                  transaction.transactionKind === 1 ? '#1a73e8' : 
                                  '#b91c1c'
                              }}>
                          {getTransactionKindText(transaction.transactionKind)}
                        </span>
                      </td>
                      <td className="font-medium">
                        {formatCurrency(transaction.amount || 0)}
                      </td>
                      <td>{transaction.bankCode || 'N/A'}</td>
                      <td>{transaction.payDate ? formatDate(transaction.payDate) : 'N/A'}</td>
                      <td>
                        <StatusBadge 
                          status={transaction.statusTransaction} 
                          text={getTransactionStatusText(transaction.statusTransaction)}
                        />
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors flex items-center justify-center"
                            style={{ border: '1px solid #3b82f6', minWidth: '32px', minHeight: '32px' }}
                            onClick={() => handleViewDetails(transaction)}
                            title="Xem chi tiết"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-500">Không tìm thấy giao dịch nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && currentTransactions.length > 0 && (
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
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Show current page and 2 pages before and after
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
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
        )}
      </div>

      {/* Transaction Detail Modal */}
      {isDetailModalOpen && currentTransaction && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-3 overflow-hidden modal-container">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết giao dịch #{currentTransaction.txnRef || 'N/A'}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {/* Transaction overview card */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between">
                <div>
                  <div className="text-sm text-gray-500">Mã giao dịch</div>
                  <div className="text-lg font-bold text-gray-900">{currentTransaction.txnRef || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Số tiền</div>
                  <div className="text-lg font-bold text-indigo-600">{formatCurrency(currentTransaction.amount || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trạng thái</div>
                  <StatusBadge 
                    status={currentTransaction.statusTransaction} 
                    text={getTransactionStatusText(currentTransaction.statusTransaction)}
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ngày thanh toán</div>
                  <div className="text-md font-medium">{currentTransaction.payDate ? formatDate(currentTransaction.payDate) : 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600 border-b pb-2">Thông tin giao dịch</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Loại giao dịch:</div>
                    <div className="col-span-2 text-sm font-medium">
                      {getTransactionKindText(currentTransaction.transactionKind)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Nội dung:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.orderInfo || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Response ID:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.responseId || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Response Code:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.responseCode || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Thông báo:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.message || 'N/A'}</div>
                  </div>
                  
                  <h4 className="font-semibold text-blue-600 border-b pb-2 mt-6">Thông tin ngân hàng</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Ngân hàng:</div>
                    <div className="col-span-2 text-sm font-medium">{currentTransaction.bankCode || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Mã GD ngân hàng:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.bankTranNo || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">TMN Code:</div>
                    <div className="col-span-2 text-sm">{currentTransaction.tmnCode || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Ngày hoàn thành:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.finishDate ? formatDate(currentTransaction.finishDate) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Appointment Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600 border-b pb-2">Thông tin đặt lịch</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Mã đặt lịch:</div>
                    <div className="col-span-2 text-sm font-medium">
                      {currentTransaction.appointment?.appointmentCode || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Appointment ID:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.appointment?.appointmentID || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Trạng thái cuộc hẹn:</div>
                    <div className="col-span-2">
                      <StatusBadge 
                        status={currentTransaction.appointment?.status || 0} 
                        text={getAppointmentStatusText(currentTransaction.appointment?.status || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Trạng thái thanh toán:</div>
                    <div className="col-span-2">
                      <StatusBadge 
                        status={currentTransaction.appointment?.paymentStatus || 0} 
                        text={getPaymentStatusText(currentTransaction.appointment?.paymentStatus || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Ngày hẹn:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.appointment?.appointmentDate 
                        ? formatDate(currentTransaction.appointment.appointmentDate) 
                        : 'N/A'}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-blue-600 border-b pb-2 mt-6">Thông tin khách hàng</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Tên khách hàng:</div>
                    <div className="col-span-2 text-sm font-medium">
                      {currentTransaction.appointment?.customer?.name || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Số điện thoại:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.appointment?.customer?.phone || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Địa chỉ:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.appointment?.customer?.address || 'N/A'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Ngày sinh:</div>
                    <div className="col-span-2 text-sm">
                      {currentTransaction.appointment?.customer?.dateOfBirth ? 
                        `${currentTransaction.appointment.customer.dateOfBirth.day}/${currentTransaction.appointment.customer.dateOfBirth.month}/${currentTransaction.appointment.customer.dateOfBirth.year}` : 
                        'N/A'}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-blue-600 border-b pb-2 mt-6">Chi tiết thanh toán</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Tổng tiền:</div>
                    <div className="col-span-2 text-sm font-medium text-indigo-600">
                      {formatCurrency(currentTransaction.appointment?.totalAmount || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Phí tư vấn:</div>
                    <div className="col-span-2 text-sm">
                      {formatCurrency(currentTransaction.appointment?.consultationFee || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Phí xét nghiệm:</div>
                    <div className="col-span-2 text-sm">
                      {formatCurrency(currentTransaction.appointment?.stIsTestFee || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-gray-500">Số dư còn lại:</div>
                    <div className="col-span-2 text-sm font-medium">
                      {formatCurrency(currentTransaction.appointment?.remainingBalance || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account information (User who processed the transaction) */}
              {currentTransaction.account && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-blue-600 border-b pb-2 mb-4">Thông tin tài khoản xử lý</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-gray-500">User ID:</div>
                      <div className="col-span-2 text-sm">{currentTransaction.account.userID || 'N/A'}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-gray-500">Tên người dùng:</div>
                      <div className="col-span-2 text-sm">{currentTransaction.account.name || 'N/A'}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-gray-500">Username:</div>
                      <div className="col-span-2 text-sm">{currentTransaction.account.userName || 'N/A'}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-gray-500">Email:</div>
                      <div className="col-span-2 text-sm">{currentTransaction.account.email || 'N/A'}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-gray-500">Số điện thoại:</div>
                      <div className="col-span-2 text-sm">{currentTransaction.account.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal (Simplified version with essential information) */}
      {isStatusUpdateModalOpen && currentTransaction && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg w-full max-w-md mx-3 overflow-hidden modal-container">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật trạng thái giao dịch</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsStatusUpdateModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Transaction Summary Card */}
              <div className="mb-4 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Mã giao dịch:</span>
                  <span className="text-sm font-medium">{currentTransaction.txnRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Khách hàng:</span>
                  <span className="text-sm font-medium">{currentTransaction.appointment?.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Số tiền:</span>
                  <span className="text-sm font-medium text-indigo-600">{formatCurrency(currentTransaction.amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Trạng thái hiện tại:</span>
                  <StatusBadge 
                    status={currentTransaction.statusTransaction} 
                    text={getTransactionStatusText(currentTransaction.statusTransaction)}
                  />
                </div>
              </div>
              
              {/* Status Update Options */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cập nhật trạng thái:</h4>
                <div className="space-y-2">
                  {currentTransaction.statusTransaction === 0 && (
                    <>
                      <button 
                        className="w-full py-2 px-3 text-left border border-green-200 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        onClick={() => {
                          // Handle confirming transaction
                          setIsStatusUpdateModalOpen(false);
                          showToast("Trạng thái giao dịch đã được cập nhật", "success");
                        }}
                      >
                        <div className="flex items-center">
                          <FaCheckCircle className="mr-2" />
                          <span>Xác nhận giao dịch</span>
                        </div>
                      </button>
                      
                      <button 
                        className="w-full py-2 px-3 text-left border border-red-200 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        onClick={() => {
                          // Handle cancelling transaction
                          setIsStatusUpdateModalOpen(false);
                          showToast("Giao dịch đã bị hủy", "success");
                        }}
                      >
                        <div className="flex items-center">
                          <FaTimesCircle className="mr-2" />
                          <span>Hủy giao dịch</span>
                        </div>
                      </button>
                    </>
                  )}
                  
                  {currentTransaction.statusTransaction !== 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
                      Không thể cập nhật trạng thái của giao dịch này
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                  onClick={() => setIsStatusUpdateModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTransactions;
