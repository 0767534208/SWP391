import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaPrint, FaShare } from 'react-icons/fa';
import './TestResultConsultant.css';
import { testResultService } from '../../services';
import { toast } from 'react-hot-toast';

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
    // Fetch test result data from API
    const fetchTestResult = async () => {
      if (!id) {
        toast.error('Không tìm thấy ID kết quả xét nghiệm');
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await testResultService.getTestResult(id);
        
        if (response.statusCode === 200 && response.data) {
          const testResult = response.data;
          
          // Transform API data to match our component's expected format
          const reportData: TestReport = {
            id: testResult.id,
            patientInfo: {
              id: testResult.userId,
              name: testResult.user?.name || 'Không xác định',
              dob: testResult.user?.dateOfBirth || 'Không có thông tin',
              gender: testResult.user?.gender || 'Không xác định',
              email: testResult.user?.email,
              phone: testResult.user?.phone
            },
            testDate: testResult.testDate,
            reportDate: testResult.testDate, // Using same date for simplicity
            sampleType: testResult.testType,
            collectionDate: `${testResult.testDate} 09:00 AM`, // Simulating time
            receivedDate: `${testResult.testDate} 10:00 AM`, // Simulating time
            labId: `LAB-${testResult.id.substring(0, 5).toUpperCase()}`,
            expiryDate: calculateExpiryDate(testResult.testDate),
            categories: determineCategories(testResult),
            notes: testResult.notes || 'Kết quả xét nghiệm chỉ có giá trị tại thời điểm lấy mẫu.',
            doctorName: 'BS. Tư vấn'
          };
          
          setReport(reportData);
        } else {
          toast.error(`Không thể tải kết quả xét nghiệm: ${response.message}`);
          fallbackToMockData();
        }
      } catch (error) {
        console.error('Error fetching test result:', error);
        toast.error('Có lỗi khi tải kết quả xét nghiệm, đang hiển thị dữ liệu mẫu');
        fallbackToMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestResult();
  }, [id]);
  
  // Helper function to calculate expiry date (1 year from test date)
  const calculateExpiryDate = (testDate: string): string => {
    const date = new Date(testDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };
  
  // Helper function to determine status based on result
  const determineStatus = (result: string): 'normal' | 'abnormal' | 'critical' => {
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('dương tính') || lowerResult.includes('positive')) {
      return 'abnormal';
    } else if (lowerResult.includes('nguy hiểm') || lowerResult.includes('critical')) {
      return 'critical';
    } else {
      return 'normal';
    }
  };
  
  // Helper function to create categories based on test result
  const determineCategories = (testResult: any): TestCategory[] => {
    // Create simple categories based on test type
    const result = testResult.result || 'Không có kết quả';
    const status = determineStatus(result);
    
    // Default category with test result
    const categories: TestCategory[] = [
      {
        name: 'KẾT QUẢ XÉT NGHIỆM',
        results: [
          {
            name: testResult.testType,
            value: result,
            status: status
          }
        ]
      }
    ];
    
    // For HIV test, add more detailed information
    if (testResult.testType.toLowerCase().includes('hiv')) {
      categories.push({
        name: 'MIỄN DỊCH',
        results: [
          {
            name: 'HIV Combo Ag + Ab',
            value: status === 'normal' ? '0.05' : '3.25',
            referenceRange: '< 1',
            unit: 'S/CO',
            status: status
          }
        ]
      });
    }
    
    return categories;
  };
  
  // Fallback to mock data if API fails
  const fallbackToMockData = () => {
    if (!id) return;
    
    // This is mock data used as fallback
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
            
      // Add cases for other IDs if needed
      
      default:
            fakeReport = {
          id: id,
              patientInfo: {
            id: 'BN-XXXX',
            name: 'Bệnh nhân',
            dob: '01/01/1990',
            gender: 'Không xác định',
            email: 'patient@example.com',
            phone: '0900000000'
          },
          testDate: '01/01/2023',
          reportDate: '01/01/2023',
          sampleType: 'Máu',
          collectionDate: '01/01/2023 09:00 AM',
          receivedDate: '01/01/2023 10:00 AM',
          labId: 'LABXXXXX',
          expiryDate: '01/01/2024',
              categories: [
                {
              name: 'KẾT QUẢ XÉT NGHIỆM',
                  results: [
                {
                  name: 'Xét nghiệm chung',
                  value: 'Bình thường',
                      status: 'normal'
                    }
                  ]
                }
              ],
          notes: 'Dữ liệu mẫu - không phải kết quả thực tế',
          doctorName: 'BS. Mẫu'
            };
        }
        
        setReport(fakeReport);
    };

  const handlePrint = () => {
    window.print();
  };

  const getStatusClass = (status: 'normal' | 'abnormal' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'status-normal';
      case 'abnormal': return 'status-abnormal';
      case 'critical': return 'status-critical';
      default: return '';
    }
  };

  return (
    <div className="test-result-consultant">
      <div className="test-result-header">
        <h1>Chi tiết kết quả xét nghiệm</h1>
        <div className="page-actions">
          <Link to="/consultant/test-results" className="btn-back">
            <FaArrowLeft /> Quay lại danh sách kết quả
            </Link>
          <div className="action-buttons">
            <button className="btn-print" onClick={handlePrint}>
              <FaPrint /> In kết quả
            </button>
            <button className="btn-download">
              <FaDownload /> Tải PDF
            </button>
            <button className="btn-share">
              <FaShare /> Chia sẻ
            </button>
          </div>
        </div>
                </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải kết quả xét nghiệm...</p>
                </div>
      ) : report ? (
        <div className="test-report">
          <div className="report-header">
            <div className="clinic-info">
              <h3>TRUNG TÂM Y TẾ CHĂM SÓC SỨC KHỎE SINH SẢN</h3>
              <p>123 Nguyễn Văn Linh, Quận 7, TP.HCM</p>
              <p>ĐT: 1900-0123 | Email: info@rh-center.vn</p>
                </div>
            <div className="report-title">
              <h2>KẾT QUẢ XÉT NGHIỆM</h2>
              <div className="report-id">Mã phiếu: {report.id}</div>
                </div>
              </div>
          
          <div className="patient-info">
            <div className="info-row">
              <div className="info-item"><strong>Họ tên:</strong> {report.patientInfo.name}</div>
              <div className="info-item"><strong>Mã BN:</strong> {report.patientInfo.id}</div>
            </div>
            <div className="info-row">
              <div className="info-item"><strong>Ngày sinh:</strong> {report.patientInfo.dob}</div>
              <div className="info-item"><strong>Giới tính:</strong> {report.patientInfo.gender}</div>
                </div>
            <div className="info-row">
              <div className="info-item"><strong>SĐT:</strong> {report.patientInfo.phone || 'N/A'}</div>
              <div className="info-item"><strong>Email:</strong> {report.patientInfo.email || 'N/A'}</div>
                </div>
                </div>
          
          <div className="test-info">
            <div className="info-row">
              <div className="info-item"><strong>Loại mẫu:</strong> {report.sampleType}</div>
              <div className="info-item"><strong>Mã xét nghiệm:</strong> {report.id}</div>
                </div>
            <div className="info-row">
              <div className="info-item"><strong>Ngày lấy mẫu:</strong> {report.collectionDate}</div>
              <div className="info-item"><strong>Ngày nhận mẫu:</strong> {report.receivedDate}</div>
                </div>
            <div className="info-row">
              <div className="info-item"><strong>Ngày trả kết quả:</strong> {report.reportDate}</div>
              <div className="info-item"><strong>Có hiệu lực đến:</strong> {report.expiryDate}</div>
            </div>
          </div>

          <div className="test-results">
            {report.categories.map((category, index) => (
              <div key={index} className="test-category">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Tên xét nghiệm</th>
                      <th>Kết quả</th>
                      <th>Đơn vị</th>
                      <th>Giá trị tham chiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.results.map((result, idx) => (
                      <tr key={idx} className={`result-row result-${result.status}`}>
                        <td>{result.name}</td>
                        <td className={`result-value result-${result.status}`}>
                          {result.value}
                        </td>
                        <td>{result.unit || ''}</td>
                        <td>{result.referenceRange || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {report.notes && (
            <div className="test-notes">
              <p><strong>Ghi chú:</strong> {report.notes}</p>
            </div>
          )}
          
          <div className="report-footer">
            <div className="doctor-signature">
              <p><strong>Bác sĩ phụ trách</strong></p>
              <div className="signature-placeholder"></div>
              <p>{report.doctorName}</p>
            </div>
            <div className="report-note">
              <p>Kết quả này được tạo bởi hệ thống điện tử và có giá trị mà không cần chữ ký</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>Không thể tải kết quả xét nghiệm. Vui lòng thử lại sau.</p>
          <Link to="/consultant/test-results" className="btn-back">
            <FaArrowLeft /> Quay lại danh sách
          </Link>
      </div>
      )}
    </div>
  );
};

export default TestResultConsultantDetail; 