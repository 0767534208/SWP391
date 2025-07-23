// API lấy danh sách cuộc hẹn theo customerID
export const getAppointmentsByCustomerId = async (customerId: string) => {
  return apiRequest<any[]>(`/api/appointment/GetAppointmentByCustomerID/${customerId}`, 'GET');
};

// API lấy link thanh toán theo appointmentID
export const getAppointmentPaymentUrl = async (appointmentId: string) => {
  return apiRequest<any>(`/api/appointment/AppointmentPayment?appointmentID=${appointmentId}`, 'POST');
};

// API thay đổi trạng thái cuộc hẹn
export const changeAppointmentStatus = async (appointmentId: string, status: number, paymentStatus: number) => {
  return apiRequest<any>(`/api/appointment/ChangeAppointmentStatus?appointmentID=${appointmentId}&status=${status}&paymentStatus=${paymentStatus}`, 'PUT');
};
// Lấy tất cả profile tư vấn viên
export const consultantProfileAPI = {
  getAllConsultantProfiles: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/consultantSlot/GetAllConsultantProfile`, 'GET');
  }
};
/**
 * API Utilities
 * 
 * File này chứa các hàm tiện ích và cấu hình để gọi API
 * Bao gồm xử lý token, refresh token, và các endpoint API cơ bản
 */

import type { UserData, RegisterRequest, AppointmentRequest } from '../types';
import { API, STORAGE_KEYS, ROUTES } from '../config/constants';

// Helper function to create a minimal valid image file for placeholder
const createPlaceholderImage = (): File => {
  // Create a minimal 1x1 pixel PNG image as base64
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1, 1);
  }
  
  // Convert canvas to blob, then to File
  const dataURL = canvas.toDataURL('image/png');
  const base64Data = dataURL.split(',')[1];
  const bytes = atob(base64Data);
  const byteArray = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    byteArray[i] = bytes.charCodeAt(i);
  }
  
  return new File([byteArray], 'placeholder.png', { type: 'image/png' });
};

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
  consultantID: string | null;
  appointmentDate: string;
  status: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string | null;
  treatmentOutcome?: any | null;
  slot: {
    slotID: number;
    startTime: string;
    endTime: string;
  };
  consultant: {
    name: string;
  } | null;
  customer?: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    status: boolean;
    dateOfBirth: string;
  };
  appointmentDetails?: {
    appointmentDetailID: number;
    servicesID: number;
    service: {
      servicesID: number;
      servicesName: string;
      servicesPrice: number;
      description: string;
    };
    consultantProfileID: number;
    quantity: number;
    servicePrice: number;
    totalPrice: number;
  }[];
  appointmentCode?: string;
  expiredTime?: string;
  createAt?: string;
  updateAt?: string;
}

/**
 * Xử lý response từ API
 * @param response - Response từ fetch API
 * @returns Promise với dữ liệu đã được parse
 * @throws Error nếu response không thành công
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    
    // Handle empty response
    if (!contentType || response.headers.get('content-length') === '0') {
      // Special case for Question endpoints with 404
      if (response.url.includes('/Question') && response.status === 404) {
        return {
          message: "No questions",
          statusCode: 200,
          data: { items: [], total: 0, page: 1, pageSize: 0, totalPages: 0 } as unknown as T
        };
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    const errorText = await response.text();
    let errorMessage;
    let errorData;
    
    try {
      errorData = JSON.parse(errorText);
      errorMessage = errorData.message || `API error: ${response.status}`;
      
      // Special case for "No questions" 404 response
      if (response.status === 404 && errorData.message === "No questions") {
        // Return a valid empty response instead of throwing an error
        return {
          message: "No questions",
          statusCode: 200,
          data: { items: [], total: 0, page: 1, pageSize: 0, totalPages: 0 } as unknown as T
        };
      }
      
    } catch {
      errorMessage = `API error: ${response.status} - ${errorText || 'Unknown error'}`;
    }
    
    throw new Error(errorMessage);
  }
  
  // Handle empty successful response
  const contentType = response.headers.get('content-type');
  if (!contentType || response.headers.get('content-length') === '0') {
    return {
      message: "Success",
      statusCode: response.status,
      data: null as unknown as T
    };
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
  
  console.log(`🔄 API Request: ${method} ${endpoint}`);
  console.log('🔑 Token exists:', !!token);
  console.log('📦 Request body:', body);
  
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
  
  const fullUrl = `${API.BASE_URL}${endpoint}`;
  console.log('🌐 Full URL:', fullUrl);
  console.log('📋 Request options:', options);
  
  try {
    console.log('📡 Sending request...');
    const response = await fetch(fullUrl, options);
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Thêm debug cho PUT request
    if (method === 'PUT') {
      console.log('🔍 PUT Request details:', {
        url: fullUrl,
        headers: options.headers,
        body: options.body
      });
    }
    
    // Handle 401 Unauthorized - Token hết hạn
    if (response.status === 401 && retry) {
      console.log('🔒 Unauthorized, attempting token refresh...');
      // Try to refresh the token
      const refreshed = await refreshAuthToken();
      
      if (refreshed) {
        console.log('✅ Token refreshed, retrying request...');
        // Retry the original request with the new token
        return apiRequest<T>(endpoint, method, body, customHeaders, false);
      } else {
        console.log('❌ Token refresh failed, redirecting to login...');
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
    
    console.log('✅ Processing response...');
    // Clone the response to log the raw body for debugging
    const clonedResponse = response.clone();
    try {
      const rawText = await clonedResponse.text();
      console.log('📦 Raw response body:', rawText);
    } catch (e) {
      console.log('⚠️ Could not log raw response body:', e);
    }
    
    const result = await handleResponse<T>(response);
    console.log('📦 Final result:', result);
    return result;
  } catch (error) {
    // Log the error for debugging
    console.error(`❌ API Request Error (${method} ${endpoint}):`, error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
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
   * Lấy tất cả lịch hẹn
   */
  getAllAppointments: async (): Promise<ApiResponse<AppointmentData[]>> => {
    return apiRequest<AppointmentData[]>(`/api/appointment/GetAllAppointment`, 'GET');
  },

  /**
   * Lấy lịch hẹn theo ID
   * @param appointmentId - ID của lịch hẹn
   */
  getAppointmentById: async (appointmentId: string): Promise<ApiResponse<AppointmentData>> => {
    return apiRequest<AppointmentData>(`/api/appointment/GetAppointmentByID/${appointmentId}`, 'GET');
  },

  /**
   * Lấy lịch hẹn theo mã code
   * @param appointmentCode - Mã code của lịch hẹn
   */
  getAppointmentByCode: async (appointmentCode: string): Promise<ApiResponse<AppointmentData>> => {
    return apiRequest<AppointmentData>(`/api/appointment/GetAppointmentByCode/${appointmentCode}`, 'GET');
  },
  
  /**
   * Lấy tất cả lịch hẹn của một khách hàng
   * @param customerId - ID của khách hàng
   */
  getAppointmentsByCustomerId: async (customerId: string): Promise<ApiResponse<AppointmentData[]>> => {
    return apiRequest<AppointmentData[]>(`/api/appointment/GetAppointmentByCustomerID/${customerId}`, 'GET');
  },
  
  /**
   * Lấy lịch hẹn theo ID tư vấn viên
   * @param consultantId - ID của tư vấn viên
   */
  getAppointmentsByConsultantId: async (consultantId: string): Promise<ApiResponse<AppointmentData[]>> => {
    return apiRequest<AppointmentData[]>(`/api/appointment/GetAppointmentByConsultantID/${consultantId}`, 'GET');
  },

  /**
   * Lấy các slot có sẵn
   */
  getSlots: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/appointment/GetSlot`, 'GET');
  },

  /**
   * Lấy thông tin phòng khám theo ID
   * @param clinicId - ID của phòng khám
   */
  getClinic: async (clinicId: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/appointment/GetClinic/${clinicId}`, 'GET');
  },

  /**
   * Xử lý VNPay return
   * @param vnpayParams - Các tham số từ VNPay
   */
  vnpayReturn: async (vnpayParams: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams(vnpayParams);
    return apiRequest<any>(`/api/appointment/vnpay-return?${queryParams.toString()}`, 'GET');
  },

  /**
   * Xử lý VNPay return refunded
   * @param vnpayParams - Các tham số từ VNPay
   */
  vnpayReturnRefunded: async (vnpayParams: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams(vnpayParams);
    return apiRequest<any>(`/api/appointment/vnpay-return-refunded?${queryParams.toString()}`, 'GET');
  },
  
  /**
   * Tạo lịch hẹn mới
   * @param appointmentData - Thông tin lịch hẹn
   */
  createAppointment: async (appointmentData: AppointmentRequest): Promise<ApiResponse<AppointmentData>> => {
    return apiRequest<AppointmentData>('/api/appointment/CreateAppointment', 'POST', appointmentData);
  },

  /**
   * Thanh toán lịch hẹn
   * @param paymentData - Thông tin thanh toán
   */
  appointmentPayment: async (paymentData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/AppointmentPayment', 'POST', paymentData);
  },

  /**
   * Hoàn tiền toàn bộ lịch hẹn
   * @param appointmentID - Mã cuộc hẹn
   * @param accountId - ID tài khoản người dùng
   * @param refundType - Loại hoàn tiền (full, consultation, sti)
   */
  appointmentRefundFull: async (appointmentID: number, accountId: string, refundType: string): Promise<string> => {
    const response = await fetch(`/api/appointment/AppointmentPayment-Refund-Full?appointmentID=${appointmentID}&accountId=${accountId}&refundType=${refundType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Return the raw text response which should be the VNPay URL
    return response.text();
  },

  /**
   * Tạo phòng khám mới
   * @param clinicData - Thông tin phòng khám
   */
  createClinic: async (clinicData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/CreateClinic', 'POST', clinicData);
  },

  /**
   * Cập nhật thông tin phòng khám
   * @param clinicData - Thông tin phòng khám cần cập nhật
   */
  updateClinic: async (clinicData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/UpdateClinic', 'PUT', clinicData);
  },

  /**
   * Cập nhật lịch hẹn
   * @param appointmentData - Thông tin lịch hẹn cần cập nhật
   */
  updateAppointment: async (appointmentData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/UpdateAppointment', 'PUT', appointmentData);
  },

  /**
   * Cập nhật lịch hẹn với yêu cầu STI
   * @param appointmentId - ID của lịch hẹn cần cập nhật
   * @param appointmentData - Thông tin dịch vụ STI
   */
  updateAppointmentWithSTIRequest: async (appointmentId: string, appointmentData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/appointment/UpdateAppointmentWithSTIRequest?appointmentID=${appointmentId}`, 'PUT', appointmentData);
  },

  /**
   * Thay đổi slot của lịch hẹn
   * @param slotChangeData - Thông tin thay đổi slot
   */
  changeAppointmentSlot: async (slotChangeData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/ChangeAppointmentSlot', 'PUT', slotChangeData);
  },

  /**
   * Thay đổi trạng thái lịch hẹn
   * @param appointmentID 
   * @param status
   * @param paymentStatus
   */
  changeAppointmentStatus: async (appointmentID: number, status: number, paymentStatus: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/appointment/ChangeAppointmentStatus?appointmentID=${appointmentID}&status=${status}&paymentStatus=${paymentStatus}`, 'PUT');
  },

  /**
   * Đặt lại lịch hẹn với email
   * @param rescheduleData - Thông tin đặt lại lịch
   */
  rescheduleAppointmentWithEmail: async (rescheduleData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/RescheduleAppointmentWithEmail', 'PUT', rescheduleData);
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
    return apiRequest<UserData>(`/api/account/login`, 'POST', { 
      UserName: username,
      Password: password 
    });
  },
  
  /**
   * Đăng ký tài khoản khách hàng mới
   * @param userData - Thông tin người dùng đăng ký
   */
  register: (userData: RegisterRequest): Promise<ApiResponse<UserData>> => {
    return apiRequest<UserData>(`/api/account/register-Customer`, 'POST', userData);
  },
  
  /**
   * Xác thực OTP
   * @param email - Email đã đăng ký
   * @param code - Mã OTP
   */
  verifyOTP: (email: string, code: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/account/confirmation/${email}/${code}`, 'POST');
  },
  
  /**
   * Làm mới token
   * @param refreshToken - Refresh token hiện tại
   */
  refreshToken: (refreshToken: string): Promise<ApiResponse<{token: string, refreshToken: string}>> => {
    return apiRequest<{token: string, refreshToken: string}>(`/api/account/resetToken`, 'POST', { refreshToken });
  },
  
  /**
   * Yêu cầu token đặt lại mật khẩu
   * @param email - Email đã đăng ký
   */
  forgotPassword: (email: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/account/Reset-Password-Token`, 'POST', { email });
  },
  
  /**
   * Đặt lại mật khẩu
   * @param email - Email đã đăng ký
   * @param token - Token từ email
   * @param newPassword - Mật khẩu mới
   */
  resetPassword: (email: string, token: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/account/Reset-Password`, 'POST', { email, token, newPassword });
  },
  
  /**
   * Thay đổi mật khẩu
   * @param currentPassword - Mật khẩu hiện tại
   * @param newPassword - Mật khẩu mới
   */
  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/account/Change-Password`, 'POST', { currentPassword, newPassword });
  },
  
  /**
   * Tạo tài khoản (dành cho admin)
   * @param accountData - Thông tin tài khoản
   */
  createAccount: (accountData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/account/create account`, 'POST', accountData);
  },
  
  /**
   * Cập nhật trạng thái tài khoản (dành cho admin)
   * @param userEmail - Email người dùng
   * @param statusData - Dữ liệu trạng thái mới
   */
  updateAccountStatus: (userEmail: string, statusData: any): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/account/Update-Account-Status?userEmail=${userEmail}`, 'PUT', statusData);
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
    return apiRequest<any[]>('/api/Service/GetService', 'GET');
  },
  
  /**
   * Lấy thống kê dịch vụ
   */
  getServiceStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/Service/GetServiceStats', 'GET');
  },
  
  /**
   * Tạo dịch vụ mới (dành cho Manager)
   * @param serviceData - Thông tin dịch vụ
   */
  createService: async (serviceData: any): Promise<ApiResponse<any>> => {
    // Tạo query parameters từ serviceData (theo swagger spec)
    const queryParams = new URLSearchParams();
    
    if (serviceData.ClinicID) queryParams.append('ClinicID', serviceData.ClinicID.toString());
    if (serviceData.CategoryID) queryParams.append('CategoryID', serviceData.CategoryID.toString());
    if (serviceData.ManagerID) queryParams.append('ManagerID', serviceData.ManagerID);
    if (serviceData.ServicesName) queryParams.append('ServicesName', serviceData.ServicesName);
    if (serviceData.Description) queryParams.append('Description', serviceData.Description);
    // Only include ServicesPrice for test services (ServiceType = 1)
    if (serviceData.ServiceType === 1 && serviceData.ServicesPrice) {
      queryParams.append('ServicesPrice', serviceData.ServicesPrice.toString());
    }
    if (serviceData.ServiceType !== undefined) queryParams.append('ServiceType', serviceData.ServiceType.toString());
    if (serviceData.Status !== undefined) queryParams.append('Status', serviceData.Status.toString());
    
    // Tạo URL với query parameters
    const url = `/api/Service/CreateService?${queryParams.toString()}`;
    
    // Tạo FormData cho multipart/form-data (theo swagger spec)
    const formData = new FormData();
    
    // Thêm hình ảnh vào formData nếu có
    if (serviceData.Images && serviceData.Images.length > 0) {
      // Only add actual image files, not placeholder files
      const validImages = serviceData.Images.filter((image: File) => 
        image instanceof File && 
        image.size > 0 && 
        image.type.startsWith('image/')
      );
      
      if (validImages.length > 0) {
        for (const image of validImages) {
          formData.append('Images', image);
        }
      } else {
        // Create a minimal valid image placeholder if no valid images provided
        const placeholderImage = createPlaceholderImage();
        formData.append('Images', placeholderImage);
      }
    } else {
      // API requires Images field - create a minimal valid image placeholder
      const placeholderImage = createPlaceholderImage();
      formData.append('Images', placeholderImage);
    }
    
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Gửi request với multipart/form-data
    const response = await fetch(`${API.BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Log detailed error information for debugging
    if (!response.ok) {
      console.error('CreateService Error Details:');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('URL:', `${API.BASE_URL}${url}`);
      console.error('Headers:', headers);
      
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Error Response Body:', errorText);
      } catch (e) {
        console.error('Could not read error response body');
      }
      
      // Try to parse error as JSON
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const responseData = await response.json();
    return responseData;
  },

  /**
   * Cập nhật dịch vụ (dành cho Manager)
   * @param serviceId - ID của dịch vụ
   * @param serviceData - Thông tin dịch vụ cần cập nhật
   */
  updateService: async (serviceId: number, serviceData: any): Promise<ApiResponse<any>> => {
    // Theo swagger UpdateServiceRequest schema, chỉ hỗ trợ các fields:
    // servicesID, servicesName, description, servicesPrice, serviceType, status
    // KHÔNG hỗ trợ categoryID
    const updateData: any = {
      servicesID: Number(serviceId), // Đảm bảo là number
      servicesName: serviceData.servicesName?.toString() || '',
      description: serviceData.description?.toString() || '',
      serviceType: Number(serviceData.serviceType) || 0, // Đảm bảo là number (0 hoặc 1)
      status: Boolean(serviceData.status) // Đảm bảo là boolean
      // Note: categoryID không được hỗ trợ trong UpdateService API
    };
    
    // Only include servicesPrice for test services (serviceType = 1)
    if (Number(serviceData.serviceType) === 1 && serviceData.servicesPrice !== undefined) {
      updateData.servicesPrice = Number(serviceData.servicesPrice) || 0;
    }
    
    console.log('UpdateService payload:', updateData);
    console.log('UpdateService URL:', `/api/Service/UpdateService?serviceID=${serviceId}`);
    
    return apiRequest<any>(`/api/Service/UpdateService?serviceID=${serviceId}`, 'PUT', updateData);
  }
};

// Cycle Prediction API endpoints (Dự đoán chu kỳ kinh nguyệt)
export const cyclePredictionAPI = {
  /**
   * Lấy tất cả dự đoán chu kỳ
   */
  getAllCyclePredictions: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/CyclePrediction', 'GET');
  },

  /**
   * Tạo dự đoán chu kỳ mới
   * @param predictionData - Thông tin dự đoán chu kỳ
   */
  createCyclePrediction: async (predictionData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/CyclePrediction', 'POST', predictionData);
  },

  /**
   * Lấy dự đoán chu kỳ theo ID
   * @param id - ID của dự đoán chu kỳ
   */
  getCyclePredictionById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/CyclePrediction/${id}`, 'GET');
  },

  /**
   * Cập nhật dự đoán chu kỳ
   * @param id - ID của dự đoán chu kỳ
   * @param predictionData - Thông tin dự đoán chu kỳ cần cập nhật
   */
  updateCyclePrediction: async (id: string, predictionData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/CyclePrediction/${id}`, 'PUT', predictionData);
  },

  /**
   * Xóa dự đoán chu kỳ
   * @param id - ID của dự đoán chu kỳ
   */
  deleteCyclePrediction: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/CyclePrediction/${id}`, 'DELETE');
  },

  /**
   * Lấy dự đoán chu kỳ theo ID chu kỳ kinh nguyệt
   * @param menstrualCycleId - ID của chu kỳ kinh nguyệt
   */
  getCyclePredictionByMenstrualCycle: async (menstrualCycleId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/CyclePrediction/menstrual-cycle/${menstrualCycleId}`, 'GET');
  },

  /**
   * Lấy dự đoán chu kỳ theo ID khách hàng
   * @param customerId - ID của khách hàng
   */
  getCyclePredictionByCustomer: async (customerId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/CyclePrediction/customer/${customerId}`, 'GET');
  },

  /**
   * Lấy dự đoán chu kỳ theo khoảng thời gian
   * @param startDate - Ngày bắt đầu
   * @param endDate - Ngày kết thúc
   */
  getCyclePredictionByDateRange: async (startDate: string, endDate: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/CyclePrediction/date-range?startDate=${startDate}&endDate=${endDate}`, 'GET');
  },

  /**
   * Tìm kiếm dự đoán chu kỳ
   * @param searchParams - Tham số tìm kiếm
   */
  searchCyclePredictions: async (searchParams: any): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams(searchParams);
    return apiRequest<any[]>(`/api/CyclePrediction/search?${queryParams.toString()}`, 'GET');
  },

  /**
   * Tạo dự đoán chu kỳ từ chu kỳ kinh nguyệt
   * @param menstrualCycleId - ID của chu kỳ kinh nguyệt
   */
  generateCyclePrediction: async (menstrualCycleId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/CyclePrediction/generate/${menstrualCycleId}`, 'POST');
  }
};

