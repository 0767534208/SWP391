import { labTestAPI } from '../utils/api';
import type { ApiResponse, PaginationParams } from '../types';
import type { LabTestData, CreateLabTestRequest, UpdateLabTestRequest } from '../utils/api';

const testResultService = {
  /**
   * Get all test results (admin only)
   * Sử dụng labTestAPI.getAllLabTests() theo đúng swagger
   */
  getAllTestResults: async (params?: PaginationParams): Promise<ApiResponse<LabTestData[]>> => {
    return labTestAPI.getAllLabTests();
  },
  
  /**
   * Get test results for a specific user (admin, staff, or user's own results)
   * Sử dụng labTestAPI.getLabTestByCustomer() theo đúng swagger
   */
  getUserTestResults: async (userId: string, params?: PaginationParams): Promise<ApiResponse<LabTestData[]>> => {
    return labTestAPI.getLabTestByCustomer(userId);
  },
  
  /**
   * Get the logged-in user's test results
   * Sử dụng labTestAPI.getLabTestByCustomer() theo đúng swagger
   */
  getMyTestResults: async (params?: PaginationParams): Promise<ApiResponse<LabTestData[]>> => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    return labTestAPI.getLabTestByCustomer(userId);
  },
  
  /**
   * Get test results created by the logged-in staff
   * Sử dụng labTestAPI.getLabTestByStaff() theo đúng swagger
   */
  getStaffCreatedResults: async (params?: PaginationParams): Promise<ApiResponse<LabTestData[]>> => {
    const staffId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    if (!staffId) {
      throw new Error('Staff ID not found in localStorage');
    }
    return labTestAPI.getLabTestByStaff(staffId);
  },

  /**
   * Get test results for a specific treatment/appointment
   * Sử dụng labTestAPI.getLabTestByTreatment() theo đúng swagger
   */
  getAppointmentTestResults: async (treatmentId: number): Promise<ApiResponse<LabTestData[]>> => {
    return labTestAPI.getLabTestByTreatment(treatmentId);
  },
  
  /**
   * Get test results by date range
   * Sử dụng labTestAPI.getLabTestByDateRange() theo đúng swagger
   */
  getTestResultsByDateRange: async (fromDate: string, toDate: string): Promise<ApiResponse<LabTestData[]>> => {
    return labTestAPI.getLabTestByDateRange(fromDate, toDate);
  },

  /**
   * Search test results
   * Sử dụng labTestAPI.searchLabTests() theo đúng swagger
   */
  searchTestResults: async (searchTerm: string, pageIndex: number = 1, pageSize: number = 10): Promise<ApiResponse<LabTestData[]>> => {
    return labTestAPI.searchLabTests(searchTerm, pageIndex, pageSize);
  },
  
  /**
   * Get a specific test result by ID
   * Sử dụng labTestAPI.getLabTestById() theo đúng swagger
   */
  getTestResult: async (testResultId: number): Promise<ApiResponse<LabTestData>> => {
    return labTestAPI.getLabTestById(testResultId);
  },
  
  /**
   * Create a new test result (staff only)
   * Sử dụng labTestAPI.createLabTest() theo đúng swagger
   */
  createTestResult: async (testResultData: CreateLabTestRequest): Promise<ApiResponse<LabTestData>> => {
    return labTestAPI.createLabTest(testResultData);
  },
  
  /**
   * Update a test result (staff only)
   * Sử dụng labTestAPI.updateLabTest() theo đúng swagger
   */
  updateTestResult: async (testResultData: UpdateLabTestRequest): Promise<ApiResponse<LabTestData>> => {
    return labTestAPI.updateLabTest(testResultData);
  },
  
  /**
   * Delete a test result (admin only)
   * Sử dụng labTestAPI.deleteLabTest() theo đúng swagger
   */
  deleteTestResult: async (testResultId: number): Promise<ApiResponse<void>> => {
    return labTestAPI.deleteLabTest(testResultId);
  }
};

export default testResultService; 