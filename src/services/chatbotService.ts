/**
 * Chatbot Service
 * Tích hợp tất cả API từ Swagger để chatbot có thể thực hiện các tác vụ thực tế
 */

import { authUtils } from '../utils/auth';

const API_BASE_URL = 'https://localhost:7157/api';

// Helper function cho API calls
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<{success: boolean, data?: T, error?: string}> => {
  try {
    const token = authUtils.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export class ChatbotService {
  
  // Account APIs
  static async login(username: string, password: string) {
    return await apiRequest('/account/login', 'POST', { username, password });
  }

  static async registerCustomer(userData: Record<string, unknown>) {
    return await apiRequest('/account/register-Customer', 'POST', userData);
  }

  static async confirmAccount(email: string, code: string) {
    return await apiRequest(`/account/confirmation/${email}/${code}`, 'POST');
  }

  static async resetPasswordToken(email: string) {
    return await apiRequest('/account/Reset-Password-Token', 'POST', { email });
  }

  static async resetPassword(token: string, newPassword: string) {
    return await apiRequest('/account/Reset-Password', 'POST', { token, newPassword });
  }

  static async changePassword(oldPassword: string, newPassword: string) {
    return await apiRequest('/account/Change-Password', 'POST', { oldPassword, newPassword });
  }

  // Appointment APIs
  static async getAllAppointments() {
    return await apiRequest('/appointment/GetAllAppointment');
  }

  static async getAppointmentById(appointmentId: string) {
    return await apiRequest(`/appointment/GetAppointmentByID/${appointmentId}`);
  }

  static async getAppointmentByCode(appointmentCode: string) {
    return await apiRequest(`/appointment/GetAppointmentByCode/${appointmentCode}`);
  }

  static async getAppointmentsByConsultant(accountId: string) {
    return await apiRequest(`/appointment/GetAppointmentByConsultantID/${accountId}`);
  }

  static async getAppointmentsByCustomer(accountId: string) {
    return await apiRequest(`/appointment/GetAppointmentByCustomerID/${accountId}`);
  }

  static async createAppointment(appointmentData: Record<string, unknown>) {
    return await apiRequest('/appointment/CreateAppointment', 'POST', appointmentData);
  }

  static async updateAppointmentStatus(appointmentId: string, status: number) {
    return await apiRequest('/appointment/ChangeAppointmentStatus', 'PUT', { appointmentId, status });
  }

  static async rescheduleAppointment(appointmentId: string, newSlot: Record<string, unknown>) {
    return await apiRequest('/appointment/RescheduleAppointmentWithEmail', 'PUT', { appointmentId, ...newSlot });
  }

  // Service APIs
  static async getAllServices() {
    return await apiRequest('/Service/GetService');
  }

  static async getServiceStats() {
    return await apiRequest('/Service/GetServiceStats');
  }

  // Consultant APIs
  static async getAllConsultants() {
    return await apiRequest('/consultantSlot/GetAllConsultantProfile');
  }

  static async getConsultantById(consultantId: string) {
    return await apiRequest(`/consultantSlot/GetConsultantProfileById/${consultantId}`);
  }

  static async getConsultantByAccountId(accountId: string) {
    return await apiRequest(`/consultantSlot/GetConsultantProfileByAccountId/${accountId}`);
  }

  // Slot APIs
  static async getAllSlots() {
    return await apiRequest('/slot/GetSlot');
  }

  static async searchSlots(criteria: Record<string, unknown>) {
    return await apiRequest('/slot/search', 'POST', criteria);
  }

  // Blog APIs
  static async getAllBlogs() {
    return await apiRequest('/blog/GetAllBlog');
  }

  static async getBlogById(blogId: string) {
    return await apiRequest(`/blog/GetBlogByID?blogId=${blogId}`);
  }

  // Lab Test APIs
  static async getLabTests() {
    return await apiRequest('/LabTest');
  }

  static async getLabTestsByCustomer(customerId: string) {
    return await apiRequest(`/LabTest/customer/${customerId}`);
  }

  static async createLabTest(labTestData: Record<string, unknown>) {
    return await apiRequest('/LabTest', 'POST', labTestData);
  }

  // Treatment Outcome APIs
  static async getTreatmentOutcomes() {
    return await apiRequest('/TreatmentOutcome');
  }

  static async getTreatmentByCustomer(customerId: string) {
    return await apiRequest(`/TreatmentOutcome/customer/${customerId}`);
  }

  static async getTreatmentByConsultant(consultantId: string) {
    return await apiRequest(`/TreatmentOutcome/consultant/${consultantId}`);
  }

  // Cycle Prediction APIs
  static async getCyclePredictions() {
    return await apiRequest('/CyclePrediction');
  }

  static async getCyclePredictionsByCustomer(customerId: string) {
    return await apiRequest(`/CyclePrediction/customer/${customerId}`);
  }

  static async createCyclePrediction(cycleData: Record<string, unknown>) {
    return await apiRequest('/CyclePrediction', 'POST', cycleData);
  }

  // Transaction APIs
  static async getAllTransactions() {
    return await apiRequest('/Transaction/GetAllTransactions');
  }

  static async getTransactionsByAccount(accountId: string) {
    return await apiRequest(`/Transaction/GetTransactionByAccountID/${accountId}`);
  }

  static async getTransactionsByAppointment(appointmentId: string) {
    return await apiRequest(`/Transaction/GetTransactionByAppointmentId/${appointmentId}`);
  }

  // Dashboard APIs
  static async getAdminDashboard() {
    return await apiRequest('/dashboard/adminDashBoard/GetTotalAppointmentsTotalAppointmentsAmount');
  }

  static async getCurrentWeekRevenue() {
    return await apiRequest('/dashboard/adminDashBoard/GetCurrentWeekRevenue');
  }

  // Feedback APIs
  static async getFeedbacks() {
    return await apiRequest('/FeedBack');
  }

  static async getFeedbacksByCustomer(customerId: string) {
    return await apiRequest(`/FeedBack/customer/${customerId}`);
  }

  static async createFeedback(feedbackData: Record<string, unknown>) {
    return await apiRequest('/FeedBack', 'POST', feedbackData);
  }

  // Process intelligent message
  static async processIntelligentMessage(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim();
    
    try {
      // Xử lý các câu hỏi về appointment
      if (lowerMessage.includes('lịch hẹn') || lowerMessage.includes('appointment') || lowerMessage.includes('đặt lịch')) {
        const userId = authUtils.getCurrentUserId();
        if (userId) {
          const result = await this.getAppointmentsByCustomer(userId);
          if (result.success && result.data) {
            const appointments = Array.isArray(result.data) ? result.data : [result.data];
            if (appointments.length > 0) {
              return `Bạn có ${appointments.length} lịch hẹn. Lịch hẹn gần nhất: ${appointments[0].appointmentCode || 'N/A'}`;
            } else {
              return 'Bạn chưa có lịch hẹn nào. Bạn có muốn đặt lịch hẹn mới không?';
            }
          }
        }
        return 'Để xem lịch hẹn, bạn cần đăng nhập trước. Hoặc bạn có thể đặt lịch hẹn mới tại trang Booking.';
      }

      // Xử lý câu hỏi về dịch vụ
      if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('service') || lowerMessage.includes('giá')) {
        const result = await this.getAllServices();
        if (result.success && result.data) {
          const services = Array.isArray(result.data) ? result.data : [result.data];
          const serviceList = services.slice(0, 3).map((s: Record<string, unknown>) => 
            `- ${s.servicesName as string}: ${(s.servicesPrice as number)?.toLocaleString()}đ`
          ).join('\n');
          return `Các dịch vụ hiện có:\n${serviceList}\n\nBạn có muốn biết thêm thông tin về dịch vụ nào không?`;
        }
        return 'Hiện tại chúng tôi có các dịch vụ tư vấn sức khỏe sinh sản và xét nghiệm STI. Bạn có muốn biết thêm chi tiết không?';
      }

      // Xử lý câu hỏi về consultant
      if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('consultant') || lowerMessage.includes('tư vấn viên')) {
        const result = await this.getAllConsultants();
        if (result.success && result.data) {
          const consultants = Array.isArray(result.data) ? result.data : [result.data];
          if (consultants.length > 0) {
            const consultantList = consultants.slice(0, 3).map((c: Record<string, unknown>) => 
              `- ${c.name as string || 'Bác sĩ'}: ${c.specialty as string || 'Chuyên khoa tổng quát'}`
            ).join('\n');
            return `Các bác sĩ/tư vấn viên của chúng tôi:\n${consultantList}\n\nBạn có muốn đặt lịch với bác sĩ nào không?`;
          }
        }
        return 'Chúng tôi có đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm. Bạn có muốn đặt lịch tư vấn không?';
      }

      // Xử lý câu hỏi về chu kỳ kinh nguyệt
      if (lowerMessage.includes('chu kỳ') || lowerMessage.includes('kinh nguyệt') || lowerMessage.includes('cycle')) {
        const userId = authUtils.getCurrentUserId();
        if (userId) {
          const result = await this.getCyclePredictionsByCustomer(userId);
          if (result.success && result.data) {
            return 'Tôi đã tìm thấy dữ liệu chu kỳ của bạn. Bạn có muốn xem dự đoán chu kỳ tiếp theo không?';
          }
        }
        return 'Để theo dõi chu kỳ kinh nguyệt, bạn cần đăng nhập và cập nhật thông tin. Chức năng này giúp dự đoán chu kỳ tiếp theo của bạn.';
      }

      // Xử lý câu hỏi về kết quả xét nghiệm
      if (lowerMessage.includes('xét nghiệm') || lowerMessage.includes('kết quả') || lowerMessage.includes('lab test')) {
        const userId = authUtils.getCurrentUserId();
        if (userId) {
          const result = await this.getLabTestsByCustomer(userId);
          if (result.success && result.data) {
            const labTests = Array.isArray(result.data) ? result.data : [result.data];
            if (labTests.length > 0) {
              return `Bạn có ${labTests.length} kết quả xét nghiệm. Bạn có muốn xem chi tiết không?`;
            }
          }
        }
        return 'Để xem kết quả xét nghiệm, bạn cần đăng nhập. Hoặc bạn có thể đặt lịch xét nghiệm STI mới.';
      }

      // Xử lý câu hỏi chung về hỗ trợ
      if (lowerMessage.includes('giúp') || lowerMessage.includes('help') || lowerMessage.includes('hỗ trợ')) {
        return `Tôi có thể giúp bạn:
• Đặt lịch hẹn tư vấn hoặc xét nghiệm
• Xem thông tin dịch vụ và giá cả
• Theo dõi chu kỳ kinh nguyệt
• Xem kết quả xét nghiệm
• Tìm hiểu về đội ngũ bác sĩ
• Hỗ trợ thanh toán và giao dịch

Bạn cần hỗ trợ gì cụ thể?`;
      }

      // Câu trả lời mặc định
      return `Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp bạn:
      
• Đặt lịch hẹn tư vấn
• Xem thông tin dịch vụ
• Theo dõi chu kỳ kinh nguyệt  
• Xem kết quả xét nghiệm
• Tìm hiểu về bác sĩ

Bạn có câu hỏi gì cho tôi không?`;

    } catch (error) {
      console.error('Error processing message:', error);
      return 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
    }
  }

  // Get suggested questions
  static getSuggestedQuestions(): string[] {
    return [
      'Tôi muốn đặt lịch hẹn',
      'Xem thông tin dịch vụ và giá cả',
      'Theo dõi chu kỳ kinh nguyệt',
      'Xem kết quả xét nghiệm',
      'Thông tin bác sĩ tư vấn',
      'Hỗ trợ thanh toán',
      'Liên hệ phòng khám'
    ];
  }
}

export default ChatbotService;
