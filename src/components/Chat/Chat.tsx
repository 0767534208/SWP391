import React, { useState, useEffect, useRef } from 'react';
import { authUtils } from '../../utils/auth';
import chatService from '../../services/chatService';
import { STORAGE_KEYS } from '../../config/constants';
import './Chat.css';

// Using the interfaces from chatService
import { Message, Conversation } from '../../services/chatService';

/**
 * Chat component for customer support on the home page
 */
const Chat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Default support staff ID - will be replaced with actual staff IDs from API
  const [supportStaffID, setSupportStaffID] = useState('');
  
  // Check if user is logged in
  const isLoggedIn = authUtils.isLoggedIn();
  const userId = authUtils.getCurrentUserId();

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initialize conversation if the chat is opened and user is logged in
  useEffect(() => {
    if (isOpen && isLoggedIn && userId) {
      initializeConversation();
    }
  }, [isOpen, isLoggedIn, userId]);
  
  // Poll for new messages every 10 seconds when the chat is open
  useEffect(() => {
    if (!isOpen || !isLoggedIn || !userId || !activeConversation?.conversationID) {
      return; // Don't poll if chat is closed or no active conversation
    }
    
    const pollInterval = setInterval(async () => {
      try {
        const messagesResponse = await chatService.getConversationMessages(
          activeConversation.conversationID || ''
        );
        
        if (messagesResponse.statusCode === 200 && messagesResponse.data) {
          // Only update if we have new messages
          if (messagesResponse.data.length > messages.length) {
            setMessages(messagesResponse.data);
          }
        }
      } catch (error) {
        console.error("Failed to poll for new messages:", error);
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(pollInterval);
  }, [isOpen, isLoggedIn, userId, activeConversation, messages.length]);

  // Scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize or retrieve existing conversation
  const initializeConversation = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get all customer conversations
      const conversationsResponse = await chatService.getCustomerConversations(userId);
      
      if (conversationsResponse.statusCode === 200 && conversationsResponse.data && conversationsResponse.data.length > 0) {
        // We have existing conversations
        setConversations(conversationsResponse.data);
        
        // Use the most recent conversation or create a new one with a staff member
        const latestConversation = conversationsResponse.data[0]; // Assuming sorted by latest
        setActiveConversation(latestConversation);
        setSupportStaffID(latestConversation.receiverID);
        
        // Get messages for this conversation
        const messagesResponse = await chatService.getConversationMessages(latestConversation.conversationID || '');
        if (messagesResponse.statusCode === 200 && messagesResponse.data) {
          setMessages(messagesResponse.data);
        }
      } else {
        // No existing conversations, we'll need to create one when the user sends a message
        // For now, just show a welcome message
        const systemMessage: Message = {
          senderID: "system",
          receiverID: userId,
          content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
          createAt: new Date().toISOString(),
          isRead: true
        };
        
        setMessages([systemMessage]);
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
      
      // Show a friendly message on error
      const errorMessage: Message = {
        senderID: "system",
        receiverID: userId || '',
        content: "Không thể kết nối đến hệ thống chat. Vui lòng thử lại sau.",
        createAt: new Date().toISOString(),
        isRead: true
      };
      
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return;
    
    let targetReceiverId = supportStaffID;
    
    // If no active conversation or support staff ID, use a default staff ID or fetch one
    if (!targetReceiverId && activeConversation) {
      targetReceiverId = activeConversation.receiverID;
    } else if (!targetReceiverId) {
      // In a real app, you would fetch available staff members from an API
      // For now, use a default value until the first response sets the correct ID
      targetReceiverId = "default-staff-id";
    }
    
    // Create a new message object
    const newMessage: Message = {
      senderID: userId,
      receiverID: targetReceiverId,
      content: message,
      createAt: new Date().toISOString(),
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    try {
      // Send the message via API
      const response = await chatService.sendMessage(newMessage);
      
      if (response.statusCode !== 200) {
        throw new Error('Failed to send message');
      }
      
      // If this is the first message and we don't have an active conversation,
      // we need to refresh the conversations list to get the new conversation
      if (!activeConversation) {
        const conversationsResponse = await chatService.getCustomerConversations(userId);
        if (conversationsResponse.statusCode === 200 && conversationsResponse.data && conversationsResponse.data.length > 0) {
          setConversations(conversationsResponse.data);
          setActiveConversation(conversationsResponse.data[0]);
          setSupportStaffID(conversationsResponse.data[0].receiverID);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Show an error message to the user
      const errorMessage: Message = {
        senderID: "system",
        receiverID: userId,
        content: "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
        createAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev.filter(m => m.content !== newMessage.content), errorMessage]);
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Mark messages as read when opening the chat
    if (newIsOpen && activeConversation?.conversationID && userId) {
      markMessagesAsRead();
    }
  };
  
  // Mark all messages in the conversation as read
  const markMessagesAsRead = async () => {
    if (!activeConversation?.conversationID || !userId) return;
    
    try {
      await chatService.markAsRead(activeConversation.conversationID, userId);
      
      // Update messages in the UI to show as read
      setMessages(prev => 
        prev.map(msg => ({
          ...msg,
          isRead: true
        }))
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat button */}
      <button 
        className={`chat-button ${isOpen ? 'chat-button-active' : ''}`}
        onClick={toggleChat}
      >
        <span className="chat-icon">
          {isOpen ? '×' : '💬'}
        </span>
        {!isOpen && <span className="chat-label">Hỗ trợ trực tuyến</span>}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat header */}
          <div className="chat-header">
            <h3>Hỗ trợ khách hàng</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          
          {/* Chat messages */}
          <div className="chat-messages">
            {loading ? (
              <div className="chat-loading">Đang tải...</div>
            ) : (
              <>
                {!isLoggedIn ? (
                  <div className="chat-login-prompt">
                    Vui lòng đăng nhập để sử dụng tính năng chat
                  </div>
                ) : (
                  <>
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        Chưa có tin nhắn nào. Hãy gửi tin nhắn để bắt đầu cuộc hội thoại.
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div 
                          key={msg.messageID || index} 
                          className={`chat-message ${msg.senderID === userId || msg.senderID === 'system' ? 'sent' : 'received'}`}
                        >
                          {msg.senderID === 'system' && <div className="system-badge">Hệ thống</div>}
                          <div className="message-content">{msg.content}</div>
                          <div className="message-time">
                            {msg.createAt ? new Date(msg.createAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            {!msg.isRead && msg.senderID !== userId && msg.senderID !== 'system' && <span className="unread-badge">•</span>}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Chat input */}
          {isLoggedIn && (
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <button 
                className="send-button" 
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
              >
                Gửi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
