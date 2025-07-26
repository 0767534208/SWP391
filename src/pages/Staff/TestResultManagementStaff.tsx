import React, { useState, useEffect } from 'react';
// Grouped test types for professional table input (copy from TestResultForm)
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
import './TestResultManagementStaff.css';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaEye, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import { appointmentAPI } from '../../utils/api';
import type { LabTestData, AppointmentData } from '../../utils/api';

// Types
interface TestResult {
  labTestID?: number;
  id?: number | string;
  customerID?: string;
  customerName?: string;
  patientId?: string;
  patientName?: string;
  staffName?: string;
  testName?: string;
  testType?: string;
  result?: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate?: string;
  resultDate?: string | null;
  staffID?: string;
  treatmentID?: number | null;
  status?: 'completed' | 'pending' | 'cancelled' | string | number;
  notes?: string;
  phone?: string;
  patientPhone?: string;
}

const TestResultManagementStaff: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTestGroup, setSelectedTestGroup] = useState<TestResult[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // Map customerID to phone and treatmentID to appointmentCode
  const [customerIdToPhone, setCustomerIdToPhone] = useState<Record<string, string>>({});
  const [treatmentIdToAppointmentCode, setTreatmentIdToAppointmentCode] = useState<Record<string, string>>({});

  // Fetch test results
  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await testResultService.getStaffCreatedResults({
        page: 1,
        limit: 100,
        pageNumber: 1,
        pageSize: 100,
        searchTerm: searchQuery
      });
      if (response.data) {
        setTestResults(response.data as unknown as TestResult[]);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error("Error fetching test results:", err);
      setError("Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.");
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all appointments and build customerId->phone and treatmentID->appointmentCode map
  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAllAppointments();
      if (response.data) {
        const phoneMap: Record<string, string> = {};
        const codeMap: Record<string, string> = {};
        (response.data as AppointmentData[]).forEach((apt) => {
          if (apt.customerID && apt.customer && apt.customer.phone) {
            phoneMap[apt.customerID] = apt.customer.phone;
          }
          // Map treatmentID and appointmentID to appointmentCode
          if (apt.treatmentID && apt.appointmentCode) {
            codeMap[apt.treatmentID] = apt.appointmentCode;
          }
          if (apt.appointmentID && apt.appointmentCode) {
            codeMap[apt.appointmentID] = apt.appointmentCode;
          }
          // Also map treatmentOutcome.treatmentID if available
          if (apt.treatmentOutcome && apt.treatmentOutcome.treatmentID && apt.appointmentCode) {
            codeMap[apt.treatmentOutcome.treatmentID] = apt.appointmentCode;
          }
        });
        setCustomerIdToPhone(phoneMap);
        setTreatmentIdToAppointmentCode(codeMap);
      }
    } catch (err) {
      setCustomerIdToPhone({});
      setTreatmentIdToAppointmentCode({});
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTestResults();
    fetchAppointments();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchTestResults();
  };


  // Group test results by customerID, staffID, testDate, treatmentID
  function groupTestResults(results: TestResult[]) {
    const groups: Record<string, TestResult[]> = {};
    for (const test of results) {
      const key = [
        test.customerID || '',
        test.staffID || '',
        test.testDate || '',
        test.treatmentID || ''
      ].join('|');
      if (!groups[key]) groups[key] = [];
      groups[key].push(test);
    }
    return Object.values(groups);
  }

  // Filter and group
  const filteredTestResults = groupTestResults(
    testResults.filter(test => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        (test.customerName?.toLowerCase().includes(searchLower)) ||
        (test.patientName?.toLowerCase().includes(searchLower)) ||
        (test.staffName?.toLowerCase().includes(searchLower)) ||
        (test.testName?.toLowerCase().includes(searchLower)) ||
        (test.testType?.toLowerCase().includes(searchLower)) ||
        (test.result?.toLowerCase().includes(searchLower))
      );
    })
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getPatientName = (test: TestResult) => {
    return test.customerName || test.patientName || `Bệnh nhân ${test.customerID || 'N/A'}`;
  };

  const getStaffName = (test: TestResult) => {
    return test.staffName || `Nhân viên ${test.staffID || 'N/A'}`;
  };

  // Xóa kết quả xét nghiệm
  const handleDelete = async (testId: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kết quả xét nghiệm này?')) return;
    setLoading(true);
    setError(null);
    try {
      const idNum = typeof testId === 'string' ? parseInt(testId, 10) : testId;
      if (isNaN(idNum)) throw new Error('ID không hợp lệ');
      await testResultService.deleteTestResult(idNum);
      await fetchTestResults();
    } catch {
      setError('Không thể xóa kết quả xét nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const handleViewDetails = (testId: number | string) => {
    // Tìm test trong danh sách
    let test: TestResult | undefined = undefined;
    for (const group of filteredTestResults) {
      test = group.find(t => (t.labTestID || t.id) === testId);
      if (test) {
        // Lấy tất cả test cùng nhóm
        const groupTests = group;
        setSelectedTestGroup(groupTests);
        setShowModal(true);
        return;
      }
    }
    setError('Không tìm thấy thông tin chi tiết');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTestGroup(null);
  };

  return (
    <div className="test-results-staff">
      {/* Header */}
      <div className="results-header">
        <div>
          <h1>Quản lý kết quả xét nghiệm</h1>
          <p>Quản lý và cập nhật kết quả xét nghiệm của bệnh nhân</p>
        </div>
        <div className="header-actions">
          <Link to="/staff/test-results/new" className="create-result-btn">
            <FaPlus /> Thêm kết quả xét nghiệm mới
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="results-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, nhân viên, loại xét nghiệm..."
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
            <button onClick={fetchTestResults} className="retry-btn">
              Thử lại
            </button>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Số điện thoại</th>
                <th>Nhân viên xét nghiệm</th>
                <th>Ngày xét nghiệm</th>
                <th>Kết quả các xét nghiệm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestResults.length > 0 ? (
                filteredTestResults.map((group, idx) => {
                  const first = group[0];
                  const phone = (first.customerID && customerIdToPhone[first.customerID]) || '';
                  return (
                    <tr key={first.labTestID || first.id || idx}>
                      <td>{getPatientName(first)}</td>
                      <td>{phone || '-'}</td>
                      <td>{getStaffName(first)}</td>
                      <td>{formatDate(first.testDate || first.resultDate)}</td>
                      <td>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f8fafc', fontSize: 14 }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #e5e7eb', padding: 4 }}>Tên xét nghiệm</th>
                              <th style={{ border: '1px solid #e5e7eb', padding: 4 }}>Kết quả</th>
                              <th style={{ border: '1px solid #e5e7eb', padding: 4 }}>Tham chiếu</th>
                              <th style={{ border: '1px solid #e5e7eb', padding: 4 }}>Đơn vị</th>
                              <th style={{ border: '1px solid #e5e7eb', padding: 4 }}>Kết luận</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.map(test => (
                              <tr key={test.labTestID || test.id}>
                                <td style={{ border: '1px solid #e5e7eb', padding: 4 }}>{test.testName || test.testType || 'N/A'}</td>
                                <td style={{ border: '1px solid #e5e7eb', padding: 4 }}>{test.result || 'N/A'}</td>
                                <td style={{ border: '1px solid #e5e7eb', padding: 4 }}>{test.referenceRange || 'N/A'}</td>
                                <td style={{ border: '1px solid #e5e7eb', padding: 4 }}>{test.unit || ''}</td>
                                <td style={{ border: '1px solid #e5e7eb', padding: 4 }}>
                                  {test.isPositive !== undefined ? (
                                    <span style={{ color: test.isPositive ? 'red' : 'green', fontWeight: 'bold' }}>
                                      {test.isPositive ? 'Dương tính' : 'Âm tính'}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewDetails(first.labTestID || first.id || '')}
                            className="action-btn view-btn"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <Link
                            to={`/staff/test-results/edit/${first.labTestID || first.id}`}
                            className="action-btn edit-btn"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(first.labTestID || first.id || '')}
                            className="action-btn delete-btn"
                            title="Xóa"
                            style={{ color: 'red' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="no-data">
                    {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có kết quả xét nghiệm nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedTestGroup && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 900, minWidth: 600, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết kết quả xét nghiệm</h3>
              <button 
                onClick={closeModal}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {/* Thông tin chung mở rộng */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>Bệnh nhân:</label>
                  <span>{getPatientName(selectedTestGroup[0])}</span>
                </div>
                <div className="modal-info-item">
                  <label>Mã lịch hẹn:</label>
                  <span>{
                    (selectedTestGroup[0].treatmentID && treatmentIdToAppointmentCode[selectedTestGroup[0].treatmentID])
                      ? treatmentIdToAppointmentCode[selectedTestGroup[0].treatmentID]
                      : (selectedTestGroup[0].treatmentID || 'N/A')
                  }</span>
                </div>
                <div className="modal-info-item">
                  <label>Số điện thoại:</label>
                  <span>{(selectedTestGroup[0].customerID && customerIdToPhone[selectedTestGroup[0].customerID]) || '-'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Nhân viên xét nghiệm:</label>
                  <span>{getStaffName(selectedTestGroup[0])}</span>
                </div>
                <div className="modal-info-item">
                  <label>Ngày xét nghiệm:</label>
                  <span>{formatDate(selectedTestGroup[0].testDate)}</span>
                </div>
                <div className="modal-info-item">
                  <label>Ngày tạo:</label>
                  <span>{selectedTestGroup[0].testDate ? formatDate(selectedTestGroup[0].testDate) : 'N/A'}</span>
                </div>
              </div>
              {/* Bảng kết quả xét nghiệm chuyên nghiệp (read-only, like TestResultForm) */}
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
                    {GROUPED_TEST_TYPES.map(group => (
                      <React.Fragment key={group.group}>
                        <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                          <td colSpan={5} style={{ border: '1.5px solid #64748b', padding: 8, color: '#0ea5e9', fontSize: 16 }}>{group.group}</td>
                        </tr>
                        {group.tests.map(test => {
                          // Find test result in selectedTestGroup by test name
                          const testResult = selectedTestGroup.find(t => t.testName === test.name);
                          let result = testResult?.result || '';
                          let conclusion = '';
                          if (typeof testResult?.isPositive === 'boolean') {
                            conclusion = testResult.isPositive ? 'Dương Tính' : 'Âm Tính';
                          }
                          return (
                            <tr key={test.id}>
                              <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.name}</td>
                              <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{result || '-'}</td>
                              <td style={{ border: '1.5px solid #64748b', padding: 8, whiteSpace: 'pre-line' }}>{test.referenceRange}</td>
                              <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.unit}</td>
                              <td style={{ border: '1.5px solid #64748b', padding: 8, fontWeight: 'bold', color: conclusion === 'Dương Tính' ? 'red' : conclusion === 'Âm Tính' ? 'green' : '#333' }}>
                                {conclusion || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
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

export default TestResultManagementStaff;
