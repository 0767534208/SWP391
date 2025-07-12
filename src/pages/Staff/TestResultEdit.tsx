import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultEdit.css';
import { FaArrowLeft } from 'react-icons/fa';
import testResultService from '../../services/testResultService';
import type { UpdateLabTestRequest } from '../../types';

interface TestResult {
  id?: number | string;
  labTestID?: number;
  userId?: string;
  customerID?: string;
  staffID?: string;
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
        
        const response = await testResultService.getTestResult(id);
        if (response && response.data) {
          setTestResult(response.data);
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setTestResult(prev => prev ? {
        ...prev,
        [name]: checkbox.checked
      } : null);
    } else {
      setTestResult(prev => prev ? {
        ...prev,
        [name]: value
      } : null);
    }
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
            <label htmlFor="customerID">ID Khách hàng <span className="required">*</span></label>
                  <input
                    type="text"
              id="customerID"
              name="customerID"
              value={testResult.customerID || testResult.userId || ''}
              onChange={handleInputChange}
              required
                  />
                </div>
          
          <div className="form-group">
            <label htmlFor="staffID">ID Nhân viên <span className="required">*</span></label>
                  <input
                    type="text"
              id="staffID"
              name="staffID"
              value={testResult.staffID || ''}
              onChange={handleInputChange}
              required
                  />
                </div>

          <div className="form-group">
            <label htmlFor="testName">Loại xét nghiệm <span className="required">*</span></label>
            <select
              id="testName"
              name="testName"
              value={testResult.testName || testResult.testType || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn loại xét nghiệm --</option>
              <option value="Xét nghiệm HIV">Xét nghiệm HIV</option>
              <option value="Xét nghiệm STI tổng quát">Xét nghiệm STI tổng quát</option>
              <option value="Xét nghiệm Chlamydia">Xét nghiệm Chlamydia</option>
              <option value="Xét nghiệm Gonorrhea">Xét nghiệm Gonorrhea</option>
              <option value="Xét nghiệm Syphilis">Xét nghiệm Syphilis</option>
              <option value="Xét nghiệm Hepatitis B">Xét nghiệm Hepatitis B</option>
              <option value="Xét nghiệm Hepatitis C">Xét nghiệm Hepatitis C</option>
              <option value="Khác">Khác</option>
            </select>
                </div>

          <div className="form-row">
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
            
            <div className="form-group">
              <label htmlFor="treatmentID">Mã điều trị</label>
                  <input
                type="number"
                id="treatmentID"
                name="treatmentID"
                value={testResult.treatmentID || ''}
                onChange={handleInputChange}
                placeholder="Mã điều trị (nếu có)"
                  />
                </div>
              </div>
            </div>

        <div className="form-section">
          <h3 className="form-section-title">Kết quả xét nghiệm</h3>
          
          <div className="form-group">
            <label htmlFor="result">Kết quả xét nghiệm <span className="required">*</span></label>
            <textarea
              id="result"
              name="result"
              rows={4}
              value={testResult.result || ''}
              onChange={handleInputChange}
              placeholder="Nhập kết quả xét nghiệm chi tiết"
              required
            ></textarea>
              </div>
              
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="referenceRange">Phạm vi tham chiếu</label>
                    <input
                      type="text"
                id="referenceRange"
                name="referenceRange"
                value={testResult.referenceRange || ''}
                onChange={handleInputChange}
                placeholder="Ví dụ: < 0.9 index"
                    />
                  </div>
                  
            <div className="form-group">
              <label htmlFor="unit">Đơn vị đo</label>
                            <input
                              type="text"
                id="unit"
                name="unit"
                value={testResult.unit || ''}
                onChange={handleInputChange}
                placeholder="Ví dụ: mmol/L"
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
                            <input
              type="checkbox"
              id="isPositive"
              name="isPositive"
              checked={testResult.isPositive || false}
              onChange={handleInputChange}
                            />
            <label htmlFor="isPositive">Kết quả dương tính</label>
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