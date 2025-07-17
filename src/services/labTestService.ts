import api from '../utils/api';
import type { ApiResponse } from '../types';

export interface CreateLabTestRequest {
  customerID: string;
  staffID: string;
  treatmentID?: number;
  testName: string;
  result: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate: string;
}

export interface UpdateLabTestRequest {
  id: number;
  customerID?: string;
  staffID?: string;
  treatmentID?: number;
  testName?: string;
  result?: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate?: string;
}

export interface LabTest {
  id: number;
  customerID: string;
  staffID: string;
  treatmentID?: number;
  testName: string;
  result: string;
  referenceRange?: string;
  unit?: string;
  isPositive?: boolean;
  testDate: string;
  createAt: string;
  updateAt: string;
}

export interface StaffInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AppointmentWithTreatment {
  appointmentID: number;
  appointmentCode: string;
  customerID: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  treatmentOutcome?: {
    treatmentID: number;
    diagnosis: string;
    treatmentPlan: string;
  };
}

const labTestService = {
  /**
   * Get all lab tests
   */
  getAllLabTests: async (): Promise<ApiResponse<LabTest[]>> => {
    return api.get<LabTest[]>('/api/LabTest');
  },

  /**
   * Get lab test by ID
   */
  getLabTestById: async (id: number): Promise<ApiResponse<LabTest>> => {
    return api.get<LabTest>(`/api/LabTest/${id}`);
  },

  /**
   * Create new lab test
   */
  createLabTest: async (data: CreateLabTestRequest): Promise<ApiResponse<LabTest>> => {
    return api.post<LabTest>('/api/LabTest', data);
  },

  /**
   * Update lab test
   */
  updateLabTest: async (data: UpdateLabTestRequest): Promise<ApiResponse<LabTest>> => {
    return api.put<LabTest>('/api/LabTest', data);
  },

  /**
   * Delete lab test
   */
  deleteLabTest: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/api/LabTest/${id}`);
  },

  /**
   * Get lab tests by customer ID
   */
  getLabTestsByCustomer: async (customerId: string): Promise<ApiResponse<LabTest[]>> => {
    return api.get<LabTest[]>(`/api/LabTest/customer/${customerId}`);
  },

  /**
   * Get lab tests by staff ID
   */
  getLabTestsByStaff: async (staffId: string): Promise<ApiResponse<LabTest[]>> => {
    return api.get<LabTest[]>(`/api/LabTest/staff/${staffId}`);
  },

  /**
   * Get lab tests by treatment ID
   */
  getLabTestsByTreatment: async (treatmentId: number): Promise<ApiResponse<LabTest[]>> => {
    return api.get<LabTest[]>(`/api/LabTest/treatment/${treatmentId}`);
  },

  /**
   * Search lab tests
   */
  searchLabTests: async (searchParams: any): Promise<ApiResponse<LabTest[]>> => {
    const queryParams = new URLSearchParams(searchParams);
    return api.get<LabTest[]>(`/api/LabTest/search?${queryParams.toString()}`);
  },

  /**
   * Get all appointments with treatment outcomes
   */
  getAppointmentsWithTreatments: async (): Promise<ApiResponse<AppointmentWithTreatment[]>> => {
    try {
      const [appointmentsResponse, treatmentsResponse] = await Promise.all([
        api.get<any[]>('/api/appointment/GetAllAppointment'),
        api.get<any[]>('/api/TreatmentOutcome')
      ]);

      if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
        const appointments = appointmentsResponse.data;
        const treatments = treatmentsResponse.statusCode === 200 ? treatmentsResponse.data || [] : [];

        const combined = appointments.map(appointment => ({
          appointmentID: appointment.appointmentID,
          appointmentCode: appointment.appointmentCode,
          customerID: appointment.customerID,
          customer: appointment.customer,
          treatmentOutcome: treatments.find(t => t.appointmentID === appointment.appointmentID)
        }));

        return {
          statusCode: 200,
          message: 'Success',
          data: combined
        };
      }

      return {
        statusCode: 404,
        message: 'No appointments found',
        data: []
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching appointments',
        data: []
      };
    }
  },

  /**
   * Get all staff members (optional, for display purposes only)
   * This method is kept for backwards compatibility but not required for lab test creation
   */
  getAllStaff: async (): Promise<ApiResponse<StaffInfo[]>> => {
    try {
      console.log('🔍 Fetching staff from API...');
      const response = await api.get<any[]>('/api/consultantSlot/GetAllConsultantProfile');
      
      console.log('📊 Raw API response:', response);
      
      if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
        console.log('📋 Raw data:', response.data);
        
        const staff = response.data
          .filter(consultant => consultant && consultant.account) // Filter out invalid data
          .map(consultant => {
            console.log('👤 Processing consultant:', consultant);
            
            // Based on schema: consultant has consultantProfileID, account with name/phone, etc.
            const account = consultant.account || {};
            
            return {
              id: consultant.consultantProfileID?.toString() || '',
              name: account.name || 'Unknown',
              email: account.email || '', // Note: email not in schema but trying
              phone: account.phone || '',
            };
          })
          .filter(staff => staff.id && staff.name); // Filter out incomplete data
        
        console.log('👥 Mapped staff:', staff);
        
        return {
          statusCode: 200,
          message: 'Success',
          data: staff
        };
      }
      
      console.log('❌ No data or invalid response');
      return {
        statusCode: response.statusCode || 500,
        message: response.message || 'No data',
        data: []
      };
    } catch (error) {
      console.error('💥 Error fetching staff:', error);
      return {
        statusCode: 500,
        message: 'Error fetching staff',
        data: []
      };
    }
  },
};

export default labTestService;
