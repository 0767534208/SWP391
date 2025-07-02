/**
 * API Utilities
 * 
 * File này chứa các hàm tiện ích và cấu hình để gọi API
 * Bao gồm xử lý token, refresh token, và các endpoint API cơ bản
 */

import type { UserData, RegisterRequest } from '../types';
import { API, STORAGE_KEYS, ROUTES } from '../config/constants';

// Define interface for API response
export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
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
    let errorData: Record<string, unknown> = {};
    
    try {
      errorData = JSON.parse(errorText);
      console.error('API error response:', errorData);
      errorMessage = errorData.message 
        ? String(errorData.message) 
        : `API error: ${response.status}`;
    } catch {
      console.error('Failed to parse error response:', errorText);
      errorMessage = `API error: ${response.status} - ${errorText || 'Unknown error'}`;
    }
    
    // Ghi log thêm thông tin lỗi
    console.error(`API Error Details - Status: ${response.status}, URL: ${response.url}`);
    
    // Xử lý các lỗi HTTP phổ biến
    switch (response.status) {
      case 400:
        throw new Error(`Yêu cầu không hợp lệ: ${errorMessage}`);
      case 401:
        throw new Error(`Không được phép truy cập: ${errorMessage}`);
      case 403:
        throw new Error(`Truy cập bị từ chối: ${errorMessage}`);
      case 404:
        throw new Error(`Không tìm thấy tài nguyên: ${errorMessage}`);
      case 429:
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
      case 500:
      case 501:
      case 502:
      case 503:
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      default:
        throw new Error(errorMessage);
    }
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
    credentials: 'include',
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
    
    if (endpoint === API.AUTH.LOGIN) {
      console.log('Login API called');
    }
  }
  
  try {
    console.log(`Calling API: ${method} ${API.BASE_URL}${endpoint}`);
    const response = await fetch(`${API.BASE_URL}${endpoint}`, options);
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401 && retry) {
      const refreshed = await refreshAuthToken();
      
      if (refreshed) {
        return apiRequest<T>(endpoint, method, body, customHeaders, false);
      } else {
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
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - Please check your connection or the API server might be down');
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    }
    
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