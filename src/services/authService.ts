/**
 * Authentication Service
 * 
 * Cung cấp các phương thức xử lý authentication và quản lý phiên đăng nhập
 * Bao gồm đăng nhập, đăng ký, xác thực OTP, quên mật khẩu, v.v.
 */

import { authAPI } from '../utils/api';
import type { RegisterRequest, UserData } from '../types';
import type { ApiResponse } from '../utils/api';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Authentication service với đầy đủ chức năng xác thực
 */
const authService = {
  /**
   * Đăng nhập người dùng với username và password
   * 
   * @param username - Tên đăng nhập
   * @param password - Mật khẩu
   * @returns Promise với dữ liệu người dùng
   */
  login: async (username: string, password: string): Promise<ApiResponse<UserData>> => {
    try {
      const response = await authAPI.login(username, password);
      
      if (response.statusCode === 200 && response.data) {
        // Lưu thông tin xác thực vào localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        
        // Lấy role đầu tiên nếu có
        const role = response.data.roles && response.data.roles.length > 0 
          ? response.data.roles[0].toLowerCase() 
          : 'user';
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
        
        // Lưu thông tin người dùng
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
          userID: response.data.userID,
          customerID: response.data.customerID || response.data.userID, 
          userName: response.data.userName,
          email: response.data.email,
          name: response.data.name,
          role: role,
          address: response.data.address,
          phone: response.data.phone,
          dateOfBirth: response.data.dateOfBirth,
          roles: response.data.roles
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Đăng ký người dùng mới
   * 
   * @param userData - Thông tin đăng ký
   * @returns Promise với kết quả đăng ký
   */
  register: async (userData: RegisterRequest): Promise<ApiResponse<UserData>> => {
    try {
      const response = await authAPI.register(userData);
      
      // Nếu đăng ký thành công, lưu thông tin để xác thực OTP
      if (response.statusCode === 200) {
        localStorage.setItem(STORAGE_KEYS.PENDING_REGISTRATION, JSON.stringify({
          email: userData.email,
          username: userData.username,
          name: userData.name,
          password: userData.password // Lưu mật khẩu để tự động đăng nhập sau OTP
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Xác thực mã OTP được gửi trong quá trình đăng ký hoặc đặt lại mật khẩu
   * 
   * @param email - Email người dùng
   * @param otp - Mã OTP
   * @returns Promise với kết quả xác thực
   */
  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<void>> => {
    try {
      const response = await authAPI.verifyOTP(email, otp);
      
      // Nếu xác thực thành công, xóa thông tin đăng ký tạm thời
      if (response.statusCode === 200) {
        localStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);
      }
      
      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  
  /**
   * Yêu cầu đặt lại mật khẩu
   * 
   * @param email - Email người dùng
   * @returns Promise với kết quả yêu cầu
   */
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  /**
   * Đặt lại mật khẩu với token nhận được qua email
   * 
   * @param email - Email người dùng
   * @param token - Token từ email
   * @param newPassword - Mật khẩu mới
   * @returns Promise với kết quả đặt lại mật khẩu
   */
  resetPassword: async (email: string, token: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const response = await authAPI.resetPassword(email, token, newPassword);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  /**
   * Đăng xuất người dùng hiện tại
   * 
   * @returns Promise với kết quả đăng xuất
   */
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await authAPI.logout();
      
      // Xóa tất cả dữ liệu xác thực
      authService.clearAuthData();
      
      return response;
    } catch (error) {
      // Ngay cả khi API gặp lỗi, vẫn xóa dữ liệu xác thực
      authService.clearAuthData();
      
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Xóa tất cả dữ liệu xác thực khỏi localStorage
   */
  clearAuthData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   * 
   * @returns Boolean cho biết trạng thái đăng nhập
   */
  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },
  
  /**
   * Lấy vai trò của người dùng hiện tại
   * 
   * @returns Vai trò người dùng hoặc null nếu chưa đăng nhập
   */
  getUserRole: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  },
  
  /**
   * Lấy thông tin người dùng hiện tại từ localStorage
   * 
   * @returns Đối tượng thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
};

export default authService; 