// FeedBack API endpoints (Phản hồi khách hàng)
export const feedbackAPI = {
  /**
   * Lấy tất cả phản hồi
   */
  getAllFeedbacks: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/FeedBack', 'GET');
  },

  /**
   * Tạo phản hồi mới
   * @param feedbackData - Thông tin phản hồi
   */
  createFeedback: async (feedbackData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/FeedBack', 'POST', feedbackData);
  },

  /**
   * Lấy phản hồi theo ID
   * @param id - ID của phản hồi
   */
  getFeedbackById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/FeedBack/${id}`, 'GET');
  },

  /**
   * Cập nhật phản hồi
   * @param id - ID của phản hồi
   * @param feedbackData - Thông tin phản hồi cần cập nhật
   */
  updateFeedback: async (id: string, feedbackData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/FeedBack/${id}`, 'PUT', feedbackData);
  },

  /**
   * Xóa phản hồi
   * @param id - ID của phản hồi
   */
  deleteFeedback: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/FeedBack/${id}`, 'DELETE');
  },

  /**
   * Lấy phản hồi theo ID khách hàng
   * @param customerId - ID của khách hàng
   */
  getFeedbackByCustomer: async (customerId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/FeedBack/customer/${customerId}`, 'GET');
  },

  /**
   * Lấy phản hồi theo ID lịch hẹn
   * @param appointmentId - ID của lịch hẹn
   */
  getFeedbackByAppointment: async (appointmentId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/FeedBack/appointment/${appointmentId}`, 'GET');
  }
};

/**
 * Thông tin xét nghiệm từ API (theo swagger LabTest schema)
 */
export interface LabTestData {
  labTestID: number;
  customerID: string | null;
  customer?: any; // Account schema
  staffID: string | null;
  staff?: any; // Account schema
  treatmentID: number | null;
  treatmentOutcome?: any; // TreatmentOutcome schema
  testName: string | null;
  result: string | null;
  referenceRange: string | null;
  unit: string | null;
  isPositive: boolean | null;
  testDate: string; // ISO date format
}

/**
 * Request để tạo xét nghiệm mới (theo swagger CreateLabTestRequest schema)
 */
export interface CreateLabTestRequest {
  customerID: string; // required
  staffID: string; // required
  treatmentID?: number | null;
  testName: string; // required, max 200 chars
  result: string; // required, max 500 chars
  referenceRange?: string | null; // max 200 chars
  unit?: string | null; // max 50 chars
  isPositive?: boolean | null;
  testDate: string; // required, ISO date format
}

/**
 * Request để cập nhật xét nghiệm (theo swagger UpdateLabTestRequest schema)
 */
export interface UpdateLabTestRequest {
  labTestID: number; // required
  customerID?: string | null;
  staffID?: string | null;
  treatmentID?: number | null;
  testName?: string | null; // max 200 chars
  result?: string | null; // max 500 chars
  referenceRange?: string | null; // max 200 chars
  unit?: string | null; // max 50 chars
  isPositive?: boolean | null;
  testDate?: string | null; // ISO date format
}

// LabTest API endpoints (Xét nghiệm) - Theo đúng swagger specification
export const labTestAPI = {
  /**
   * Lấy tất cả xét nghiệm
   * Endpoint: GET /api/LabTest
   */
  getAllLabTests: async (): Promise<ApiResponse<LabTestData[]>> => {
    return apiRequest<LabTestData[]>('/api/LabTest', 'GET');
  },

  /**
   * Tạo xét nghiệm mới
   * Endpoint: POST /api/LabTest
   * @param labTestData - Thông tin xét nghiệm theo CreateLabTestRequest schema
   */
  createLabTest: async (labTestData: CreateLabTestRequest): Promise<ApiResponse<LabTestData>> => {
    return apiRequest<LabTestData>('/api/LabTest', 'POST', labTestData);
  },

  /**
   * Cập nhật xét nghiệm
   * Endpoint: PUT /api/LabTest
   * @param labTestData - Thông tin xét nghiệm cần cập nhật theo UpdateLabTestRequest schema
   */
  updateLabTest: async (labTestData: UpdateLabTestRequest): Promise<ApiResponse<LabTestData>> => {
    return apiRequest<LabTestData>('/api/LabTest', 'PUT', labTestData);
  },

  /**
   * Lấy xét nghiệm theo ID
   * Endpoint: GET /api/LabTest/{id}
   * @param id - ID của xét nghiệm (integer)
   */
  getLabTestById: async (id: number): Promise<ApiResponse<LabTestData>> => {
    return apiRequest<LabTestData>(`/api/LabTest/${id}`, 'GET');
  },

  /**
   * Xóa xét nghiệm
   * Endpoint: DELETE /api/LabTest/{id}
   * @param id - ID của xét nghiệm (integer)
   */
  deleteLabTest: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/api/LabTest/${id}`, 'DELETE');
  },

  /**
   * Lấy xét nghiệm theo ID khách hàng
   * Endpoint: GET /api/LabTest/customer/{customerId}
   * @param customerId - ID của khách hàng (string)
   */
  getLabTestByCustomer: async (customerId: string): Promise<ApiResponse<LabTestData[]>> => {
    return apiRequest<LabTestData[]>(`/api/LabTest/customer/${customerId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo ID nhân viên
   * Endpoint: GET /api/LabTest/staff/{staffId}
   * @param staffId - ID của nhân viên (string)
   */
  getLabTestByStaff: async (staffId: string): Promise<ApiResponse<LabTestData[]>> => {
    return apiRequest<LabTestData[]>(`/api/LabTest/staff/${staffId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo ID điều trị
   * Endpoint: GET /api/LabTest/treatment/{treatmentId}
   * @param treatmentId - ID của điều trị (integer)
   */
  getLabTestByTreatment: async (treatmentId: number): Promise<ApiResponse<LabTestData[]>> => {
    return apiRequest<LabTestData[]>(`/api/LabTest/treatment/${treatmentId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo khoảng thời gian
   * Endpoint: GET /api/LabTest/date-range
   * @param fromDate - Ngày bắt đầu (ISO format: 2025-05-10T00:00:00)
   * @param toDate - Ngày kết thúc (ISO format: 2025-05-10T00:00:00)
   */
  getLabTestByDateRange: async (fromDate: string, toDate: string): Promise<ApiResponse<LabTestData[]>> => {
    return apiRequest<LabTestData[]>(`/api/LabTest/date-range?fromDate=${fromDate}&toDate=${toDate}`, 'GET');
  },

  /**
   * Tìm kiếm xét nghiệm
   * Endpoint: GET /api/LabTest/search
   * @param search - Từ khóa tìm kiếm
   * @param pageIndex - Trang hiện tại (mặc định: 1)
   * @param pageSize - Số bản ghi trên mỗi trang (mặc định: 10)
   */
  searchLabTests: async (search?: string, pageIndex: number = 1, pageSize: number = 10): Promise<ApiResponse<LabTestData[]>> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('pageIndex', pageIndex.toString());
    queryParams.append('pageSize', pageSize.toString());
    return apiRequest<LabTestData[]>(`/api/LabTest/search?${queryParams.toString()}`, 'GET');
  }
};

// Transaction data interface
export interface TransactionData {
  responseId: string;
  appointment: {
    appointmentID: number;
    customerID: string;
    customer: {
      name: string;
      address: string;
      phone: string;
      status: boolean;
      dateOfBirth: {
        year: number;
        month: number;
        day: number;
        dayOfWeek: number;
        dayOfYear: number;
        dayNumber: number;
      };
    };
    consultantID: string;
    consultant: {
      name: string;
      address: string;
      phone: string;
      status: boolean;
      dateOfBirth: {
        year: number;
        month: number;
        day: number;
        dayOfWeek: number;
        dayOfYear: number;
        dayNumber: number;
      };
    };
    clinicID: number;
    clinic: {
      clinicID: number;
      name: string;
      description: string;
      email: string;
      address: string;
      phone: string;
      createAt: string;
      updateAt: string;
      status: number;
    };
    appointmentCode: string;
    expiredTime: string;
    createAt: string;
    appointmentDate: string;
    updateAt: string;
    totalAmount: number;
    remainingBalance: number;
    consultationFee: number;
    stIsTestFee: number;
    status: number;
    paymentStatus: number;
  };
  account: {
    userID: string;
    userName: string;
    email: string;
    name: string;
    address: string;
    phone: string;
    dateOfBirth: {
      year: number;
      month: number;
      day: number;
      dayOfWeek: number;
      dayOfYear: number;
      dayNumber: number;
    };
  };
  tmnCode: string;
  txnRef: string;
  amount: number;
  orderInfo: string;
  responseCode: string;
  message: string;
  bankTranNo: string;
  payDate: string;
  finishDate: string;
  bankCode: string;
  transactionNo: string;
  transactionType: string;
  transactionStatus: string;
  secureHash: string;
  transactionKind: number;
  statusTransaction: number;
}

// Transaction API endpoints (Giao dịch thanh toán)
export const transactionAPI = {
  /**
   * Lấy tất cả giao dịch
   */
  getAllTransactions: async (): Promise<ApiResponse<TransactionData[]>> => {
    return apiRequest<TransactionData[]>('/api/Transaction/GetAllTransactions', 'GET');
  },

  /**
   * Lấy giao dịch theo ID
   * @param transactionId - ID của giao dịch
   */
  getTransactionById: async (transactionId: string): Promise<ApiResponse<TransactionData>> => {
    return apiRequest<TransactionData>(`/api/Transaction/GetTransactionByID/${transactionId}`, 'GET');
  },

  /**
   * Lấy giao dịch theo ID lịch hẹn
   * @param appointmentId - ID của lịch hẹn
   */
  getTransactionByAppointment: async (appointmentId: string): Promise<ApiResponse<TransactionData[]>> => {
    return apiRequest<TransactionData[]>(`/api/Transaction/GetTransactionByAppointmentId/${appointmentId}`, 'GET');
  },

  /**
   * Lấy giao dịch theo ID tài khoản
   * @param accountId - ID của tài khoản
   */
  getTransactionByAccount: async (accountId: string): Promise<ApiResponse<TransactionData[]>> => {
    return apiRequest<TransactionData[]>(`/api/Transaction/GetTransactionByAccountID/${accountId}`, 'GET');
  },
  
  /**
   * Cập nhật trạng thái giao dịch
   * @param transactionId - ID giao dịch
   * @param status - Trạng thái mới
   */
  updateTransactionStatus: async (transactionId: string, status: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Transaction/UpdateTransactionStatus?transactionID=${transactionId}&status=${status}`, 'PUT');
  }
};

// Slot API endpoints (Quản lý slot thời gian)
export const slotAPI = {
  /**
   * Lấy tất cả slot
   */
  getAllSlots: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/slot/GetSlot', 'GET');
  },

  /**
   * Tạo slot mới
   * @param slotData - Thông tin slot
   */
  createSlot: async (slotData: any): Promise<ApiResponse<any>> => {
    console.log('Calling createSlot API with data:', slotData);
    return apiRequest<any>('/api/slot', 'POST', slotData);
  },
  
  
  /**
   * Cập nhật slot
   * Endpoint: PUT /api/slot?slotId={slotId}
   * @param slotId - ID của slot
   * @param slotData - Thông tin slot cần cập nhật
   */
  updateSlot: async (slotId: string, slotData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/slot?slotId=${slotId}`, 'PUT', slotData);
  },

  /**
   * Xóa slot
   * Endpoint: DELETE /api/slot/{slotId}
   * @param slotId - ID của slot
   */
  deleteSlot: async (slotId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/slot/${slotId}`, 'DELETE');
  }
};

