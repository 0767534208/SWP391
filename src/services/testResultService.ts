import api from '../utils/api';
import type { ApiResponse, TestResult, PaginatedResponse, PaginationParams } from '../types';

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
    
    const endpoint = `/test-results?${queryParams.toString()}`;
    return api.get<PaginatedResponse<TestResult>>(endpoint);
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
    
    const endpoint = `/test-results/user/${userId}?${queryParams.toString()}`;
    return api.get<PaginatedResponse<TestResult>>(endpoint);
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
    
    const endpoint = `/test-results/my-results?${queryParams.toString()}`;
    return api.get<PaginatedResponse<TestResult>>(endpoint);
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
    
    const endpoint = `/test-results/staff-created?${queryParams.toString()}`;
    return api.get<PaginatedResponse<TestResult>>(endpoint);
  },
  
  /**
   * Get a specific test result by ID
   
  getTestResult: async (testResultId: string): Promise<ApiResponse<TestResult>> => {
    return api.get<TestResult>(`/test-results/${testResultId}`);
  },
  
  /**
   * Create a new test result (staff only)
   
  createTestResult: async (testResultData: TestResultRequest): Promise<ApiResponse<TestResult>> => {
    return api.post<TestResult>('/test-results', testResultData);
  },
  
  /**
   * Update a test result (staff only)
   
  updateTestResult: async (testResultId: string, testResultData: Partial<TestResultRequest>): Promise<ApiResponse<TestResult>> => {
    return api.put<TestResult>(`/test-results/${testResultId}`, testResultData);
  },
  
  /**
   * Delete a test result (admin only)
   */
  deleteTestResult: async (testResultId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/test-results/${testResultId}`);
  },
  
  /**
   * Upload a file attachment for a test result
   */
  uploadAttachment: async (testResultId: string, file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    return api.uploadFile(file, `/test-results/${testResultId}/upload-attachment`);
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
    
    const endpoint = `/test-results/statistics?${queryParams.toString()}`;
    return api.get<{
      totalTests: number;
      positiveResults: number;
      negativeResults: number;
      byTestType: {testType: string, count: number}[];
    }>(endpoint);
  },
};

export default testResultService; 