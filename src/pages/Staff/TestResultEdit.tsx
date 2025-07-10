import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultEdit.css';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// Types
interface TestResultDetail {
  testName: string;
  result: string;
  normalRange?: string;
  unit?: string;
  isNormal: boolean;
}

interface TestCategory {
  name: string;
  description?: string;
  items: TestResultDetail[];
}

interface TestResult {
  id: number;
  appointmentId: number;
  patientId: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientEmail: string;
  patientPhone: string;
  testType: string;
  testDate: string;
  resultDate: string | null;
  status: 'completed' | 'pending' | 'cancelled';
  sampleType: string;
  sampleCollectedAt: string;
  sampleReceivedAt: string;
  testId: string;
  categories: TestCategory[];
  consultant: string;
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
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          // Mock data based on the ID
          const mockTestResult: TestResult = {
            id: Number(id),
            appointmentId: 100 + Number(id),
            patientId: `P-${1000 + Number(id)}`,
            patientName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'][Number(id) % 5],
            patientDob: '15/05/1992',
            patientGender: 'Nam',
            patientEmail: 'nguyenvana@example.com',
            patientPhone: '0912345678',
            testType: ['Xét nghiệm STI toàn diện', 'Xét nghiệm HIV', 'Xét nghiệm viêm gan', 'Xét nghiệm Giang mai'][Number(id) % 4],
            testDate: '2023-06-15',
            resultDate: '2023-06-18',
            status: 'completed',
            sampleType: 'Máu, Dịch niệu đạo',
            sampleCollectedAt: '15/06/2023 09:30',
            sampleReceivedAt: '15/06/2023 10:15',
            testId: `LAB-${10000 + Number(id)}`,
            consultant: 'BS. Trần Văn B',
            categories: [
              {
                name: 'SINH HÓA',
                items: [
                  { 
                    testName: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
                    result: '0.00',
                    normalRange: '< 1',
                    unit: 'RU',
                    isNormal: true
                  }
                ]
              },
              {
                name: 'MIỄN DỊCH',
                items: [
                  {
                    testName: 'HIV Combo Ag + Ab',
                    result: '0.05',
                    normalRange: '< 1',
                    unit: 'S/CO',
                    isNormal: true
                  },
                  {
                    testName: 'Syphilis',
                    result: '0.11',
                    normalRange: 'Âm Tính: < 1.00\nDương Tính: ≥ 1.00',
                    unit: 'S/CO',
                    isNormal: true
                  }
                ]
              },
              {
                name: 'SINH HỌC PHÂN TỬ',
                description: 'Bộ STIs / STDs 13 Realtime PCR (Định Tính - CE-IVD)',
                items: [
                  { testName: 'Chlamydia trachomatis', result: 'Âm Tính', isNormal: true },
                  { testName: 'Candida albicans', result: 'Âm Tính', isNormal: true },
                  { testName: 'Treponema pallidum', result: 'Âm Tính', isNormal: true },
                  { testName: 'Herpes Simplex Virus 1', result: 'Âm Tính', isNormal: true },
                  { testName: 'Herpes Simplex Virus 2', result: 'Âm Tính', isNormal: true }
                ]
              }
            ]
          };