// Working Hour API endpoints (Giờ làm việc)
export const workingHourAPI = {
  /**
   * Lấy tất cả giờ làm việc
   */
  getAllWorkingHours: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/WorkingHour/GetWorkingHour', 'GET');
  },

  /**
   * Tạo giờ làm việc mới
   * @param workingHourData - Thông tin giờ làm việc
   */
  createWorkingHour: async (workingHourData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/WorkingHour/CreateWorkingHour', 'POST', workingHourData);
  },

  /**
   * Cập nhật giờ làm việc
   * @param workingHourID - ID của working hour cần cập nhật
   * @param workingHourData - Thông tin giờ làm việc cần cập nhật
   */
  updateWorkingHour: async (workingHourID: number, workingHourData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/WorkingHour/UpdateWorkingHour?workingHourID=${workingHourID}`, 'PUT', workingHourData);
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
  post: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'POST', data),
  
  /**
   * PUT request
   * @param endpoint - Đường dẫn API
   * @param data - Dữ liệu gửi lên
   */
  put: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'PUT', data),
  
  /**
   * DELETE request
   * @param endpoint - Đường dẫn API
   */
  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, 'DELETE'),
  
  /**
   * Upload file
   * @param file - File cần upload
   * @param path - Đường dẫn API
   */
  uploadFile,
};

// Consultant API endpoints (dành cho Manager)
export const consultantAPI = {
  /**
   * Lấy tất cả tư vấn viên
   */
  getAllConsultants: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/Consultant/GetConsultant', 'GET');
  },
  
  /**
   * Lấy tư vấn viên theo ID
   */
  getConsultantById: async (consultantId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Consultant/GetConsultantById/${consultantId}`, 'GET');
  },
  
  /**
   * Tạo tư vấn viên mới
   */
  createConsultant: async (consultantData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/Consultant/CreateConsultant', 'POST', consultantData);
  },
  
  /**
   * Cập nhật thông tin tư vấn viên
   */
  updateConsultant: async (consultantId: string, consultantData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Consultant/UpdateConsultant/${consultantId}`, 'PUT', consultantData);
  },
  
  /**
   * Xóa tư vấn viên
   */
  deleteConsultant: async (consultantId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Consultant/DeleteConsultant/${consultantId}`, 'DELETE');
  },
  
  /**
   * Kích hoạt tư vấn viên
   */
  activateConsultant: async (consultantId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Consultant/ActivateConsultant/${consultantId}`, 'PUT');
  },
  
  /**
   * Vô hiệu hóa tư vấn viên
   */
  deactivateConsultant: async (consultantId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Consultant/DeactivateConsultant/${consultantId}`, 'PUT');
  }
};

