import api from '../utils/api';
import { uploadFile } from '../utils/api';
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
    
    return api.get<PaginatedResponse<ConsultantProfile>>(`/api/consultantSlot?${queryParams.toString()}`);
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
    
    return api.get<PaginatedResponse<ConsultantProfile>>(`/api/consultantSlot/GetAll?${queryParams.toString()}`);
  },
  
  /**
   * Get a specific consultant's profile by ID
   */
  getConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.get<ConsultantProfile>(`/api/consultantSlot?consultantId=${consultantId}`);
  },
  
  /**
   * Get a specific consultant's profile by ID (alternative method name)
   */
  getConsultantById: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    const response = await api.get<ConsultantProfile>(`/api/consultantSlot?consultantId=${consultantId}`);
    console.log(`Response from getConsultantById(${consultantId}):`, response);
    
    // Kiểm tra và log dữ liệu chi tiết
    if (response.data) {
      console.log("ConsultantProfile data structure:", {
        id: response.data.id,
        userId: response.data.userId,
        specialization: response.data.specialization,
        experience: response.data.experience,
        bio: response.data.bio,
        // Log các trường khác mà API trả về
        rawData: response.data
      });
    }
    
    return response;
  },
  
  /**
   * Get the current consultant's profile
   */
  getMyProfile: async (): Promise<ApiResponse<ConsultantProfile>> => {
    return api.get<ConsultantProfile>('/api/consultantSlot');
  },
  
  /**
   * Update the current consultant's profile
   */
  updateProfile: async (profileData: ConsultantProfileRequest): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>('/api/consultantSlot/UpdateConsultantProfile', profileData);
  },
  
  /**
   * Upload a profile picture
   */
  uploadProfilePicture: async (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    console.log('Uploading profile picture:', file);
    return uploadFile(file, '/api/account/upload-picture');
  },
  
  /**
   * Get available slots for a consultant
   */
  getAvailableSlots: async (consultantId: string, date: string): Promise<ApiResponse<Slot[]>> => {
    return api.get<Slot[]>(`/api/appointment/GetSlot?consultantId=${consultantId}&date=${date}`);
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
      `/api/consultantSlot?consultantId=${consultantId}&startDate=${startDate}&endDate=${endDate}`
    );
  },
  
  /**
   * Update consultant's schedule
   */
  updateConsultantSchedule: async (consultantId: string, schedule: any): Promise<ApiResponse<any>> => {
    return api.put<ConsultantProfile>(`/api/consultantSlot/UpdateConsultantProfile`, {
      description: '',
      specialty: '',
      experience: '',
      consultantPrice: 0
    });
  },
  
  /**
   * Activate a consultant
   */
  activateConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>(`/api/account/Update-Account-Status?accountId=${consultantId}&status=1`);
  },
  
  /**
   * Deactivate a consultant
   */
  deactivateConsultant: async (consultantId: string): Promise<ApiResponse<ConsultantProfile>> => {
    return api.put<ConsultantProfile>(`/api/account/Update-Account-Status?accountId=${consultantId}&status=0`);
  },
  
  /**
   * Create consultant profile (for admin/manager)
   */
  createConsultantProfile: async (profileData: any): Promise<ApiResponse<ConsultantProfile>> => {
    // Transform data to match the API's expected format based on swagger
    const apiRequestData = {
      accountID: profileData.accountId,
      description: profileData.description || profileData.about,
      specialty: profileData.specialty,
      experience: profileData.experience,
      consultantPrice: profileData.consultantPrice || 0
    };
    
    return api.post<ConsultantProfile>('/api/consultantSlot/CreateConsultantProfile', apiRequestData);
  },
  
  /**
   * Update consultant profile (for admin/manager)
   */
  updateConsultantProfile: async (profileData: ConsultantProfileRequest & { consultantProfileID?: number }): Promise<ApiResponse<ConsultantProfile>> => {
    // Transform the data to match the API's expected format based on swagger
    const apiRequestData = {
      description: profileData.description,
      specialty: profileData.specialty,
      experience: profileData.experience,
      consultantPrice: profileData.consultantPrice || 0,
      consultantProfileID: profileData.consultantProfileID
    };
    
    console.log('Sending transformed data to API:', apiRequestData);
    
    // Lấy consultantProfileID từ tham số profileData hoặc từ localStorage
    let consultantProfileID = profileData.consultantProfileID;
    
    // Nếu không có trong profileData thì lấy từ localStorage
    if (!consultantProfileID) {
      const userId = localStorage.getItem('userId') || localStorage.getItem('AccountID');
      if (userId) {
        try {
          // Lấy thông tin profile để lấy consultantProfileID
          const profileResponse = await api.get<any>(`/api/consultantSlot?consultantId=${userId}`);
          console.log('Profile response for getting ID:', profileResponse);
          
          if (profileResponse.statusCode === 200 && profileResponse.data) {
            consultantProfileID = profileResponse.data.consultantProfileID || profileResponse.data.id;
            console.log('Found consultantProfileID:', consultantProfileID);
            
            // Cập nhật consultantProfileID trong apiRequestData
            apiRequestData.consultantProfileID = consultantProfileID;
          }
        } catch (error) {
          console.error('Error getting consultant profile ID:', error);
        }
      }
    }
    
    // Gọi API với endpoint cố định và đưa consultantProfileID vào body
    const endpoint = '/api/consultantSlot/UpdateConsultantProfile';
    
    console.log('Calling API endpoint:', endpoint);
    console.log('With request body:', apiRequestData);
    
    return api.put<ConsultantProfile>(endpoint, apiRequestData);
  },
  
  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (appointmentId: string, status: number): Promise<ApiResponse<any>> => {
    return api.put<any>(`/api/appointment/ChangeAppointmentStatus?appointmentID=${appointmentId}&status=${status}`, {});
  },
  
  /**
   * Get consultant slots by consultant ID
   */
  getConsultantSlots: async (consultantId: string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/api/consultantSlot?consultantId=${consultantId}`);
  },
  
  /**
   * Get all consultant slots
   */
  getAllConsultantSlots: async (): Promise<ApiResponse<any>> => {
    return api.get<any>('/api/consultantSlot/GetAll');
  },
  
  /**
   * Register consultant for a slot
   */
  registerSlot: async (slotId: number, maxAppointment: number): Promise<ApiResponse<any>> => {
    return api.post<any>(`/api/consultantSlot/register?slotId=${slotId}&maxAppointment=${maxAppointment}`);
  },
  
  /**
   * Swap slots between consultants
   */
  swapSlots: async (consultantA: string, slotA: number, consultantB: string, slotB: number): Promise<ApiResponse<any>> => {
    return api.put<any>(`/api/consultantSlot/swap?consultantA=${consultantA}&slotA=${slotA}&consultantB=${consultantB}&slotB=${slotB}`);
  },
  
  /**
   * Get appointments for a consultant
   */
  getConsultantAppointments: async (consultantId: string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/api/appointment/GetAppointmentByConsultantID/${consultantId}`);
  },
  
  /**
   * Get treatment outcomes for a consultant
   */
  getConsultantTreatmentOutcomes: async (consultantId: string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/api/TreatmentOutcome/consultant/${consultantId}`);
  },

  /**
   * Create a new treatment outcome for an appointment
   */
  createTreatmentOutcome: async (treatmentData: {
    customerId: string,
    consultantId: string,
    appointmentId: number,
    diagnosis: string,
    treatmentPlan: string
  }): Promise<ApiResponse<any>> => {
    return api.post<any>('/api/TreatmentOutcome', treatmentData);
  },

  /**
   * Update a treatment outcome
   */
  updateTreatmentOutcome: async (treatmentId: number, treatmentData: {
    diagnosis?: string,
    treatmentPlan?: string,
    status?: string
  }): Promise<ApiResponse<any>> => {
    return api.put<any>(`/api/TreatmentOutcome/${treatmentId}`, treatmentData);
  }
};

export default consultantService; 