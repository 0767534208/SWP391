import React, { useState, useEffect } from 'react';
// Grouped test types for professional table input (copy from TestResultManagementStaff)
const GROUPED_TEST_TYPES = [
  {
    group: 'SINH HÓA',
    tests: [
      {
        id: 'rpr',
        name: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
        referenceRange: '< 1',
        unit: 'RU',
      },
    ],
  },
  {
    group: 'MIỄN DỊCH',
    tests: [
      {
        id: 'hiv_combo',
        name: 'HIV Combo Ag + Ab',
        referenceRange: '< 1',
        unit: 'S/CO',
      },
      {
        id: 'syphilis',
        name: 'Syphilis',
        referenceRange: 'Âm Tính: < 1.00\nDương Tính: ≥ 1.00',
        unit: 'S/CO',
      },
    ],
  },
  {
    group: 'SINH HỌC PHÂN TỬ',
    tests: [
      { id: 'chlamydia', name: 'Chlamydia trachomatis', referenceRange: 'Âm Tính', unit: '' },
      { id: 'candida', name: 'Candida albicans', referenceRange: 'Âm Tính', unit: '' },
      { id: 'treponema', name: 'Treponema pallidum', referenceRange: 'Âm Tính', unit: '' },
      { id: 'hsv1', name: 'Herpes Simplex Virus 1', referenceRange: 'Âm Tính', unit: '' },
      { id: 'hsv2', name: 'Herpes Simplex Virus 2', referenceRange: 'Âm Tính', unit: '' },
      { id: 'ureaplasma_parvum', name: 'Ureaplasma parvum', referenceRange: 'Âm Tính', unit: '' },
      { id: 'trichomonas', name: 'Trichomonas vaginalis', referenceRange: 'Âm Tính', unit: '' },
      { id: 'mycoplasma_gen', name: 'Mycoplasma genitalium', referenceRange: 'Âm Tính', unit: '' },
      { id: 'mycoplasma_hom', name: 'Mycoplasma hominis', referenceRange: 'Âm Tính', unit: '' },
      { id: 'neisseria', name: 'Neisseria gonorrhoeae', referenceRange: 'Âm Tính', unit: '' },
      { id: 'ureaplasma_urea', name: 'Ureaplasma urealyticum', referenceRange: 'Âm Tính', unit: '' },
      { id: 'haemophilus', name: 'Haemophilus ducreyi', referenceRange: 'Âm Tính', unit: '' },
      { id: 'gardnerella', name: 'Gardnerella vaginalis', referenceRange: 'Âm Tính', unit: '' },
    ],
  },
];
import { FaSearch, FaTimes, FaEye, FaEdit, FaPlus, FaFlask } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TestResultConsultant.css';
import { treatmentOutcomeService } from '../../services';
import testResultService from '../../services/testResultService';
import type { LabTestData } from '../../utils/api';
import { toast } from 'react-hot-toast';
import type { TreatmentOutcome } from '../../services/treatmentOutcomeService';

interface TreatmentOutcomeWithDetails extends TreatmentOutcome {
  appointmentCode?: string;
  customerName?: string;
  consultantName?: string;
  treatmentDate?: string;
  labTestID?: number;
  hasLabTest?: boolean;
}

interface ViewModalData {
  treatmentOutcome: TreatmentOutcome;
  appointmentCode?: string;
  customerName?: string;
  consultantName?: string;
}

interface EditModalData {
  treatmentID: number;
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
  // const [appointments, setAppointments] = useState<GetAllAppointment[]>([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showLabTestModal, setShowLabTestModal] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<ViewModalData | null>(null);
  const [editModalData, setEditModalData] = useState<EditModalData | null>(null);
  // Danh sách test của 1 cuộc hẹn (treatmentID)
  const [selectedLabTests, setSelectedLabTests] = useState<LabTestData[] | null>(null);
  const [labTestLoading, setLabTestLoading] = useState<boolean>(false);

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
        // setAppointments(appointmentData);

