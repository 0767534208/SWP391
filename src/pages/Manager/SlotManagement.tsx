import React, { useState, useEffect } from 'react';
import './SlotManagement.css';

// Types
interface TimeSlot {
  id: number;
  start: string;
  end: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface SlotRequest {
  id: number;
  consultantId: number;
  consultantName: string;
  consultantImage: string;
  specialty: string;
  day: string;
  date: string;
  slots: TimeSlot[];
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SlotManagement = () => {
  // State
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SlotRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [currentRequest, setCurrentRequest] = useState<SlotRequest | null>(null);

  // Constants
  const requestsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockSlotRequests: SlotRequest[] = [
      {
        id: 1,
        consultantId: 1,
        consultantName: 'Dr. John Smith',
        consultantImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        specialty: 'Reproductive Health',
        day: 'monday',
        date: '2023-06-10',
        slots: [
          { id: 1, start: '09:00', end: '10:00', status: 'pending' },
          { id: 2, start: '10:00', end: '11:00', status: 'pending' },
          { id: 3, start: '14:00', end: '15:00', status: 'pending' }
        ],
        requestDate: '2023-06-05',
        status: 'pending'
      },
      {
        id: 2,
        consultantId: 2,
        consultantName: 'Dr. Sarah Johnson',
        consultantImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        specialty: 'HIV/AIDS',
        day: 'tuesday',
        date: '2023-06-11',
        slots: [
          { id: 4, start: '13:00', end: '14:00', status: 'pending' },
          { id: 5, start: '14:00', end: '15:00', status: 'pending' }
        ],
        requestDate: '2023-06-06',
        status: 'pending'
      },
      {
        id: 3,
        consultantId: 3,
        consultantName: 'Dr. Michael Brown',
        consultantImage: 'https://randomuser.me/api/portraits/men/3.jpg',
        specialty: 'STI Treatment',
        day: 'wednesday',
        date: '2023-06-12',
        slots: [
          { id: 6, start: '10:00', end: '11:00', status: 'pending' },
          { id: 7, start: '11:00', end: '12:00', status: 'pending' },
          { id: 8, start: '15:00', end: '16:00', status: 'pending' }
        ],
        requestDate: '2023-06-07',
        status: 'pending'
      },
      {
        id: 4,
        consultantId: 4,
        consultantName: 'Dr. Emily Davis',
        consultantImage: 'https://randomuser.me/api/portraits/women/4.jpg',
        specialty: 'Reproductive Health',
        day: 'thursday',
        date: '2023-06-13',
        slots: [
          { id: 9, start: '09:00', end: '10:00', status: 'pending' },
          { id: 10, start: '16:00', end: '17:00', status: 'pending' }
        ],
        requestDate: '2023-06-08',
        status: 'pending'
      },
      {
        id: 5,
        consultantId: 5,
        consultantName: 'Dr. Robert Wilson',
        consultantImage: 'https://randomuser.me/api/portraits/men/5.jpg',
        specialty: 'HIV/AIDS',
        day: 'friday',
        date: '2023-06-14',
        slots: [
          { id: 11, start: '13:00', end: '14:00', status: 'pending' },
          { id: 12, start: '14:00', end: '15:00', status: 'pending' },
          { id: 13, start: '15:00', end: '16:00', status: 'pending' }
        ],
        requestDate: '2023-06-09',
        status: 'pending'
      }
    ];

    setSlotRequests(mockSlotRequests);
    setFilteredRequests(mockSlotRequests);
  }, []);