// Category API endpoints
export const categoryAPI = {
  /**
   * Lấy tất cả danh mục
   */
  getCategories: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/category/GetCategory', 'GET');
  },
  
  /**
   * Tạo danh mục mới (dành cho Manager)
   * @param categoryData - {clinicID: number, name: string}
   */
  createCategory: async (categoryData: {clinicID: number, name: string}): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/category/CreateCategory', 'POST', categoryData);
  },

  /**
   * Cập nhật danh mục (dành cho Manager)
   * @param categoryId - ID của danh mục
   * @param categoryData - {name: string, status: boolean}
   */
  updateCategory: async (categoryId: number, categoryData: {name: string, status: boolean}): Promise<ApiResponse<any>> => {
    const url = `/api/category/UpdateCategory?id=${categoryId}`;
    return apiRequest<any>(url, 'PUT', categoryData);
  }
};


// Consultant Slot API endpoints (Quản lý đăng ký slot của consultant)
export const consultantSlotAPI = {
  /**
   * Lấy tất cả consultant và thông tin slot đã đăng ký
   */
  getAllConsultants: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/consultantSlot/GetAllConsultantSlot', 'GET');
  },

  /**
   * Alias for getAllConsultants (for backward compatibility)
   */
  getAllConsultantSlots: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/consultantSlot/GetAllConsultantSlot', 'GET');
  },

  /**
   * Lấy thông tin đăng ký slot của một consultant
/**
   * Lấy tất cả consultant profile  
   * Endpoint: GET /api/consultantSlot/GetAllConsultantProfile
   */
  getAllConsultantProfiles: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/consultantSlot/GetAllConsultantProfile', 'GET');
  },

  /**
   * Lấy consultant profile theo Account ID
   * Endpoint: GET /api/consultantSlot/GetConsultantProfileByAccountId/{accountId}
   * @param accountId - ID của account
   */
  getConsultantProfileByAccountId: async (accountId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/GetConsultantProfileByAccountId/${accountId}`, 'GET');
  },

  /**
   * Lấy consultant profile theo Profile ID
   * Endpoint: GET /api/consultantSlot/GetConsultantProfileById/{consultantProfileID}
   * @param consultantProfileID - ID của consultant profile
   */
  getConsultantProfileById: async (consultantProfileID: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/GetConsultantProfileById/${consultantProfileID}`, 'GET');
  },

  /**
   * Lấy thông tin slot của một consultant
   * Endpoint: GET /api/consultantSlot?consultantId={consultantId}
  * @param consultantId - ID của consultant
   */
  getConsultantSlots: async (consultantId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/consultantSlot?consultantId=${consultantId}`, 'GET');
  },

  /**
   * Đăng ký slot cho consultant
   * @param slotId - ID của slot
   * @param maxAppointment - Số lượng appointment tối đa
   */
  registerSlot: async (slotId: number, maxAppointment: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/register?slotId=${slotId}&maxAppointment=${maxAppointment}`, 'POST');
  },

  /**
   * Hủy đăng ký slot của consultant
   * @param slotId - ID của slot đã đăng ký
   */
  unregisterSlot: async (slotId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/unregister?id=${slotId}`, 'DELETE');
  },
  
  /**
   * Lấy tất cả slot có sẵn cho consultant đăng ký
   */
  getAvailableSlots: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/slot/GetSlot', 'GET');
  },

  /**
   * Tạo consultant profile mới
   * @param profileData - {accountId, description, specialty, experience, consultantPrice}
   */
  createConsultantProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams({
      accountId: profileData.accountId || '',
      description: profileData.description || '',
      specialty: profileData.specialty || '',
      experience: profileData.experience || '',
      consultantPrice: profileData.consultantPrice?.toString() || '0'
    });
    return apiRequest<any>(`/api/consultantSlot/CreateConsultantProfile?${queryParams.toString()}`, 'POST');
  },

  /**
   * Cập nhật consultant profile
   * @param profileId - ID của profile
   * @param profileData - Dữ liệu cập nhật
   */
  updateConsultantProfile: async (profileId: number, profileData: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams({
      consultantProfileID: profileId.toString(),
      description: profileData.description || '',
      specialty: profileData.specialty || '',
      experience: profileData.experience || '',
      consultantPrice: profileData.consultantPrice?.toString() || '0'
    });
    return apiRequest<any>(`/api/consultantSlot/UpdateConsultantProfile?${queryParams.toString()}`, 'PUT');
  },

  /**
   * Xóa consultant profile
   * @param profileId - ID của profile cần xóa
   */
  deleteConsultantProfile: async (profileId: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/DeleteConsultantProfile?consultantProfileID=${profileId}`, 'DELETE');
  },

  /**
   * Hoán đổi slots giữa các consultant
   * @param fromConsultantId - ID consultant hiện tại
   * @param toConsultantId - ID consultant nhận slot
   * @param slotId - ID của slot cần hoán đổi
   */
  swapSlots: async (fromConsultantId: string, toConsultantId: string, slotId: number): Promise<ApiResponse<any>> => {
    const requestBody = {
      fromConsultantId,
      toConsultantId,
      slotId
    };
    return apiRequest<any>('/api/consultantSlot/swap', 'POST', requestBody);
  },

  /**
   * Lấy danh sách tất cả users có thể làm consultant
   */
  getAllUsers: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/account/GetAllAccount', 'GET');
  }
};


