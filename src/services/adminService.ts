import type { ApiResponse } from '../utils/api';

interface AccountStats {
  totalAccount: number;
  managersAccount: number;
  customersAccount: number;
  staffsAccount: number;
  consultantAccount: number;
}

interface AppointmentStats {
  totalAppointments: number;
  totalAppointmentsAmount: number;
}

interface WeeklyRevenue {
  date: string;
  totalAppointmentsAmount: number;
}

interface MonthlyStats {
  name: string;
  totalAppointments: number;
  totalAppointmentsAmount: number;
}

export const adminDashboardAPI = {
  getTotalAccounts: async (): Promise<ApiResponse<AccountStats>> => {
    try {
      const response = await fetch('/api/account/adminDashboard/GetTotalAccount', {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch account statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting total accounts:', error);
      throw error;
    }
  },
  
  getTotalAppointmentsAndAmount: async (): Promise<ApiResponse<AppointmentStats>> => {
    try {
      const response = await fetch('/api/dashboard/adminDashBoard/GetTotalAppointmentsAndAmount', {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting total appointments and amount:', error);
      throw error;
    }
  },
  
  getCurrentWeekRevenue: async (): Promise<ApiResponse<WeeklyRevenue[]>> => {
    try {
      const response = await fetch('/api/dashboard/adminDashBoard/GetCurrentWeekRevenue', {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch current week revenue');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting current week revenue:', error);
      throw error;
    }
  },
  
  getPeriodRevenue: async (startDate: string, endDate: string, timeSpanType: 'day' | 'week' | 'month'): Promise<ApiResponse<MonthlyStats[]>> => {
    try {
      const url = `/api/dashboard/adminDashBoard/GetTotalAppointmentsTotalAppointmentsAmount?startDate=${startDate}&endDate=${endDate}&timeSpanType=${timeSpanType}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch period revenue');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting period revenue:', error);
      throw error;
    }
  }
};
