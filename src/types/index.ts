/**
 * Types and Interfaces
 * 
 * File này chứa tất cả các định nghĩa type và interface cho toàn bộ ứng dụng
 * Được tổ chức theo nhóm chức năng để dễ bảo trì
 */

// ========== API Response Types ==========

/**
 * API Response chung cho tất cả các API call
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
}

// ========== Authentication Types ==========

/**
 * Thông tin người dùng từ API
 */
export interface UserData {
  userID: string;
  customerID?: string;
  userName: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  dateOfBirth: string;
  roles: string[];
  token: string;
  refreshToken: string;
  profilePicture?: string;
}

/**
 * Dữ liệu đăng nhập
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Dữ liệu đăng ký
 */
export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  password: string;
  dateOfBirth: string;
}

/**
 * Yêu cầu xác thực OTP
 */
export interface OTPRequest {
  email: string;
  otp: string;
}

/**
 * Yêu cầu đặt lại mật khẩu
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * Yêu cầu cập nhật thông tin người dùng
 */
export interface ProfileUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}

/**
 * Yêu cầu thay đổi mật khẩu
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ========== Appointment Types ==========

/**
 * Trạng thái cuộc hẹn
 */
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Thông tin cuộc hẹn
 */
export interface Appointment {
  id: string;
  userId: string;
  consultantId: string;
  serviceId: string;
  slotId: string;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserData;
  consultant?: Consultant;
  service?: Service;
  slot?: Slot;
  paymentStatus?: string;
}

/**
 * Yêu cầu tạo cuộc hẹn mới
 */
export interface CreateAppointmentRequest {
  consultantId: string;
  serviceId: string;
  slotId: string;
  date: string;
  notes?: string;
}

/**
 * Yêu cầu cập nhật trạng thái cuộc hẹn
 */
export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

/**
 * Yêu cầu đặt lịch hẹn
 */
export interface AppointmentRequest {
  customerID: string;
  consultantID: string;
  clinicID: number;
  slotID: number;
  appointmentDate: string;
  appointmentDetails: {
    servicesID: number;
    consultantProfileID: number;
    quantity: number;
  }[];
}

// ========== Service Types ==========

/**
 * Thông tin dịch vụ
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Yêu cầu tạo dịch vụ mới
 */
export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  isActive?: boolean;
}

// ========== Consultant Types ==========

/**
 * Thông tin tư vấn viên
 */
export interface Consultant {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  bio: string;
  rating?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserData;
}

/**
 * Thông tin profile của tư vấn viên
 */
export interface ConsultantProfile {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  bio: string;
  rating?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserData;
  availability?: {date: string, slots: Slot[]}[];
}

/**
 * Yêu cầu tạo tư vấn viên mới
 */
export interface CreateConsultantRequest {
  userId: string;
  specialization: string;
  experience: number;
  bio: string;
  isAvailable?: boolean;
}

/**
 * Yêu cầu cập nhật profile tư vấn viên
 */
export interface ConsultantProfileRequest {
  description?: string;
  specialty?: string;
  experience?: string;
  consultantPrice?: number;
}

// ========== Slot Types ==========

/**
 * Thông tin khung giờ
 */
export interface Slot {
  id: string;
  consultantId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
  consultant?: Consultant;
}

/**
 * Yêu cầu tạo khung giờ mới
 */
export interface CreateSlotRequest {
  consultantId: string;
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * Yêu cầu tạo khung giờ từ API
 */
export interface SlotCreationRequest {
  clinicID: number;
  workingHourID: number;
  maxConsultant: number;
  maxTestAppointment: number;
  startTime: string; // ISO format date-time
  endTime: string;   // ISO format date-time
}



// ========== Blog Types ==========

/**
 * Thông tin bài viết
 */
export interface Blog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image?: string;
  authorId: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: UserData;
  tags?: string[];
}

/**
 * Yêu cầu tạo bài viết mới
 */
export interface CreateBlogRequest {
  title: string;
  content: string;
  summary: string;
  image?: string;
  isPublished?: boolean;
  tags?: string[];
}

