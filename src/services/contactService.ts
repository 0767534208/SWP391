import api from '../utils/api';
import type { ApiResponse, ContactRequest, PaginatedResponse, PaginationParams } from '../types';

interface ContactMessage {
  contactId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
}

const contactService = {
  /**
   * Submit a contact form
   */
  submitContactForm: async (contactData: ContactRequest): Promise<ApiResponse<void>> => {
    return api.post<void>('/contact', contactData);
  },
  
  /**
   * Get all contact messages (admin/manager only)
   */
  getAllContactMessages: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ContactMessage>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }
    
    const endpoint = `/contact?${queryParams.toString()}`;
    return api.get<PaginatedResponse<ContactMessage>>(endpoint);
  },
  
  /**
   * Get a specific contact message by ID (admin/manager only)
   */
  getContactMessage: async (contactId: string): Promise<ApiResponse<ContactMessage>> => {
    return api.get<ContactMessage>(`/contact/${contactId}`);
  },
  
  /**
   * Mark a contact message as resolved (admin/manager only)
   */
  markAsResolved: async (contactId: string): Promise<ApiResponse<ContactMessage>> => {
    return api.put<ContactMessage>(`/contact/${contactId}/resolve`, {});
  },
  
  /**
   * Mark a contact message as unresolved (admin/manager only)
   */
  markAsUnresolved: async (contactId: string): Promise<ApiResponse<ContactMessage>> => {
    return api.put<ContactMessage>(`/contact/${contactId}/unresolve`, {});
  },
  
  /**
   * Delete a contact message (admin/manager only)
   */
  deleteContactMessage: async (contactId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/contact/${contactId}`);
  },
  
  /**
   * Reply to a contact message (admin/manager only)
   */
  replyToContactMessage: async (
    contactId: string, 
    replyMessage: string
  ): Promise<ApiResponse<void>> => {
    return api.post<void>(`/contact/${contactId}/reply`, { message: replyMessage });
  },
};

export default contactService; 