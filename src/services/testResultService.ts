import api from '../utils/api';
import { uploadFile } from '../utils/api';
import type { ApiResponse, TestResult, PaginationParams, CreateLabTestRequest, UpdateLabTestRequest } from '../types';

const testResultService = {
  /**
   * Get all test results (admin only)
   */
  getAllTestResults: async (params?: PaginationParams): Promise<ApiResponse<TestResult[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
    }
    
    return api.get<TestResult[]>(`/api/LabTest${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  
  /**
   * Get test results for a specific user (admin, staff, or user's own results)
   */
  getUserTestResults: async (userId: string, params?: PaginationParams): Promise<ApiResponse<TestResult[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
    }
    
    return api.get<TestResult[]>(`/api/LabTest/customer/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  
  /**
   * Get the logged-in user's test results
   */
  getMyTestResults: async (params?: PaginationParams): Promise<ApiResponse<TestResult[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
    }
    
    // We need to get the user ID from localStorage
    const userId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    return api.get<TestResult[]>(`/api/LabTest/customer/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  
  /**
   * Get test results created by the logged-in staff
   */
  getStaffCreatedResults: async (params?: PaginationParams): Promise<ApiResponse<TestResult[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
    }
    
    const staffId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    return api.get<TestResult[]>(`/api/LabTest/staff/${staffId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },

  /**
   * Get test results for a specific treatment/appointment
   */
  getAppointmentTestResults: async (treatmentId: string): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/treatment/${treatmentId}`);
  },
  
  /**
   * Get test results by date range
   */
  getTestResultsByDateRange: async (fromDate: string, toDate: string): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/date-range?fromDate=${fromDate}&toDate=${toDate}`);
  },

  /**
   * Search test results
   */
  searchTestResults: async (searchTerm: string, pageIndex: number = 1, pageSize: number = 10): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/search?search=${searchTerm}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  
  /**
   * Get a specific test result by ID
   */
  getTestResult: async (testResultId: string): Promise<ApiResponse<TestResult>> => {
    return api.get<TestResult>(`/api/LabTest/${testResultId}`);
  },
  
  /**
   * Create a new test result (staff only)
   */
  createTestResult: async (testResultData: CreateLabTestRequest): Promise<ApiResponse<TestResult>> => {
    return api.post<TestResult>('/api/LabTest', testResultData);
  },
  
  /**
   * Update a test result (staff only)
   */
  updateTestResult: async (testResultData: UpdateLabTestRequest): Promise<ApiResponse<TestResult>> => {
    return api.put<TestResult>('/api/LabTest', testResultData);
  },
  
  /**
   * Delete a test result (admin only)
   */
  deleteTestResult: async (testResultId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/api/LabTest/${testResultId}`);
  },
  
  /**
   * Upload a file attachment for a test result
   * Note: This endpoint is not specified in swagger.json, but would be needed for file attachments
   */
  uploadAttachment: async (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    return uploadFile(file, '/api/LabTest/upload-attachment');
  },
};

export default testResultService; 