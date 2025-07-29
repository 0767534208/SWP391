import React, { useState, useEffect, useRef } from 'react';
import testResultService from '../../services/testResultService';
import type { LabTestData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaSearch, FaTimes } from 'react-icons/fa';
import treatmentOutcomeService from '../../services/treatmentOutcomeService';
import type { 
  CreateTreatmentOutcomeRequest, 
  GetAllAppointment, 
  CustomerInfo, 
  ConsultantInfo 
} from '../../services/treatmentOutcomeService';
import './NewTestResult.css';

const NewTestResult: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTreatmentOutcomeRequest>({
    customerID: '',
    consultantID: '',
    appointmentID: undefined,
    diagnosis: '',
    treatmentPlan: '',
    prescription: '',
    recommendation: '',
  });

  // Data for dropdowns
  const [appointments, setAppointments] = useState<GetAllAppointment[]>([]);
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [consultants, setConsultants] = useState<ConsultantInfo[]>([]);

  // Track which appointments already have treatment outcome
  const [appointmentsWithOutcome, setAppointmentsWithOutcome] = useState<Set<string>>(new Set());
  const [showOutcomeWarning, setShowOutcomeWarning] = useState(false);

  // Search states
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState<GetAllAppointment[]>([]);

  // Current selection display
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantInfo | null>(null);

  // Ref for dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lab test state for selected appointment
  const [labTests, setLabTests] = useState<LabTestData[] | null>(null);
  const [labTestLoading, setLabTestLoading] = useState(false);
  const [labTestError, setLabTestError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAppointmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter appointments based on search
  useEffect(() => {
    if (appointmentSearch.trim()) {
      const filtered = appointments.filter(appointment =>
        appointment.appointmentCode.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        appointment.customer?.name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        appointment.consultant?.name.toLowerCase().includes(appointmentSearch.toLowerCase())
      );
      setFilteredAppointments(filtered);
      console.log('Filtered appointments:', filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [appointmentSearch, appointments]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, customersRes, consultantsRes, outcomesRes] = await Promise.all([
        treatmentOutcomeService.getAllAppointments(),
        treatmentOutcomeService.getAllCustomers(),
        treatmentOutcomeService.getAllConsultants(),
        treatmentOutcomeService.getAllTreatmentOutcomes?.() // Optional chaining for backward compatibility
      ]);

      console.log('Appointments response:', appointmentsRes);
      console.log('Customers response:', customersRes);
      console.log('Consultants response:', consultantsRes);
      if (appointmentsRes.statusCode === 200 && appointmentsRes.data) {
        setAppointments(appointmentsRes.data);
        setFilteredAppointments(appointmentsRes.data);
        console.log('Appointments loaded:', appointmentsRes.data);
      } else {
        console.error('Failed to load appointments:', appointmentsRes);
        toast.error('Không thể tải danh sách cuộc hẹn');
      }

      if (customersRes.statusCode === 200 && customersRes.data) {
        setCustomers(customersRes.data);
        console.log('Customers loaded:', customersRes.data);
      } else {
        console.error('Failed to load customers:', customersRes);
        toast.error('Không thể tải danh sách khách hàng');
      }

      if (consultantsRes.statusCode === 200 && consultantsRes.data) {
        setConsultants(consultantsRes.data);
        console.log('Consultants loaded:', consultantsRes.data);
      } else {
        console.error('Failed to load consultants:', consultantsRes);
        toast.error('Không thể tải danh sách bác sĩ');
      }

      // Collect appointmentIDs that already have treatment outcome
      if (outcomesRes && outcomesRes.statusCode === 200 && Array.isArray(outcomesRes.data)) {
        const outcomeSet = new Set(
          outcomesRes.data
            .filter((o: any) => o.appointmentID)
            .map((o: any) => o.appointmentID)
        );
        setAppointmentsWithOutcome(outcomeSet);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Không thể tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSelect = async (appointment: GetAllAppointment) => {
    // Prevent selecting if already has outcome
    if (appointmentsWithOutcome.has(appointment.appointmentID)) {
      setShowOutcomeWarning(true);
      return;
    }
    setShowOutcomeWarning(false);
    setAppointmentSearch(appointment.appointmentCode);
    setShowAppointmentDropdown(false);

    // Auto-fill customer and consultant info
    const customer = customers.find(c => c.id === appointment.customerID);
    let consultant = null;
    if (appointment.consultant) {
      consultant = {
        id: appointment.consultantID,
        name: appointment.consultant.name,
        email: appointment.consultant.email,
        phone: appointment.consultant.phone,
      };
    } else {
      consultant = consultants.find(c => c.id === appointment.consultantID);
    }

    setSelectedCustomer(customer || null);
    setSelectedConsultant(consultant || null);

    setFormData(prev => ({
      ...prev,
      appointmentID: appointment.appointmentID,
      customerID: appointment.customerID,
      consultantID: appointment.consultantID,
    }));

    // Fetch lab tests for this appointment/treatment
    setLabTestLoading(true);
    setLabTestError(null);
    setLabTests(null);
    try {
      // Prefer treatmentID if available, else fallback to appointmentID
      const treatmentID = appointment.treatmentID || appointment.appointmentID;
      const res = await testResultService.getAppointmentTestResults(treatmentID);
      if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
        setLabTests(res.data as LabTestData[]);
      } else {
        setLabTests([]);
      }
    } catch (err) {
      setLabTestError('Không thể tải kết quả xét nghiệm');
    } finally {
      setLabTestLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.appointmentID) {
      toast.error('⚠️ Vui lòng chọn mã cuộc hẹn trước khi lưu', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (!formData.diagnosis.trim()) {
      toast.error('⚠️ Vui lòng nhập chẩn đoán trước khi lưu', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (!formData.treatmentPlan.trim()) {
      toast.error('⚠️ Vui lòng nhập kế hoạch điều trị trước khi lưu', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (!formData.customerID || !formData.consultantID) {
      toast.error('⚠️ Thông tin khách hàng và bác sĩ chưa được điền đầy đủ', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    // Confirm before saving
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn lưu kết quả khám cho:\n\n` +
      `📋 Mã cuộc hẹn: ${appointmentSearch}\n` +
      `👤 Khách hàng: ${selectedCustomer?.name || 'N/A'}\n` +
      `👨‍⚕️ Bác sĩ: ${selectedConsultant?.name || 'N/A'}\n\n` +
      `Sau khi lưu, bạn sẽ được chuyển về trang danh sách kết quả khám.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting treatment outcome data:', formData);
      
      const response = await treatmentOutcomeService.createTreatmentOutcome(formData);
      
      console.log('Create treatment outcome response:', response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success('🎉 Lưu kết quả khám thành công!', {
          duration: 3000,
          position: 'top-center'
        });
        
        // Delay navigation to show success message
        setTimeout(() => {
          navigate('/consultant/test-results');
        }, 1500);
      } else {
        const errorMessage = response.message || 'Có lỗi xảy ra khi lưu kết quả khám';
        toast.error(`❌ Lưu thất bại: ${errorMessage}`, {
          duration: 4000,
          position: 'top-center'
        });
        console.error('Failed to create treatment outcome:', response);
      }
    } catch (error: any) {
      console.error('Error creating treatment outcome:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi lưu kết quả khám';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ Lưu thất bại: ${errorMessage}`, {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/consultant/test-results');
  };

  const clearAppointmentSearch = () => {
    setAppointmentSearch('');
    setSelectedCustomer(null);
    setSelectedConsultant(null);
    setLabTests(null);
    setLabTestError(null);
    setShowOutcomeWarning(false);
    setFormData(prev => ({
      ...prev,
      appointmentID: undefined,
      customerID: '',
      consultantID: '',
    }));
  };

  return (
    <div className="new-test-result-container">
      <div className="new-test-result-header">
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Tạo kết quả khám mới</h1>
      </div>

      <div className="new-test-result-content">
        <form onSubmit={handleSubmit} className="test-result-form">
          {/* Appointment Code Search */}
          <div className="form-group">
            <label htmlFor="appointmentCode" className="required">
              Mã cuộc hẹn <span className="required-star">*</span>
            </label>
            <div className="appointment-search-container" ref={dropdownRef}>
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  value={appointmentSearch}
                  onChange={(e) => {
                    setAppointmentSearch(e.target.value);
                    setShowAppointmentDropdown(true);
                  }}
                  onFocus={() => setShowAppointmentDropdown(true)}
                  placeholder="Nhập mã cuộc hẹn, tên khách hàng hoặc tên bác sĩ để tìm kiếm..."
                  className="appointment-search-input"
                />
                {appointmentSearch && (
                  <button 
                    type="button" 
                    className="clear-search-btn"
                    onClick={clearAppointmentSearch}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {showAppointmentDropdown && (
                <div className="appointment-dropdown">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => {
                      const hasOutcome = appointmentsWithOutcome.has(appointment.appointmentID);
                      return (
                        <div
                          key={appointment.appointmentID}
                          className={`appointment-item${hasOutcome ? ' has-outcome' : ''}`}
                          onClick={() => {
                            if (!hasOutcome) handleAppointmentSelect(appointment);
                          }}
                          style={hasOutcome ? { opacity: 0.6, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                        >
                          <div className="appointment-code">{appointment.appointmentCode}</div>
                          <div className="appointment-details">
                            <div className="appointment-info-row">
                              <span className="info-label">Khách hàng:</span>
                              <span className="customer-name">{appointment.customer?.name || 'Không có tên'}</span>
                            </div>
                            <div className="appointment-info-row">
                              <span className="info-label">Bác sĩ:</span>
                              <span className="consultant-name">{appointment.consultant?.name || 'Không có tên'}</span>
                            </div>
                            <div className="appointment-info-row">
                              <span className="info-label">Ngày hẹn:</span>
                              <span className="appointment-date">
                                {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className="appointment-info-row">
                              <span className="info-label">Trạng thái:</span>
                              <span className="outcome-status" style={{ color: hasOutcome ? 'red' : 'green', fontWeight: 600 }}>
                                {hasOutcome ? 'ĐÃ CÓ KẾT QUẢ KHÁM' : 'Chưa có kết quả khám'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-appointments">
                      {appointmentSearch.trim() ? 'Không tìm thấy cuộc hẹn nào' : 'Không có cuộc hẹn nào'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warning if appointment already has treatment outcome */}
          {showOutcomeWarning && (
            <div style={{ color: 'red', fontWeight: 600, marginBottom: 12, fontSize: 16, background: '#fff3cd', border: '1px solid #ffeeba', padding: 12, borderRadius: 6 }}>
              ⚠️ Cuộc hẹn này đã có kết quả khám trước đó. Vui lòng chọn cuộc hẹn khác!
            </div>
          )}


          {/* Customer Info Display */}
          {selectedCustomer && (
            <div className="form-group">
              <label>Thông tin khách hàng</label>
              <div className="info-display">
                <div className="info-item">
                  <strong>Tên:</strong> {selectedCustomer.name}
                </div>
                <div className="info-item">
                  <strong>Số điện thoại:</strong> {selectedCustomer.phone}
                </div>
              </div>
            </div>
          )}

          {/* Consultant Info Display */}
          {selectedConsultant && (
            <div className="form-group">
              <label>Thông tin bác sĩ tư vấn</label>
              <div className="info-display">
                <div className="info-item">
                  <strong>Tên:</strong> {selectedConsultant.name}
                </div>
                <div className="info-item">
                  <strong>Số điện thoại:</strong> {selectedConsultant.phone}
                </div>
              </div>
            </div>
          )}

          {/* Lab Test Results Table (if any) - show after info */}
          {formData.appointmentID && (
            <div className="form-group">
              <label>Kết quả xét nghiệm</label>
              {labTestLoading ? (
                <div style={{ margin: '16px 0' }}>Đang tải kết quả xét nghiệm...</div>
              ) : labTestError ? (
                <div style={{ margin: '16px 0', color: 'red' }}>{labTestError}</div>
              ) : labTests && labTests.length > 0 ? (
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
                      {labTests.map((test, idx) => (
                        <tr key={test.labTestID || idx}>
                          <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.testName || 'N/A'}</td>
                          <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.result || '-'}</td>
                          <td style={{ border: '1.5px solid #64748b', padding: 8, whiteSpace: 'pre-line' }}>{test.referenceRange || '-'}</td>
                          <td style={{ border: '1.5px solid #64748b', padding: 8 }}>{test.unit || ''}</td>
                          <td style={{ border: '1.5px solid #64748b', padding: 8, fontWeight: 'bold', color: typeof test.isPositive === 'boolean' ? (test.isPositive ? 'red' : 'green') : '#333' }}>
                            {typeof test.isPositive === 'boolean' ? (test.isPositive ? 'Dương Tính' : 'Âm Tính') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ margin: '16px 0', color: '#64748b' }}>Không có kết quả xét nghiệm cho cuộc hẹn này</div>
              )}
            </div>
          )}

          {/* Diagnosis */}
          <div className="form-group">
            <label htmlFor="diagnosis" className="required">
              Chẩn đoán <span className="required-star">*</span>
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              placeholder="Nhập chẩn đoán chi tiết..."
              required
              maxLength={1000}
            />
            <div className="char-count">{formData.diagnosis.length}/1000</div>
          </div>

          {/* Treatment Plan */}
          <div className="form-group">
            <label htmlFor="treatmentPlan" className="required">
              Kế hoạch điều trị <span className="required-star">*</span>
            </label>
            <textarea
              id="treatmentPlan"
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleInputChange}
              placeholder="Nhập kế hoạch điều trị chi tiết..."
              required
              maxLength={2000}
            />
            <div className="char-count">{formData.treatmentPlan.length}/2000</div>
          </div>

          {/* Prescription */}
          <div className="form-group">
            <label htmlFor="prescription">Đơn thuốc</label>
            <textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleInputChange}
              placeholder="Nhập đơn thuốc (nếu có)..."
              maxLength={1000}
            />
            <div className="char-count">{formData.prescription?.length || 0}/1000</div>
          </div>

          {/* Recommendation */}
          <div className="form-group">
            <label htmlFor="recommendation">Khuyến nghị</label>
            <textarea
              id="recommendation"
              name="recommendation"
              value={formData.recommendation}
              onChange={handleInputChange}
              placeholder="Nhập khuyến nghị cho bệnh nhân..."
              maxLength={1000}
            />
            <div className="char-count">{formData.recommendation?.length || 0}/1000</div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              <FaSave /> 
              {loading ? 'Đang lưu kết quả...' : 'Lưu kết quả khám'}
            </button>
            {loading && (
              <div className="loading-text">
                Vui lòng đợi, hệ thống đang xử lý...
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTestResult;
