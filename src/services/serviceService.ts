import api from '../utils/api';
import type { ApiResponse, Service, PaginatedResponse, PaginationParams } from '../types';

const serviceService = {
  /**
   * Get all active services
   */
  getActiveServices: async (): Promise<ApiResponse<Service[]>> => {
    return api.get<Service[]>('/services/active');
  },
  
  /**
   * Get all services (including inactive ones) for admin/manager
   */
  getAllServices: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/services?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Service>>(endpoint);
  },
  
  /**
   * Get a specific service by ID
   */
  getService: async (serviceId: string): Promise<ApiResponse<Service>> => {
    return api.get<Service>(`/services/${serviceId}`);
  },
  
  /**
   * Create a new service
   */
  createService: async (serviceData: Omit<Service, 'serviceId' | 'isActive'>): Promise<ApiResponse<Service>> => {
    return api.post<Service>('/services', serviceData);
  },
  
  /**
   * Update a service
   */
  updateService: async (serviceId: string, serviceData: Partial<Omit<Service, 'serviceId'>>): Promise<ApiResponse<Service>> => {
    return api.put<Service>(`/services/${serviceId}`, serviceData);
  },
  
  /**
   * Activate a service
   */
  activateService: async (serviceId: string): Promise<ApiResponse<Service>> => {
    return api.put<Service>(`/services/${serviceId}/activate`, {});
  },
  
  /**
   * Deactivate a service
   */
  deactivateService: async (serviceId: string): Promise<ApiResponse<Service>> => {
    return api.put<Service>(`/services/${serviceId}/deactivate`, {});
  },
  
  /**
   * Delete a service
   */
  deleteService: async (serviceId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/services/${serviceId}`);
  },
};

export default serviceService; 