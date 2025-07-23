import React, { useState, type ChangeEvent } from 'react';
import './TestResultForm.css';
import testResultService from '../../services/testResultService';
import { useNavigate } from 'react-router-dom';
import type { CreateLabTestRequest } from '../../utils/api';

interface TestResultFormProps {
  appointmentId?: number;
  patientName?: string;
  patientPhone?: string;
  service?: string;
  date?: string;
  time?: string;
  onSave?: (results: CreateLabTestRequest) => void;
  onCancel?: () => void;
  initialData?: CreateLabTestRequest;
}

const TestResultForm = ({
  appointmentId,
  patientName,
  patientPhone,
  service,
  date,
  time,
  onSave,
  onCancel,
  initialData
}: TestResultFormProps) => {
  const navigate = useNavigate();
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const staffId = localStorage.getItem('userId') || localStorage.getItem('AccountID') || '';

  // Initialize form state
  const [formData, setFormData] = useState<CreateLabTestRequest>(
    initialData || {
      customerID: '',
      staffID: staffId,
      treatmentID: appointmentId || null,
      testName: service || '',
      result: '',
      referenceRange: '',
      unit: '',
      isPositive: false,
      testDate: getCurrentDate()
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } 
    // Handle number inputs
    else if (name === 'treatmentID') {
      // Convert to number or null if empty
      const numValue = value.trim() === '' ? null : parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: numValue
      });
    }
    // Handle other inputs
    else {
    setFormData({
      ...formData,
      [name]: value
    });
    }
  };

  // Prepare data for submission
  const prepareDataForSubmission = (): CreateLabTestRequest => {
    // Create a clean copy of the form data
    const cleanData = { ...formData };
    
    // Ensure treatmentID is either a number or null, not an empty string or undefined
    if (cleanData.treatmentID === undefined) {
      cleanData.treatmentID = null;
    }
    
    // Ensure other fields have proper types
    if (cleanData.referenceRange === '') {
      cleanData.referenceRange = undefined;
    }
    
    if (cleanData.unit === '') {
      cleanData.unit = undefined;
    }
    
    return cleanData;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submissionData = prepareDataForSubmission();
      console.log('Submitting data:', submissionData);
      
      // Gửi dữ liệu đúng theo schema API trong swagger.json
      await testResultService.createTestResult(submissionData);
      setSuccess(true);
      setTimeout(() => {
        if (onSave) {
          onSave(submissionData);
        } else {
          navigate('/staff/test-results');
        }
      }, 1500);
    } catch (err) {
      console.error("Error creating test result:", err);
      setError("Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/staff/test-results');
    }
  };

  return (
    <div className="test-result-form-container">
      <div className="page-header">
        <h1 className="page-title">Nhập Kết Quả Xét Nghiệm Mới</h1>
        <p className="page-subtitle">Nhập thông tin kết quả xét nghiệm cho bệnh nhân</p>
      </div>

      <div className="test-result-form-content">
        {patientName && (
        <div className="patient-info-card">
          <div className="patient-info-header">Thông tin bệnh nhân</div>
          <div className="patient-info-content">
            <div className="patient-info-row">
              <div className="patient-info-label">Họ tên:</div>
              <div className="patient-info-value">{patientName}</div>
            </div>
              {patientPhone && (
            <div className="patient-info-row">
              <div className="patient-info-label">Số điện thoại:</div>
              <div className="patient-info-value">{patientPhone}</div>
            </div>
              )}
              {service && (
            <div className="patient-info-row">
              <div className="patient-info-label">Dịch vụ:</div>
              <div className="patient-info-value">{service}</div>
            </div>
              )}
              {date && time && (
            <div className="patient-info-row">
              <div className="patient-info-label">Ngày & giờ hẹn:</div>
              <div className="patient-info-value">{date} {time}</div>
            </div>
              )}
            </div>
          </div>
        )}

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Đã lưu kết quả xét nghiệm thành công!</h3>
            <p>Đang chuyển hướng về trang quản lý kết quả...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="test-result-form">
            <div className="form-group">
              <label htmlFor="customerID">ID Khách hàng <span className="required">*</span></label>
              <input
                type="text"
                id="customerID"
                name="customerID"
                value={formData.customerID}
                onChange={handleInputChange}
                required
                placeholder="Nhập ID khách hàng"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="staffID">ID Nhân viên <span className="required">*</span></label>
              <input
                type="text"
                id="staffID"
                name="staffID"
                value={formData.staffID}
                onChange={handleInputChange}
                required
                placeholder="Nhập ID nhân viên"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="treatmentID">Mã điều trị</label>
              <input
                type="number"
                id="treatmentID"
                name="treatmentID"
                value={formData.treatmentID === null ? '' : formData.treatmentID}
                onChange={handleInputChange}
                placeholder="Nhập mã điều trị (nếu có)"
              />
        </div>

          <div className="form-group">
              <label htmlFor="testName">Loại xét nghiệm <span className="required">*</span></label>
            <select
                id="testName"
                name="testName"
                value={formData.testName}
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

          <div className="form-group">
              <label htmlFor="result">Kết quả xét nghiệm <span className="required">*</span></label>
            <textarea
                id="result"
                name="result"
              rows={4}
                value={formData.result}
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
                  value={formData.referenceRange || ''}
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
                  value={formData.unit || ''}
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
                checked={formData.isPositive || false}
                onChange={handleInputChange}
              />
              <label htmlFor="isPositive">Kết quả dương tính</label>
            </div>

            <div className="form-group">
              <label htmlFor="testDate">Ngày xét nghiệm <span className="required">*</span></label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
                onClick={handleCancel}
                disabled={isSubmitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-button"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default TestResultForm; 