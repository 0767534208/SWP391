/**
 * Constants và cấu hình cho toàn bộ ứng dụng
 */

/**
 * Các URL API
 */
export const API = {
  BASE_URL: '', // Để trống vì proxy đã xử lý việc này
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/account/login',
    REGISTER: '/account/register-Customer',
    VERIFY_OTP: (email: string, code: string) => `/account/confirmation/${encodeURIComponent(email)}/${code}`,
    REFRESH_TOKEN: '/account/refresh-token',
    FORGOT_PASSWORD: '/account/forgot-password',
    RESET_PASSWORD: '/account/reset-password',
    LOGOUT: '/account/logout',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_PROFILE_PICTURE: '/user/upload-profile-picture',
  },
  
  // Appointment endpoints
  APPOINTMENT: {
    BASE: '/appointments',
    GET_BY_ID: (id: string) => `/appointments/${id}`,
    GET_BY_USER: '/appointments/user',
    GET_BY_CONSULTANT: '/appointments/consultant',
    UPDATE_STATUS: (id: string) => `/appointments/${id}/status`,
  },
  
  // Service endpoints
  SERVICE: {
    BASE: '/services',
    GET_BY_ID: (id: string) => `/services/${id}`,
  },
  
  // Blog endpoints
  BLOG: {
    BASE: '/blogs',
    GET_BY_ID: (id: string) => `/blogs/${id}`,
  },
  
  // Slot endpoints
  SLOT: {
    BASE: '/slots',
    GET_BY_ID: (id: string) => `/slots/${id}`,
    GET_AVAILABLE: '/slots/available',
  },
  
  // Test result endpoints
  TEST_RESULT: {
    BASE: '/test-results',
    GET_BY_ID: (id: string) => `/test-results/${id}`,
    GET_BY_USER: '/test-results/user',
  },
  
  // Consultant endpoints
  CONSULTANT: {
    BASE: '/consultants',
    GET_BY_ID: (id: string) => `/consultants/${id}`,
    GET_PROFILE: '/consultants/profile',
  },
  
  // Cycle tracking endpoints
  CYCLE_TRACKING: {
    BASE: '/cycle-tracking',
    GET_BY_ID: (id: string) => `/cycle-tracking/${id}`,
  },
  
  // Payment endpoints
  PAYMENT: {
    BASE: '/payments',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    CREATE: '/payments/create',
  },
  
  // Contact endpoints
  CONTACT: {
    SEND: '/contact',
  },
  
  // QnA endpoints
  QNA: {
    QUESTIONS: '/Question',
    QUESTION_BY_ID: (id: number) => `/Question/${id}`,
    MESSAGES: '/Message',
    VOTE_QUESTION: (id: number) => `/Question/${id}/vote`,
    VOTE_ANSWER: (id: number) => `/Message/${id}/vote`,
    VERIFY_ANSWER: (id: number) => `/Message/${id}/verify`,
    SEARCH: '/Question/search',
    BY_CATEGORY: '/Question/category',
    MY_QUESTIONS: '/Question/my-questions',
    UPDATE_STATUS: (id: number) => `/Question/${id}/status`,
  },
};

/**
 * Các key được sử dụng trong localStorage
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  IS_LOGGED_IN: 'isLoggedIn',
  USER_ROLE: 'userRole',
  USER: 'user',
  PENDING_REGISTRATION: 'pendingRegistration'
};

/**
 * Các vai trò người dùng
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CONSULTANT: 'consultant',
  USER: 'user',
};

/**
 * Các trạng thái của cuộc hẹn
 */
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Các cài đặt mặc định
 */
export const DEFAULT_SETTINGS = {
  PAGINATION: {
    PAGE_SIZE: 10,
    FIRST_PAGE: 1,
  },
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
};

/**
 * Các đường dẫn trong ứng dụng
 */
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/profile',
    TEST_RESULTS: '/test-results',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    APPOINTMENTS: '/admin/appointments',
    CONSULTANTS: '/admin/consultants',
  },
  MANAGER: {
    DASHBOARD: '/manager',
    SERVICES: '/manager/services',
    BLOGS: '/manager/blogs',
    SLOTS: '/manager/slots',
  },
  CONSULTANT: {
    PROFILE: '/consultant/profile',
    DASHBOARD: '/consultant/dashboard',
    APPOINTMENTS: '/consultant/appointments',
    TEST_RESULTS: '/consultant/test-results',
  },
  STAFF: {
    DASHBOARD: '/staff',
    APPOINTMENTS: '/staff/appointments',
    TEST_RESULTS: '/staff/test-results',
  },
  SERVICES: '/services',
  BOOKING: '/booking',
  CONFIRM_BOOKING: '/confirm-booking',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment-success',
  BLOGS: '/blogUser',
  BLOG_DETAIL: '/blog/:id',
  CYCLE_TRACKER: '/CycleTracker',
  CONTACT: '/contact',
  QNA: '/qna',
  API_TESTERS: '/api-testers',
}; 