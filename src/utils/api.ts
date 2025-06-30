// Define interface for API response
interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
}

interface UserData {
  userID: string;
  userName: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  dateOfBirth: string;
  isActive: boolean;
  roles: string[];
  token: string;
  refreshToken: string;
}

// Appointment interface
interface AppointmentData {
  appointmentID: number;
  customerID: string;
  customer: {
    name: string;
    address: string;
    phone: string;
    status: boolean;
    dateOfBirth: string;
  };
  consultantID: string;
  consultant: {
    name: string;
    address: string;
    phone: string;
    status: boolean;
    dateOfBirth: string;
  };
  treatmentID: number | null;
  treatmentOutcome: string | null;
  slotID: number;
  slot: {
    slotID: number;
    maxConsultant: number;
    startTime: string;
    endTime: string;
  };
  createAt: string;
  appointmentDate: string;
  updateAt: string;
  totalAmount: number;
  status: number;
  appointmentType: number;
  paymentStatus: number;
}

// Service interface
interface ServiceData {
  servicesID: number;
  categoryID: number;
  category: string | null;
  servicesName: string;
  description: string;
  createAt: string;
  updateAt: string;
  servicesPrice: number;
  status: boolean;
  imageServices: string[];
}

// Category interface
interface CategoryData {
  categoryID: number;
  name: string;
  createAt: string;
  updateAt: string;
  status: boolean;
}

// Base API URL
const API_BASE_URL = 'https://ghsmsystemdemopublish.azurewebsites.net/api';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    mode: 'cors',
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Unauthorized');
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    throw error;
  }
};

// Auth API endpoints
export const authAPI = {
  login: async (username: string, password: string): Promise<ApiResponse<UserData>> => {
    const response = await fetch(`${API_BASE_URL}/account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      mode: 'cors'
    });
    
    return handleResponse<UserData>(response);
  },
  register: (userData: any): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>('/account/register', 'POST', userData);
  },
  verifyOTP: (email: string, otp: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/account/verify-otp', 'POST', { email, otp });
  },
};

// User API endpoints
export const userAPI = {
  getProfile: (): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>('/user/profile', 'GET');
  },
  updateProfile: (userData: any): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>('/user/profile', 'PUT', userData);
  },
};

// Appointment API endpoints
export const appointmentAPI = {
  getAppointmentsByCustomerId: async (customerId: string): Promise<ApiResponse<AppointmentData[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointment/GetAppointmentByCustomerID/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      const responseData = await response.json();
      console.log("Raw API response:", responseData);
      
      // Return the response in the expected format
      return responseData;
    } catch (error) {
      console.error("Error in getAppointmentsByCustomerId:", error);
      throw error;
    }
  },
};

// Service API endpoints
export const serviceAPI = {
  getServices: (): Promise<ApiResponse<ServiceData[]>> => {
    return apiRequest<ServiceData[]>('/Service/GetService', 'GET');
  },
};

// Category API endpoints
export const categoryAPI = {
  getCategories: (): Promise<ApiResponse<CategoryData[]>> => {
    return apiRequest<CategoryData[]>('/category/GetCategory', 'GET');
  },
};

// Consultant Slot API endpoints
export const consultantSlotAPI = {
  getAllConsultants: (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/consultantSlot/GetAll', 'GET');
  },
  getSlotsByConsultantId: (consultantId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/consultantSlot?consultantId=${consultantId}`, 'GET');
  },
};

export type { ApiResponse, UserData, AppointmentData, ServiceData, CategoryData };

export default {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'GET'),
    
  post: <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'POST', data),
    
  put: <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'PUT', data),
    
  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'DELETE'),
}; 