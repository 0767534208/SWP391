import api from '../utils/api';
import type { ApiResponse } from '../types';

export interface CreateTreatmentOutcomeRequest {
  customerID: string;
  consultantID: string;
  appointmentID?: number;
  diagnosis: string;
  treatmentPlan: string;
  prescription?: string;
  recommendation?: string;
}

export interface UpdateTreatmentOutcomeRequest {
  treatmentID: number;
  customerID?: string;
  consultantID?: string;
  appointmentID?: number;
  diagnosis?: string;
  treatmentPlan?: string;
  prescription?: string;
  recommendation?: string;
}

export interface TreatmentOutcome {
  treatmentID: number;
  customerID: string;
  consultantID: string;
  appointmentID?: number;
  diagnosis: string;
  treatmentPlan: string;
  prescription?: string;
  recommendation?: string;
  createAt: string;
  updateAt: string;
}

export interface GetAllAppointment {
  appointmentID: number;
  customerID: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  consultantID: string;
  consultant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  appointmentCode: string;
  appointmentDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  remainingBalance: number;
  consultationFee: number;
  createAt: string;
  updateAt: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ConsultantInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const treatmentOutcomeService = {
  /**
   * Get all treatment outcomes
   */
  getAllTreatmentOutcomes: async (): Promise<ApiResponse<TreatmentOutcome[]>> => {
    return api.get<TreatmentOutcome[]>('/api/TreatmentOutcome');
  },

  /**
   * Get treatment outcome by ID
   */
  getTreatmentOutcome: async (id: number): Promise<ApiResponse<TreatmentOutcome>> => {
    return api.get<TreatmentOutcome>(`/api/TreatmentOutcome/${id}`);
  },

  /**
   * Create new treatment outcome
   */
  createTreatmentOutcome: async (data: CreateTreatmentOutcomeRequest): Promise<ApiResponse<TreatmentOutcome>> => {
    return api.post<TreatmentOutcome>('/api/TreatmentOutcome', data);
  },

  /**
   * Update treatment outcome
   */
  updateTreatmentOutcome: async (data: UpdateTreatmentOutcomeRequest): Promise<ApiResponse<TreatmentOutcome>> => {
    return api.put<TreatmentOutcome>('/api/TreatmentOutcome', data);
  },

  /**
   * Delete treatment outcome
   */
  deleteTreatmentOutcome: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/api/TreatmentOutcome/${id}`);
  },

  /**
   * Get treatment outcomes by customer ID
   */
  getTreatmentOutcomesByCustomer: async (customerId: string): Promise<ApiResponse<TreatmentOutcome[]>> => {
    return api.get<TreatmentOutcome[]>(`/api/TreatmentOutcome/customer/${customerId}`);
  },

  /**
   * Get treatment outcomes by consultant ID
   */
  getTreatmentOutcomesByConsultant: async (consultantId: string): Promise<ApiResponse<TreatmentOutcome[]>> => {
    return api.get<TreatmentOutcome[]>(`/api/TreatmentOutcome/consultant/${consultantId}`);
  },

  /**
   * Get treatment outcomes by appointment ID
   */
  getTreatmentOutcomesByAppointment: async (appointmentId: number): Promise<ApiResponse<TreatmentOutcome[]>> => {
    return api.get<TreatmentOutcome[]>(`/api/TreatmentOutcome/appointment/${appointmentId}`);
  },

  /**
   * Get all appointments
   */
  getAllAppointments: async (): Promise<ApiResponse<GetAllAppointment[]>> => {
    return api.get<GetAllAppointment[]>('/api/appointment/GetAllAppointment');
  },

  /**
   * Get all customers (using appointment data)
   */
  getAllCustomers: async (): Promise<ApiResponse<CustomerInfo[]>> => {
    // Since there's no direct API for customers, we'll extract from appointments
    const appointmentsResponse = await api.get<GetAllAppointment[]>('/api/appointment/GetAllAppointment');
    
    if (appointmentsResponse.statusCode === 200 && appointmentsResponse.data) {
      const uniqueCustomers = Array.from(
        new Map(
          appointmentsResponse.data
            .filter(appointment => appointment.customer)
            .map(appointment => [
              appointment.customerID,
              {
                id: appointment.customerID,
                name: appointment.customer.name,
                email: appointment.customer.email,
                phone: appointment.customer.phone,
              }
            ])
        ).values()
      );
      
      return {
        statusCode: 200,
        message: 'Success',
        data: uniqueCustomers
      };
    }
    
    return {
      statusCode: 404,
      message: 'No customers found',
      data: []
    };
  },

  /**
   * Get all consultants
   */
  getAllConsultants: async (): Promise<ApiResponse<ConsultantInfo[]>> => {
    const response = await api.get<any[]>('/api/consultantSlot/GetAllConsultantProfile');
    
    if (response.statusCode === 200 && response.data) {
      const consultants = response.data.map(consultant => ({
        id: consultant.consultantID || consultant.id,
        name: consultant.fullName || consultant.name,
        email: consultant.email || '',
        phone: consultant.phone || '',
      }));
      
      return {
        statusCode: 200,
        message: 'Success',
        data: consultants
      };
    }
    
    return response as ApiResponse<ConsultantInfo[]>;
  },
};

export default treatmentOutcomeService;
