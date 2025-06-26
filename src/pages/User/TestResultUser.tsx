import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaPrint, FaShare } from 'react-icons/fa';
import './TestResultUser.css';

// Define interfaces for our data structure
interface TestResult {
  name: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
}

interface TestCategory {
  name: string;
  description?: string;
  results: TestResult[];
}

interface PatientInfo {
  id: string;
  name: string;
  dob: string;
  gender: string;
  email?: string;
  phone?: string;
}

interface TestReport {
  id: string;
  patientInfo: PatientInfo;
  testDate: string;
  reportDate: string;
  sampleType: string;
  collectionDate: string;
  receivedDate: string;
  labId: string;
  categories: TestCategory[];
  notes?: string;
  doctorName?: string;
}

const TestResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulating API call to fetch test results
    const fetchTestResults = () => {
      setLoading(true);
      
      // This would be an API call in a real application
      setTimeout(() => {
        // Fake data based on the image
        const fakeReport: TestReport = {
          id: id || '123456',
          patientInfo: {
            id: 'BN' + Math.floor(10000 + Math.random() * 90000),
            name: 'Nguyễn Văn A',
            dob: '15/05/1992',
            gender: 'Nam',
            email: 'nguyenvana@example.com',
            phone: '0912345678'
          },
          testDate: '08/04/2024',
          reportDate: '08/04/2024',
          sampleType: 'Máu, Dịch niệu đạo',
          collectionDate: '08/04/2024 09:49 AM',
          receivedDate: '08/04/2024 10:05 AM',
          labId: 'LAB' + Math.floor(10000 + Math.random() * 90000),
          categories: [
            {
              name: 'SINH HÓA',
              results: [
                {
                  name: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
                  value: '0.00',
                  referenceRange: '< 1',
                  unit: 'RU',
                  status: 'normal'
                }
              ]
            },
            {
              name: 'MIỄN DỊCH',
              results: [
                {
                  name: 'HIV Combo Ag + Ab',
                  value: '0.05',
                  referenceRange: '< 1',
                  unit: 'S/CO',
                  status: 'normal'
                },
                {
                  name: 'Syphilis',
                  value: '0.11',
                  referenceRange: 'Âm Tính: < 1.00\nDương Tính: ≥ 1.00',
                  unit: 'S/CO',
                  status: 'normal'
                }
              ]
            },
            {
              name: 'SINH HỌC PHÂN TỬ',
              description: 'Bộ STIs / STDs 13 Realtime PCR (Định Tính - CE-IVD)',
              results: [
                { name: 'Chlamydia trachomatis', value: 'Âm Tính', status: 'normal' },
                { name: 'Candida albicans', value: 'Âm Tính', status: 'normal' },
                { name: 'Treponema pallidum', value: 'Âm Tính', status: 'normal' },
                { name: 'Herpes Simplex Virus 1', value: 'Âm Tính', status: 'normal' },
                { name: 'Herpes Simplex Virus 2', value: 'Âm Tính', status: 'normal' },
                { name: 'Ureaplasma parvum', value: 'Âm Tính', status: 'normal' },
                { name: 'Trichomonas vaginalis', value: 'Âm Tính', status: 'normal' },
                { name: 'Mycoplasma genitalium', value: 'Âm Tính', status: 'normal' },
                { name: 'Mycoplasma hominis', value: 'Âm Tính', status: 'normal' },
                { name: 'Neisseria gonorrhoeae', value: 'Âm Tính', status: 'normal' },
                { name: 'Ureaplasma urealyticum', value: 'Âm Tính', status: 'normal' },
                { name: 'Haemophilus ducreyi', value: 'Âm Tính', status: 'normal' },
                { name: 'Gardnerella vaginalis', value: 'Âm Tính', status: 'normal' }
              ]
            }
          ],
          notes: 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu.',
          doctorName: 'BS. Trần Văn B'
        };
        
        setReport(fakeReport);
        setLoading(false);
      }, 1000);
    };
    
    fetchTestResults();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="test-results-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải kết quả xét nghiệm...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="test-results-error">
        <h2>Không tìm thấy kết quả xét nghiệm</h2>
        <p>Kết quả xét nghiệm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/profile" className="back-link">
          <FaArrowLeft /> Quay lại trang cá nhân
        </Link>
      </div>
    );
  }

  return (
    <div className="test-results-page">
      <div className="test-results-container">
        <div className="test-results-header">
          <div className="header-left">
            <Link to="/profile" className="back-button">
              <FaArrowLeft /> Quay lại
            </Link>
          </div>
          <div className="header-center">
            <h1>Kết Quả Xét Nghiệm STIs</h1>
            <p>Mã phiếu: {report.id}</p>
          </div>
          <div className="header-right">
            <button className="action-button" onClick={handlePrint}>
              <FaPrint /> In
            </button>
            <button className="action-button">
              <FaDownload /> Tải PDF
            </button>
            <button className="action-button">
              <FaShare /> Chia sẻ
            </button>
          </div>
        </div>

        <div className="test-results-content">
          <div className="test-info-section">
            <div className="patient-info">
              <h2>Thông tin bệnh nhân</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Họ và tên:</span>
                  <span className="info-value">{report.patientInfo.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mã bệnh nhân:</span>
                  <span className="info-value">{report.patientInfo.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày sinh:</span>
                  <span className="info-value">{report.patientInfo.dob}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Giới tính:</span>
                  <span className="info-value">{report.patientInfo.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{report.patientInfo.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{report.patientInfo.phone}</span>
                </div>
              </div>
            </div>

            <div className="sample-info">
              <h2>Thông tin mẫu xét nghiệm</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Loại mẫu:</span>
                  <span className="info-value">{report.sampleType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày lấy mẫu:</span>
                  <span className="info-value">{report.collectionDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày nhận mẫu:</span>
                  <span className="info-value">{report.receivedDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày có kết quả:</span>
                  <span className="info-value">{report.reportDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mã xét nghiệm:</span>
                  <span className="info-value">{report.labId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="test-results-section">
            <h2>Kết quả xét nghiệm</h2>
            
            {report.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="result-category">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                
                <table className="results-table">
                  <thead>
                    <tr>
                      <th className="test-name-col">TÊN XÉT NGHIỆM</th>
                      <th className="test-result-col">KẾT QUẢ</th>
                      <th className="reference-range-col">THANG Đ.CHIẾU</th>
                      <th className="unit-col">ĐƠN VỊ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.results.map((result, resultIndex) => (
                      <tr key={resultIndex} className={`result-row ${result.status}`}>
                        <td className="test-name">{result.name}</td>
                        <td className="test-result">{result.value}</td>
                        <td className="reference-range">{result.referenceRange || '-'}</td>
                        <td className="unit">{result.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="test-footer">
            <div className="doctor-signature">
              <p className="signature-date">Ngày {report.reportDate.split('/')[0]} tháng {report.reportDate.split('/')[1]} năm {report.reportDate.split('/')[2]}</p>
              <p className="doctor-title">Bác sĩ chỉ định</p>
              <p className="doctor-name">{report.doctorName}</p>
            </div>
            <div className="report-verification">
              <p>Kết quả này được xác thực điện tử và có giá trị như bản in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 