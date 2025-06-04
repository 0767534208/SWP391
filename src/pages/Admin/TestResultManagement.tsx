import React, { useState } from 'react';
import './TestResultManagement.css';

const TestResultManagement = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);

  // Types
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

  interface TestResultDetail {
    testName: string;
    result: string;
    normalRange?: string;
    unit?: string;
    isNormal: boolean;
  }

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

  // Filter test results based on search query and status
  const filteredTestResults = testResults.filter(test => {
    const matchesSearch = 
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle view test details
  const handleViewTest = (test: TestResult) => {
    setCurrentTest(test);
    setShowViewModal(true);
  };

  // Handle add test result
  const handleAddResult = (testId: number, results: TestResultDetail[], notes: string) => {
    setTestResults(prevTests => 
      prevTests.map(test => 
        test.id === testId
          ? { 
              ...test, 
              results, 
              notes,
              status: 'completed',
              resultDate: new Date().toISOString().split('T')[0]
            }
          : test
      )
    );
    setShowAddModal(false);
  };

  // Handle starting to add results
  const handleStartAddResults = (test: TestResult) => {
    setCurrentTest(test);
    setShowAddModal(true);
  };

  // Handle delete test
  const handleDeleteTest = (id: number) => {
    if (window.confirm('Are you sure you want to delete this test record? This action cannot be undone.')) {
      setTestResults(prevTests => prevTests.filter(test => test.id !== id));
    }
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
        </div>
      </div>

      <div className="test-results-table-container">
        <table className="test-results-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Test Date</th>
              <th>Result Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestResults.length > 0 ? (
              filteredTestResults.map(test => (
                <tr key={test.id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{test.patientName}</div>
                      <div className="patient-id">{test.patientId}</div>
                    </div>
                  </td>
                  <td>{test.testType}</td>
                  <td>{test.testDate}</td>
                  <td>{test.resultDate || '—'}</td>
                  <td>
                    <span className={getStatusBadgeClass(test.status)}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {test.status === 'completed' && (
                        <button 
                          className="view-button"
                          onClick={() => handleViewTest(test)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View
                        </button>
                      )}
                      
                      {test.status === 'pending' && (
                        <button 
                          className="add-results-button"
                          onClick={() => handleStartAddResults(test)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Add Results
                        </button>
                      )}
                      
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteTest(test.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="no-results">
                <td colSpan={6}>No test results found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Test Results Modal */}
      {showViewModal && currentTest && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Test Results</h2>
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
              <div className="test-info">
                <div className="info-row">
                  <div className="info-label">Patient:</div>
                  <div className="info-value">{currentTest.patientName} ({currentTest.patientId})</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Test Type:</div>
                  <div className="info-value">{currentTest.testType}</div>
                </div>
                
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Test Date:</div>
                    <div className="info-value">{currentTest.testDate}</div>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-label">Result Date:</div>
                    <div className="info-value">{currentTest.resultDate}</div>
                  </div>
                </div>
              </div>
              
              <div className="results-section">
                <h3>Test Results</h3>
                
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Result</th>
                      <th>Normal Range</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTest.results.map((result, index) => (
                      <tr key={index}>
                        <td>{result.testName}</td>
                        <td>
                          {result.result} {result.unit && `(${result.unit})`}
                        </td>
                        <td>{result.normalRange || 'N/A'}</td>
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
              
              <div className="notes-section">
                <h3>Notes</h3>
                <p>{currentTest.notes}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="print-button"
                  onClick={() => window.print()}
                >
                  Print Results
                </button>
                
                <button 
                  className="send-button"
                >
                  Send to Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Results Modal */}
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
              <div className="test-info">
                <div className="info-row">
                  <div className="info-label">Patient:</div>
                  <div className="info-value">{currentTest.patientName} ({currentTest.patientId})</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Test Type:</div>
                  <div className="info-value">{currentTest.testType}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Test Date:</div>
                  <div className="info-value">{currentTest.testDate}</div>
                </div>
              </div>

              {/* This would be a form in a real application */}
              <div className="add-results-form">
                <div className="form-section">
                  <h3>Test Results</h3>
                  
                  {/* Example form fields for an STI panel */}
                  <div className="result-input">
                    <label>HIV Antibody</label>
                    <select defaultValue="negative">
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                    <div className="result-normal">
                      <input type="checkbox" id="hiv-normal" defaultChecked />
                      <label htmlFor="hiv-normal">Normal</label>
                    </div>
                  </div>
                  
                  <div className="result-input">
                    <label>Hepatitis B Surface Antigen</label>
                    <select defaultValue="negative">
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                    <div className="result-normal">
                      <input type="checkbox" id="hep-b-normal" defaultChecked />
                      <label htmlFor="hep-b-normal">Normal</label>
                    </div>
                  </div>
                  
                  <div className="result-input">
                    <label>Syphilis RPR</label>
                    <select defaultValue="non-reactive">
                      <option value="non-reactive">Non-reactive</option>
                      <option value="reactive">Reactive</option>
                    </select>
                    <div className="result-normal">
                      <input type="checkbox" id="syphilis-normal" defaultChecked />
                      <label htmlFor="syphilis-normal">Normal</label>
                    </div>
                  </div>
                  
                  <div className="result-input">
                    <label>Gonorrhea PCR</label>
                    <select defaultValue="negative">
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                    <div className="result-normal">
                      <input type="checkbox" id="gonorrhea-normal" defaultChecked />
                      <label htmlFor="gonorrhea-normal">Normal</label>
                    </div>
                  </div>
                  
                  <div className="result-input">
                    <label>Chlamydia PCR</label>
                    <select defaultValue="negative">
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                    <div className="result-normal">
                      <input type="checkbox" id="chlamydia-normal" defaultChecked />
                      <label htmlFor="chlamydia-normal">Normal</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Notes</h3>
                  <textarea
                    placeholder="Enter notes about the test results..."
                    rows={4}
                    defaultValue="All tests normal. No further action required."
                  ></textarea>
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
                  onClick={() => handleAddResult(
                    currentTest.id,
                    [
                      { testName: 'HIV Antibody', result: 'Negative', isNormal: true },
                      { testName: 'Hepatitis B Surface Antigen', result: 'Negative', isNormal: true },
                      { testName: 'Syphilis RPR', result: 'Non-reactive', isNormal: true },
                      { testName: 'Gonorrhea PCR', result: 'Negative', isNormal: true },
                      { testName: 'Chlamydia PCR', result: 'Negative', isNormal: true }
                    ],
                    'All tests normal. No further action required.'
                  )}
                >
                  Save Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultManagement; 