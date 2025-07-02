/**
 * API Utilities
 * 
 * File này chứa các hàm tiện ích và cấu hình để gọi API
 * Bao gồm xử lý token, refresh token, và các endpoint API cơ bản
 */

import type { UserData, RegisterRequest, AppointmentRequest } from '../types';
import { API, STORAGE_KEYS, ROUTES } from '../config/constants';

// Define interface for API response
export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
}

/**
 * Thông tin lịch hẹn từ API
 */
export interface AppointmentData {
  appointmentID: string;
  customerID: string;
  consultantID: string;
  appointmentDate: string;
  status: number;
  appointmentType: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string;
  slot: {
    startTime: string;
    endTime: string;
  };
  consultant: {
    name: string;
  };
}

/**
 * Xử lý response từ API
 * @param response - Response từ fetch API
 * @returns Promise với dữ liệu đã được parse
 * @throws Error nếu response không thành công
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || `API error: ${response.status}`;
    } catch {
      errorMessage = `API error: ${response.status} - ${errorText || 'Unknown error'}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Làm mới access token bằng refresh token
 * @returns Promise<boolean> - true nếu refresh thành công, false nếu không
 */
const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch(`${API.BASE_URL}${API.AUTH.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    if (data.statusCode === 200 && data.data) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

/**
 * Hàm chung để gọi API
 * @param endpoint - Đường dẫn API (không bao gồm base URL)
 * @param method - Phương thức HTTP (GET, POST, PUT, DELETE, v.v.)
 * @param body - Dữ liệu gửi lên server (cho POST, PUT, PATCH)
 * @param customHeaders - Headers tùy chỉnh
 * @param retry - Có thử lại khi token hết hạn không
 * @returns Promise với dữ liệu từ API
 */
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: unknown,
  customHeaders?: Record<string, string>,
  retry: boolean = true
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
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
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API.BASE_URL}${endpoint}`, options);
    
    // Handle 401 Unauthorized - Token hết hạn
    if (response.status === 401 && retry) {
      // Try to refresh the token
      const refreshed = await refreshAuthToken();
      
      if (refreshed) {
        // Retry the original request with the new token
        return apiRequest<T>(endpoint, method, body, customHeaders, false);
      } else {
        // Clear local storage and redirect to login
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
        localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = ROUTES.AUTH.LOGIN;
        throw new Error('Unauthorized: Session expired');
      }
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    // Log the error for debugging
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

/**
 * Upload file lên server
 * @param file - File cần upload
 * @param path - Đường dẫn API để upload
 * @returns Promise với URL của file đã upload
 */
export const uploadFile = async (file: File, path: string): Promise<ApiResponse<{fileUrl: string}>> => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const formData = new FormData();
  formData.append('file', file);
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API.BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse<{fileUrl: string}>(response);
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Appointment API endpoints
export const appointmentAPI = {
  /**
   * Lấy tất cả lịch hẹn của một khách hàng
   * @param customerId - ID của khách hàng
   */
  getAppointmentsByCustomerId: async (customerId: string): Promise<ApiResponse<AppointmentData[]>> => {
    return apiRequest<AppointmentData[]>(`/appointments/customer/${customerId}`, 'GET');
  },
  
  /**
   * Lấy lịch hẹn theo ID tư vấn viên
   * @param consultantId - ID của tư vấn viên
   */
  getAppointmentsByConsultantId: async (consultantId: string): Promise<ApiResponse<AppointmentData[]>> => {
    return apiRequest<AppointmentData[]>(`/appointment/consultant/${consultantId}`, 'GET');
  },
  
  /**
   * Tạo lịch hẹn mới
   * @param appointmentData - Thông tin lịch hẹn
   */
  createAppointment: async (appointmentData: AppointmentRequest): Promise<ApiResponse<AppointmentData>> => {
    return apiRequest<AppointmentData>('/appointments', 'POST', appointmentData);
  }
};

// Auth API endpoints
export const authAPI = {
  /**
   * Đăng nhập
   * @param username - Tên đăng nhập
   * @param password - Mật khẩu
   */
  login: async (username: string, password: string): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>(API.AUTH.LOGIN, 'POST', { username, password });
  },
  
  /**
   * Đăng ký tài khoản mới
   * @param userData - Thông tin người dùng đăng ký
   */
  register: (userData: RegisterRequest): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>(API.AUTH.REGISTER, 'POST', userData);
  },
  
  /**
   * Xác thực OTP
   * @param email - Email đã đăng ký
   * @param otp - Mã OTP
   */
  verifyOTP: (email: string, otp: string): Promise<ApiResponse<void>> => {
    const endpoint = API.AUTH.VERIFY_OTP(email, otp);
    console.log('OTP verification endpoint:', endpoint);
    return apiRequest<void>(endpoint, 'POST');
  },
  
  /**
   * Làm mới token
   * @param refreshToken - Refresh token hiện tại
   */
  refreshToken: (refreshToken: string): Promise<ApiResponse<{token: string, refreshToken: string}>> => {
    return apiRequest<{token: string, refreshToken: string}>(API.AUTH.REFRESH_TOKEN, 'POST', { refreshToken });
  },
  
  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email - Email đã đăng ký
   */
  forgotPassword: (email: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(API.AUTH.FORGOT_PASSWORD, 'POST', { email });
  },
  
  /**
   * Đặt lại mật khẩu
   * @param email - Email đã đăng ký
   * @param token - Token từ email
   * @param newPassword - Mật khẩu mới
   */
  resetPassword: (email: string, token: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(API.AUTH.RESET_PASSWORD, 'POST', { email, token, newPassword });
  },
  
  /**
   * Đăng xuất
   */
  logout: (): Promise<ApiResponse<void>> => {
    return apiRequest<void>(API.AUTH.LOGOUT, 'POST');
  },
};

