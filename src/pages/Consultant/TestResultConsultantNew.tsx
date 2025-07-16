import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TestResultConsultant.css';
import { treatmentOutcomeService } from '../../services';
import { toast } from 'react-hot-toast';
import type { TreatmentOutcome, GetAllAppointment } from '../../services/treatmentOutcomeService';

interface TreatmentOutcomeWithDetails extends TreatmentOutcome {
  appointmentCode?: string;
  customerName?: string;
  consultantName?: string;
  treatmentDate?: string;
}

interface ViewModalData {
  treatmentOutcome: TreatmentOutcome;
  appointmentCode?: string;
  customerName?: string;
  consultantName?: string;
}

interface EditModalData {
  id: number;
  diagnosis: string;
  treatmentPlan: string;
  prescription: string;
  recommendation: string;
}

const TestResultConsultant: React.FC = () => {
  // States
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<TreatmentOutcomeWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appointments, setAppointments] = useState<GetAllAppointment[]>([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<ViewModalData | null>(null);
  const [editModalData, setEditModalData] = useState<EditModalData | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load treatment outcomes and appointments
      const [treatmentResponse, appointmentResponse] = await Promise.all([
        treatmentOutcomeService.getAllTreatmentOutcomes(),
        treatmentOutcomeService.getAllAppointments()
      ]);

      console.log('Treatment outcomes response:', treatmentResponse);
      console.log('Appointments response:', appointmentResponse);

      if (treatmentResponse.statusCode === 200 && treatmentResponse.data) {
        const appointmentData = appointmentResponse.statusCode === 200 ? appointmentResponse.data || [] : [];
        setAppointments(appointmentData);

        // Combine treatment outcomes with appointment details
        const combinedData = treatmentResponse.data.map(outcome => {
          const appointment = appointmentData.find(app => app.appointmentID === outcome.appointmentID);
          
          return {
            ...outcome,
            appointmentCode: appointment?.appointmentCode || 'N/A',
            customerName: appointment?.customer?.name || 'N/A',
            consultantName: appointment?.consultant?.name || 'N/A',
            treatmentDate: outcome.createdAt
          };
        });

        setTreatmentOutcomes(combinedData);
      } else {
        setError('Không thể tải dữ liệu kết quả khám');
        toast.error('Không thể tải dữ liệu kết quả khám');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter treatment outcomes based on search query
  const filteredOutcomes = treatmentOutcomes.filter(outcome => {
    const searchLower = searchQuery.toLowerCase();
    return (
      outcome.appointmentCode?.toLowerCase().includes(searchLower) ||
      outcome.customerName?.toLowerCase().includes(searchLower) ||
      outcome.consultantName?.toLowerCase().includes(searchLower) ||
      outcome.diagnosis.toLowerCase().includes(searchLower)
    );
  });

  // Handle view details
  const handleViewDetails = async (outcomeId: number) => {
    try {
      const response = await treatmentOutcomeService.getTreatmentOutcome(outcomeId);
      
      if (response.statusCode === 200 && response.data) {
        const outcome = treatmentOutcomes.find(t => t.id === outcomeId);
        setViewModalData({
          treatmentOutcome: response.data,
          appointmentCode: outcome?.appointmentCode,
          customerName: outcome?.customerName,
          consultantName: outcome?.consultantName
        });
        setShowViewModal(true);
      } else {
        toast.error('Không thể tải chi tiết kết quả khám');
      }
    } catch (error) {
      console.error('Error loading treatment outcome details:', error);
      toast.error('Có lỗi xảy ra khi tải chi tiết');
    }
  };

  // Handle edit
  const handleEdit = (outcome: TreatmentOutcomeWithDetails) => {
    setEditModalData({
      id: outcome.id,
      diagnosis: outcome.diagnosis,
      treatmentPlan: outcome.treatmentPlan,
      prescription: outcome.prescription || '',
      recommendation: outcome.recommendation || ''
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editModalData) return;

    try {
      const outcome = treatmentOutcomes.find(t => t.id === editModalData.id);
      if (!outcome) return;

      const updateData = {
        id: editModalData.id,
        customerID: outcome.customerID,
        consultantID: outcome.consultantID,
        appointmentID: outcome.appointmentID,
        diagnosis: editModalData.diagnosis,
        treatmentPlan: editModalData.treatmentPlan,
        prescription: editModalData.prescription,
        recommendation: editModalData.recommendation
      };

      const response = await treatmentOutcomeService.updateTreatmentOutcome(updateData);
      
      if (response.statusCode === 200) {
        toast.success('Cập nhật kết quả khám thành công!');
        setShowEditModal(false);
        setEditModalData(null);
        await loadData(); // Reload data
      } else {
        toast.error('Không thể cập nhật kết quả khám');
      }
    } catch (error) {
      console.error('Error updating treatment outcome:', error);
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="test-results-consultant">
      {/* Header */}
      <div className="results-header">
        <div>
          <h1>Kết quả khám</h1>
          <p>Quản lý và theo dõi kết quả khám của tất cả bệnh nhân</p>
        </div>
        <div className="header-actions">
          <Link to="/consultant/test-results/new" className="create-result-btn">
            <FaPlus /> Tạo kết quả khám mới
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="results-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lịch hẹn, tên khách hàng, tư vấn viên..."
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
            <button onClick={loadData} className="retry-btn">
              Thử lại
            </button>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Mã lịch hẹn</th>
                <th>Khách hàng</th>
                <th>Tư vấn viên</th>
                <th>Ngày tư vấn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOutcomes.length > 0 ? (
                filteredOutcomes.map((outcome) => (
                  <tr key={outcome.id}>
                    <td>{outcome.appointmentCode}</td>
                    <td>{outcome.customerName}</td>
                    <td>{outcome.consultantName}</td>
                    <td>{formatDate(outcome.treatmentDate || outcome.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetails(outcome.id)}
                          className="action-btn view-btn"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(outcome)}
                          className="action-btn edit-btn"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-data">
                    {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có kết quả khám nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && viewModalData && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết kết quả khám</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin cuộc hẹn</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Mã lịch hẹn:</strong> {viewModalData.appointmentCode}
                  </div>
                  <div className="detail-item">
                    <strong>Khách hàng:</strong> {viewModalData.customerName}
                  </div>
                  <div className="detail-item">
                    <strong>Tư vấn viên:</strong> {viewModalData.consultantName}
                  </div>
                  <div className="detail-item">
                    <strong>Ngày tạo:</strong> {formatDate(viewModalData.treatmentOutcome.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Chẩn đoán</h4>
                <div className="detail-content">
                  {viewModalData.treatmentOutcome.diagnosis}
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Kế hoạch điều trị</h4>
                <div className="detail-content">
                  {viewModalData.treatmentOutcome.treatmentPlan}
                </div>
              </div>
              
              {viewModalData.treatmentOutcome.prescription && (
                <div className="detail-section">
                  <h4>Đơn thuốc</h4>
                  <div className="detail-content">
                    {viewModalData.treatmentOutcome.prescription}
                  </div>
                </div>
              )}
              
              {viewModalData.treatmentOutcome.recommendation && (
                <div className="detail-section">
                  <h4>Khuyến nghị</h4>
                  <div className="detail-content">
                    {viewModalData.treatmentOutcome.recommendation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editModalData && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa kết quả khám</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Chẩn đoán *</label>
                <textarea
                  value={editModalData.diagnosis}
                  onChange={(e) => setEditModalData({
                    ...editModalData,
                    diagnosis: e.target.value
                  })}
                  maxLength={1000}
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Kế hoạch điều trị *</label>
                <textarea
                  value={editModalData.treatmentPlan}
                  onChange={(e) => setEditModalData({
                    ...editModalData,
                    treatmentPlan: e.target.value
                  })}
                  maxLength={2000}
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Đơn thuốc</label>
                <textarea
                  value={editModalData.prescription}
                  onChange={(e) => setEditModalData({
                    ...editModalData,
                    prescription: e.target.value
                  })}
                  maxLength={1000}
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Khuyến nghị</label>
                <textarea
                  value={editModalData.recommendation}
                  onChange={(e) => setEditModalData({
                    ...editModalData,
                    recommendation: e.target.value
                  })}
                  maxLength={1000}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveEdit}
                className="btn btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultConsultant;