  // Filter requests based on status and search query
  useEffect(() => {
    let filtered = slotRequests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.consultantName.toLowerCase().includes(query) ||
        request.specialty.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterStatus, searchQuery, slotRequests]);

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  // Open detail modal
  const openDetailModal = (request: SlotRequest) => {
    setCurrentRequest(request);
    setIsDetailModalOpen(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setCurrentRequest(null);
  };

  // Approve all slots in a request
  const approveAllSlots = (requestId: number) => {
    setSlotRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'approved' as const,
              slots: request.slots.map(slot => ({ ...slot, status: 'approved' as const }))
            }
          : request
      )
    );
    closeDetailModal();
  };

  // Reject all slots in a request
  const rejectAllSlots = (requestId: number) => {
    setSlotRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: 'rejected' as const,
              slots: request.slots.map(slot => ({ ...slot, status: 'rejected' as const }))
            }
          : request
      )
    );
    closeDetailModal();
  };

  // Approve a specific slot
  const approveSlot = (requestId: number, slotId: number) => {
    setSlotRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              slots: request.slots.map(slot => 
                slot.id === slotId 
                  ? { ...slot, status: 'approved' as const }
                  : slot
              ),
              // If all slots are approved, mark the request as approved
              status: request.slots.every(slot => 
                slot.id === slotId ? true : slot.status === 'approved'
              ) ? 'approved' as const : request.status
            }
          : request
      )
    );
  };

  // Reject a specific slot
  const rejectSlot = (requestId: number, slotId: number) => {
    setSlotRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              slots: request.slots.map(slot => 
                slot.id === slotId 
                  ? { ...slot, status: 'rejected' as const }
                  : slot
              ),
              // If all slots are rejected, mark the request as rejected
              status: request.slots.every(slot => 
                slot.id === slotId ? true : slot.status === 'rejected'
              ) ? 'rejected' as const : request.status
            }
          : request
      )
    );
  };

  // Helper function to translate day name to Vietnamese
  const translateDayName = (day: string): string => {
    const translations: { [key: string]: string } = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật'
    };
    return translations[day] || day;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'status-badge status-badge-warning';
      case 'approved':
        return 'status-badge status-badge-success';
      case 'rejected':
        return 'status-badge status-badge-danger';
      default:
        return 'status-badge status-badge-secondary';
    }
  };

  // Helper function to translate status to Vietnamese
  const translateStatus = (status: string): string => {
    const translations: { [key: string]: string } = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    };
    return translations[status] || status;
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="pagination-button"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          className="pagination-button"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    );
  };

  // Render detail modal
  const renderDetailModal = () => {
    if (!isDetailModalOpen || !currentRequest) return null;

    return (
      <div className="modal-overlay">
        <div className="slot-detail-modal">
          <div className="modal-header">
            <h2>Chi Tiết Yêu Cầu Lịch Làm Việc</h2>
            <button className="close-button" onClick={closeDetailModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="consultant-info">
              <img 
                src={currentRequest.consultantImage} 
                alt={currentRequest.consultantName} 
                className="consultant-image"
              />
              <div className="consultant-details">
                <h3>{currentRequest.consultantName}</h3>
                <p className="specialty">{currentRequest.specialty}</p>
                <p className="request-date">
                  Ngày yêu cầu: {formatDate(currentRequest.requestDate)}
                </p>
              </div>
            </div>
            
            <div className="schedule-info">
              <div className="schedule-header">
                <h4>Lịch Làm Việc - {translateDayName(currentRequest.day)} ({formatDate(currentRequest.date)})</h4>
                <div className="schedule-actions">
                  <button 
                    className="approve-all-button"
                    onClick={() => approveAllSlots(currentRequest.id)}
                  >
                    Duyệt Tất Cả
                  </button>
                  <button 
                    className="reject-all-button"
                    onClick={() => rejectAllSlots(currentRequest.id)}
                  >
                    Từ Chối Tất Cả
                  </button>
                </div>
              </div>
              
              <div className="time-slots-list">
                {currentRequest.slots.map(slot => (
                  <div key={slot.id} className={`time-slot-item ${slot.status}`}>
                    <span className="time-range">{slot.start} - {slot.end}</span>
                    <span className={getStatusBadgeClass(slot.status)}>
                      {translateStatus(slot.status)}
                    </span>
                    <div className="slot-actions">
                      {slot.status === 'pending' && (
                        <>
                          <button 
                            className="approve-button"
                            onClick={() => approveSlot(currentRequest.id, slot.id)}
                          >
                            Duyệt
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => rejectSlot(currentRequest.id, slot.id)}
                          >
                            Từ Chối
                          </button>
                        </>
                      )}
                      {slot.status === 'approved' && (
                        <button 
                          className="reject-button"
                          onClick={() => rejectSlot(currentRequest.id, slot.id)}
                        >
                          Hủy Duyệt
                        </button>
                      )}
                      {slot.status === 'rejected' && (
                        <button 
                          className="approve-button"
                          onClick={() => approveSlot(currentRequest.id, slot.id)}
                        >
                          Duyệt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="slot-management-container">
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold mb-1">Quản Lý Lịch Làm Việc Chuyên Gia</h1>
          <p className="text-sm text-gray-500">
            Duyệt các yêu cầu lịch làm việc từ chuyên gia
          </p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="filter-search-container">
        <div className="filter-container">
          <label htmlFor="status-filter">Trạng thái:</label>
          <select 
            id="status-filter" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
        
        <div className="search-container">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên chuyên gia hoặc chuyên môn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Requests table */}
      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Chuyên Gia</th>
              <th>Chuyên Môn</th>
              <th>Ngày</th>
              <th>Số Khung Giờ</th>
              <th>Ngày Yêu Cầu</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map(request => (
              <tr key={request.id}>
                <td>
                  <div className="consultant-info-cell">
                    <img 
                      src={request.consultantImage} 
                      alt={request.consultantName} 
                      className="consultant-image-small"
                    />
                    <span>{request.consultantName}</span>
                  </div>
                </td>
                <td>{request.specialty}</td>
                <td>
                  <div className="date-info">
                    <div>{translateDayName(request.day)}</div>
                    <div className="date-value">{formatDate(request.date)}</div>
                  </div>
                </td>
                <td className="text-center">{request.slots.length}</td>
                <td>{formatDate(request.requestDate)}</td>
                <td>
                  <span className={getStatusBadgeClass(request.status)}>
                    {translateStatus(request.status)}
                  </span>
                </td>
                <td>
                  <div className="request-actions">
                    <button 
                      className="view-details-button"
                      onClick={() => openDetailModal(request)}
                    >
                      Xem Chi Tiết
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button 
                          className="approve-button"
                          onClick={() => approveAllSlots(request.id)}
                        >
                          Duyệt
                        </button>
                        <button 
                          className="reject-button"
                          onClick={() => rejectAllSlots(request.id)}
                        >
                          Từ Chối
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Detail modal */}
      {renderDetailModal()}
    </div>
  );
};

export default SlotManagement; 