// User API endpoints
export const userAPI = {
  /**
   * Lấy thông tin profile người dùng
   */
  getProfile: (): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>(API.USER.PROFILE, 'GET');
  },
  
  /**
   * Cập nhật thông tin profile
   * @param userData - Thông tin cần cập nhật
   */
  updateProfile: (userData: any): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>(API.USER.PROFILE, 'PUT', userData);
  },
  
  /**
   * Thay đổi mật khẩu
   * @param currentPassword - Mật khẩu hiện tại
   * @param newPassword - Mật khẩu mới
   */
  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(API.USER.CHANGE_PASSWORD, 'POST', { currentPassword, newPassword });
  },
  
  /**
   * Upload ảnh đại diện
   * @param file - File ảnh
   */
  uploadProfilePicture: (file: File): Promise<ApiResponse<{fileUrl: string}>> => {
    return uploadFile(file, API.USER.UPLOAD_PROFILE_PICTURE);
  },
};

// Service API endpoints
export const serviceAPI = {
  /**
   * Lấy tất cả dịch vụ
   */
  getServices: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/services', 'GET');
  },
  
  /**
   * Lấy dịch vụ theo ID
   */
  getServiceById: async (serviceId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/services/${serviceId}`, 'GET');
  },
  
  /**
   * Lấy dịch vụ theo danh mục
   */
  getServicesByCategory: async (categoryId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/services/category/${categoryId}`, 'GET');
  }
};

// Category API endpoints
export const categoryAPI = {
  /**
   * Lấy tất cả danh mục
   */
  getCategories: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/categories', 'GET');
  },
  
  /**
   * Lấy danh mục theo ID
   */
  getCategoryById: async (categoryId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/categories/${categoryId}`, 'GET');
  }
};

// Consultant Slot API endpoints
export const consultantSlotAPI = {
  /**
   * Lấy tất cả tư vấn viên
   */
  getAllConsultants: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/consultants', 'GET');
  },
  
  /**
   * Lấy slots theo ID tư vấn viên
   */
  getSlotsByConsultantId: async (consultantId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/slots/consultant/${consultantId}`, 'GET');
  },
  
  /**
   * Lấy slots theo ngày và ID tư vấn viên
   */
  getSlotsByConsultantAndDate: async (consultantId: string, date: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/slots/consultant/${consultantId}/date/${date}`, 'GET');
  }
};

// Default export with generic methods
export default {
  /**
   * GET request
   * @param endpoint - Đường dẫn API
   */
  get: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'GET'),
  
  /**
   * POST request
   * @param endpoint - Đường dẫn API
   * @param data - Dữ liệu gửi lên
   */
  post: <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'POST', data),
  
  /**
   * PUT request
   * @param endpoint - Đường dẫn API
   * @param data - Dữ liệu gửi lên
   */
  put: <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'PUT', data),
  
  /**
   * PATCH request
   * @param endpoint - Đường dẫn API
   * @param data - Dữ liệu gửi lên
   */
  patch: <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'PATCH', data),
  
  /**
   * DELETE request
   * @param endpoint - Đường dẫn API
   */
  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'DELETE'),
  
  uploadFile,
}; 