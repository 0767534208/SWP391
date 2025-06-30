import api from '../utils/api';
import type { 
  ApiResponse, 
  ConsultantProfile, 
  ConsultantProfileRequest, 
  PaginatedResponse, 
  PaginationParams, 
  Slot 
} from '../types';

const consultantService = {
  /**
   * Get all active consultants for public viewing
   */
  getActiveConsultants: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ConsultantProfile>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/consultants/active?${queryParams.toString()}`;
    return api.get<PaginatedResponse<ConsultantProfile>>(endpoint);
  },
  
  /**
   * Get all consultants (including inactive ones) for admin/manager
   */
  getAllConsultants: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ConsultantProfile>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/consultants?${queryParams.toString()}`;
    return api.get<PaginatedResponse<ConsultantProfile>>(endpoint);
  },
  
  /**
   * Get a specific consultant's profile by ID
   */
  getConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.get<ConsultantProfile>(`/consultants/${consultantId}`);
  },
  
  /**
   * Get the current consultant's profile
   */
  getMyProfile: async (): Promise<ApiResponse<ConsultantProfile>> => {
    return api.get<ConsultantProfile>('/consultants/profile');
  },
  
  /**
   * Update the current consultant's profile
   */
  updateProfile: async (profileData: ConsultantProfileRequest): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>('/consultants/profile', profileData);
  },
  
  /**
   * Upload a profile picture
   */
  uploadProfilePicture: async (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    return api.uploadFile(file, '/consultants/upload-picture');
  },
  
  /**
   * Get available slots for a consultant
   */
  getAvailableSlots: async (consultantId: string, date: string): Promise<ApiResponse<Slot[]>> => {
    return api.get<Slot[]>(`/consultants/${consultantId}/available-slots?date=${date}`);
  },
  
  /**
   * Get a consultant's schedule
   */
  getSchedule: async (
    consultantId: string, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<{date: string, slots: Slot[]}[]>> => {
    return api.get<{date: string, slots: Slot[]}[]>(
      `/consultants/${consultantId}/schedule?startDate=${startDate}&endDate=${endDate}`
    );
  },
  
  /**
   * Activate a consultant
   */
  activateConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>(`/consultants/${consultantId}/activate`, {});
  },
  
  /**
   * Deactivate a consultant
   */
  deactivateConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>(`/consultants/${consultantId}/deactivate`, {});
  },
  
  /**
   * Create consultant profile (for admin/manager)
   */
  createConsultantProfile: async (userId: string, profileData: ConsultantProfileRequest): Promise<ApiResponse<ConsultantProfile>> => {
    return api.post<ConsultantProfile>('/consultants', { userId, ...profileData });
  },
  
  /**
   * Update consultant profile (for admin/manager)
   */
  updateConsultantProfile: async (consultantId: string, profileData: Partial<ConsultantProfileRequest>): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>(`/consultants/${consultantId}`, profileData);
  },
};

export default consultantService; 