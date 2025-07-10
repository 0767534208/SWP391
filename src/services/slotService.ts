import api, { slotAPI } from '../utils/api';
import type { ApiResponse, Slot, SlotCreationRequest, BatchSlotCreationRequest, PaginatedResponse, PaginationParams } from '../types';

const slotService = {
  /**
   * Get all slots (for admin/manager)
   */
  getAllSlots: async (params?: PaginationParams): Promise<ApiResponse<any[]>> => {
    return await slotAPI.getAllSlots();
  },

  /**
   * Get slots by date range
   */
  getSlotsByDateRange: async (startDate: string, endDate: string): Promise<ApiResponse<any[]>> => {
    // Format query params
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    
    // Call API
    return await api.get(`/api/slot/range?${queryParams.toString()}`);
  },

  /**
   * Get slot by ID
   */
  getSlotById: async (slotId: string): Promise<ApiResponse<any>> => {
    return await api.get(`/api/slot/${slotId}`);
  },

  /**
   * Create a new slot
   */
  createSlot: async (slotData: SlotCreationRequest): Promise<ApiResponse<any>> => {
    return await slotAPI.createSlot(slotData);
  },

  /**
   * Create multiple slots at once
   */
  createMultipleSlots: async (batchSlotData: BatchSlotCreationRequest): Promise<ApiResponse<any[]>> => {
    return await slotAPI.createBatchSlots(batchSlotData);
  },

  /**
   * Update a slot
   */
  updateSlot: async (slotId: string, slotData: Partial<SlotCreationRequest>): Promise<ApiResponse<any>> => {
    return await slotAPI.updateSlot(slotId, slotData);
  },

  /**
   * Delete a slot
   */
  deleteSlot: async (slotId: string): Promise<ApiResponse<any>> => {
    return await slotAPI.deleteSlot(slotId);
  }
};

export default slotService; 