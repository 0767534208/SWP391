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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
                      <td>
                        <button
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                          onClick={() => handleViewDetails(transaction)}
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
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
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết giao dịch</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Thông tin giao dịch</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Mã giao dịch:</div>
                  <div className="col-span-2 text-sm font-medium">{currentTransaction.txnRef || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Loại giao dịch:</div>
                  <div className="col-span-2 text-sm font-medium">
                    {getTransactionKindText(currentTransaction.transactionKind)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Số tiền:</div>
                  <div className="col-span-2 text-sm font-medium text-indigo-600">
                    {formatCurrency(currentTransaction.amount || 0)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Nội dung:</div>
                  <div className="col-span-2 text-sm">{currentTransaction.orderInfo || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-gray-500">Trạng thái:</div>
                  <div className="col-span-2">
                    <StatusBadge 
                      status={currentTransaction.statusTransaction} 
                      text={getTransactionStatusText(currentTransaction.statusTransaction)}
                    />
                  </div>
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
                  <div className="text-sm text-gray-500">Ngày thanh toán:</div>
                  <div className="col-span-2 text-sm">
                    {currentTransaction.payDate ? formatDate(currentTransaction.payDate) : 'N/A'}
                  </div>
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
                  <div className="text-sm text-gray-500">Trạng thái:</div>
                  <div className="col-span-2">
                    <StatusBadge 
                      status={currentTransaction.appointment?.status || 0} 
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
    </div>
  );
};

export default StaffTransactions;