          setTestResult(mockTestResult);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Không thể tải dữ liệu kết quả xét nghiệm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [id]);

  // Handle form input changes
  const handleResultChange = (categoryIndex: number, itemIndex: number, field: keyof TestResultDetail, value: string) => {
    if (!testResult) return;

    const updatedCategories = [...testResult.categories];
    const updatedItems = [...updatedCategories[categoryIndex].items];
    
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: value,
      // Automatically update isNormal based on result if needed
      isNormal: field === 'result' 
        ? (value.toLowerCase().includes('âm tính') || value.toLowerCase().includes('không phản ứng'))
        : updatedItems[itemIndex].isNormal
    };
    
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedItems
    };

    setTestResult({
      ...testResult,
      categories: updatedCategories
    });
  };

  const handleCategoryChange = (index: number, field: string, value: string) => {
    if (!testResult) return;

    const updatedCategories = [...testResult.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };

    setTestResult({
      ...testResult,
      categories: updatedCategories
    });
  };

  const addTestItem = (categoryIndex: number) => {
    if (!testResult) return;

    const updatedCategories = [...testResult.categories];
    const newItem: TestResultDetail = {
      testName: '',
      result: '',
      normalRange: '',
      unit: '',
      isNormal: true
    };

    updatedCategories[categoryIndex].items.push(newItem);

    setTestResult({
      ...testResult,
      categories: updatedCategories
    });
  };

  const addCategory = () => {
    if (!testResult) return;

    const newCategory: TestCategory = {
      name: '',
      items: []
    };

    setTestResult({
      ...testResult,
      categories: [...testResult.categories, newCategory]
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testResult) return;

    setSaving(true);
    try {
      // In a real app, this would be an API call to update the test result
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to the test result view page after successful save
      navigate(`/staff/test-results/${id}`);
    } catch (err) {
      setError('Không thể lưu kết quả xét nghiệm. Vui lòng thử lại sau.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/staff/test-results/${id}`);
  };

  return (
    <div className="test-result-edit">
      <div className="page-header">
        <h1 className="page-title">Chỉnh Sửa Kết Quả Xét Nghiệm</h1>
        <p className="page-subtitle">Cập nhật thông tin kết quả xét nghiệm của bệnh nhân</p>
      </div>

      {loading ? (
        <div className="test-result-edit-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu kết quả xét nghiệm...</p>
        </div>
      ) : error ? (
        <div className="test-result-edit-error">
          <p>{error}</p>
          <button onClick={() => navigate('/staff/test-results')} className="back-button">
            <FaArrowLeft /> Quay lại danh sách kết quả
          </button>
        </div>
      ) : !testResult ? (
        <div className="test-result-edit-error">
          <p>Không tìm thấy kết quả xét nghiệm.</p>
          <button onClick={() => navigate('/staff/test-results')} className="back-button">
            <FaArrowLeft /> Quay lại danh sách kết quả
          </button>
        </div>
      ) : (
        <div className="test-result-edit-content">
          <div className="test-result-edit-actions">
            <button className="back-button" onClick={handleCancel}>
              <FaArrowLeft /> Quay lại
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="info-section">
              <div className="section-header">
                <h2>Thông tin bệnh nhân</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ và tên:</label>
                  <span>{testResult.patientName}</span>
                </div>
                <div className="info-item">
                  <label>ID bệnh nhân:</label>
                  <span>{testResult.patientId}</span>
                </div>
                <div className="info-item">
                  <label>Ngày sinh:</label>
                  <span>{testResult.patientDob}</span>
                </div>
                <div className="info-item">
                  <label>Giới tính:</label>
                  <span>{testResult.patientGender}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{testResult.patientEmail}</span>
                </div>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  <span>{testResult.patientPhone}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <div className="section-header">
                <h2>Thông tin mẫu xét nghiệm</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Mã cuộc hẹn:</label>
                  <span>APT-{testResult.appointmentId}</span>
                </div>
                <div className="info-item">
                  <label>Loại xét nghiệm:</label>
                  <span>{testResult.testType}</span>
                </div>
                <div className="info-item">
                  <label>Loại mẫu:</label>
                  <input
                    type="text"
                    value={testResult.sampleType}
                    onChange={(e) => setTestResult({...testResult, sampleType: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                  <label>Ngày lấy mẫu:</label>
                  <input
                    type="text"
                    value={testResult.sampleCollectedAt}
                    onChange={(e) => setTestResult({...testResult, sampleCollectedAt: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                  <label>Ngày nhận mẫu:</label>
                  <input
                    type="text"
                    value={testResult.sampleReceivedAt}
                    onChange={(e) => setTestResult({...testResult, sampleReceivedAt: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                  <label>Mã xét nghiệm:</label>
                  <input
                    type="text"
                    value={testResult.testId}
                    onChange={(e) => setTestResult({...testResult, testId: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="info-item">
                  <label>Bác sĩ chỉ định:</label>
                  <input
                    type="text"
                    value={testResult.consultant}
                    onChange={(e) => setTestResult({...testResult, consultant: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="test-results-section">
              <div className="section-header">
                <h2>Kết quả xét nghiệm</h2>
              </div>
              
              {testResult.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="category-section">
                  <div className="category-header">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => handleCategoryChange(categoryIndex, 'name', e.target.value)}
                      className="form-input category-name-input"
                      placeholder="Tên danh mục xét nghiệm"
                    />
                    
                    <input
                      type="text"
                      value={category.description || ''}
                      onChange={(e) => handleCategoryChange(categoryIndex, 'description', e.target.value)}
                      className="form-input category-description-input"
                      placeholder="Mô tả (nếu có)"
                    />
                  </div>
                  
                  <table className="edit-results-table">
                    <thead>
                      <tr>
                        <th>Tên xét nghiệm</th>
                        <th>Kết quả</th>
                        <th>Thang điểm chiếu</th>
                        <th>Đơn vị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td>
                            <input
                              type="text"
                              value={item.testName}
                              onChange={(e) => handleResultChange(categoryIndex, itemIndex, 'testName', e.target.value)}
                              className="form-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.result}
                              onChange={(e) => handleResultChange(categoryIndex, itemIndex, 'result', e.target.value)}
                              className="form-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.normalRange || ''}
                              onChange={(e) => handleResultChange(categoryIndex, itemIndex, 'normalRange', e.target.value)}
                              className="form-input"
                              placeholder="Ví dụ: 0-10"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.unit || ''}
                              onChange={(e) => handleResultChange(categoryIndex, itemIndex, 'unit', e.target.value)}
                              className="form-input"
                              placeholder="Ví dụ: mg/dL"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button 
                    type="button" 
                    className="add-item-button"
                    onClick={() => addTestItem(categoryIndex)}
                  >
                    + Thêm kết quả
                  </button>
                </div>
              ))}

              <button 
                type="button" 
                className="add-category-button"
                onClick={addCategory}
              >
                + Thêm danh mục xét nghiệm
              </button>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="button-spinner"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave /> Lưu kết quả
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestResultEdit; 