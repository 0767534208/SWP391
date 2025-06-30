import api from '../utils/api';
import type { Appointment, AppointmentRequest, ApiResponse, PaginatedResponse, PaginationParams } from '../types';

const appointmentService = {
  /**
   * Get all appointments for the logged-in user
   */
  getUserAppointments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/appointments/user?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Appointment>>(endpoint);
  },
  
  /**
   * Get all appointments for a consultant
   */
  getConsultantAppointments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/appointments/consultant?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Appointment>>(endpoint);
  },
  
  /**
   * Get all appointments for a staff member
   */
  getStaffAppointments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/appointments/staff?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Appointment>>(endpoint);
  },
  
  /**
   * Get all appointments (admin)
   */
  getAllAppointments: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/appointments?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Appointment>>(endpoint);
  },
  
  /**
   * Get a specific appointment by ID
   */
  getAppointment: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
    return api.get<Appointment>(`/appointments/${appointmentId}`);
  },
  
  /**
   * Create a new appointment
   */
  createAppointment: async (appointmentData: AppointmentRequest): Promise<ApiResponse<Appointment>> => {
    return api.post<Appointment>('/appointments', appointmentData);
  },
  
  /**
   * Update an appointment's status
   */
  updateAppointmentStatus: async (appointmentId: string, status: string, notes?: string): Promise<ApiResponse<Appointment>> => {
    return api.put<Appointment>(`/appointments/${appointmentId}/status`, { status, notes });
  },
  
  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<ApiResponse<void>> => {
    return api.put<void>(`/appointments/${appointmentId}/cancel`, { reason });
  },
  
  /**
   * Reschedule an appointment
   */
  rescheduleAppointment: async (appointmentId: string, slotId: string, date: string): Promise<ApiResponse<Appointment>> => {
    return api.put<Appointment>(`/appointments/${appointmentId}/reschedule`, { slotId, date });
  },
};

export default appointmentService; 