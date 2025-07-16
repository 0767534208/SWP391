import React, { useState, useEffect, type ErrorInfo } from 'react';
import { FaFlask, FaCalendarAlt, FaArrowLeft, FaSearch, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import labTestService from '../../services/labTestService';
import { authUtils } from '../../utils/auth';
import type { CreateLabTestRequest, StaffInfo, AppointmentWithTreatment } from '../../services/labTestService';
import './NewLabTest.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="new-lab-test">
          <div className="page-header">
            <h1>Lỗi</h1>
            <p>Có lỗi xảy ra khi tải trang. Vui lòng thử lại.</p>
          </div>
          <div className="form-actions">
            <button onClick={() => window.location.reload()} className="cancel-btn">
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const NewLabTest: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<StaffInfo | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithTreatment[]>([]);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState<string>('');
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithTreatment | null>(null);
  
  // Form data with proper typing
  const [formData, setFormData] = useState<CreateLabTestRequest>({
    customerID: '',
    staffID: '',
    treatmentID: undefined,
    testName: '',
    result: '',
    referenceRange: '',
    unit: '',
    isPositive: false,
    testDate: new Date().toISOString().split('T')[0],
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('Loading initial data...');
      
      // Get current staff ID from auth
      const currentStaffId = authUtils.getCurrentUserId();
      console.log('Current staff ID:', currentStaffId);
      
      if (currentStaffId) {
        setFormData(prev => ({ ...prev, staffID: currentStaffId }));
        
        // Try to get staff info (optional, for display purposes)
        try {
          const staffResponse = await labTestService.getAllStaff();
          if (staffResponse && staffResponse.statusCode === 200 && staffResponse.data) {
            const staffList = Array.isArray(staffResponse.data) ? staffResponse.data : [];
            const currentStaffInfo = staffList.find(s => s.id === currentStaffId);
            if (currentStaffInfo) {
              setCurrentStaff(currentStaffInfo);
            } else {
              // Create basic staff info if not found
              setCurrentStaff({
                id: currentStaffId,
                name: 'Staff User',
                email: '',
                phone: ''
              });
            }
          }
        } catch (staffError) {
          console.warn('Could not load staff info:', staffError);
          // Still create basic staff info
          setCurrentStaff({
            id: currentStaffId,
            name: 'Staff User',
            email: '',
            phone: ''
          });
        }
      } else {
        toast.error('Không thể xác định tài khoản staff hiện tại');
      }

      // Load appointments data
      try {
        const appointmentsResponse = await labTestService.getAppointmentsWithTreatments();
        console.log('Appointments response:', appointmentsResponse);
        
        if (appointmentsResponse && appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
          setAppointments(Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []);
        } else {
          console.warn('Invalid appointments response:', appointmentsResponse);
          setAppointments([]);
        }
      } catch (appointmentError) {
        console.error('Error loading appointments:', appointmentError);
        setAppointments([]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions with safety checks
  const filteredAppointments = appointments.filter(app => {
    try {
      if (!app || !app.appointmentCode || !app.customer || !app.customer.name) return false;
      if (!appointmentSearchTerm.trim()) return true; // Show all if no search term
      return app.appointmentCode.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
             app.customer.name.toLowerCase().includes(appointmentSearchTerm.toLowerCase());
    } catch (error) {
      console.error('Error filtering appointments:', error);
      return false;
    }
  });

  // Event handlers with error protection
  const handleAppointmentSelect = (appointment: AppointmentWithTreatment) => {
    try {
      if (!appointment || !appointment.customerID) {
        console.error('Invalid appointment selected');
        return;
      }
      setSelectedAppointment(appointment);
      setFormData(prev => ({
        ...prev,
        customerID: appointment.customerID,
        treatmentID: appointment.treatmentOutcome?.treatmentID
      }));
      setAppointmentSearchTerm(appointment.appointmentCode || '');
      setShowAppointmentDropdown(false);
    } catch (error) {
      console.error('Error selecting appointment:', error);
      toast.error('Lỗi khi chọn cuộc hẹn');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    try {
      const { name, value, type } = e.target;
      if (!name) return;
      
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    } catch (error) {
      console.error('Error handling input change:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      // Validation
      if (!formData.customerID || !formData.staffID || !formData.testName || !formData.result) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      setSubmitting(true);
      
      console.log('Creating lab test with data:', formData);
      const response = await labTestService.createLabTest(formData);
      
      if (response && (response.statusCode === 200 || response.statusCode === 201)) {
        toast.success('Tạo kết quả xét nghiệm thành công');
        navigate('/staff/test-results');
      } else {
        toast.error(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating lab test:', error);
      toast.error('Có lỗi xảy ra khi tạo kết quả xét nghiệm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    try {
      navigate('/staff/test-results');
    } catch (error) {
      console.error('Error navigating:', error);
      window.location.href = '/staff/test-results';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        Đang tải dữ liệu...
      </div>
    );
  }

  try {
    return (
      <div className="new-lab-test">
        <div className="page-header">
          <h1>Tạo kết quả xét nghiệm mới</h1>
          <p>Tạo kết quả xét nghiệm cho bệnh nhân</p>
        </div>
        
        <form onSubmit={handleSubmit} className="lab-test-form">
          <div className="form-sections">
            {/* Current Staff Info */}
            <div className="form-section">
              <h3>Thông tin nhân viên</h3>
              {currentStaff ? (
                <div className="selected-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>ID:</strong>
                      <span>{currentStaff.id}</span>
                    </div>
                    <div className="info-item">
                      <strong>Tên:</strong>
                      <span>{currentStaff.name}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong>
                      <span>{currentStaff.email || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Điện thoại:</strong>
                      <span>{currentStaff.phone || 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="error-message">
                  <p>Không thể xác định thông tin nhân viên hiện tại</p>
                </div>
              )}
            </div>

            {/* Appointment Selection */}
            <div className="form-section">
              <h3>Chọn cuộc hẹn</h3>
              <div className="form-group">
                <label>Mã cuộc hẹn *</label>
                <div className="search-dropdown">
                  <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Gõ mã cuộc hẹn..."
                      value={appointmentSearchTerm}
                      onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                      onFocus={() => setShowAppointmentDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAppointmentDropdown(false), 200)}
                    />
                    <FaChevronDown className="dropdown-icon" />
                  </div>
                  
                  {showAppointmentDropdown && (
                    <div className="search-dropdown-menu">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.slice(0, 10).map(appointment => (
                          <div
                            key={appointment.appointmentID}
                            className="dropdown-item"
                            onClick={() => handleAppointmentSelect(appointment)}
                          >
                            <div className="item-info">
                              <strong>{appointment.appointmentCode}</strong>
                              <span className="item-detail">
                                Bệnh nhân: {appointment.customer?.name || 'N/A'}
                              </span>
                              {appointment.treatmentOutcome && (
                                <span className="treatment-info">
                                  ✓ Đã có kết quả điều trị
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item no-results">
                          {appointmentSearchTerm.trim() ? 'Không tìm thấy cuộc hẹn' : 'Đang tải...'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Appointment Info */}
              {selectedAppointment && (
                <div className="selected-info">
                  <h4>Thông tin cuộc hẹn đã chọn</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Mã cuộc hẹn:</strong>
                      <span>{selectedAppointment.appointmentCode}</span>
                    </div>
                    <div className="info-item">
                      <strong>Tên bệnh nhân:</strong>
                      <span>{selectedAppointment.customer?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong>
                      <span>{selectedAppointment.customer?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Điện thoại:</strong>
                      <span>{selectedAppointment.customer?.phone || 'N/A'}</span>
                    </div>
                    {selectedAppointment.treatmentOutcome && (
                      <>
                        <div className="info-item">
                          <strong>Chẩn đoán:</strong>
                          <span>{selectedAppointment.treatmentOutcome.diagnosis || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong>Kế hoạch điều trị:</strong>
                          <span>{selectedAppointment.treatmentOutcome.treatmentPlan || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Test Information */}
          <div className="form-section">
            <h3>Thông tin xét nghiệm</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tên xét nghiệm *</label>
                <input
                  type="text"
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên xét nghiệm"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày xét nghiệm *</label>
                <div className="date-input-container">
                  <FaCalendarAlt className="date-icon" />
                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Kết quả *</label>
              <textarea
                name="result"
                value={formData.result}
                onChange={handleInputChange}
                placeholder="Nhập kết quả xét nghiệm"
                rows={3}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Giá trị tham chiếu</label>
                <input
                  type="text"
                  name="referenceRange"
                  value={formData.referenceRange}
                  onChange={handleInputChange}
                  placeholder="Nhập giá trị tham chiếu"
                />
              </div>
              <div className="form-group">
                <label>Đơn vị</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="Nhập đơn vị đo"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPositive"
                  checked={formData.isPositive}
                  onChange={handleInputChange}
                />
                <span>Kết quả dương tính</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            <FaArrowLeft /> Hủy
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? (
              <>
                <div className="button-spinner"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <FaFlask />
                Tạo kết quả
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
  } catch (error) {
    console.error('Error rendering NewLabTest:', error);
    return (
      <div className="new-lab-test">
        <div className="page-header">
          <h1>Lỗi</h1>
          <p>Có lỗi xảy ra khi tải trang. Vui lòng thử lại.</p>
        </div>
        <div className="form-actions">
          <button onClick={handleCancel} className="cancel-btn">
            Quay lại
          </button>
        </div>
      </div>
    );
  }
};

export default () => (
  <ErrorBoundary>
    <NewLabTest />
  </ErrorBoundary>
);
