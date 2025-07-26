import type { ApiResponse } from '../utils/api';

/**
 * Interface for a chat conversation
 */
export interface Conversation {
  conversationID?: string;
  receiverID: string;
  senderID: string;
  createAt?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  receiverName?: string;
  receiverAvatar?: string;
}

/**
 * Interface for a chat message
 */
export interface Message {
  messageID?: string;
  conversationID?: string;
  senderID: string;
  receiverID: string;
  content: string;
  images?: string[];
  createAt?: string;
  isRead?: boolean;
}

/**
 * apiRequest function imported from elsewhere in the project
 */
declare function apiRequest<T>(
  endpoint: string, 
  method?: string, 
  body?: unknown,
  customHeaders?: Record<string, string>,
  retry?: boolean
): Promise<ApiResponse<T>>;

const chatService = {
  // Create a new conversation
  createConversation: async (receiverID: string, senderID: string) => {
    try {
      const response = await apiRequest<Conversation>(
        '/api/Chat/create-conversation', 
        'POST', 
        {
          receiverID,
          senderID,
          createAt: new Date().toISOString()
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a message in a conversation
  sendMessage: async (message: Message) => {
    try {
      const formData = new FormData();
      formData.append('receiverID', message.receiverID);
      formData.append('senderID', message.senderID);
      
      if (message.content) {
        formData.append('content', message.content);
      } else {
        formData.append('content', '');
      }

      if (message.images && message.images.length > 0) {
        message.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await apiRequest<Message>(
        '/api/Chat/send-message', 
        'POST', 
        formData
      );
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationID: string, senderID: string) => {
    try {
      const response = await apiRequest<any>(
        '/api/Chat/mark-as-read', 
        'PUT', 
        {
          conversationID,
          senderID
        }
      );
      return response;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get conversation messages by conversationID
  getConversationMessages: async (conversationID: string) => {
    try {
      const response = await apiRequest<Message[]>(
        `/api/Chat/messages/${conversationID}`, 
        'GET'
      );
      return response;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  },

  // Get all conversations for a customer
  getCustomerConversations: async (customerID: string) => {
    try {
      const response = await apiRequest<Conversation[]>(
        `/api/Chat/conversations/by-customer/${customerID}`, 
        'GET'
      );
      return response;
    } catch (error) {
      console.error('Error getting customer conversations:', error);
      throw error;
    }
  },
  
  // Get messages between a customer and receiver
  getMessagesByCustomerAndReceiver: async (customerID: string, receiverID: string) => {
    try {
      const response = await apiRequest<Message[]>(
        `/api/Chat/messages/by-customer-receiver?customerID=${customerID}&receiverID=${receiverID}`, 
        'GET'
      );
      return response;
    } catch (error) {
      console.error('Error getting messages by customer and receiver:', error);
      throw error;
    }
  },
};

export default chatService;
