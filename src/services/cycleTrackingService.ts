import api from '../utils/api';
import type { ApiResponse, CycleData, CycleDataRequest } from '../types';

const cycleTrackingService = {
  /**
   * Get all cycle data for the current user
   */
  getMyCycleData: async (): Promise<ApiResponse<CycleData[]>> => {
    return api.get<CycleData[]>('/cycle-tracking');
  },
  
  /**
   * Get a specific cycle record by ID
   */
  getCycleRecord: async (cycleId: string): Promise<ApiResponse<CycleData>> => {
    return api.get<CycleData>(`/cycle-tracking/${cycleId}`);
  },
  
  /**
   * Create a new cycle record
   */
  createCycleRecord: async (cycleData: CycleDataRequest): Promise<ApiResponse<CycleData>> => {
    return api.post<CycleData>('/cycle-tracking', cycleData);
  },
  
  /**
   * Update a cycle record
   */
  updateCycleRecord: async (cycleId: string, cycleData: Partial<CycleDataRequest>): Promise<ApiResponse<CycleData>> => {
    return api.put<CycleData>(`/cycle-tracking/${cycleId}`, cycleData);
  },
  
  /**
   * Delete a cycle record
   */
  deleteCycleRecord: async (cycleId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/cycle-tracking/${cycleId}`);
  },
  
  /**
   * Get cycle statistics and predictions
   */
  getCycleStatistics: async (): Promise<ApiResponse<{
    averageCycleLength: number;
    averagePeriodLength: number;
    nextPeriodPrediction?: string;
    fertilePeriodStart?: string;
    fertilePeriodEnd?: string;
  }>> => {
    return api.get<{
      averageCycleLength: number;
      averagePeriodLength: number;
      nextPeriodPrediction?: string;
      fertilePeriodStart?: string;
      fertilePeriodEnd?: string;
    }>('/cycle-tracking/statistics');
  },
  
  /**
   * Get cycle data for a specific date range
   */
  getCycleDataByDateRange: async (startDate: string, endDate: string): Promise<ApiResponse<CycleData[]>> => {
    return api.get<CycleData[]>(`/cycle-tracking/range?startDate=${startDate}&endDate=${endDate}`);
  },
};

export default cycleTrackingService; 