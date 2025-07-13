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
  consultantID: string | null;
  appointmentDate: string;
  status: number;
  appointmentType: number;
  totalAmount: number;
  paymentStatus: number;
  treatmentID?: string | null;
  treatmentOutcome?: any | null;
  slot: {
    slotID: number;
    startConsultant: string;
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
    status: boolean;
    dateOfBirth: string;
  };
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
   * @param refundData - Thông tin hoàn tiền
   */
  appointmentRefundFull: async (refundData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/AppointmentPayment-Refund-Full', 'POST', refundData);
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
   * @param appointmentData - Thông tin lịch hẹn với STI request
   */
  updateAppointmentWithSTIRequest: async (appointmentData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/appointment/UpdateAppointmentWithSTIRequest', 'PUT', appointmentData);
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
    if (serviceData.ServicesPrice) queryParams.append('ServicesPrice', serviceData.ServicesPrice.toString());
    if (serviceData.ServiceType !== undefined) queryParams.append('ServiceType', serviceData.ServiceType.toString());
    if (serviceData.Status !== undefined) queryParams.append('Status', serviceData.Status.toString());
    
    // Tạo URL với query parameters
    const url = `/api/Service/CreateService?${queryParams.toString()}`;
    
    // Tạo FormData cho multipart/form-data (theo swagger spec)
    const formData = new FormData();
    
    // Thêm hình ảnh vào formData nếu có
    if (serviceData.Images && serviceData.Images.length > 0) {
      for (const image of serviceData.Images) {
        if (image instanceof File || image instanceof Blob) {
          formData.append('Images', image);
        }
      }
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
    
    return handleResponse<any>(response);
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
    const updateData = {
      servicesID: serviceId,
      servicesName: serviceData.servicesName,
      description: serviceData.description,
      servicesPrice: serviceData.servicesPrice,
      serviceType: serviceData.serviceType,
      status: serviceData.status
      // Note: categoryID không được hỗ trợ trong UpdateService API
    };
    
    console.log('UpdateService payload:', updateData);
    
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

// LabTest API endpoints (Xét nghiệm)
export const labTestAPI = {
  /**
   * Lấy tất cả xét nghiệm
   */
  getAllLabTests: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/LabTest', 'GET');
  },

  /**
   * Tạo xét nghiệm mới
   * @param labTestData - Thông tin xét nghiệm
   */
  createLabTest: async (labTestData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/LabTest', 'POST', labTestData);
  },

  /**
   * Lấy xét nghiệm theo ID
   * @param id - ID của xét nghiệm
   */
  getLabTestById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/LabTest/${id}`, 'GET');
  },

  /**
   * Cập nhật xét nghiệm
   * @param id - ID của xét nghiệm
   * @param labTestData - Thông tin xét nghiệm cần cập nhật
   */
  updateLabTest: async (id: string, labTestData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/LabTest/${id}`, 'PUT', labTestData);
  },

  /**
   * Xóa xét nghiệm
   * @param id - ID của xét nghiệm
   */
  deleteLabTest: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/LabTest/${id}`, 'DELETE');
  },

  /**
   * Lấy xét nghiệm theo ID khách hàng
   * @param customerId - ID của khách hàng
   */
  getLabTestByCustomer: async (customerId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/LabTest/customer/${customerId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo ID nhân viên
   * @param staffId - ID của nhân viên
   */
  getLabTestByStaff: async (staffId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/LabTest/staff/${staffId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo ID điều trị
   * @param treatmentId - ID của điều trị
   */
  getLabTestByTreatment: async (treatmentId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/LabTest/treatment/${treatmentId}`, 'GET');
  },

  /**
   * Lấy xét nghiệm theo khoảng thời gian
   * @param startDate - Ngày bắt đầu
   * @param endDate - Ngày kết thúc
   */
  getLabTestByDateRange: async (startDate: string, endDate: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/LabTest/date-range?startDate=${startDate}&endDate=${endDate}`, 'GET');
  },

  /**
   * Tìm kiếm xét nghiệm
   * @param searchParams - Tham số tìm kiếm
   */
  searchLabTests: async (searchParams: any): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams(searchParams);
    return apiRequest<any[]>(`/api/LabTest/search?${queryParams.toString()}`, 'GET');
  }
};

// Transaction API endpoints (Giao dịch thanh toán)
export const transactionAPI = {
  /**
   * Lấy tất cả giao dịch
   */
  getAllTransactions: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/Transaction/GetAllTransactions', 'GET');
  },

  /**
   * Lấy giao dịch theo ID
   * @param transactionId - ID của giao dịch
   */
  getTransactionById: async (transactionId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/Transaction/GetTransactionByID/${transactionId}`, 'GET');
  },

  /**
   * Lấy giao dịch theo ID lịch hẹn
   * @param appointmentId - ID của lịch hẹn
   */
  getTransactionByAppointment: async (appointmentId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/Transaction/GetTransactionByAppointmentId/${appointmentId}`, 'GET');
  },

  /**
   * Lấy giao dịch theo ID tài khoản
   * @param accountId - ID của tài khoản
   */
  getTransactionByAccount: async (accountId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/api/Transaction/GetTransactionByAccountID/${accountId}`, 'GET');
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
   * @param workingHourData - Thông tin giờ làm việc cần cập nhật
   */
  updateWorkingHour: async (workingHourData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/WorkingHour/UpdateWorkingHour', 'PUT', workingHourData);
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

// Consultant Slot API endpoints (Dựa theo các endpoint trong ảnh)
export const consultantSlotAPI = {
  /**
   * Lấy tất cả consultant slot
   * Endpoint: GET /api/consultantSlot/GetAllConsultantSlot
   */
  getAllConsultantSlots: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/api/consultantSlot/GetAllConsultantSlot', 'GET');
  },

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
   * Tìm kiếm consultant slot
   * Endpoint: GET /api/consultantSlot/search
   * @param searchParams - Các tham số tìm kiếm
   */
  searchConsultantSlots: async (searchParams?: { [key: string]: any }): Promise<ApiResponse<any[]>> => {
    const queryString = searchParams ? 
      '?' + Object.entries(searchParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&') 
      : '';
    return apiRequest<any[]>(`/api/consultantSlot/search${queryString}`, 'GET');
  },

  /**
   * Đăng ký slot cho consultant
   * Endpoint: POST /api/consultantSlot/register?slotId={slotId}&maxAppointment={maxAppointment}
   * @param slotId - ID của slot
   * @param maxAppointment - Số lượng appointment tối đa
   */
  registerSlot: async (slotId: number, maxAppointment: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/register?slotId=${slotId}&maxAppointment=${maxAppointment}`, 'POST');
  },

  /**
   * Tạo profile consultant
   * Endpoint: POST /api/consultantSlot/CreateConsultantProfile
   * @param profileData - Dữ liệu profile consultant
   */
  createConsultantProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/api/consultantSlot/CreateConsultantProfile', 'POST', profileData);
  },

  /**
   * Cập nhật profile consultant
   * Endpoint: PUT /api/consultantSlot/UpdateConsultantProfile?consultantProfileID={consultantProfileID}
   * @param consultantProfileID - ID profile consultant
   * @param profileData - Dữ liệu profile consultant cần cập nhật
   */
  updateConsultantProfile: async (consultantProfileID: number, profileData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/UpdateConsultantProfile?consultantProfileID=${consultantProfileID}`, 'PUT', profileData);
  },

  /**
   * Hoán đổi slot giữa 2 consultant
   * Endpoint: PUT /api/consultantSlot/swap?consultantA={consultantA}&slotA={slotA}&consultantB={consultantB}&slotB={slotB}
   * @param consultantA - ID consultant A
   * @param slotA - ID slot A
   * @param consultantB - ID consultant B 
   * @param slotB - ID slot B
   */
  swapSlots: async (consultantA: string, slotA: number, consultantB: string, slotB: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/api/consultantSlot/swap?consultantA=${consultantA}&slotA=${slotA}&consultantB=${consultantB}&slotB=${slotB}`, 'PUT');
  },

  // Alias methods cho backward compatibility
  getAllConsultants: async (): Promise<ApiResponse<any[]>> => {
    return consultantSlotAPI.getAllConsultantSlots();
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
   * @param blogData - { title, content, author, status, images }
   */
  createBlog: async (blogData: any): Promise<ApiResponse<any>> => {
    // Tạo FormData cho multipart/form-data
    const formData = new FormData();
    
    // Thêm các trường dữ liệu cơ bản
    formData.append('Title', blogData.title);
    formData.append('Content', blogData.content);
    formData.append('Author', blogData.author || '');
    formData.append('Status', blogData.isPublished ? 'true' : 'false');
    
    // Thêm hình ảnh nếu có
    if (blogData.image) {
      if (typeof blogData.image === 'string') {
        // Nếu là URL
        const response = await fetch(blogData.image);
        const blob = await response.blob();
        formData.append('Images', blob, 'image.jpg');
      } else if (blogData.image instanceof File) {
        // Nếu là File
        formData.append('Images', blogData.image);
      }
    }
    
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Gửi request với multipart/form-data
    const response = await fetch(`${API.BASE_URL}/api/blog/CreateBlog`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse<any>(response);
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