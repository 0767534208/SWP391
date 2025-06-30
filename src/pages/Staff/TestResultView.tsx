import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestResultView.css';

interface TestItem {
  name: string;
  result: string;
  range?: string;
  unit?: string;
}

interface TestCategory {
  name: string;
  description?: string;
  items: TestItem[];
}

interface TestResult {
  id: number;
  patientName: string;
  patientId: string;
  patientDob: string;
  patientGender: string;
  patientEmail: string;
  patientPhone: string;
  service: string;
  serviceType: 'test' | 'consultation';
  testType?: 'sti' | 'hiv' | 'blood' | 'general';
  date: string;
  time: string;
  consultant: string;
  sampleType?: string;
  sampleCollectedAt?: string;
  sampleReceivedAt?: string;
  resultDate?: string;
  testId?: string;
  testCategories?: TestCategory[];
  consultationNotes?: string;
  createdAt: string;
}

const TestResultView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    // Simulate API call to fetch test result
    const fetchTestResult = async () => {
      setLoading(true);
      try {
        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
          // Mock different types of results based on ID to demonstrate different test types
          let result;
          const testId = parseInt(id || '0');
          
          if (testId % 4 === 0) {
            // STI Test
            result = {
              id: testId,
              patientName: "Nguyễn Văn A",
              patientId: "BN58766",
              patientDob: "15/05/1992",
              patientGender: "Nam",
              patientEmail: "nguyenvana@example.com",
              patientPhone: "0912345678",
              service: "Xét nghiệm STIs",
              serviceType: 'test' as const,
              testType: 'sti' as const,
              date: "08/04/2024",
              time: "09:49 AM",
              consultant: "BS. Trần Văn B",
              sampleType: "Mẫu, Dịch niệu đạo",
              sampleCollectedAt: "08/04/2024 09:49 AM",
              sampleReceivedAt: "08/04/2024 10:05 AM",
              resultDate: "08/04/2024",
              testId: "LAB96583",
              testCategories: [
                {
                  name: "SINH HỌA",
                  items: [
                    {
                      name: "Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)",
                      result: "0.00",
                      range: "< 1",
                      unit: "RU"
                    }
                  ]
                },
                {
                  name: "SINH HỌC PHÂN TỬ",
                  description: "Bộ STIs / STDs 13 Realtime PCR (Định Tính - CE-IVD)",
                  items: [
                    { name: "Chlamydia trachomatis", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Candida albicans", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Treponema pallidum", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Herpes Simplex Virus 1", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Herpes Simplex Virus 2", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Ureaplasma parvum", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Trichomonas vaginalis", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Mycoplasma genitalium", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Mycoplasma hominis", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Neisseria gonorrhoeae", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Ureaplasma urealyticum", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Haemophilus ducreyi", result: "Âm Tính", range: "-", unit: "-" },
                    { name: "Gardnerella vaginalis", result: "Âm Tính", range: "-", unit: "-" }
                  ]
                }
              ],
              createdAt: "08/04/2024 11:30 AM"
            };
          } else if (testId % 4 === 1) {
            // HIV Test
            result = {
              id: testId,
              patientName: "Lê Thị C",
              patientId: "BN58768",
              patientDob: "10/09/1985",
              patientGender: "Nữ",
              patientEmail: "lethic@example.com",
              patientPhone: "0912345680",
              service: "Xét nghiệm HIV",
              serviceType: 'test' as const,
              testType: 'hiv' as const,
              date: "09/04/2024",
              time: "10:15 AM",
              consultant: "BS. Nguyễn Thị D",
              sampleType: "Mẫu máu",
              sampleCollectedAt: "09/04/2024 10:15 AM",
              sampleReceivedAt: "09/04/2024 10:30 AM",
              resultDate: "09/04/2024",
              testId: "LAB96585",
              testCategories: [
                {
                  name: "XÉT NGHIỆM HIV",
                  items: [
                    { name: "HIV Ag/Ab Combo (test sàng lọc)", result: "Âm Tính", range: "-", unit: "-" }
                  ]
                }
              ],
              createdAt: "09/04/2024 12:45 PM"
            };
          } else if (testId % 4 === 2) {
            // Blood Test
            result = {
              id: testId,
              patientName: "Phạm Văn D",
              patientId: "BN58770",
              patientDob: "22/03/1978",
              patientGender: "Nam",
              patientEmail: "phamvand@example.com",
              patientPhone: "0912345682",
              service: "Xét nghiệm máu tổng quát",
              serviceType: 'test' as const,
              testType: 'blood' as const,
              date: "10/04/2024",
              time: "08:30 AM",
              consultant: "BS. Hoàng Văn E",
              sampleType: "Mẫu máu tĩnh mạch",
              sampleCollectedAt: "10/04/2024 08:30 AM",
              sampleReceivedAt: "10/04/2024 08:45 AM",
              resultDate: "10/04/2024",
              testId: "LAB96587",
              testCategories: [
                {
                  name: "HUYẾT HỌC",
                  items: [
                    { name: "Số lượng hồng cầu (RBC)", result: "5.2", range: "4.5-5.5", unit: "10^6/µL" },
                    { name: "Hemoglobin (Hb)", result: "14.5", range: "13.5-17.5", unit: "g/dL" },
                    { name: "Hematocrit (Hct)", result: "44", range: "41-50", unit: "%" },
                    { name: "Số lượng bạch cầu (WBC)", result: "7.5", range: "4.5-11.0", unit: "10^3/µL" },
                    { name: "Số lượng tiểu cầu (PLT)", result: "250", range: "150-400", unit: "10^3/µL" }
                  ]
                },
                {
                  name: "SINH HÓA",
                  items: [
                    { name: "Glucose", result: "95", range: "70-100", unit: "mg/dL" },
                    { name: "Cholesterol toàn phần", result: "180", range: "< 200", unit: "mg/dL" },
                    { name: "Triglyceride", result: "150", range: "< 150", unit: "mg/dL" },
                    { name: "HDL-Cholesterol", result: "45", range: "> 40", unit: "mg/dL" },
                    { name: "LDL-Cholesterol", result: "105", range: "< 130", unit: "mg/dL" }
                  ]
                }
              ],
              createdAt: "10/04/2024 10:30 AM"
            };
          } else {
            // Consultation service
            result = {
              id: testId,
              patientName: "Trần Thị B",
              patientId: "BN58767",
              patientDob: "22/08/1988",
              patientGender: "Nữ",
              patientEmail: "tranthib@example.com",
              patientPhone: "0912345679",
              service: "Tư vấn sức khỏe tình dục",
              serviceType: 'consultation' as const,
              date: "16/06/2023",
              time: "10:30",
              consultant: "Dr. Hoa",
              consultationNotes: "Bệnh nhân đến khám với lo ngại về các phương pháp tránh thai.\n\nNhận xét của bác sĩ:\n- Đã tư vấn về các phương pháp tránh thai khác nhau và hiệu quả của từng phương pháp\n- Đã hướng dẫn cách sử dụng bao cao su đúng cách\n- Đã giải đáp các thắc mắc về tác dụng phụ của thuốc tránh thai\n\nKhuyến nghị: Bệnh nhân nên quay lại tái khám sau 3 tháng để đánh giá hiệu quả của phương pháp đã chọn.",
              createdAt: "16/06/2023 12:45"
            };
          }
          setTestResult(result);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching result:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchTestResult();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/staff/test-results');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="test-result-loading">
        <div className="spinner"></div>
        <p>Đang tải kết quả...</p>
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
          Quay lại danh sách lịch hẹn
        </button>
      </div>
    );
  }

  // Get the title based on test type
  const getTestTitle = () => {
    if (testResult.serviceType === 'consultation') {
      return 'Kết Quả Tư Vấn';
    }
    
    switch (testResult.testType) {
      case 'sti':
        return 'Kết Quả Xét Nghiệm STIs';
      case 'hiv':
        return 'Kết Quả Xét Nghiệm HIV';
      case 'blood':
        return 'Kết Quả Xét Nghiệm Máu';
      default:
        return `Kết Quả ${testResult.service}`;
    }
  };

  // Render test results view
  if (testResult.serviceType === 'test') {
    return (
      <div className="test-result-container">
        <div className="test-result-header">
          <button className="back-button" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại
          </button>
          <h1 className="test-result-title">{getTestTitle()}</h1>
          <div className="test-result-actions">
            <button className="print-button" onClick={handlePrint}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              In
            </button>
            <button className="download-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Tải PDF Chia sẻ
            </button>
          </div>
        </div>

        <div className="test-result-content">
          <div className="info-section">
            <div className="info-card">
              <h2 className="info-card-title">Thông tin bệnh nhân</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Họ và tên:</div>
                  <div className="info-value">{testResult.patientName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Mã bệnh nhân:</div>
                  <div className="info-value">{testResult.patientId}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày sinh:</div>
                  <div className="info-value">{testResult.patientDob}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Giới tính:</div>
                  <div className="info-value">{testResult.patientGender}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Email:</div>
                  <div className="info-value">{testResult.patientEmail}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Số điện thoại:</div>
                  <div className="info-value">{testResult.patientPhone}</div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h2 className="info-card-title">Thông tin mẫu xét nghiệm</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Loại mẫu:</div>
                  <div className="info-value">{testResult.sampleType}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày lấy mẫu:</div>
                  <div className="info-value">{testResult.sampleCollectedAt}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày nhận mẫu:</div>
                  <div className="info-value">{testResult.sampleReceivedAt}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày có kết quả:</div>
                  <div className="info-value">{testResult.resultDate}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Mã xét nghiệm:</div>
                  <div className="info-value">{testResult.testId}</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="result-section-title">Kết quả xét nghiệm</h2>
          
          {testResult.testCategories?.map((category, index) => (
            <div key={index} className="result-category">
              <h3 className="category-title">{category.name}</h3>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              <div className="result-table-container">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>TÊN XÉT NGHIỆM</th>
                      <th>KẾT QUẢ</th>
                      <th>THANG Đ.CHIẾU</th>
                      <th>ĐƠN VỊ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td>{item.name}</td>
                        <td className={
                          item.result.toLowerCase().includes('âm') ? 'result-negative' : 
                          (item.range && item.result && !isNaN(parseFloat(item.result)) && item.range.includes('-')) ? 
                            (isWithinRange(item.result, item.range) ? 'result-normal' : 'result-abnormal') : 
                            'result-value'
                        }>
                          {item.result}
                        </td>
                        <td>{item.range}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="result-footer">
            <div className="result-date">
              Ngày {testResult.date.split('/')[0]} tháng {testResult.date.split('/')[1]} năm {testResult.date.split('/')[2]}
            </div>
            <div className="result-signature">
              <div className="doctor-title">Bác sĩ chỉ định</div>
              <div className="doctor-name">{testResult.consultant}</div>
            </div>
            <div className="result-verification">
              Kết quả này được xác thực điện tử và có giá trị như bản in.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render consultation notes view
  return (
    <div className="test-result-container">
      <div className="test-result-header">
        <button className="back-button" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Quay lại
        </button>
        <button className="print-button" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          In kết quả
        </button>
      </div>

      <div className="test-result-card">
        <div className="test-result-title">
          <h1>Kết Quả Tư Vấn</h1>
          <div className="test-result-id">ID: {testResult.id}</div>
        </div>

        <div className="test-result-info">
          <div className="info-group">
            <div className="info-label">Bệnh nhân:</div>
            <div className="info-value">{testResult.patientName}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Số điện thoại:</div>
            <div className="info-value">{testResult.patientPhone}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Dịch vụ:</div>
            <div className="info-value">{testResult.service}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Ngày khám:</div>
            <div className="info-value">{testResult.date}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Giờ khám:</div>
            <div className="info-value">{testResult.time}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Chuyên gia:</div>
            <div className="info-value">{testResult.consultant}</div>
          </div>
        </div>

        <div className="test-result-content">
          <h2>Nhận xét của chuyên gia</h2>
          <div className="result-text">
            {testResult.consultationNotes?.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        <div className="test-result-footer">
          <div className="timestamp">
            Kết quả được tạo lúc: {testResult.createdAt}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to check if a value is within a reference range
const isWithinRange = (value: string, range: string): boolean => {
  const numValue = parseFloat(value);
  
  // Handle different range formats
  if (range.includes('-')) {
    const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
    return numValue >= min && numValue <= max;
  } else if (range.includes('<')) {
    const max = parseFloat(range.replace('<', '').trim());
    return numValue < max;
  } else if (range.includes('>')) {
    const min = parseFloat(range.replace('>', '').trim());
    return numValue > min;
  }
  
  return true; // If range format is unknown, consider it normal
};

export default TestResultView; 