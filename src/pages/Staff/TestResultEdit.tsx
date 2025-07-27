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
        // Get the selected test result
        const response = await testResultService.getTestResult(testResultId);
        if (!response || !response.data) throw new Error('Không tìm thấy kết quả xét nghiệm');
        const result = response.data as any;
        // Get all test results for the same group (customerID, staffID, testDate, treatmentID)
        const groupRes = await testResultService.getStaffCreatedResults({
          page: 1,
          limit: 100,
          pageNumber: 1,
          pageSize: 100,
          searchTerm: ''
        });
        let group: TestResult[] = [];
        if (groupRes && groupRes.data) {
          group = (groupRes.data as TestResult[]).filter(t =>
            t.customerID === result.customerID &&
            t.staffID === result.staffID &&
            t.testDate === result.testDate &&
            t.treatmentID === result.treatmentID
          );
        }
        // If not found, fallback to just the selected test
        if (group.length === 0) group = [{ ...result }];
        setTestGroup(group);

        // Patient info: fetch from appointmentAPI by treatmentID (like TestResultForm)
        let patientName = result.customerName || 'Không có tên';
        let patientPhone = result.phone || '';
        let appointmentCode = result.treatmentID ? String(result.treatmentID) : '';
        if (result.treatmentID) {
          try {
            const aptRes = await appointmentAPI.getAllAppointments();
            if (aptRes && aptRes.data) {
              const foundApt = (aptRes.data as AppointmentData[]).find(
                (apt) => apt.treatmentID === result.treatmentID
              );
              if (foundApt && foundApt.customer) {
                patientName = foundApt.customer.name || patientName;
                patientPhone = foundApt.customer.phone || patientPhone;
                appointmentCode = foundApt.appointmentCode || appointmentCode;
              }
            }
          } catch {}
        }
        setPatientInfo({
          name: patientName,
          phone: patientPhone,
          appointmentCode: appointmentCode
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Prepare update requests for all filled tests
      const updates: UpdateLabTestRequest[] = [];
      for (const test of testGroup) {
        // Find test id by name
        let testId = '';
        for (const groupType of GROUPED_TEST_TYPES) {
          const found = groupType.tests.find(tt => tt.name === test.testName);
          if (found) { testId = found.id; break; }
        }
        if (!testId) continue;
        const tableVal = testTable[testId];
        if (!tableVal || !tableVal.result.trim()) continue;
        updates.push({
          labTestID: test.labTestID || Number(test.id),
          customerID: test.customerID || '',
          staffID: test.staffID || '',
          treatmentID: test.treatmentID,
          testName: test.testName || '',
          result: tableVal.result,
          referenceRange: getTestInfoById(testId)?.referenceRange || '',
          unit: getTestInfoById(testId)?.unit || '',
          isPositive: tableVal.conclusion === 'Dương Tính',
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
          {/* Bảng kết quả xét nghiệm chuyên nghiệp */}
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
                    {group.tests.map(test => (
                      <tr key={test.id}>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.name}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                          <input
                            type="text"
                            value={testTable[test.id]?.result || ''}
                            onChange={e => handleTestTableChange(test.id, e.target.value)}
                            placeholder="Nhập kết quả"
                            style={{ width: 100, padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: 4 }}
                          />
                        </td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8, whiteSpace: 'pre-line' }}>{test.referenceRange}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.unit}</td>
                        <td style={{ border: '1.5px solid #64748b', padding: 8, fontWeight: 'bold', color: testTable[test.id]?.conclusion === 'Dương Tính' ? 'red' : testTable[test.id]?.conclusion === 'Âm Tính' ? 'green' : '#333' }}>
                          {testTable[test.id]?.conclusion || '-'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
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
        </form>
      </div>
    </div>
  );
};

export default TestResultEdit; 