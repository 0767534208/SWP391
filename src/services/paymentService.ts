import api from '../utils/api';
import type { ApiResponse, Payment, PaymentRequest, PaginatedResponse, PaginationParams } from '../types';

const paymentService = {
  /**
   * Get all payments (admin only)
   */
  getAllPayments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/payments?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Payment>>(endpoint);
  },
  
  /**
   * Get payments for the current user
   */
  getUserPayments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/payments/user?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Payment>>(endpoint);
  },
  
  /**
   * Get a specific payment by ID
   */
  getPayment: async (paymentId: string): Promise<ApiResponse<Payment>> => {
    return api.get<Payment>(`/payments/${paymentId}`);
  },
  
  /**
   * Create a payment
   */
  createPayment: async (paymentData: PaymentRequest): Promise<ApiResponse<Payment>> => {
    return api.post<Payment>('/payments', paymentData);
  },
  
  /**
   * Update a payment status (admin only)
   */
  updatePaymentStatus: async (paymentId: string, status: string): Promise<ApiResponse<Payment>> => {
    return api.put<Payment>(`/payments/${paymentId}/status`, { status });
  },
  
  /**
   * Verify a payment
   */
  verifyPayment: async (paymentId: string, transactionId: string): Promise<ApiResponse<Payment>> => {
    return api.put<Payment>(`/payments/${paymentId}/verify`, { transactionId });
  },
  
  /**
   * Get payment statistics (admin only)
   */
  getPaymentStatistics: async (
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  }>> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const endpoint = `/payments/statistics?${queryParams.toString()}`;
    return api.get<{
      totalPayments: number;
      totalAmount: number;
      successfulPayments: number;
      failedPayments: number;
      pendingPayments: number;
    }>(endpoint);
  },
  
  /**
   * Get payment methods available
   */
  getPaymentMethods: async (): Promise<ApiResponse<{
    id: string;
    name: string;
    isActive: boolean;
  }[]>> => {
    return api.get<{
      id: string;
      name: string;
      isActive: boolean;
    }[]>('/payments/methods');
  },
  
  /**
   * Get payment by appointment ID
   */
  getPaymentByAppointment: async (appointmentId: string): Promise<ApiResponse<Payment>> => {
    return api.get<Payment>(`/payments/appointment/${appointmentId}`);
  },
};

export default paymentService; 