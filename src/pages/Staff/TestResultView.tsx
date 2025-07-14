import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultView.css';
import testResultService from '../../services/testResultService';
import type { LabTestData } from '../../utils/api';

const TestResultView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<LabTestData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResult = async () => {
      setLoading(true);
      setError(null);
      
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

  const handleBack = () => {
    navigate('/staff/test-results');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="test-result-loading">
        <div className="spinner"></div>
        <p>Đang tải kết quả...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-result-error">
        <div className="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2>Lỗi tải dữ liệu</h2>
        <p>{error}</p>
        <button className="back-button" onClick={handleBack}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="test-result-error">
        <div className="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2>Không tìm thấy kết quả</h2>
        <p>Không thể tìm thấy kết quả cho ID: {id}</p>
        <button className="back-button" onClick={handleBack}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="test-result-view">
      {/* Header */}
      <div className="result-header">
        <button className="back-button" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <h1>Kết Quả Xét Nghiệm</h1>
        <button className="print-button" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          In kết quả
        </button>
      </div>

      {/* Patient Info */}
      <div className="patient-info-section">
        <h2>Thông tin bệnh nhân</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Họ tên:</label>
            <span>{testResult.customer?.name || `BN-${testResult.customerID}`}</span>
          </div>
          <div className="info-item">
            <label>Mã bệnh nhân:</label>
            <span>{testResult.customerID}</span>
          </div>
          <div className="info-item">
            <label>Ngày xét nghiệm:</label>
            <span>{formatDate(testResult.testDate)}</span>
          </div>
          <div className="info-item">
            <label>Bác sĩ thực hiện:</label>
            <span>{testResult.staff?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="test-results-section">
        <h2>Kết quả xét nghiệm</h2>
        <div className="test-info">
          <div className="test-header">
            <h3>{testResult.testName}</h3>
            <span className="test-id">ID: {testResult.labTestID}</span>
          </div>
          
          <div className="result-content">
            <div className="result-item">
              <label>Kết quả:</label>
              <div className="result-value">
                {testResult.isPositive !== null ? (
                  <span className={`result-badge ${testResult.isPositive ? 'positive' : 'negative'}`}>
                    {testResult.isPositive ? 'Dương tính' : 'Âm tính'}
                  </span>
                ) : (
                  <span className="result-text">{testResult.result || 'N/A'}</span>
                )}
              </div>
            </div>

            {testResult.referenceRange && (
              <div className="result-item">
                <label>Giá trị tham chiếu:</label>
                <span>{testResult.referenceRange}</span>
              </div>
            )}

            {testResult.unit && (
              <div className="result-item">
                <label>Đơn vị:</label>
                <span>{testResult.unit}</span>
              </div>
            )}

            <div className="result-item">
              <label>Ngày thực hiện:</label>
              <span>{formatDateTime(testResult.testDate)}</span>
            </div>

            {testResult.treatmentID && (
              <div className="result-item">
                <label>Mã điều trị:</label>
                <span>{testResult.treatmentID}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="result-footer">
        <p>Kết quả được tạo vào: {formatDateTime(testResult.testDate)}</p>
        <p>Nhân viên thực hiện: {testResult.staff?.name || 'N/A'}</p>
      </div>
    </div>
  );
};

export default TestResultView; 