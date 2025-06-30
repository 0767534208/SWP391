import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultInput.css';

interface TestResult {
  id: string;
  name: string;
  value: string;
  normalRange: string;
  unit: string;
  isAbnormal: boolean;
}

interface AppointmentType {
  id: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientAge?: number;
  service: string;
  serviceType: 'test' | 'consultation';
  date: string;
  time: string;
  consultant: string;
  status: string;
  notes: string;
  testResults?: TestResult[];
  consultationNotes?: string;
  sampleCollectedDate?: string;
  sampleType?: string;
  resultDate?: string;
}

const TestResultInput: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [sampleType, setSampleType] = useState<string>('');
  const [sampleCollectedDate, setSampleCollectedDate] = useState<string>('');
  const [resultDate, setResultDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Default test results based on service type
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string>('');

  useEffect(() => {
    // Fetch appointment data
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock data
      const mockAppointment: AppointmentType = {
        id: Number(appointmentId),
        patientName: 'Nguyễn Văn A',
        patientPhone: '0901234567',
        patientEmail: 'nguyenvana@example.com',
        patientGender: 'Nam',
        patientAge: 35,
        service: 'Xét nghiệm HIV',
        serviceType: 'test',
        date: '15/06/2023',
        time: '09:00',
        consultant: 'Dr. Minh',
        status: 'awaiting_results',
        notes: 'Lịch hẹn lần đầu',
        sampleCollectedDate: '15/06/2023',
        sampleType: 'Máu'
      };

      setAppointment(mockAppointment);
      setSampleType(mockAppointment.sampleType || '');
      setSampleCollectedDate(mockAppointment.sampleCollectedDate || '');

      // Initialize test results based on service type
      if (mockAppointment.service.includes('HIV')) {
        setTestResults([
          { id: '1', name: 'HIV Antibody', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false },
          { id: '2', name: 'HIV p24 Antigen', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false }
        ]);
      } else if (mockAppointment.service.includes('STI') || mockAppointment.service.includes('Bệnh lây truyền')) {
        setTestResults([
          { id: '1', name: 'Chlamydia', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false },
          { id: '2', name: 'Gonorrhea', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false },
          { id: '3', name: 'Syphilis', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false },
          { id: '4', name: 'Herpes Simplex', value: '', normalRange: 'Âm tính', unit: '', isAbnormal: false }
        ]);
      } else {
        setTestResults([
          { id: '1', name: 'Kết quả xét nghiệm', value: '', normalRange: '', unit: '', isAbnormal: false }
        ]);
      }

      setIsLoading(false);
    }, 1000);
  }, [appointmentId]);

  const handleTestResultChange = (id: string, field: keyof TestResult, value: string | boolean) => {
    setTestResults(prevResults => 
      prevResults.map(result => 
        result.id === id ? { ...result, [field]: value } : result
      )
    );
  };

  const handleSaveResults = () => {
    setIsSaving(true);
    
    // Simulate API call to save results
    setTimeout(() => {
      // Update appointment with test results
      if (appointment) {
        const updatedAppointment = {
          ...appointment,
          testResults,
          sampleType,
          sampleCollectedDate,
          resultDate,
          status: 'completed'
        };
        
        setAppointment(updatedAppointment);
        setIsSaving(false);
        setIsSubmitted(true);
      }
    }, 1500);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      navigate('/staff/appointments');
    }
  };

  const handleBackToList = () => {
    navigate('/staff/appointments');
  };

  const handlePrintResults = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="test-result-input-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="test-result-input-container">
        <div className="error-message">
          <h2>Không tìm thấy thông tin cuộc hẹn</h2>
          <button 
            className="primary-button"
            onClick={handleBackToList}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-result-input-container print-friendly">
      <div className="page-header">
        <h1>{isSubmitted ? 'Kết Quả Xét Nghiệm' : 'Nhập Kết Quả Xét Nghiệm'}</h1>
        <p className="text-gray-500">
          {isSubmitted ? 'Xem kết quả xét nghiệm đã hoàn thành' : 'Nhập kết quả xét nghiệm cho bệnh nhân'}
        </p>
      </div>

      <div className="result-card">
        {/* Patient Information */}
        <div className="card-section">
          <h2 className="section-title">Thông tin bệnh nhân</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Họ tên:</span>
              <span className="info-value">{appointment.patientName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Số điện thoại:</span>
              <span className="info-value">{appointment.patientPhone}</span>
            </div>
            {appointment.patientGender && (
              <div className="info-item">
                <span className="info-label">Giới tính:</span>
                <span className="info-value">{appointment.patientGender}</span>
              </div>
            )}
            {appointment.patientAge && (
              <div className="info-item">
                <span className="info-label">Tuổi:</span>
                <span className="info-value">{appointment.patientAge}</span>
              </div>
            )}
            {appointment.patientEmail && (
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{appointment.patientEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sample Information */}
        <div className="card-section">
          <h2 className="section-title">Thông tin mẫu xét nghiệm</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Loại dịch vụ:</span>
              <span className="info-value">{appointment.service}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Loại mẫu:</span>
              {isSubmitted ? (
                <span className="info-value">{sampleType}</span>
              ) : (
                <input 
                  type="text" 
                  className="form-input"
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  placeholder="Ví dụ: Máu, Nước tiểu, v.v."
                />
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Ngày lấy mẫu:</span>
              {isSubmitted ? (
                <span className="info-value">{sampleCollectedDate}</span>
              ) : (
                <input 
                  type="date" 
                  className="form-input"
                  value={sampleCollectedDate}
                  onChange={(e) => setSampleCollectedDate(e.target.value)}
                />
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Ngày có kết quả:</span>
              {isSubmitted ? (
                <span className="info-value">{resultDate}</span>
              ) : (
                <input 
                  type="date" 
                  className="form-input"
                  value={resultDate}
                  onChange={(e) => setResultDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card-section">
          <h2 className="section-title">Kết quả xét nghiệm</h2>
          <div className="test-results-table">
            <table>
              <thead>
                <tr>
                  <th>Tên xét nghiệm</th>
                  <th>Kết quả</th>
                  <th>Đơn vị</th>
                  <th>Giá trị tham chiếu</th>
                  {!isSubmitted && <th>Bất thường</th>}
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr key={result.id} className={result.isAbnormal ? 'abnormal-row' : ''}>
                    <td>{result.name}</td>
                    <td>
                      {isSubmitted ? (
                        <span className={result.isAbnormal ? 'abnormal-value' : ''}>
                          {result.value || 'Âm tính'}
                        </span>
                      ) : (
                        <input 
                          type="text" 
                          className="form-input"
                          value={result.value}
                          onChange={(e) => handleTestResultChange(result.id, 'value', e.target.value)}
                          placeholder="Nhập kết quả"
                        />
                      )}
                    </td>
                    <td>
                      {isSubmitted ? (
                        result.unit
                      ) : (
                        <input 
                          type="text" 
                          className="form-input"
                          value={result.unit}
                          onChange={(e) => handleTestResultChange(result.id, 'unit', e.target.value)}
                          placeholder="Đơn vị"
                        />
                      )}
                    </td>
                    <td>
                      {isSubmitted ? (
                        result.normalRange
                      ) : (
                        <input 
                          type="text" 
                          className="form-input"
                          value={result.normalRange}
                          onChange={(e) => handleTestResultChange(result.id, 'normalRange', e.target.value)}
                          placeholder="Giá trị tham chiếu"
                        />
                      )}
                    </td>
                    {!isSubmitted && (
                      <td>
                        <input 
                          type="checkbox" 
                          checked={result.isAbnormal}
                          onChange={(e) => handleTestResultChange(result.id, 'isAbnormal', e.target.checked)}
                          className="form-checkbox"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Notes */}
        <div className="card-section">
          <h2 className="section-title">Ghi chú & Nhận xét</h2>
          {isSubmitted ? (
            <div className="notes-display">
              {generalNotes || 'Không có ghi chú.'}
            </div>
          ) : (
            <textarea 
              className="form-textarea"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Nhập ghi chú hoặc nhận xét về kết quả xét nghiệm"
              rows={4}
            />
          )}
        </div>

        {/* Actions */}
        <div className="card-section actions-section">
          {isSubmitted ? (
            <div className="button-group">
              <button 
                className="secondary-button"
                onClick={handleBackToList}
              >
                Quay lại danh sách
              </button>
              <button 
                className="primary-button"
                onClick={handlePrintResults}
              >
                In kết quả
              </button>
            </div>
          ) : (
            <div className="button-group">
              <button 
                className="secondary-button"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button 
                className="primary-button"
                onClick={handleSaveResults}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultInput; 