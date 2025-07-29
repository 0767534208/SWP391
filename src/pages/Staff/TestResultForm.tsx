
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


// Gom các loại vi khuẩn/virus vào từng nhóm xét nghiệm chính, nhóm còn lại để vào 'Vi khuẩn/Vi rút khác'
const TEST_TYPE_OPTIONS = [
  {
    type: 'HIV',
    tests: [
      { id: 'hiv', name: 'HIV Ag/Ab (Kháng nguyên/kháng thể HIV)', referenceRange: 'Âm tính: < 1.0 S/CO; Dương tính: ≥ 1.0 S/CO', unit: 'S/CO' },
      { id: 'hpv', name: 'HPV (Human Papillomavirus)', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
      { id: 'hsv', name: 'HSV (Herpes Simplex Virus)', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
    ],
  },
  {
    type: 'Giang mai',
    tests: [
      { id: 'rpr', name: 'RPR (Giang mai không đặc hiệu)', referenceRange: 'Âm tính: < 1.0 RU; Dương tính: ≥ 1.0 RU', unit: 'RU' },
      { id: 'tpha', name: 'TPHA (Giang mai đặc hiệu)', referenceRange: 'Âm tính: < 1.0 COI; Dương tính: ≥ 1.0 COI', unit: 'COI' },
      { id: 'chlamydia', name: 'Chlamydia trachomatis', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
      { id: 'gonorrhea', name: 'Lậu (Neisseria gonorrhoeae)', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
      { id: 'trichomonas', name: 'Trichomonas vaginalis', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
    ],
  },
  {
    type: 'Viêm gan',
    tests: [
      { id: 'hbsag', name: 'HBsAg (Viêm gan B)', referenceRange: 'Âm tính: < 0.05 IU/mL; Dương tính: ≥ 0.05 IU/mL', unit: 'IU/mL' },
      { id: 'anti_hbs', name: 'Anti-HBs (Kháng thể viêm gan B)', referenceRange: 'Âm tính: < 10 mIU/mL; Dương tính: ≥ 10 mIU/mL', unit: 'mIU/mL' },
      { id: 'anti_hcv', name: 'Anti-HCV (Viêm gan C)', referenceRange: 'Âm tính: < 1.0 S/CO; Dương tính: ≥ 1.0 S/CO', unit: 'S/CO' },
      { id: 'mycoplasma', name: 'Mycoplasma genitalium', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
      { id: 'ureaplasma', name: 'Ureaplasma urealyticum', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
    ],
  },
  {
    type: 'Vi khuẩn/Vi rút khác',
    tests: [
      { id: 'gardnerella', name: 'Gardnerella vaginalis', referenceRange: 'Âm Tính', unit: '', isBacteriaVirus: true },
    ],
  },
];


// Kiểu dữ liệu cho từng dòng xét nghiệm
type TestRow = {
  id: string;
  name: string;
  referenceRange: string;
  unit: string;
  result: string;
  conclusion: string;
  isCustom?: boolean; // true nếu là dòng thêm thủ công
  isBacteriaVirus?: boolean; // true nếu là dòng vi khuẩn/vi rút
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

  // Danh sách các dòng xét nghiệm động
  const [testRows, setTestRows] = useState<TestRow[]>([]);
 
  const [selectedTestTypes, setSelectedTestTypes] = useState<string[]>([]);
  // State cho dropdown custom
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Khi chọn loại xét nghiệm, tự động thêm các xét nghiệm mặc định vào bảng (không trùng)
  useEffect(() => {
    // Giữ lại các dòng custom (dòng thêm thủ công)
    const customRows = testRows.filter(row => row.isCustom);
    // Gom tất cả các test từ các loại đã chọn
    let allTests = selectedTestTypes.flatMap(type => {
      const found = TEST_TYPE_OPTIONS.find(opt => opt.type === type);
      if (!found) return [];
      return found.tests.map(test => {
        // Nếu đã có dữ liệu nhập thì giữ lại dữ liệu cũ
        const existed = testRows.find(row => row.id === test.id && !row.isCustom);
        if (existed) return existed;
        // Nếu là vi khuẩn/vi rút thì mặc định là âm tính
        if (test.isBacteriaVirus) {
          return { ...test, result: 'Âm Tính', conclusion: 'Âm Tính', isBacteriaVirus: true };
        }
        return { ...test, result: '', conclusion: '' };
      });
    });
    // Sắp xếp: test thường lên trên, vi khuẩn/virus xuống dưới
    const normalTests = allTests.filter(row => !row.isBacteriaVirus);
    const bacteriaVirusTests = allTests.filter(row => row.isBacteriaVirus);
    setTestRows([
      ...customRows,
      ...normalTests,
      ...bacteriaVirusTests
    ]);
    // eslint-disable-next-line
  }, [selectedTestTypes]);

  // Helper: tìm loại xét nghiệm theo id
  function getTestTypeByTestId(testId: string) {
    for (const opt of TEST_TYPE_OPTIONS) {
      if (opt.tests.some(t => t.id === testId)) return opt.type;
    }
    return '';
  }

  // Xử lý thay đổi kết quả xét nghiệm
  const handleTestRowChange = (idx: number, value: string) => {
    setTestRows(prev => {
      const newRows = [...prev];
      // Nếu là vi khuẩn/vi rút thì không cho nhập tay
      if (newRows[idx].isBacteriaVirus) {
        return newRows;
      }
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
      newRows[idx] = { ...newRows[idx], result: value, conclusion };
      return newRows;
    });
  };

  // Toggle kết quả cho vi khuẩn/vi rút
  const handleToggleBacteriaVirusResult = (idx: number) => {
    setTestRows(prev => {
      const newRows = [...prev];
      if (newRows[idx].isBacteriaVirus) {
        const current = newRows[idx].result === 'Dương Tính' ? 'Âm Tính' : 'Dương Tính';
        newRows[idx].result = current;
        newRows[idx].conclusion = current;
      }
      return newRows;
    });
  };

  // Thêm dòng xét nghiệm mới (tùy ý)
  const handleAddTestRow = () => {
    setTestRows(prev => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        name: '',
        referenceRange: '',
        unit: '',
        result: '',
        conclusion: '',
        isCustom: true,
      },
    ]);
  };

  // Xóa dòng xét nghiệm
  const handleRemoveTestRow = (idx: number) => {
    setTestRows(prev => prev.filter((_, i) => i !== idx));
  };
  const [note, setNote] = useState('');
  const [appointmentCode, setAppointmentCode] = useState('');
  const [allAppointmentCodes, setAllAppointmentCodes] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // Fetch all appointment codes for dropdown
  useEffect(() => {
    async function fetchAllCodes() {
      try {
        const response = await appointmentAPI.getAllAppointments();
        if (response.data) {
          const codes = response.data
            .filter((apt: any) => apt.appointmentCode)
            .map((apt: any) => apt.appointmentCode);
          setAllAppointmentCodes(codes);
        }
      } catch {
        setAllAppointmentCodes([]);
      }
    }
    fetchAllCodes();
  }, []);

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

  // Handle appointment code change (dropdown)
  const handleAppointmentCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setAppointmentCode(code);
    if (!code.trim()) {
      setCustomerInfo(null);
      setFormData(prev => ({ ...prev, customerID: '', treatmentID: null }));
      return;
    }
    getCustomerFromAppointmentCode(code);
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


  // Chuẩn bị dữ liệu gửi đi: lấy các dòng đã nhập kết quả
  const prepareDataForSubmission = () => {
    return testRows
      .filter(row => row.result.trim() !== '')
      .map(row => ({
        customerID: formData.customerID,
        staffID: formData.staffID,
        treatmentID: formData.treatmentID,
        testName: row.name,
        result: row.result,
        referenceRange: row.referenceRange,
        unit: row.unit,
        isPositive: row.conclusion === 'Dương Tính',
        testDate: formData.testDate,
      }));
  };

  // Handle form submission: show confirm modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Thực hiện lưu thực sự sau khi xác nhận
  const handleConfirmSave = async () => {
    setShowConfirm(false);
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
            onSave(Array.isArray(submissionData) ? submissionData[0] : submissionData);
          } else {
            navigate('/staff/test-results');
          }
        }, 1500);
      }
    } catch (err: unknown) {
      let errorMessage = 'Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.';
      if (typeof err === 'object' && err !== null) {
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
              <select
                id="appointmentCode"
                name="appointmentCode"
                value={appointmentCode}
                onChange={handleAppointmentCodeChange}
                required
                style={{ width: 220, textTransform: 'uppercase' }}
              >
                <option value="">-- Chọn mã lịch hẹn --</option>
                {allAppointmentCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              {isLoadingCustomer && (
                <div className="loading-text">Đang tìm kiếm thông tin khách hàng...</div>
              )}
            </div>

            {/* Chọn loại xét nghiệm */}
            <div className="form-group" style={{ marginBottom: 20, position: 'relative', maxWidth: 350 }}>
              <label htmlFor="testType">Chọn loại xét nghiệm <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <div
                  tabIndex={0}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    minHeight: 38,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                  onClick={() => setDropdownOpen(v => !v)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                >
                  {selectedTestTypes.length === 0 ? (
                    <span style={{ color: '#94a3b8' }}>Chọn loại xét nghiệm...</span>
                  ) : (
                    selectedTestTypes.map(type => (
                      <span key={type} style={{
                        background: '#e0e7ef',
                        color: '#0ea5e9',
                        borderRadius: 4,
                        padding: '2px 8px 2px 8px',
                        marginRight: 6,
                        marginBottom: 2,
                        fontSize: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {type}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTestTypes(prev => prev.filter(t => t !== type));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e11d48',
                            fontWeight: 700,
                            fontSize: 15,
                            marginLeft: 4,
                            cursor: 'pointer',
                            lineHeight: 1,
                          }}
                          title={`Bỏ loại ${type}`}
                        >×</button>
                      </span>
                    ))
                  )}
                  <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 18 }}>▼</span>
                </div>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    zIndex: 10,
                    boxShadow: '0 2px 8px #0001',
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}>
                    {TEST_TYPE_OPTIONS.map(opt => (
                      <div
                        key={opt.type}
                        style={{
                          padding: '8px 14px',
                          cursor: 'pointer',
                          background: selectedTestTypes.includes(opt.type) ? '#e0e7ef' : '#fff',
                          color: selectedTestTypes.includes(opt.type) ? '#0ea5e9' : '#1e293b',
                          fontWeight: selectedTestTypes.includes(opt.type) ? 700 : 400,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTestTypes(prev =>
                            prev.includes(opt.type)
                              ? prev.filter(t => t !== opt.type)
                              : [...prev, opt.type]
                          );
                        }}
                      >
                        {opt.type}
                        {selectedTestTypes.includes(opt.type) && (
                          <span style={{ float: 'right', color: '#0ea5e9' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>


            {/* Bảng xét nghiệm động */}
            <div className="test-result-table-pro" style={{ margin: '24px 0', overflowX: 'auto' }}>
              <table className="test-result-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 15, border: '1.5px solid #64748b' }}>
                <thead>
                  <tr style={{ background: '#e0e7ef', color: '#1e293b', fontWeight: 700 }}>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 220 }}>TÊN XÉT NGHIỆM</th>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 100 }}>KẾT QUẢ</th>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 120 }}>GIÁ TRỊ THAM CHIẾU</th>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 80 }}>ĐƠN VỊ</th>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 100 }}>KẾT LUẬN</th>
                    <th style={{ border: '1.5px solid #64748b', padding: 8, minWidth: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {testRows.map((row, idx) => (
                    <tr key={row.id}>
                      <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                        {row.isCustom ? (
                          <input
                            type="text"
                            value={row.name}
                            onChange={e => {
                              const val = e.target.value;
                              setTestRows(prev => {
                                const newRows = [...prev];
                                newRows[idx].name = val;
                                return newRows;
                              });
                            }}
                            placeholder="Tên xét nghiệm"
                            style={{ width: 180 }}
                          />
                        ) : row.name}
                      </td>
                      <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                        {row.isBacteriaVirus ? (
                          <select
                            value={row.result || 'Âm Tính'}
                            onChange={e => {
                              const val = e.target.value;
                              setTestRows(prev => {
                                const newRows = [...prev];
                                newRows[idx].result = val;
                                newRows[idx].conclusion = val;
                                return newRows;
                              });
                            }}
                            style={{
                              width: 110,
                              padding: '2px 6px',
                              border: '1px solid #cbd5e1',
                              borderRadius: 4,
                              fontWeight: 600,
                              color: row.result === 'Dương Tính' ? '#dc2626' : '#0ea5e9',
                              background: row.result === 'Dương Tính' ? '#fee2e2' : '#e0f2fe',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Âm Tính">Âm Tính</option>
                            <option value="Dương Tính">Dương Tính</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.result}
                            onChange={e => handleTestRowChange(idx, e.target.value)}
                            placeholder="Nhập kết quả"
                            style={{ width: 100, padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: 4 }}
                          />
                        )}
                      </td>
                      <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                        {row.isCustom ? (
                          <input
                            type="text"
                            value={row.referenceRange}
                            onChange={e => {
                              const val = e.target.value;
                              setTestRows(prev => {
                                const newRows = [...prev];
                                newRows[idx].referenceRange = val;
                                return newRows;
                              });
                            }}
                            placeholder="Giá trị tham chiếu"
                            style={{ width: 120 }}
                          />
                        ) : row.isBacteriaVirus ? 'Âm Tính' : row.referenceRange}
                      </td>
                      <td style={{ border: '1.5px solid #64748b', padding: 8 }}>
                        {row.isCustom ? (
                          <input
                            type="text"
                            value={row.unit}
                            onChange={e => {
                              const val = e.target.value;
                              setTestRows(prev => {
                                const newRows = [...prev];
                                newRows[idx].unit = val;
                                return newRows;
                              });
                            }}
                            placeholder="Đơn vị"
                            style={{ width: 60 }}
                          />
                        ) : row.unit}
                      </td>
                      <td style={{ border: '1.5px solid #64748b', padding: 8, fontWeight: 'bold', color: row.conclusion === 'Dương Tính' ? 'red' : row.conclusion === 'Âm Tính' ? 'green' : '#333' }}>
                        {row.conclusion || '-'}
                      </td>
                      <td style={{ border: '1.5px solid #64748b', padding: 8, textAlign: 'center' }}>
                        <button type="button" onClick={() => handleRemoveTestRow(idx)} style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} title="Xóa dòng">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={handleAddTestRow} style={{ marginTop: 12, background: '#f1f5f9', color: '#0ea5e9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15 }}>
                + Thêm xét nghiệm
              </button>
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
                  disabled={isSubmitting || !customerInfo || testRows.every(v => !v.result.trim())}
                  title={
                    !customerInfo ? "Vui lòng nhập mã lịch hẹn hợp lệ" :
                    testRows.every(v => !v.result.trim()) ? "Vui lòng nhập ít nhất một kết quả xét nghiệm" :
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
            {/* Modal xác nhận lưu thay đổi */}
            {showConfirm && (
              <div style={{
                position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0006', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0003', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Xác nhận lưu kết quả</div>
                  <div style={{ fontSize: 15, marginBottom: 24 }}>Bạn có chắc chắn muốn lưu các kết quả xét nghiệm này không?</div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowConfirm(false)}
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
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestResultForm; 