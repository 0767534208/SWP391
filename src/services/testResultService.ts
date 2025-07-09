import api from '../utils/api';
import { uploadFile } from '../utils/api';
import type { ApiResponse, TestResult, PaginatedResponse, PaginationParams, CreateTestResultRequest } from '../types';

const testResultService = {
  /**
   * Get all test results (admin only)
   */
  getAllTestResults: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<TestResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    return api.get<PaginatedResponse<TestResult>>(`/api/LabTest?${queryParams.toString()}`);
  },
  
  /**
   * Get test results for a specific user (admin, staff, or user's own results)
   */
  getUserTestResults: async (userId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<TestResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    return api.get<PaginatedResponse<TestResult>>(`/api/LabTest/customer/${userId}?${queryParams.toString()}`);
  },
  
  /**
   * Get the logged-in user's test results
   */
  getMyTestResults: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<TestResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    // We need to get the user ID from localStorage
    const userId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    return api.get<PaginatedResponse<TestResult>>(`/api/LabTest/customer/${userId}?${queryParams.toString()}`);
  },
  
  /**
   * Get test results created by the logged-in staff
   */
  getStaffCreatedResults: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<TestResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const staffId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
    return api.get<PaginatedResponse<TestResult>>(`/api/LabTest/staff/${staffId}?${queryParams.toString()}`);
  },

  /**
   * Get test results for a specific appointment
   */
  getAppointmentTestResults: async (appointmentId: string): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/treatment/${appointmentId}`);
  },
  
  /**
   * Get test results by date range
   */
  getTestResultsByDateRange: async (startDate: string, endDate: string): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/date-range?startDate=${startDate}&endDate=${endDate}`);
  },

  /**
   * Search test results
   */
  searchTestResults: async (searchTerm: string): Promise<ApiResponse<TestResult[]>> => {
    return api.get<TestResult[]>(`/api/LabTest/search?query=${searchTerm}`);
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
  createTestResult: async (testResultData: CreateTestResultRequest): Promise<ApiResponse<TestResult>> => {
    return api.post<TestResult>('/api/LabTest', testResultData);
  },
  
  /**
   * Update a test result (staff only)
   */
  updateTestResult: async (testResultId: string, testResultData: Partial<TestResult>): Promise<ApiResponse<TestResult>> => {
    return api.put<TestResult>(`/api/LabTest/${testResultId}`, testResultData);
  },
  
  /**
   * Delete a test result (admin only)
   */
  deleteTestResult: async (testResultId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/api/LabTest/${testResultId}`);
  },
  
  /**
   * Upload a file attachment for a test result
   */
  uploadAttachment: async (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    return uploadFile(file, '/api/LabTest/upload-attachment');
  },
  
  /**
   * Add a comment to a test result
   */
  addComment: async (testResultId: string, comment: string): Promise<ApiResponse<TestResult>> => {
    return api.post<TestResult>(`/api/LabTest/${testResultId}/comment`, { comment });
  },
  
  /**
   * Mark a test result as viewed by consultant
   */
  markAsViewed: async (testResultId: string): Promise<ApiResponse<TestResult>> => {
    return api.put<TestResult>(`/api/LabTest/${testResultId}/mark-viewed`, {});
  },
  
  /**
   * Mark a test result as viewed by consultant (alias for markAsViewed)
   */
  markTestResultAsViewed: async (testResultId: string): Promise<ApiResponse<TestResult>> => {
    return api.put<TestResult>(`/api/LabTest/${testResultId}/mark-viewed`, {});
  },
  
  /**
   * Get test result statistics (admin only)
   */
  getTestStatistics: async (startDate?: string, endDate?: string): Promise<ApiResponse<{
    totalTests: number;
    positiveResults: number;
    negativeResults: number;
    byTestType: {testType: string, count: number}[];
  }>> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    return api.get<{
      totalTests: number;
      positiveResults: number;
      negativeResults: number;
      byTestType: {testType: string, count: number}[];
    }>(`/api/LabTest/statistics?${queryParams.toString()}`);
  },
};

export default testResultService; 