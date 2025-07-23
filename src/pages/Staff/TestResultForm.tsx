import React, { useState, useEffect, type ChangeEvent } from 'react';
import './TestResultForm.css';
import testResultService from '../../services/testResultService';
import { useNavigate } from 'react-router-dom';
import type { CreateLabTestRequest, AppointmentData } from '../../utils/api';
import { authUtils } from '../../utils/auth';
import { appointmentAPI } from '../../utils/api';

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

// Test types with proper medical names and reference ranges
const TEST_TYPES = [
  {
    id: 'hiv_antibody',
    name: 'Xét nghiệm kháng thể HIV (HIV Antibody Test)',
    referenceRange: '< 1.0 S/CO',
    unit: 'S/CO',
    normalRange: 'Âm tính (< 1.0)'
  },
  {
    id: 'hiv_rna',
    name: 'Xét nghiệm RNA HIV (HIV RNA Quantitative)',
    referenceRange: '< 20 copies/mL',
    unit: 'copies/mL',
    normalRange: 'Không phát hiện (< 20)'
  },
  {
    id: 'chlamydia_pcr',
    name: 'Xét nghiệm Chlamydia trachomatis (PCR)',
    referenceRange: 'Âm tính',
    unit: 'định tính',
    normalRange: 'Âm tính'
  },
  {
    id: 'gonorrhea_pcr',
    name: 'Xét nghiệm Neisseria gonorrhoeae (PCR)',
    referenceRange: 'Âm tính',
    unit: 'định tính',
    normalRange: 'Âm tính'
  },
  {
    id: 'syphilis_rpr',
    name: 'Xét nghiệm giang mai RPR (Syphilis RPR)',
    referenceRange: 'Non-reactive',
    unit: 'định tính',
    normalRange: 'Non-reactive'
  },
  {
    id: 'syphilis_tpha',
    name: 'Xét nghiệm giang mai TPHA (Syphilis TPHA)',
    referenceRange: 'Non-reactive',
    unit: 'định tính',
    normalRange: 'Non-reactive'
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
    id: 'hepatitis_c_rna',
    name: 'Xét nghiệm RNA viêm gan C (HCV RNA)',
    referenceRange: 'Không phát hiện',
    unit: 'IU/mL',
    normalRange: 'Không phát hiện'
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
  },
  {
    id: 'hpv_dna',
    name: 'Xét nghiệm DNA Human Papillomavirus (HPV)',
    referenceRange: 'Âm tính',
    unit: 'định tính',
    normalRange: 'Âm tính'
  },
  {
    id: 'trichomonas',
    name: 'Xét nghiệm Trichomonas vaginalis',
    referenceRange: 'Âm tính',
    unit: 'định tính',
    normalRange: 'Âm tính'
  },
  {
    id: 'mycoplasma',
    name: 'Xét nghiệm Mycoplasma genitalium',
    referenceRange: 'Âm tính',
    unit: 'định tính',
    normalRange: 'Âm tính'
  },
  {
    id: 'ureaplasma',
    name: 'Xét nghiệm Ureaplasma urealyticum',
    referenceRange: '< 10^4 CFU/mL',
    unit: 'CFU/mL',
    normalRange: '< 10^4 CFU/mL'
  }
];

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

  // Get staff ID from token
  const staffId = authUtils.getCurrentUserId() || '';

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

  const [appointmentCode, setAppointmentCode] = useState('');
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<typeof TEST_TYPES[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // Effect to auto-populate staff ID from token
  useEffect(() => {
    const currentStaffId = authUtils.getCurrentUserId();
    if (currentStaffId && currentStaffId !== formData.staffID) {
      setFormData(prev => ({
        ...prev,
        staffID: currentStaffId
      }));
    }
  }, [formData.staffID]);

  // Function to get customer info from appointment code
  const getCustomerFromAppointmentCode = async (code: string) => {
    if (!code.trim()) {
      setCustomerInfo(null);
      setFormData(prev => ({ ...prev, customerID: '' }));
      return;
    }

    setIsLoadingCustomer(true);
    setError(null);

    try {
      // Get all appointments and find the one with matching appointment code
      const response = await appointmentAPI.getAllAppointments();
      
      if (response.data) {
        const appointment = response.data.find(
          (apt: AppointmentData) => {
            const appointmentCode = apt.appointmentCode;
            return appointmentCode && appointmentCode.toLowerCase() === code.toLowerCase();
          }
        );

        if (appointment && appointment.customer) {
          const customer = {
            name: appointment.customer.name || 'Không có tên',
            phone: appointment.customer.phone || 'Không có SĐT'
          };
          
          setCustomerInfo(customer);
          
          // Determine treatmentID priority:
          // 1. treatmentOutcome.treatmentID (if available)
          // 2. treatmentID (if available)
          // 3. appointmentID as fallback
          // 4. null if none available
          let treatmentId = null;
          
          if (appointment.treatmentOutcome?.treatmentID) {
            treatmentId = appointment.treatmentOutcome.treatmentID;
            console.log('📋 Using treatmentOutcome.treatmentID:', treatmentId);
          } else if (appointment.treatmentID) {
            treatmentId = appointment.treatmentID;
            console.log('📋 Using appointment.treatmentID:', treatmentId);
          } else {
            // Use appointmentID as treatmentID since API might expect this relationship
            treatmentId = appointment.appointmentID;
            console.log('📋 Using appointmentID as treatmentID:', treatmentId);
          }
          
          setFormData(prev => ({
            ...prev,
            customerID: appointment.customerID,
            treatmentID: treatmentId
          }));
          
          console.log('✅ Customer info set:', customer);
          console.log('✅ CustomerID set to:', appointment.customerID);
          console.log('✅ TreatmentID set to:', treatmentId);
        } else {
          setError('Không tìm thấy lịch hẹn với mã này');
          setCustomerInfo(null);
          setFormData(prev => ({ ...prev, customerID: '', treatmentID: null }));
        }
      }
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('Không thể tìm kiếm thông tin lịch hẹn. Vui lòng thử lại.');
      setCustomerInfo(null);
      setFormData(prev => ({ ...prev, customerID: '', treatmentID: null }));
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  // Handle appointment code change
  const handleAppointmentCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setAppointmentCode(code);
    
    // Clear previous customer info immediately when code changes
    if (!code.trim()) {
      setCustomerInfo(null);
      setFormData(prev => ({ ...prev, customerID: '', treatmentID: null }));
      return;
    }
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      getCustomerFromAppointmentCode(code);
    }, 500);
    
    // Cleanup function to cancel previous timeout
    return () => clearTimeout(timeoutId);
  };

  // Handle test type selection
  const handleTestTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const testTypeId = e.target.value;
    const testType = TEST_TYPES.find(t => t.id === testTypeId);
    
    setSelectedTestType(testType || null);
    
    if (testType) {
      setFormData(prev => ({
        ...prev,
        testName: testType.name,
        referenceRange: testType.referenceRange,
        unit: testType.unit
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        testName: '',
        referenceRange: '',
        unit: ''
      }));
    }
  };

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
    
    // Critical fix: Set treatmentID to null if no valid treatment exists
    // This prevents foreign key constraint violations
    if (!customerInfo || cleanData.treatmentID === undefined || cleanData.treatmentID === null) {
      console.log('⚠️ Setting treatmentID to null (no customer info or invalid treatmentID)');
      cleanData.treatmentID = null;
    } else {
      // Ensure treatmentID is a proper number
      cleanData.treatmentID = Number(cleanData.treatmentID);
      console.log('✅ treatmentID set to:', cleanData.treatmentID);
    }
    
    // Ensure other fields have proper types
    if (cleanData.referenceRange === '') {
      cleanData.referenceRange = undefined;
    }
    
    if (cleanData.unit === '') {
      cleanData.unit = undefined;
    }
    
    // Ensure testDate is in proper ISO format
    if (cleanData.testDate && !cleanData.testDate.includes('T')) {
      // Convert YYYY-MM-DD to ISO format
      cleanData.testDate = new Date(cleanData.testDate + 'T00:00:00.000Z').toISOString();
    }
    
    console.log('🔧 Data after preparation:', cleanData);
    console.log('🔧 treatmentID status:', {
      treatmentID: cleanData.treatmentID,
      hasCustomerInfo: !!customerInfo,
      treatmentIDType: typeof cleanData.treatmentID
    });
    
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
      console.log('🔍 Form data being submitted:', submissionData);
      
      // Validate required fields
      if (!submissionData.customerID) {
        throw new Error('Customer ID is required. Please enter a valid appointment code first.');
      }
      if (!submissionData.staffID) {
        throw new Error('Staff ID is required.');
      }
      if (!submissionData.testName) {
        throw new Error('Test name is required. Please select a test type.');
      }
      if (!submissionData.result) {
        throw new Error('Test result is required.');
      }
      if (!submissionData.testDate) {
        throw new Error('Test date is required.');
      }
      
      console.log('✅ Validation passed, sending to API...');
      
      // First attempt: Send data as prepared
      let response;
      try {
        response = await testResultService.createTestResult(submissionData);
        console.log('🎉 API Response (first attempt):', response);
      } catch (firstError) {
        console.log('❌ First attempt failed, trying without treatmentID...');
        
        // Second attempt: Try without treatmentID if first attempt fails
        const fallbackData = { ...submissionData, treatmentID: null };
        console.log('🔄 Fallback data (no treatmentID):', fallbackData);
        
        try {
          response = await testResultService.createTestResult(fallbackData);
          console.log('🎉 API Response (fallback attempt):', response);
        } catch (secondError) {
          console.error('❌ Both attempts failed:', { firstError, secondError });
          throw firstError; // Throw the original error
        }
      }
      
      if (response && (response.statusCode === 200 || response.statusCode === 201)) {
        console.log('✅ Test result created successfully');
        setSuccess(true);
        setError(null);
        
        setTimeout(() => {
          if (onSave) {
            onSave(submissionData);
          } else {
            navigate('/staff/test-results');
          }
        }, 1500);
      } else {
        throw new Error(response?.message || 'Unexpected response from server');
      }
    } catch (err: unknown) {
      console.error("❌ Error creating test result:", err);
      let errorMessage = "Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.";
      
      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
          errorMessage = err.data.message as string;
        }
      }
      
      setError(errorMessage);
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
        {/* Patient info from appointment code */}
        {customerInfo && (
          <div className="patient-info-card">
            <div className="patient-info-header">Thông tin bệnh nhân</div>
            <div className="patient-info-content">
              <div className="patient-info-row">
                <div className="patient-info-label">Họ tên:</div>
                <div className="patient-info-value">{customerInfo.name}</div>
              </div>
              <div className="patient-info-row">
                <div className="patient-info-label">Số điện thoại:</div>
                <div className="patient-info-value">{customerInfo.phone}</div>
              </div>
              <div className="patient-info-row">
                <div className="patient-info-label">Mã lịch hẹn:</div>
                <div className="patient-info-value">{appointmentCode}</div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy patient info display */}
        {!customerInfo && patientName && (
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
            {/* Appointment Code Input */}
            <div className="form-group">
              <label htmlFor="appointmentCode">Mã lịch hẹn <span className="required">*</span></label>
              <input
                type="text"
                id="appointmentCode"
                name="appointmentCode"
                value={appointmentCode}
                onChange={handleAppointmentCodeChange}
                required
                placeholder="Nhập mã lịch hẹn để tìm thông tin khách hàng"
                style={{ textTransform: 'uppercase' }}
              />
              {isLoadingCustomer && (
                <div className="loading-text">Đang tìm kiếm thông tin khách hàng...</div>
              )}
            </div>
            
            {/* Staff ID - Auto-populated from token, read-only */}
            <div className="form-group">
              <label htmlFor="staffID">ID Nhân viên <span className="required">*</span></label>
              <input
                type="text"
                id="staffID"
                name="staffID"
                value={formData.staffID}
                readOnly
                placeholder="ID nhân viên từ hệ thống"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <div className="field-note">ID nhân viên được tự động lấy từ tài khoản đăng nhập</div>
            </div>
            
            {/* Test Type Selection */}
            <div className="form-group">
              <label htmlFor="testType">Loại xét nghiệm <span className="required">*</span></label>
              <select
                id="testType"
                name="testType"
                value={selectedTestType?.id || ''}
                onChange={handleTestTypeChange}
                required
              >
                <option value="">-- Chọn loại xét nghiệm --</option>
                {TEST_TYPES.map(testType => (
                  <option key={testType.id} value={testType.id}>
                    {testType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Name - Auto-filled based on test type */}
            <div className="form-group">
              <label htmlFor="testName">Tên xét nghiệm</label>
              <input
                type="text"
                id="testName"
                name="testName"
                value={formData.testName}
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                placeholder="Được tự động điền khi chọn loại xét nghiệm"
              />
            </div>

            {/* Test Result */}
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

            {/* Reference Range and Unit */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="referenceRange">Phạm vi tham chiếu</label>
                <input
                  type="text"
                  id="referenceRange"
                  name="referenceRange"
                  value={formData.referenceRange || ''}
                  onChange={handleInputChange}
                  placeholder="Được tự động điền từ loại xét nghiệm"
                  style={{ backgroundColor: selectedTestType ? '#f5f5f5' : 'white' }}
                  readOnly={!!selectedTestType}
                />
                {selectedTestType && (
                  <div className="field-note">Giá trị bình thường: {selectedTestType.normalRange}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unit">Đơn vị đo</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit || ''}
                  onChange={handleInputChange}
                  placeholder="Được tự động điền từ loại xét nghiệm"
                  style={{ backgroundColor: selectedTestType ? '#f5f5f5' : 'white' }}
                  readOnly={!!selectedTestType}
                />
              </div>
            </div>
            
            {/* Positive Result Toggle - Enhanced UI */}
            <div className="form-group checkbox-group">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="isPositive"
                  name="isPositive"
                  checked={formData.isPositive || false}
                  onChange={handleInputChange}
                  className="positive-checkbox"
                />
                <label htmlFor="isPositive" className="positive-label">
                  <span className={`positive-indicator ${formData.isPositive ? 'positive' : 'negative'}`}>
                    {formData.isPositive ? '●' : '○'}
                  </span>
                  Kết quả dương tính
                </label>
              </div>
              <div className="field-note">
                {formData.isPositive 
                  ? "⚠️ Kết quả dương tính - cần theo dõi và điều trị" 
                  : "✓ Kết quả âm tính - bình thường"
                }
              </div>
            </div>

            {/* Test Date */}
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
                disabled={isSubmitting || !customerInfo || !formData.testName || !formData.result}
                title={
                  !customerInfo ? "Vui lòng nhập mã lịch hẹn hợp lệ" :
                  !formData.testName ? "Vui lòng chọn loại xét nghiệm" :
                  !formData.result ? "Vui lòng nhập kết quả xét nghiệm" :
                  "Lưu kết quả xét nghiệm"
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu kết quả'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestResultForm; 