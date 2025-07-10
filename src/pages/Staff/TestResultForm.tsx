import React, { useState, type ChangeEvent } from 'react';
import './TestResultForm.css';

interface TestResultFormProps {
  appointmentId: number;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  onSave: (results: TestResultData) => void;
  onCancel: () => void;
  initialData?: TestResultData;
}

export interface TestResultData {
  appointmentId: number;
  testType: string;
  results: string;
  notes: string;
  dateCompleted: string;
  completedBy: string;
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
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Initialize form state
  const [formData, setFormData] = useState<TestResultData>(
    initialData || {
      appointmentId,
      testType: service,
      results: '',
      notes: '',
      dateCompleted: getCurrentDate(),
      completedBy: 'Staff Member' // In a real app, this would be the logged-in user
    }
  );

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="test-result-form">
      <div className="page-header">
        <h1 className="page-title">Tạo Kết Quả Xét Nghiệm Mới</h1>
        <p className="page-subtitle">Nhập thông tin kết quả xét nghiệm cho bệnh nhân</p>
      </div>

      <div className="test-result-form-content">
        <div className="patient-info-card">
          <div className="patient-info-header">Thông tin bệnh nhân</div>
          <div className="patient-info-content">
            <div className="patient-info-row">
              <div className="patient-info-label">Họ tên:</div>
              <div className="patient-info-value">{patientName}</div>
            </div>
            <div className="patient-info-row">
              <div className="patient-info-label">Số điện thoại:</div>
              <div className="patient-info-value">{patientPhone}</div>
            </div>
            <div className="patient-info-row">
              <div className="patient-info-label">Dịch vụ:</div>
              <div className="patient-info-value">{service}</div>
            </div>
            <div className="patient-info-row">
              <div className="patient-info-label">Ngày & giờ hẹn:</div>
              <div className="patient-info-value">{date} {time}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="test-result-form">
          <div className="form-group">
            <label htmlFor="testType">Loại xét nghiệm</label>
            <select
              id="testType"
              name="testType"
              value={formData.testType}
              onChange={handleInputChange}
              required
            >
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
            <label htmlFor="results">Kết quả xét nghiệm</label>
            <textarea
              id="results"
              name="results"
              rows={4}
              value={formData.results}
              onChange={handleInputChange}
              placeholder="Nhập kết quả xét nghiệm chi tiết"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Nhập các ghi chú hoặc khuyến nghị cho bệnh nhân"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateCompleted">Ngày hoàn thành</label>
              <input
                type="date"
                id="dateCompleted"
                name="dateCompleted"
                value={formData.dateCompleted}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="completedBy">Người thực hiện</label>
              <input
                type="text"
                id="completedBy"
                name="completedBy"
                value={formData.completedBy}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-button"
            >
              Lưu kết quả
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestResultForm; 