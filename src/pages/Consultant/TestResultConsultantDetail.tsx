import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaPrint, FaShare } from 'react-icons/fa';
import '../User/TestResultUser.css';

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
  expiryDate?: string;
}

const TestResultConsultantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulating API call to fetch test results
    const fetchTestResults = () => {
      setLoading(true);
      
      // This would be an API call in a real application
      setTimeout(() => {
        // Dữ liệu mẫu khác nhau dựa trên ID
        let fakeReport: TestReport;
        
        switch(id) {
          case 'TR-1001':
            fakeReport = {
              id: 'TR-1001',
              patientInfo: {
                id: 'BN-5023',
                name: 'Nguyễn Văn A',
                dob: '15/05/1992',
                gender: 'Nam',
                email: 'nguyenvana@example.com',
                phone: '0912345678'
              },
              testDate: '25/06/2023',
              reportDate: '25/06/2023',
              sampleType: 'Máu, Dịch niệu đạo',
              collectionDate: '25/06/2023 09:49 AM',
              receivedDate: '25/06/2023 10:05 AM',
              labId: 'LAB10023',
              expiryDate: '05/06/2025',
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
            break;
            
          case 'TR-1002':
            fakeReport = {
              id: 'TR-1002',
              patientInfo: {
                id: 'BN-5045',
                name: 'Trần Thị B',
                dob: '22/08/1990',
                gender: 'Nữ',
                email: 'tranthib@example.com',
                phone: '0987654321'
              },
              testDate: '26/06/2023',
              reportDate: '26/06/2023',
              sampleType: 'Máu, Dịch niệu đạo',
              collectionDate: '26/06/2023 10:15 AM',
              receivedDate: '26/06/2023 11:00 AM',
              labId: 'LAB10045',
              expiryDate: '05/06/2025',
              categories: [
                {
                  name: 'SINH HÓA',
                  results: [
                    {
                      name: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
                      value: '1.20',
                      referenceRange: '< 1',
                      unit: 'RU',
                      status: 'abnormal'
                    }
                  ]
                },
                {
                  name: 'MIỄN DỊCH',
                  results: [
                    {
                      name: 'HIV Combo Ag + Ab',
                      value: '0.08',
                      referenceRange: '< 1',
                      unit: 'S/CO',
                      status: 'normal'
                    },
                    {
                      name: 'Hepatitis B Surface Antigen',
                      value: '1.25',
                      referenceRange: 'Âm Tính: < 1.00\nDương Tính: ≥ 1.00',
                      unit: 'S/CO',
                      status: 'abnormal'
                    }
                  ]
                }
              ],
              notes: 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu. Đề nghị tái khám sau 3 tháng.',
              doctorName: 'BS. Nguyễn Thị C'
            };
            break;
            
          case 'TR-1003':
            fakeReport = {
              id: 'TR-1003',
              patientInfo: {
                id: 'BN-5078',
                name: 'Lê Văn C',
                dob: '10/11/1988',
                gender: 'Nam',
                email: 'levanc@example.com',
                phone: '0909123456'
              },
              testDate: '27/06/2023',
              reportDate: '27/06/2023',
              sampleType: 'Máu, Dịch niệu đạo',
              collectionDate: '27/06/2023 08:30 AM',
              receivedDate: '27/06/2023 09:15 AM',
              labId: 'LAB10078',
              expiryDate: '05/06/2025',
              categories: [
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
              doctorName: 'BS. Phạm Văn D'
            };
            break;
            
          case 'TR-1004':
            fakeReport = {
              id: 'TR-1004',
              patientInfo: {
                id: 'BN-5102',
                name: 'Phạm Thị D',
                dob: '05/03/1995',
                gender: 'Nữ',
                email: 'phamthid@example.com',
                phone: '0912876543'
              },
              testDate: '28/06/2023',
              reportDate: '28/06/2023',
              sampleType: 'Máu, Dịch niệu đạo, Tế bào cổ tử cung',
              collectionDate: '28/06/2023 14:20 PM',
              receivedDate: '28/06/2023 15:00 PM',
              labId: 'LAB10102',
              expiryDate: '05/06/2025',
              categories: [
                {
                  name: 'SINH HỌC PHÂN TỬ',
                  description: 'HPV Genotyping (Định type)',
                  results: [
                    { name: 'HPV 16', value: 'Dương Tính', status: 'critical' },
                    { name: 'HPV 18', value: 'Âm Tính', status: 'normal' },
                    { name: 'HPV Type nguy cơ cao khác', value: 'Âm Tính', status: 'normal' }
                  ]
                }
              ],
              notes: 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu. Đề nghị tái khám ngay để được tư vấn điều trị.',
              doctorName: 'BS. Hoàng Thị E'
            };
            break;
            
          case 'TR-1005':
            fakeReport = {
              id: 'TR-1005',
              patientInfo: {
                id: 'BN-5134',
                name: 'Hoàng Văn E',
                dob: '18/12/1985',
                gender: 'Nam',
                email: 'hoangvane@example.com',
                phone: '0978123456'
              },
              testDate: '29/06/2023',
              reportDate: '29/06/2023',
              sampleType: 'Máu, Dịch niệu đạo',
              collectionDate: '29/06/2023 11:30 AM',
              receivedDate: '29/06/2023 12:15 PM',
              labId: 'LAB10134',
              expiryDate: '05/06/2025',
              categories: [
                {
                  name: 'SINH HÓA',
                  results: [
                    {
                      name: 'Rapid Plasma Reagin (RPR - Kháng thể không đặc hiệu giang mai)',
                      value: '0.50',
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
                      value: '0.07',
                      referenceRange: '< 1',
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
                    { name: 'Candida albicans', value: 'Dương Tính', status: 'abnormal' },
                    { name: 'Treponema pallidum', value: 'Âm Tính', status: 'normal' },
                    { name: 'Herpes Simplex Virus 1', value: 'Âm Tính', status: 'normal' },
                    { name: 'Herpes Simplex Virus 2', value: 'Âm Tính', status: 'normal' },
                    { name: 'Ureaplasma parvum', value: 'Dương Tính', status: 'abnormal' },
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
              notes: 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu. Đề nghị điều trị nhiễm nấm Candida và Ureaplasma.',
              doctorName: 'BS. Trần Văn F'
            };
            break;
            
          default:
            // Trường hợp không tìm thấy ID phù hợp
            fakeReport = {
              id: id || 'Unknown',
              patientInfo: {
                id: 'Unknown',
                name: 'Không tìm thấy',
                dob: 'N/A',
                gender: 'N/A',
                email: 'N/A',
                phone: 'N/A'
              },
              testDate: 'N/A',
              reportDate: 'N/A',
              sampleType: 'N/A',
              collectionDate: 'N/A',
              receivedDate: 'N/A',
              labId: 'N/A',
              expiryDate: 'N/A',
              categories: [],
              notes: 'Không tìm thấy kết quả xét nghiệm cho ID này.',
              doctorName: 'N/A'
            };
        }
        
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
        <Link to="/consultant/test-results" className="back-link">
          <FaArrowLeft /> Quay lại danh sách kết quả
        </Link>
      </div>
    );
  }

  return (
    <div className="test-results-page">
      <div className="test-results-container">
        <div className="test-results-header">
          <div className="header-left">
            <Link to="/consultant/test-results" className="back-button">
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

export default TestResultConsultantDetail; 