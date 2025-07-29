// Grouped test types (đồng bộ với TestResultForm)
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultEdit.css';
import { FaArrowLeft } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import { appointmentAPI } from '../../utils/api';
import type { UpdateLabTestRequest, LabTestData, AppointmentData } from '../../utils/api';

interface TestResult {
  id?: number | string;
  labTestID?: number;
  userId?: string;
  customerID?: string;
  customerName?: string;
  staffID?: string;
  staffName?: string;
  treatmentID?: number | null;
  testName?: string;
  testType?: string;
  result?: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate?: string;
}

const TestResultEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmitEvent, setPendingSubmitEvent] = useState<React.FormEvent | null>(null);
  const [testGroup, setTestGroup] = useState<TestResult[]>([]);
  const [patientInfo, setPatientInfo] = useState<{ name: string; phone: string; appointmentCode: string } | null>(null);
  const [testTable, setTestTable] = useState<Record<string, { result: string; conclusion: string }>>({});
  const [testDate, setTestDate] = useState('');
  const [staffName, setStaffName] = useState('');

  // Fetch test group data (all tests for the same group as the selected test)
  useEffect(() => {
    const fetchTestGroup = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error('ID không hợp lệ');
        const testResultId = parseInt(id);
        if (isNaN(testResultId)) throw new Error('ID phải là số nguyên');
        // Lấy lab test đang chỉnh sửa
        const response = await testResultService.getTestResult(testResultId);
        if (!response || !response.data) throw new Error('Không tìm thấy kết quả xét nghiệm');
        const result = response.data as any;

        // Lấy tất cả lab test của staff này
        const groupRes = await testResultService.getStaffCreatedResults({
          page: 1,
          limit: 100,
          pageNumber: 1,
          pageSize: 100,
          searchTerm: ''
        });
        let group: TestResult[] = [];
        if (groupRes && groupRes.data) {
          // Gom nhóm theo treatmentID và ngày testDate (yyyy-MM-dd)
          if (result.treatmentID && result.testDate) {
            let dateKey = '';
            try {
              const d = new Date(result.testDate);
              dateKey = d.toISOString().split('T')[0];
            } catch {
              dateKey = result.testDate;
            }
            group = (groupRes.data as TestResult[]).filter(t => {
              if (t.treatmentID !== result.treatmentID) return false;
              if (!t.testDate) return false;
              let tDateKey = '';
              try {
                const d = new Date(t.testDate);
                tDateKey = d.toISOString().split('T')[0];
              } catch {
                tDateKey = t.testDate;
              }
              return tDateKey === dateKey;
            });
          } else {
            // Nếu không có treatmentID hoặc testDate, fallback như cũ
            group = [{ ...result }];
          }
        }
        if (group.length === 0) group = [{ ...result }];
        setTestGroup(group);

        // Lấy thông tin bệnh nhân và mã lịch hẹn
        let patientName = result.customerName || 'Không có tên';
        let patientPhone = result.phone || '';
        let appointmentCode = '';
        try {
          const aptRes = await appointmentAPI.getAllAppointments();
          if (aptRes && aptRes.data) {
            const foundApt = (aptRes.data as any[]).find(
              (apt) => (apt.treatmentID && result.treatmentID && apt.treatmentID === result.treatmentID) ||
                (apt.treatmentOutcome && apt.treatmentOutcome.treatmentID && result.treatmentID && apt.treatmentOutcome.treatmentID === result.treatmentID)
            );
            if (foundApt) {
              patientName = foundApt.customer?.name || patientName;
              patientPhone = foundApt.customer?.phone || patientPhone;
              appointmentCode = foundApt.appointmentCode || (foundApt.treatmentOutcome?.appointmentID ? String(foundApt.treatmentOutcome.appointmentID) : '');
            }
          }
        } catch {}
        setPatientInfo({
          name: patientName,
          phone: patientPhone,
          appointmentCode: appointmentCode || (result.treatmentID ? String(result.treatmentID) : '-')
        });

        // Format test date as yyyy-MM-dd (like TestResultForm)
        let formattedDate = '';
        if (result.testDate) {
          try {
            const d = new Date(result.testDate);
            formattedDate = d.toISOString().split('T')[0];
          } catch {
            formattedDate = result.testDate;
          }
        }
        setTestDate(formattedDate);
        setStaffName(result.staffName || '');
        // Build testTable state
        const table: Record<string, { result: string; conclusion: string }> = {};
        group.forEach(t => {
          // Find test id by name
          let testId = '';
          for (const groupType of GROUPED_TEST_TYPES) {
            const found = groupType.tests.find(tt => tt.name === t.testName);
            if (found) { testId = found.id; break; }
          }
          if (testId) {
            table[testId] = {
              result: t.result || '',
              conclusion: typeof t.isPositive === 'boolean' ? (t.isPositive ? 'Dương Tính' : 'Âm Tính') : ''
            };
          }
        });
        setTestTable(table);
      } catch (err) {
        setError('Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchTestGroup();
  }, [id]);


  // Helper: get test info by id
  const getTestInfoById = (testId: string) => {
    for (const group of GROUPED_TEST_TYPES) {
      const found = group.tests.find(t => t.id === testId);
      if (found) return found;
    }
    return null;
  };

  // Helper: auto check positive/negative (same as TestResultForm)
  const getConclusion = (testId: string, value: string) => {
    if (value.trim() === '') return '';
    if (value.toLowerCase().includes('âm')) return 'Âm Tính';
    if (value.toLowerCase().includes('dương')) return 'Dương Tính';
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      return num >= 1 ? 'Dương Tính' : 'Âm Tính';
    }
    return '';
  };


  // Handle test table change
  const handleTestTableChange = (testId: string, value: string) => {
    setTestTable(prev => {
      const newTable = { ...prev };
      newTable[testId] = {
        result: value,
        conclusion: getConclusion(testId, value)
      };
      return newTable;
    });
  };


  // Handle form submission: update all tests in the group
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingSubmitEvent(e);
    setShowConfirm(true);
  };

  // Hàm thực hiện lưu thực sự sau khi xác nhận
  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    setError(null);
    try {
      // Prepare update requests for all tests in testGroup (không bỏ qua test nào)
      const updates: UpdateLabTestRequest[] = [];
      for (const test of testGroup) {
        const uniqueId = String(test.labTestID || test.id);
        // Tìm testId từ GROUPED_TEST_TYPES nếu có
        let testId = '';
        for (const groupType of GROUPED_TEST_TYPES) {
          const found = groupType.tests.find(tt => tt.name === test.testName);
          if (found) { testId = found.id; break; }
        }
        // Lấy giá trị nhập từ testTable hoặc giá trị cũ
        const tableVal = testTable[uniqueId];
        const resultValue = tableVal && typeof tableVal.result === 'string' ? tableVal.result : (test.result || '');
        const conclusionValue = tableVal && typeof tableVal.conclusion === 'string' ? tableVal.conclusion : (typeof test.isPositive === 'boolean' ? (test.isPositive ? 'Dương Tính' : 'Âm Tính') : '');
        updates.push({
          labTestID: test.labTestID || Number(test.id),
          customerID: test.customerID || '',
          staffID: test.staffID || '',
          treatmentID: test.treatmentID,
          testName: test.testName || '',
          result: resultValue,
          referenceRange: test.referenceRange || (testId ? (getTestInfoById(testId)?.referenceRange || '') : ''),
          unit: test.unit || (testId ? (getTestInfoById(testId)?.unit || '') : ''),
          isPositive: conclusionValue === 'Dương Tính',
          testDate: testDate || ''
        });
      }
      if (updates.length === 0) throw new Error('Vui lòng nhập ít nhất một kết quả xét nghiệm.');
      // Update all tests
      for (const req of updates) {
        await testResultService.updateTestResult(req);
      }
      navigate(`/staff/test-results`);
    } catch (err) {
      setError('Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
      setPendingSubmitEvent(null);
    }
  };

  const handleCancel = () => {
    navigate(`/staff/test-results`);
  };

  if (loading) {
    return (
      <div className="test-result-edit">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu kết quả xét nghiệm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-result-edit">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/staff/test-results')} className="back-button">
            <FaArrowLeft /> Quay lại danh sách kết quả
          </button>
        </div>
      </div>
    );
  }

  // Patient info and staff info header (like TestResultForm)
  return (
    <div className="test-result-edit">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>CHỈNH SỬA KẾT QUẢ XÉT NGHIỆM</h1>
          <div style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>PHÒNG KHÁM SỨC KHỎE GIỚI TÍNH</div>
        </div>
      </div>
      <div className="test-result-form-content" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 900, margin: '0 auto' }}>
        {/* Thông tin bệnh nhân và xét nghiệm */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Họ tên bệnh nhân:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{patientInfo?.name || '-'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Số điện thoại:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{patientInfo?.phone || '-'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Mã lịch hẹn:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{patientInfo?.appointmentCode || '-'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Tên nhân viên thực hiện:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{staffName || 'Nhân viên'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Ngày xét nghiệm:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{testDate || '-'}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="test-result-edit-form">
          {/* Bảng kết quả xét nghiệm chuyên nghiệp (editable) */}
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
                {/* Sắp xếp: chỉ áp dụng cho các test cùng treatmentID, còn lại giữ nguyên thứ tự tạo */}
                {(() => {
                  if (testGroup.length === 0) return null;
                  // Nếu tất cả test cùng treatmentID thì sort số lên trên, còn lại giữ nguyên thứ tự
                  const allSameTreatment = testGroup.every(t => t.treatmentID === testGroup[0].treatmentID);
                  let displayGroup = testGroup;
                  if (allSameTreatment && testGroup[0].treatmentID) {
                    // Nếu cùng treatmentID thì sort: Âm tính lên trên, sau đó Dương tính, còn lại số lên trên
                    const isNumericResult = (result: string | undefined | null) => {
                      if (!result) return false;
                      const cleaned = result.replace(/,/g, '.').replace(/[^0-9.\-eE]/g, '');
                      return !isNaN(Number(cleaned)) && cleaned.trim() !== '';
                    };
                    const getStatus = (test: TestResult) => {
                      if (typeof test.isPositive === 'boolean') {
                        return test.isPositive ? 2 : 1; // 1: Âm tính, 2: Dương tính
                      }
                      if (typeof test.result === 'string') {
                        const val = test.result.toLowerCase();
                        if (val.includes('âm')) return 1;
                        if (val.includes('dương')) return 2;
                      }
                      return 0; // 0: chưa xác định
                    };
                    displayGroup = [...testGroup].sort((a, b) => {
                      const aStatus = getStatus(a);
                      const bStatus = getStatus(b);
                      if (aStatus !== bStatus) return aStatus - bStatus;
                      if (aStatus === 0 && bStatus === 0) {
                        const aVal = typeof a.result === 'string' ? a.result : '';
                        const bVal = typeof b.result === 'string' ? b.result : '';
                        const aIsNum = isNumericResult(aVal);
                        const bIsNum = isNumericResult(bVal);
                        if (aIsNum && !bIsNum) return -1;
                        if (!aIsNum && bIsNum) return 1;
                      }
                      return 0;
                    });
                  } else {
                    // Nếu khác treatmentID thì sort theo ngày xét nghiệm tăng dần
                    displayGroup = [...testGroup].sort((a, b) => {
                      const aDate = a.testDate ? new Date(a.testDate).getTime() : 0;
                      const bDate = b.testDate ? new Date(b.testDate).getTime() : 0;
                      return aDate - bDate;
                    });
                  }
                  return displayGroup.map((test, idx) => {
                    const uniqueId = String(test.labTestID || test.id || idx);
                    let testId = '';
                    for (const groupType of GROUPED_TEST_TYPES) {
                      const found = groupType.tests.find(tt => tt.name === test.testName);
                      if (found) { testId = found.id; break; }
                    }
                    return (
                      <tr key={uniqueId}>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.testName || test.testType || 'N/A'}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                          <input
                            type="text"
                            value={typeof testTable[uniqueId]?.result === 'string' ? testTable[uniqueId]?.result : (test.result || '')}
                            onChange={e => handleTestTableChange(uniqueId, e.target.value)}
                            placeholder="Nhập kết quả"
                            style={{ width: 100, padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: 4 }}
                          />
                        </td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8, whiteSpace: 'pre-line' }}>{test.referenceRange || (testId ? (getTestInfoById(testId)?.referenceRange || '-') : '-')}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.unit || (testId ? (getTestInfoById(testId)?.unit || '') : '')}</td>
                        <td
                          style={{
                            border: '1.5px solid #64748b',
                            padding: 8,
                            fontWeight: 'bold',
                            color: (() => {
                              const val = testTable[uniqueId]?.conclusion || (typeof test.isPositive === 'boolean' ? (test.isPositive ? 'Dương Tính' : 'Âm Tính') : '');
                              if (val === 'Dương Tính') return 'red';
                              if (val === 'Âm Tính') return 'green';
                              return '#333';
                            })()
                          }}
                        >
                          {testTable[uniqueId]?.conclusion || (typeof test.isPositive === 'boolean' ? (test.isPositive ? 'Dương Tính' : 'Âm Tính') : '-')}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions" style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/staff/test-results')}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
          {/* Modal xác nhận lưu thay đổi */}
          {showConfirm && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0006', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0003', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Xác nhận lưu thay đổi</div>
                <div style={{ fontSize: 15, marginBottom: 24 }}>Bạn có chắc chắn muốn lưu các thay đổi kết quả xét nghiệm này không?</div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setShowConfirm(false); setPendingSubmitEvent(null); }}
                    style={{ minWidth: 80 }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmSave}
                    style={{ minWidth: 100 }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TestResultEdit; 