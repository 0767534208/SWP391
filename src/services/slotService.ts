import api from '../utils/api';
import type { ApiResponse, Slot, SlotCreationRequest, PaginatedResponse, PaginationParams } from '../types';

const slotService = {
  /**
   * Get all slots (for admin/manager)
   */
  getAllSlots: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Slot>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/slots?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Slot>>(endpoint);
  },
  
  /**
   * Get slots by date
   */
  getSlotsByDate: async (date: string): Promise<ApiResponse<Slot[]>> => {
    return api.get<Slot[]>(`/slots/by-date?date=${date}`);
  },
  
  /**
   * Get slots by consultant
   */
  getSlotsByConsultant: async (consultantId: string): Promise<ApiResponse<Slot[]>> => {
    return api.get<Slot[]>(`/slots/by-consultant/${consultantId}`);
  },
  
  /**
   * Get slots by consultant and date
   */
  getSlotsByConsultantAndDate: async (consultantId: string, date: string): Promise<ApiResponse<Slot[]>> => {
    return api.get<Slot[]>(`/slots/by-consultant/${consultantId}?date=${date}`);
  },
  
  /**
   * Get a specific slot by ID
   */
  getSlot: async (slotId: string): Promise<ApiResponse<Slot>> => {
    return api.get<Slot>(`/slots/${slotId}`);
  },
  
  /**
   * Create a new slot
   */
  createSlot: async (slotData: SlotCreationRequest): Promise<ApiResponse<Slot>> => {
    return api.post<Slot>('/slots', slotData);
  },
  
  /**
   * Create multiple slots at once
   */
  createMultipleSlots: async (
    startDate: string, 
    endDate: string, 
    startTime: string, 
    endTime: string,
    interval: number,
    consultantId?: string,
    daysOfWeek?: number[]
  ): Promise<ApiResponse<Slot[]>> => {
    return api.post<Slot[]>('/slots/batch', {
      startDate,
      endDate,
      startTime,
      endTime,
      interval,
      consultantId,
      daysOfWeek
    });
  },
  
  /**
   * Update a slot
   */
  updateSlot: async (slotId: string, slotData: Partial<SlotCreationRequest>): Promise<ApiResponse<Slot>> => {
    return api.put<Slot>(`/slots/${slotId}`, slotData);
  },
  
  /**
   * Set slot availability
   */
  setSlotAvailability: async (slotId: string, isAvailable: boolean): Promise<ApiResponse<Slot>> => {
    return api.put<Slot>(`/slots/${slotId}/availability`, { isAvailable });
  },
  
  /**
   * Assign a consultant to a slot
   */
  assignConsultant: async (slotId: string, consultantId: string): Promise<ApiResponse<Slot>> => {
    return api.put<Slot>(`/slots/${slotId}/assign`, { consultantId });
  },
  
  /**
   * Remove consultant from a slot
   */
  removeConsultant: async (slotId: string): Promise<ApiResponse<Slot>> => {
    return api.put<Slot>(`/slots/${slotId}/unassign`, {});
  },
  
  /**
   * Delete a slot
   */
  deleteSlot: async (slotId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/slots/${slotId}`);
  },
  
  /**
   * Delete multiple slots by criteria
   */
  deleteMultipleSlots: async (
    startDate?: string, 
    endDate?: string,
    consultantId?: string
  ): Promise<ApiResponse<number>> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (consultantId) queryParams.append('consultantId', consultantId);
    
    return api.delete<number>(`/slots/batch?${queryParams.toString()}`);
  },
};

export default slotService; 