        // Combine treatment outcomes with appointment details and check for lab tests
        const combinedData = await Promise.all(treatmentResponse.data.map(async (outcome) => {
          const appointment = appointmentData.find(app => app.appointmentID === outcome.appointmentID);
          
          // Check if this treatment has lab tests
          let hasLabTest = false;
          let labTestID = null;
          try {
            const labTestResponse = await testResultService.getAppointmentTestResults(outcome.treatmentID.toString());
            if (labTestResponse.statusCode === 200 && labTestResponse.data && labTestResponse.data.length > 0) {
              hasLabTest = true;
              labTestID = (labTestResponse.data[0] as any).labTestID || labTestResponse.data[0].id;
            }
          } catch (error) {
            console.error('Error checking lab test for treatment:', outcome.treatmentID, error);
          }
          
          return {
            ...outcome,
            appointmentCode: appointment?.appointmentCode || 'N/A',
            customerName: appointment?.customer?.name || 'N/A',
            consultantName: appointment?.consultant?.name || 'N/A',
            treatmentDate: outcome.createAt,
            hasLabTest,
            labTestID
          };
        }));

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
        const outcome = treatmentOutcomes.find(t => t.treatmentID === outcomeId);
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
      treatmentID: outcome.treatmentID,
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
      const outcome = treatmentOutcomes.find(t => t.treatmentID === editModalData.treatmentID);
      if (!outcome) return;

      const updateData = {
        treatmentID: editModalData.treatmentID,
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

  // Handle view lab test details
  // Xem tất cả test theo đúng mã cuộc hẹn (treatmentID)
  const handleViewLabTest = async (treatmentId: number) => {
    try {
      setLabTestLoading(true);
      // Lấy tất cả test của treatmentID này
      const labTestResponse = await testResultService.getAppointmentTestResults(treatmentId);
      if (labTestResponse.statusCode === 200 && Array.isArray(labTestResponse.data) && labTestResponse.data.length > 0) {
        setSelectedLabTests(labTestResponse.data as LabTestData[]);
        setShowLabTestModal(true);
      } else {
        setSelectedLabTests(null);
        toast.error('Không tìm thấy kết quả xét nghiệm cho điều trị này');
      }
    } catch (error) {
      setSelectedLabTests(null);
      console.error('Error loading lab test details:', error);
      toast.error('Có lỗi xảy ra khi tải kết quả xét nghiệm');
    } finally {
      setLabTestLoading(false);
    }
  };

  // Close lab test modal
  const closeLabTestModal = () => {
    setShowLabTestModal(false);
    setSelectedLabTests(null);
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
                  <tr key={outcome.treatmentID}>
                    <td>{outcome.appointmentCode}</td>
                    <td>{outcome.customerName}</td>
                    <td>{outcome.consultantName}</td>
                    <td>{formatDate(outcome.treatmentDate || outcome.createAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetails(outcome.treatmentID)}
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
                        {outcome.hasLabTest && (
                          <button
                            onClick={() => handleViewLabTest(outcome.treatmentID)}
                            className="action-btn lab-test-btn"
                            title="Xem kết quả xét nghiệm"
                            disabled={labTestLoading}
                          >
                            <FaFlask />
                          </button>
                        )}
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
                    <strong>Ngày tạo:</strong> {formatDate(viewModalData.treatmentOutcome.createAt)}
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

      {/* Lab Test Modal - Professional Table (chỉ bảng kết quả thực tế, giống TestResultManagementStaff) */}
      {showLabTestModal && selectedLabTests && (
        <div className="modal-overlay" onClick={closeLabTestModal}>
          <div className="modal-content" style={{ maxWidth: 900, minWidth: 600, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết kết quả xét nghiệm</h3>
              <button 
                onClick={closeLabTestModal}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {/* Bảng kết quả xét nghiệm thực tế */}
              <div className="test-result-table-pro" style={{ margin: '24px 0', overflowX: 'auto' }}>
                <table className="test-result-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 15, border: '1.5px solid #64748b' }}>
                  <thead>
                    <tr style={{ background: '#e0e7ef', color: '#1e293b', fontWeight: 700 }}>
                      <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 220 }}>TÊN XÉT NGHIỆM</th>
                      <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 100 }}>KẾT QUẢ</th>
                      <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 120 }}>GIÁ TRỊ THAM CHIẾU</th>
                      <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 80 }}>ĐƠN VỊ</th>
                      <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 100 }}>KẾT LUẬN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLabTests.map((test, idx) => (
                      <tr key={test.labTestID || test.id || idx}>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.testName || test.testType || 'N/A'}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.result || '-'}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8, whiteSpace: 'pre-line' }}>{test.referenceRange || '-'}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.unit || ''}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8, fontWeight: 'bold', color: test.isPositive ? 'red' : 'green' }}>
                          {typeof test.isPositive === 'boolean' ? (test.isPositive ? 'Dương Tính' : 'Âm Tính') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultConsultant;