// Blog API endpoints  
export const blogAPI = {
  /**
   * Lấy tất cả bài viết
   */
  getBlogs: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/blog/GetAllBlog', 'GET');
  },
  
  /**
   * Lấy bài viết theo ID
   */
  getBlogById: async (blogId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/blog/GetBlogByID?blogId=${blogId}`, 'GET');
  },
  
  /**
   * Tạo bài viết mới (dành cho Manager)
   * @param blogData - { title, content, author, isPublished, image? }
   */
  createBlog: async (blogData: any): Promise<ApiResponse<any>> => {
    try {
      console.log('Creating blog with data:', blogData);
      
      // Ensure required fields have default values to prevent validation errors
      const title = blogData.title?.trim() || 'Untitled Blog';
      const content = blogData.content?.trim() || 'No content provided';
      const author = blogData.author?.trim() || 'Anonymous';
      const status = blogData.isPublished ? 'true' : 'false';
      
      console.log('Blog data being sent:', { title, content, author, status });
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        Title: title,
        Content: content,
        Author: author,
        Status: status
      });
      
      const url = `/api/blog/CreateBlog?${queryParams.toString()}`;
      console.log('CreateBlog URL:', url);
      
      // Tạo FormData cho multipart/form-data
      const formData = new FormData();
      
      // Thêm hình ảnh nếu có, hoặc tạo placeholder
      if (blogData.image && blogData.image instanceof File) {
        formData.append('Images', blogData.image);
      } else {
        // API requires Images field - create a placeholder image like we did for services
        const placeholderImage = createPlaceholderImage();
        formData.append('Images', placeholderImage);
      }
      
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Sending CreateBlog request...');
      
      // Gửi request với multipart/form-data
      const response = await fetch(`${API.BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log('CreateBlog response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CreateBlog Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('CreateBlog success:', result);
      return result;
    } catch (error) {
      console.error('Create blog error:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật bài viết (dành cho Manager)
   * @param blogData - { id, title, content, author, status }
   */
  updateBlog: async (blogData: any): Promise<ApiResponse<any>> => {
    // Tạo dữ liệu cần gửi
    const updateData = {
      title: blogData.title,
      content: blogData.content,
      author: blogData.author,
      status: blogData.isPublished || blogData.status === 'published'
    };
    
    return apiRequest<any>(`/api/blog/UpdateBlog?blogId=${blogData.id}`, 'PUT', updateData);
  },
  
  /**
   * Kích hoạt bài viết (đổi trạng thái sang published)
   */
  activateBlog: async (blogId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/blog/ActivateBlog?blogId=${blogId}`, 'PUT');
  },
  
  /**
   * Vô hiệu hóa bài viết (đổi trạng thái sang draft)
   */
  deactivateBlog: async (blogId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/blog/DeactivateBlog?blogId=${blogId}`, 'PUT');
  },
  
  /**
   * Xóa bài viết
   */
  deleteBlog: async (blogId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/blog/DeleteBlog?blogId=${blogId}`, 'DELETE');
  }
}; 

// QnA API endpoints
export const qnaAPI = {
  /**
   * Get all questions
   */
  getAllQuestions: async (params?: any): Promise<ApiResponse<any>> => {
    let url = API.QNA.QUESTIONS;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('pageNumber', params.page.toString());
      if (params.limit) queryParams.append('pageSize', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      url = `${url}?${queryParams.toString()}`;
    }
    return apiRequest<any>(url, 'GET');
  },
  
  /**
   * Get a question by ID
   */
  getQuestionById: async (questionId: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.QUESTION_BY_ID(questionId), 'GET');
  },
  
  /**
   * Create a new question
   */
  createQuestion: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.QUESTIONS, 'POST', data);
  },
  
  /**
   * Get all messages for a question
   */
  getMessages: async (questionId: number): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('questionId', questionId.toString());
    return apiRequest<any>(`${API.QNA.MESSAGES}?${queryParams.toString()}`, 'GET');
  },
  
  /**
   * Add a message to a question
   */
  createMessage: async (questionId: number, data: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('questionId', questionId.toString());
    return apiRequest<any>(`${API.QNA.MESSAGES}?${queryParams.toString()}`, 'POST', data);
  },
  
  /**
   * Vote on a question
   */
  voteQuestion: async (questionId: number, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.VOTE_QUESTION(questionId), 'POST', data);
  },
  
  /**
   * Vote on an answer
   */
  voteAnswer: async (answerId: number, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.VOTE_ANSWER(answerId), 'POST', data);
  },
  
  /**
   * Verify an answer
   */
  verifyAnswer: async (answerId: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.VERIFY_ANSWER(answerId), 'PUT');
  },
  
  /**
   * Search questions
   */
  searchQuestions: async (searchTerm: string, params?: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('searchTerm', searchTerm);
    
    if (params) {
      if (params.page) queryParams.append('pageNumber', params.page.toString());
      if (params.limit) queryParams.append('pageSize', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    }
    
    return apiRequest<any>(`${API.QNA.SEARCH}?${queryParams.toString()}`, 'GET');
  },
  
  /**
   * Get questions by category
   */
  getQuestionsByCategory: async (category: string, params?: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('category', category);
    
    if (params) {
      if (params.page) queryParams.append('pageNumber', params.page.toString());
      if (params.limit) queryParams.append('pageSize', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    }
    
    return apiRequest<any>(`${API.QNA.BY_CATEGORY}?${queryParams.toString()}`, 'GET');
  },
  
  /**
   * Get questions by current user
   */
  getUserQuestions: async (params?: any): Promise<ApiResponse<any>> => {
    let url = API.QNA.MY_QUESTIONS;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('pageNumber', params.page.toString());
      if (params.limit) queryParams.append('pageSize', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      url = `${url}?${queryParams.toString()}`;
    }
    return apiRequest<any>(url, 'GET');
  },
  
  /**
   * Update question status
   */
  updateQuestionStatus: async (questionId: number, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(API.QNA.UPDATE_STATUS(questionId), 'PUT', data);
  }
}; 