/**
 * Yêu cầu tạo blog mới
 */
export interface BlogCreationRequest {
  title: string;
  content: string;
  summary: string;
  image?: string;
  isPublished?: boolean;
  tags?: string[];
}

// ========== Test Result Types ==========

/**
 * Thông tin kết quả xét nghiệm
 */
// ========== Test Result Types - Moved to api.ts ==========
// TestResult, CreateLabTestRequest và UpdateLabTestRequest đã được moved sang api.ts
// để tránh duplicate và theo đúng cấu trúc từ swagger

/**
 * Legacy TestResult interface - deprecated, sử dụng LabTestData từ api.ts thay thế
 * @deprecated Use LabTestData from api.ts instead
 */
export interface TestResult {
  id: string;
  userId: string;
  testType: string;
  testDate: string;
  result: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  user?: UserData;
}

/**
 * Legacy CreateTestResultRequest - deprecated
 * @deprecated Use CreateLabTestRequest from api.ts instead
 */
export interface CreateTestResultRequest {
  userId: string;
  testType: string;
  testDate: string;
  result: string;
  notes?: string;
  attachments?: string[];
}

// ========== Cycle Tracking Types ==========

/**
 * Thông tin chu kỳ kinh nguyệt
 */
export interface CycleData {
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  symptoms?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Yêu cầu tạo chu kỳ kinh nguyệt mới
 */
export interface CreateCycleRequest {
  startDate: string;
  endDate?: string;
  symptoms?: string[];
  notes?: string;
}

/**
 * Yêu cầu cập nhật dữ liệu chu kỳ
 */
export interface CycleDataRequest {
  startDate: string;
  endDate?: string;
  symptoms?: string[];
  notes?: string;
}

// ========== Payment Types ==========

/**
 * Trạng thái thanh toán
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * Thông tin thanh toán
 */
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

/**
 * Yêu cầu tạo thanh toán mới
 */
export interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

/**
 * Yêu cầu thanh toán
 */
export interface PaymentRequest {
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

// ========== Contact Types ==========

/**
 * Thông tin liên hệ
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Yêu cầu tạo liên hệ mới
 */
export interface CreateContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Yêu cầu liên hệ
 */
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ========== Pagination Types ==========

/**
 * Thông tin phân trang
 */
export interface PaginationParams {
  page: number;
  limit: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
}

/**
 * Kết quả phân trang
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 

/**
 * Vai trò người dùng
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  CONSULTANT = 'consultant',
  USER = 'user',
}

/**
 * Thông tin người dùng
 */
export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// QnA types
/**
 * Thông tin câu hỏi
 */
export interface Question {
  id?: number;
  questionID?: number;
  title?: string;
  content: string;
  category?: string;
  createdAt?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  status?: 'pending' | 'approved' | 'rejected';
  votes?: number;
  answered?: boolean;
  customer?: {
    name: string;
    [key: string]: unknown;
  };
  customerID?: string;
  messages?: Answer[];
}

/**
 * Thông tin câu trả lời
 */
export interface Answer {
  id?: number;
  messageID?: number;
  questionId?: number;
  content: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  createdAt?: string;
  isVerified?: boolean;
  votes?: number;
  customer?: {
    name: string;
    [key: string]: unknown;
  };
}

/**
 * Yêu cầu tạo câu hỏi mới
 */
export interface CreateQuestionRequest {
  content: string;
}

/**
 * Yêu cầu tạo câu trả lời mới
 */
export interface CreateAnswerRequest {
  questionId: number;
  content: string;
}

/**
 * Câu hỏi với danh sách câu trả lời
 */
export interface QuestionResponse extends Question {
  answers?: Answer[];
  messages?: Answer[];
}

/**
 * Yêu cầu cập nhật trạng thái câu hỏi
 */
export interface UpdateQuestionStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Yêu cầu bình chọn
 */
export interface VoteRequest {
  direction: 'up' | 'down';
} 