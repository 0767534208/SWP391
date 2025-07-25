// Test types with proper medical names and reference ranges (đồng bộ với TestResultForm)
const TEST_TYPES = [
  {
    id: 'hiv_antibody',
    name: 'Xét nghiệm kháng thể HIV (HIV Antibody Test)',
    referenceRange: '< 1.0 S/CO',
    unit: 'S/CO',
    normalRange: 'Âm tính (< 1.0)'
  },
  {
    id: 'hepatitis_b_surface',
    name: 'Kháng nguyên bề mặt viêm gan B (HBsAg)',
    referenceRange: '< 0.05 IU/mL',
    unit: 'IU/mL',
    normalRange: 'Âm tính (< 0.05)'
  },
  {
    id: 'hepatitis_b_antibody',
    name: 'Kháng thể viêm gan B (Anti-HBs)',
    referenceRange: '> 10 mIU/mL (bảo vệ)',
    unit: 'mIU/mL',
    normalRange: '> 10 (có miễn dịch)'
  },
  {
    id: 'hepatitis_c_antibody',
    name: 'Kháng thể viêm gan C (Anti-HCV)',
    referenceRange: '< 1.0 S/CO',
    unit: 'S/CO',
    normalRange: 'Âm tính (< 1.0)'
  },
  {
    id: 'ureaplasma',
    name: 'Xét nghiệm Ureaplasma urealyticum',
    referenceRange: '< 10^4 CFU/mL',
    unit: 'CFU/mL',
    normalRange: '< 10^4 CFU/mL'
  },
  {
    id: 'hsv1_igg',
    name: 'Kháng thể Herpes Simplex Virus 1 IgG',
    referenceRange: '< 0.9 index',
    unit: 'index',
    normalRange: 'Âm tính (< 0.9)'
  },
  {
    id: 'hsv2_igg',
    name: 'Kháng thể Herpes Simplex Virus 2 IgG',
    referenceRange: '< 0.9 index',
    unit: 'index',
    normalRange: 'Âm tính (< 0.9)'
  }
];
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultEdit.css';
import { FaArrowLeft } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import type { UpdateLabTestRequest, LabTestData } from '../../utils/api';

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
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch test result data
  useEffect(() => {
    const fetchTestResult = async () => {
      setLoading(true);
      try {
        if (!id) {
          throw new Error('ID không hợp lệ');
        }
        
        const testResultId = parseInt(id);
        if (isNaN(testResultId)) {
          throw new Error('ID phải là số nguyên');
        }
        
        const response = await testResultService.getTestResult(testResultId);
        if (response && response.data) {
          // The API response should contain the full test result data
          const result = response.data as any;
          
          // Map the API response to our TestResult interface
          const mappedResult: TestResult = {
            id: result.id || result.labTestID,
            labTestID: result.labTestID,
            customerID: result.customerID,
            customerName: result.customerName || `BN-${result.customerID || 'Unknown'}`,
            staffID: result.staffID,
            staffName: result.staffName || `NV-${result.staffID || 'Unknown'}`,
            treatmentID: result.treatmentID,
            testName: result.testName,
            testType: result.testType,
            result: result.result,
            referenceRange: result.referenceRange,
            unit: result.unit,
            isPositive: result.isPositive,
            testDate: result.testDate
          };
          
          setTestResult(mappedResult);
        } else {
          throw new Error('Không tìm thấy kết quả xét nghiệm');
        }
      } catch (err) {
        console.error('Error fetching test result:', err);
        setError('Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [id]);

  // Helper: get test type info by name
  const getTestTypeInfo = (testName: string) => {
    return TEST_TYPES.find(t => t.name === testName);
  };

  // Helper: auto check positive/negative
  const autoCheckIsPositive = (testName: string, result: string): boolean | undefined => {
    const info = getTestTypeInfo(testName);
    if (!info || !result) return undefined;
    // Simple rules for demo: handle numeric and string cases
    // Numeric: parse and compare
    const ref = info.referenceRange.trim();
    const resNum = parseFloat(result.replace(/[^0-9.\-eE]/g, ''));
    if (ref.startsWith('<')) {
      const refVal = parseFloat(ref.replace('<', '').replace(/[^0-9.\-eE]/g, ''));
      if (!isNaN(resNum) && !isNaN(refVal)) {
        return resNum >= refVal; // >= ref: positive
      }
    } else if (ref.startsWith('>')) {
      const refVal = parseFloat(ref.replace('>', '').replace(/[^0-9.\-eE]/g, ''));
      if (!isNaN(resNum) && !isNaN(refVal)) {
        return resNum < refVal; // < ref: positive
      }
    }
    // String: check for "âm tính" (negative) or "dương tính" (positive)
    if (typeof result === 'string') {
      if (/âm tính/i.test(result)) return false;
      if (/dương tính/i.test(result)) return true;
    }
    return undefined;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setTestResult(prev => {
      if (!prev) return null;
      // Khi chọn loại xét nghiệm, tự động điền referenceRange và unit
      if (name === 'testName') {
        const info = getTestTypeInfo(value);
        return {
          ...prev,
          testName: value,
          referenceRange: info?.referenceRange || '',
          unit: info?.unit || '',
        };
      }
      // Khi nhập kết quả xét nghiệm, tự động xác định isPositive
      if (name === 'result') {
        const isPositive = autoCheckIsPositive(prev.testName || '', value);
        return {
          ...prev,
          result: value,
          isPositive: isPositive !== undefined ? isPositive : prev.isPositive,
        };
      }
      // Không cho phép chỉnh checkbox bằng tay
      if (name === 'isPositive') {
        return prev;
      }
      // Các trường khác
      return {
        ...prev,
        [name]: value
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testResult) return;

    setSaving(true);
    setError(null);
    
    try {
      // Convert our test result to match the API's UpdateLabTestRequest schema
      const apiRequest: UpdateLabTestRequest = {
        labTestID: testResult.labTestID || Number(testResult.id),
        customerID: testResult.customerID || testResult.userId || '',
        staffID: testResult.staffID || '',
        treatmentID: testResult.treatmentID,
        testName: testResult.testName || testResult.testType || '',
        result: testResult.result || '',
        referenceRange: testResult.referenceRange,
        unit: testResult.unit,
        isPositive: testResult.isPositive,
        testDate: testResult.testDate || ''
      };
      
      await testResultService.updateTestResult(apiRequest);
      
      // Navigate back to the test result view page after successful save
      navigate(`/staff/test-results`);
    } catch (err) {
      console.error('Error updating test result:', err);
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

  if (error || !testResult) {
    return (
      <div className="test-result-edit">
        <div className="error-container">
          <p>{error || 'Không tìm thấy kết quả xét nghiệm'}</p>
          <button onClick={() => navigate('/staff/test-results')} className="back-button">
            <FaArrowLeft /> Quay lại danh sách kết quả
          </button>
        </div>
          </div>
    );
  }

  return (
    <div className="test-result-edit">
      <div className="page-header">
        <h1 className="page-title">Chỉnh Sửa Kết Quả Xét Nghiệm</h1>
        <p className="page-subtitle">ID: {testResult.labTestID || testResult.id}</p>
            </div>

      <form onSubmit={handleSubmit} className="test-result-edit-form">
        <div className="form-section">
          <h3 className="form-section-title">Thông tin cơ bản</h3>
          
          <div className="form-group">
            <label htmlFor="customerID">Bệnh nhân <span className="required">*</span></label>
            <div className="patient-info">
              <div className="patient-name">{testResult.customerName || 'N/A'}</div>
            </div>
            <input
              type="hidden"
              id="customerID"
              name="customerID"
              value={testResult.customerID || testResult.userId || ''}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="staffID">Nhân viên thực hiện <span className="required">*</span></label>
            <div className="staff-info">
              <div className="staff-name">{testResult.staffName || 'N/A'}</div>
            </div>
            <input
              type="hidden"
              id="staffID"
              name="staffID"
              value={testResult.staffID || ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="testName">Loại xét nghiệm <span className="required">*</span></label>
            <select
              id="testName"
              name="testName"
              value={testResult.testName || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn loại xét nghiệm --</option>
              {TEST_TYPES.map(testType => (
                <option key={testType.id} value={testType.name}>
                  {testType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="treatmentID">Mã điều trị</label>
            <div className="treatment-info">
              <div className="treatment-id">APT-{testResult.treatmentID || 'N/A'}</div>
            </div>
            <input
              type="hidden"
              id="treatmentID"
              name="treatmentID"
              value={testResult.treatmentID || ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="testDate">Ngày xét nghiệm <span className="required">*</span></label>
            <input
              type="date"
              id="testDate"
              name="testDate"
              value={testResult.testDate || ''}
              onChange={handleInputChange}
              required
            />
          </div>
            </div>

        <div className="form-section">
          <h3 className="form-section-title">Kết quả xét nghiệm</h3>
          <div className="form-row grouped-result-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1.5, minWidth: 180 }}>
              <label htmlFor="referenceRange">Phạm vi tham chiếu</label>
              <div style={{ fontWeight: 500 }}>{testResult.referenceRange || <span style={{ color: '#aaa' }}>Chưa có</span>}</div>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
              <label htmlFor="unit">Đơn vị đo</label>
              <div style={{ fontWeight: 500 }}>{testResult.unit || <span style={{ color: '#aaa' }}>Chưa có</span>}</div>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
              <label htmlFor="result">Kết quả xét nghiệm <span className="required">*</span></label>
              <input
                type="text"
                id="result"
                name="result"
                value={testResult.result || ''}
                onChange={handleInputChange}
                placeholder="Nhập kết quả"
                required
                style={{ minHeight: 32 }}
              />
            </div>
          </div>
          {/* Giá trị bình thường */}
          <div style={{ marginTop: 4, marginBottom: 8, color: '#666', fontSize: 13 }}>
            Giá trị bình thường: <span style={{ fontWeight: 500 }}>
              {getTestTypeInfo(testResult.testName || '')?.normalRange || <span style={{ color: '#aaa' }}>Chưa có</span>}
            </span>
          </div>
          {/* Kết luận */}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontWeight: 500, marginBottom: 2, display: 'block' }}>Kết luận</label>
            <input
              type="text"
              value={typeof testResult.isPositive === 'boolean' ? (testResult.isPositive ? 'Dương tính' : 'Âm tính') : ''}
              readOnly
              style={{
                width: '100%',
                background: '#f8f8f8',
                border: '1px solid #e0e0e0',
                color: testResult.isPositive === true ? '#d32f2f' : testResult.isPositive === false ? '#388e3c' : '#333',
                fontWeight: 600,
                textAlign: 'center',
                fontSize: 17,
                padding: '6px 0',
                marginTop: 2
              }}
              tabIndex={-1}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button 
                type="button" 
            className="btn btn-secondary"
                onClick={handleCancel}
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
  );
};

export default TestResultEdit; 