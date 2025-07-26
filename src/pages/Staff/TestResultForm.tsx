import React, { useState, useEffect, type ChangeEvent } from 'react';
import registerBg from '../../assets/images/register-bg.jpg';
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

// Grouped test types for professional table input
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

// State for all test results in table
type TestTable = Record<string, { result: string; conclusion: string }>;
const useTestTable = () => {
  const [testTable, setTestTable] = useState<TestTable>(() => {
    const table: TestTable = {};
    GROUPED_TEST_TYPES.forEach(group => {
      group.tests.forEach(test => {
        table[test.id] = { result: '', conclusion: '' };
      });
    });
    return table;
  });
  const handleTestTableChange = (testId: string, value: string) => {
    setTestTable(prev => {
      const newTable = { ...prev };
      let conclusion = '';
      if (value.trim() === '') {
        conclusion = '';
      } else if (value.toLowerCase().includes('âm')) {
        conclusion = 'Âm Tính';
      } else if (value.toLowerCase().includes('dương')) {
        conclusion = 'Dương Tính';
      } else {
        const num = parseFloat(value.replace(',', '.'));
        if (!isNaN(num)) {
          conclusion = num >= 1 ? 'Dương Tính' : 'Âm Tính';
        }
      }
      newTable[testId] = { result: value, conclusion };
      return newTable;
    });
  };
  return { testTable, handleTestTableChange };
};

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

  // Get staff name from localStorage (hoặc token nếu có)
  const staffName = localStorage.getItem('staffName') || '';
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

  const { testTable, handleTestTableChange } = useTestTable();
  const [note, setNote] = useState('');
  const [appointmentCode, setAppointmentCode] = useState('');
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);
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


  // Handle input changes (only for non-test-table fields)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (name === 'treatmentID') {
      const numValue = value.trim() === '' ? null : parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Prepare data for submission: collect all filled test results from testTable
  const prepareDataForSubmission = () => {
    // Collect all test results that have a value
    const testResults = Object.entries(testTable)
      .filter(([, v]) => v.result.trim() !== '')
      .map(([testId, v]) => {
        // Find test info from GROUPED_TEST_TYPES
        let testInfo: { id: string; name: string; referenceRange: string; unit: string } | null = null;
        for (const group of GROUPED_TEST_TYPES) {
          const found = group.tests.find(t => t.id === testId);
          if (found) {
            testInfo = found;
            break;
          }
        }
        return {
          customerID: formData.customerID,
          staffID: formData.staffID,
          treatmentID: formData.treatmentID,
          testName: testInfo ? testInfo.name : testId,
          result: v.result,
          referenceRange: testInfo ? testInfo.referenceRange : '',
          unit: testInfo ? testInfo.unit : '',
          isPositive: v.conclusion === 'Dương Tính',
          testDate: formData.testDate
        };
      });
    return testResults;
  };

  // Handle form submission for all filled test results
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const submissionData = prepareDataForSubmission();
      if (submissionData.length === 0) {
        throw new Error('Vui lòng nhập ít nhất một kết quả xét nghiệm.');
      }
      // Validate required fields for each test
      for (const data of submissionData) {
        if (!data.customerID) throw new Error('Customer ID is required. Vui lòng nhập mã lịch hẹn hợp lệ.');
        if (!data.staffID) throw new Error('Staff ID is required.');
        if (!data.testName) throw new Error('Test name is required.');
        if (!data.result) throw new Error('Test result is required.');
        if (!data.testDate) throw new Error('Test date is required.');
      }
      // Submit each test result
      let allSuccess = true;
      for (const data of submissionData) {
        try {
          const response = await testResultService.createTestResult(data);
          if (!(response && (response.statusCode === 200 || response.statusCode === 201))) {
            allSuccess = false;
            throw new Error(response?.message || 'Unexpected response from server');
          }
        } catch (err) {
          allSuccess = false;
          throw err;
        }
      }
      if (allSuccess) {
        setSuccess(true);
        setError(null);
        setTimeout(() => {
          if (onSave) {
            // If onSave expects a single result, pass the first; else, pass all
            onSave(Array.isArray(submissionData) ? submissionData[0] : submissionData);
          } else {
            navigate('/staff/test-results');
          }
        }, 1500);
      }
    } catch (err: unknown) {
      let errorMessage = 'Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.';
      if (typeof err === 'object' && err !== null) {
        // Try to extract message
        if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
          errorMessage = (err as { message: string }).message;
        } else if ('data' in err && typeof (err as { data?: unknown }).data === 'object' && (err as { data?: { message?: unknown } }).data !== null) {
          const dataObj = (err as { data: { message?: unknown } }).data;
          if ('message' in dataObj && typeof dataObj.message === 'string') {
            errorMessage = dataObj.message;
          }
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 16, marginBottom: 24 }}>
        <img src={registerBg} alt="Logo" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>PHÒNG KHÁM SỨC KHỎE GIỚI TÍNH</h1>
          <div style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>BẢNG KẾT QUẢ XÉT NGHIỆM</div>
        </div>
      </div>

      <div className="test-result-form-content" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 900, margin: '0 auto' }}>
        {/* Thông tin bệnh nhân và xét nghiệm */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Họ tên bệnh nhân:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{customerInfo?.name || patientName || '-'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Số điện thoại:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{customerInfo?.phone || patientPhone || '-'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Mã lịch hẹn:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{appointmentCode || '-'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Tên nhân viên thực hiện:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{staffName ? staffName : 'Nhân viên'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Ngày xét nghiệm:</div>
            <div style={{ fontSize: 16, color: '#1e293b', minHeight: 24 }}>{formData.testDate}</div>
          </div>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Đã lưu kết quả xét nghiệm thành công!</h3>
            <p>Đang chuyển hướng về trang quản lý kết quả...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="test-result-form">
            {/* Appointment Code Input */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="appointmentCode">Mã lịch hẹn <span className="required">*</span></label>
              <input
                type="text"
                id="appointmentCode"
                name="appointmentCode"
                value={appointmentCode}
                onChange={handleAppointmentCodeChange}
                required
                placeholder="Nhập mã lịch hẹn để tìm thông tin khách hàng"
                style={{ textTransform: 'uppercase', width: 220 }}
              />
              {isLoadingCustomer && (
                <div className="loading-text">Đang tìm kiếm thông tin khách hàng...</div>
              )}
            </div>

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

            {/* Test Date */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="testDate">Ngày xét nghiệm <span className="required">*</span></label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleInputChange}
                required
                style={{ width: 180 }}
              />
            </div>

            {/* Ghi chú */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="note">Ghi chú thêm (nếu có):</label>
              <textarea
                id="note"
                name="note"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                style={{ width: '100%', borderRadius: 6, border: '1px solid #cbd5e1', padding: 8, fontSize: 15 }}
                placeholder="Nhập ghi chú cho kết quả xét nghiệm, ví dụ: Đề nghị tái khám sau 1 tháng..."
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Chữ ký nhân viên và nút lưu */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 32 }}>
              <div style={{ fontWeight: 600, color: '#334155', fontSize: 16 }}>
                Nhân viên thực hiện:<br />
                <span style={{ display: 'inline-block', minWidth: 180, minHeight: 32, borderBottom: '1px dotted #64748b', marginTop: 12 }}>
                  {staffName ? staffName : 'Nhân viên'}
                </span>
              </div>
              <div className="form-actions" style={{ display: 'flex', gap: 16 }}>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 20px', fontWeight: 600 }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting || !customerInfo || Object.values(testTable).every(v => !v.result.trim())}
                  title={
                    !customerInfo ? "Vui lòng nhập mã lịch hẹn hợp lệ" :
                    Object.values(testTable).every(v => !v.result.trim()) ? "Vui lòng nhập ít nhất một kết quả xét nghiệm" :
                    "Lưu kết quả xét nghiệm"
                  }
                  style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 28px', fontWeight: 700, fontSize: 16 }}
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestResultForm; 