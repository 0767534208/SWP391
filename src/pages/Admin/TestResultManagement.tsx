import React, { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import './TestResultManagement.css';

// Types
interface TestResultDetail {
  testName: string;
  result: string;
  normalRange?: string;
  unit?: string;
  isNormal: boolean;
}

interface TestResult {
  id: number;
  patientId: string;
  patientName: string;
  testType: string;
  testDate: string;
  resultDate: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  results: TestResultDetail[];
  notes: string;
}

interface TestResultFormData {
  patientId: string;
  patientName: string;
  testType: string;
  testDate: string;
  notes: string;
}

const TestResultManagement = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  // Form data for adding/editing test results
  const [formData, setFormData] = useState<TestResultFormData>({
    patientId: '',
    patientName: '',
    testType: 'Complete STI Panel',
    testDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Form data for adding result details to a test
  const [resultFormData, setResultFormData] = useState<TestResultDetail[]>([
    { testName: '', result: '', normalRange: '', unit: '', isNormal: true }
  ]);
  const [resultNotes, setResultNotes] = useState('');

  // Mock data for test results
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 1,
      patientId: 'P-1001',
      patientName: 'John Smith',
      testType: 'Complete STI Panel',
      testDate: '2023-06-15',
      resultDate: '2023-06-18',
      status: 'completed',
      results: [
        { testName: 'HIV Antibody', result: 'Negative', isNormal: true },
        { testName: 'Hepatitis B Surface Antigen', result: 'Negative', isNormal: true },
        { testName: 'Syphilis RPR', result: 'Non-reactive', isNormal: true },
        { testName: 'Gonorrhea PCR', result: 'Negative', isNormal: true },
        { testName: 'Chlamydia PCR', result: 'Negative', isNormal: true }
      ],
      notes: 'All tests normal. Follow-up recommended in 6 months for routine screening.'
    },
    {
      id: 2,
      patientId: 'P-1042',
      patientName: 'Sarah Johnson',
      testType: 'HIV Testing',
      testDate: '2023-06-18',
      resultDate: '2023-06-20',
      status: 'completed',
      results: [
        { testName: 'HIV Antibody/Antigen', result: 'Negative', isNormal: true },
        { testName: 'CD4 Count', result: '850', unit: 'cells/mm³', normalRange: '500-1500', isNormal: true }
      ],
      notes: 'No issues found. Patient advised on preventive measures.'
    },
    {
      id: 3,
      patientId: 'P-1089',
      patientName: 'Michael Lee',
      testType: 'Hepatitis Panel',
      testDate: '2023-06-20',
      resultDate: null,
      status: 'pending',
      results: [],
      notes: 'Sample collected and sent to lab.'
    },
    {
      id: 4,
      patientId: 'P-1112',
      patientName: 'Jessica Taylor',
      testType: 'Complete STI Panel',
      testDate: '2023-06-21',
      resultDate: null,
      status: 'pending',
      results: [],
      notes: 'Expedited processing requested.'
    },
    {
      id: 5,
      patientId: 'P-1156',
      patientName: 'David Martinez',
      testType: 'Syphilis Screening',
      testDate: '2023-06-19',
      resultDate: '2023-06-22',
      status: 'completed',
      results: [
        { testName: 'Syphilis RPR', result: 'Reactive', isNormal: false },
        { testName: 'Syphilis Confirmation (TPPA)', result: 'Positive', isNormal: false }
      ],
      notes: 'Positive results. Patient contacted for immediate follow-up and treatment options.'
    }
  ]);

  // Form handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleResultInputChange = (index: number, field: keyof TestResultDetail, value: string) => {
    const updatedResults = [...resultFormData];
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: value,
      isNormal: field === 'result' ? 
        (value.toLowerCase() === 'negative' || value.toLowerCase() === 'non-reactive' || value.toLowerCase() === 'normal') : 
        updatedResults[index].isNormal
    };
    setResultFormData(updatedResults);
  };

  const addResultRow = () => {
    setResultFormData([...resultFormData, { testName: '', result: '', normalRange: '', unit: '', isNormal: true }]);
  };

  const removeResultRow = (index: number) => {
    if (resultFormData.length > 1) {
      const updatedResults = [...resultFormData];
      updatedResults.splice(index, 1);
      setResultFormData(updatedResults);
    }
  };

  // Filter test results based on search query and status
  const filteredTestResults = testResults.filter(test => {
    const matchesSearch = 
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredTestResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredTestResults.length / resultsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // CRUD operations
  // View test details
  const handleViewTest = (test: TestResult) => {
    setCurrentTest(test);
    setShowViewModal(true);
  };

  // Add new test
  const handleAddTest = (e: FormEvent) => {
    e.preventDefault();
    
    const newTest: TestResult = {
      id: Math.max(0, ...testResults.map(t => t.id)) + 1,
      patientId: formData.patientId,
      patientName: formData.patientName,
      testType: formData.testType,
      testDate: formData.testDate,
      resultDate: null,
      status: 'pending',
      results: [],
      notes: formData.notes
    };

    setTestResults([...testResults, newTest]);
    setShowAddTestModal(false);
    
    // Reset form data
    setFormData({
      patientId: '',
      patientName: '',
      testType: 'Complete STI Panel',
      testDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Edit test
  const handleEditTest = (test: TestResult) => {
    setCurrentTest(test);
    setFormData({
      patientId: test.patientId,
      patientName: test.patientName,
      testType: test.testType,
      testDate: test.testDate,
      notes: test.notes
    });
    setShowEditModal(true);
  };

  // Update test
  const handleUpdateTest = (e: FormEvent) => {
    e.preventDefault();
    
    if (currentTest) {
      const updatedTests = testResults.map(test => 
        test.id === currentTest.id ? {
          ...test,
          patientId: formData.patientId,
          patientName: formData.patientName,
          testType: formData.testType,
          testDate: formData.testDate,
          notes: formData.notes
        } : test
      );
      
      setTestResults(updatedTests);
      setShowEditModal(false);
    }
  };

  // Start adding results to a test
  const handleStartAddResults = (test: TestResult) => {
    console.log("Bắt đầu thêm kết quả cho", test);
    setCurrentTest(test);
    setResultFormData([{ testName: '', result: '', normalRange: '', unit: '', isNormal: true }]);
    setResultNotes(test.notes);
    setShowAddModal(true);
  };

  // Add results to a test
  const handleAddResult = () => {
    if (currentTest) {
      // Validate form
      const hasEmptyFields = resultFormData.some(result => !result.testName || !result.result);
      if (hasEmptyFields) {
        alert('Please fill in all required fields (Test Name and Result)');
        return;
      }

      setTestResults(prevTests => 
        prevTests.map(test => 
          test.id === currentTest.id
            ? { 
                ...test, 
                results: resultFormData, 
                notes: resultNotes,
                status: 'completed',
                resultDate: new Date().toISOString().split('T')[0]
              }
            : test
        )
      );
      setShowAddModal(false);
    }
  };

  // Delete test
  const handleDeleteClick = (test: TestResult) => {
    setCurrentTest(test);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (currentTest) {
      setTestResults(prevTests => prevTests.filter(test => test.id !== currentTest.id));
      setShowDeleteModal(false);
    }
  };

  // Cancel test
  const handleCancelTest = (testId: number) => {
    console.log("Hủy xét nghiệm id:", testId);
    setTestResults(prevTests => 
      prevTests.map(test => 
        test.id === testId ? { ...test, status: 'cancelled' } : test
      )
    );
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-badge completed';
      case 'pending':
        return 'status-badge pending';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="test-result-management">
      <div className="page-header">
        <h1>Test Results Management</h1>
        <p>Manage and update patient STI test results</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by patient name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="filter-controls">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="add-test-button" onClick={() => setShowAddTestModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Test
          </button>
        </div>
      </div>

      <div className="test-results-table-container">
        <table className="test-results-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Test Date</th>
              <th>Results Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length > 0 ? (
              currentResults.map(test => (
                <tr key={test.id}>
                  <td>{test.patientId}</td>
                  <td>{test.patientName}</td>
                  <td>{test.testType}</td>
                  <td>{test.testDate}</td>
                  <td>{test.resultDate || '-'}</td>
                  <td>
                    <span className={getStatusBadgeClass(test.status)}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewTest(test)}
                        className="action-button action-button-view"
                        title="Xem chi tiết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditTest(test)}
                        className="action-button action-button-edit"
                        title="Chỉnh sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(test)}
                        className="action-button action-button-delete"
                        title="Xóa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-results">No test results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTestResults.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* View Test Modal */}
      {showViewModal && currentTest && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Test Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="test-details">
                <div className="detail-group">
                  <div className="detail-label">Patient ID:</div>
                  <div className="detail-value">{currentTest.patientId}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Patient Name:</div>
                  <div className="detail-value">{currentTest.patientName}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Test Type:</div>
                  <div className="detail-value">{currentTest.testType}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Test Date:</div>
                  <div className="detail-value">{currentTest.testDate}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Results Date:</div>
                  <div className="detail-value">{currentTest.resultDate || 'Pending'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value">
                    <span className={getStatusBadgeClass(currentTest.status)}>
                      {currentTest.status.charAt(0).toUpperCase() + currentTest.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Notes:</div>
                  <div className="detail-value">{currentTest.notes || 'No notes'}</div>
                </div>
              </div>
              
              {currentTest.results.length > 0 && (
                <div className="results-section">
                  <h3>Test Results</h3>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Result</th>
                        <th>Normal Range</th>
                        <th>Unit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTest.results.map((result, index) => (
                        <tr key={index}>
                          <td>{result.testName}</td>
                          <td>{result.result}</td>
                          <td>{result.normalRange || '-'}</td>
                          <td>{result.unit || '-'}</td>
                          <td>
                            <span className={`result-status ${result.isNormal ? 'normal' : 'abnormal'}`}>
                              {result.isNormal ? 'Normal' : 'Abnormal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Results Modal */}
      {showAddModal && currentTest && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Test Results</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="patient-info">
                <p><strong>Patient:</strong> {currentTest.patientName} ({currentTest.patientId})</p>
                <p><strong>Test Type:</strong> {currentTest.testType}</p>
                <p><strong>Test Date:</strong> {currentTest.testDate}</p>
              </div>
              
              <div className="results-form">
                <h3>Test Results</h3>
                
                {resultFormData.map((result, index) => (
                  <div className="result-row" key={index}>
                    <div className="result-field">
                      <label>Test Name *</label>
                      <input 
                        type="text" 
                        value={result.testName}
                        onChange={(e) => handleResultInputChange(index, 'testName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="result-field">
                      <label>Result *</label>
                      <input 
                        type="text" 
                        value={result.result}
                        onChange={(e) => handleResultInputChange(index, 'result', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="result-field">
                      <label>Normal Range</label>
                      <input 
                        type="text" 
                        value={result.normalRange || ''}
                        onChange={(e) => handleResultInputChange(index, 'normalRange', e.target.value)}
                      />
                    </div>
                    
                    <div className="result-field">
                      <label>Unit</label>
                      <input 
                        type="text" 
                        value={result.unit || ''}
                        onChange={(e) => handleResultInputChange(index, 'unit', e.target.value)}
                      />
                    </div>
                    
                    <div className="result-actions">
                      {resultFormData.length > 1 && (
                        <button 
                          type="button" 
                          className="remove-row-button"
                          onClick={() => removeResultRow(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="add-row-button"
                  onClick={addResultRow}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Test
                </button>
                
                <div className="notes-field">
                  <label>Notes</label>
                  <textarea 
                    value={resultNotes}
                    onChange={(e) => setResultNotes(e.target.value)}
                    placeholder="Enter any additional notes about the test results"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              
              <button 
                className="save-button"
                onClick={() => handleAddResult()}
              >
                Save Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Test Modal */}
      {showAddTestModal && (
        <div className="modal-overlay" onClick={() => setShowAddTestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Test</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddTestModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleAddTest}>
                <div className="form-group">
                  <label>Patient ID *</label>
                  <input 
                    type="text" 
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input 
                    type="text" 
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Test Type *</label>
                  <select 
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Complete STI Panel">Complete STI Panel</option>
                    <option value="HIV Testing">HIV Testing</option>
                    <option value="Hepatitis Panel">Hepatitis Panel</option>
                    <option value="Syphilis Screening">Syphilis Screening</option>
                    <option value="Gonorrhea Test">Gonorrhea Test</option>
                    <option value="Chlamydia Test">Chlamydia Test</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Test Date *</label>
                  <input 
                    type="date" 
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes about the test"
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowAddTestModal(false)}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    className="save-button"
                  >
                    Add Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      {showEditModal && currentTest && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Test</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleUpdateTest}>
                <div className="form-group">
                  <label>Patient ID *</label>
                  <input 
                    type="text" 
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input 
                    type="text" 
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Test Type *</label>
                  <select 
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Complete STI Panel">Complete STI Panel</option>
                    <option value="HIV Testing">HIV Testing</option>
                    <option value="Hepatitis Panel">Hepatitis Panel</option>
                    <option value="Syphilis Screening">Syphilis Screening</option>
                    <option value="Gonorrhea Test">Gonorrhea Test</option>
                    <option value="Chlamydia Test">Chlamydia Test</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Test Date *</label>
                  <input 
                    type="date" 
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes about the test"
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    className="save-button"
                  >
                    Update Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Test Modal */}
      {showDeleteModal && currentTest && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Test</h2>
              <button 
                className="close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this test record? This action cannot be undone.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              
              <button 
                className="delete-button"
                onClick={() => handleDeleteConfirm()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultManagement; 