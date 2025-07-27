import React, { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Tôi muốn đặt lịch hẹn',
    'Xem thông tin dịch vụ và giá cả', 
    'Theo dõi chu kỳ kinh nguyệt',
    'Xem kết quả xét nghiệm',
    'Thông tin bác sĩ tư vấn',
    'Hỗ trợ thanh toán',
    'Liên hệ phòng khám'
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: 'Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp gì cho bạn hôm nay?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const processMessage = async (messageText: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = messageText.toLowerCase().trim();
    
    if (lowerMessage.includes('lịch hẹn') || lowerMessage.includes('appointment') || lowerMessage.includes('đặt lịch')) {
      return 'Để đặt lịch hẹn, bạn có thể truy cập trang "Đặt lịch" hoặc liên hệ với chúng tôi. Bạn muốn đặt lịch tư vấn hay xét nghiệm STI?';
    }
    
    if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('service') || lowerMessage.includes('giá')) {
      return `Chúng tôi cung cấp các dịch vụ:
• Tư vấn sức khỏe sinh sản
• Xét nghiệm STI (HIV, Giang mai, Lậu...)
• Theo dõi chu kỳ kinh nguyệt
• Tư vấn kế hoạch hóa gia đình

Bạn muốn biết thêm về dịch vụ nào?`;
    }
    
    if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('consultant') || lowerMessage.includes('tư vấn viên')) {
      return 'Đội ngũ bác sĩ của chúng tôi có nhiều năm kinh nghiệm trong lĩnh vực sức khỏe sinh sản và STI. Tất cả đều có chứng chỉ hành nghề và được đào tạo chuyên sâu. Bạn có muốn đặt lịch tư vấn không?';
    }
    
    if (lowerMessage.includes('chu kỳ') || lowerMessage.includes('kinh nguyệt') || lowerMessage.includes('cycle')) {
      return 'Chức năng theo dõi chu kỳ kinh nguyệt giúp bạn dự đoán chu kỳ tiếp theo và theo dõi sức khỏe sinh sản. Bạn có thể đăng nhập và sử dụng tính năng này trong tài khoản của mình.';
    }
    
    if (lowerMessage.includes('xét nghiệm') || lowerMessage.includes('kết quả') || lowerMessage.includes('lab test')) {
      return 'Chúng tôi cung cấp các xét nghiệm STI với kết quả nhanh chóng và bảo mật. Để xem kết quả xét nghiệm, bạn cần đăng nhập vào tài khoản. Bạn có muốn đặt lịch xét nghiệm không?';
    }
    
    if (lowerMessage.includes('giúp') || lowerMessage.includes('help') || lowerMessage.includes('hỗ trợ')) {
      return `Tôi có thể giúp bạn:
• Đặt lịch hẹn tư vấn hoặc xét nghiệm
• Thông tin về dịch vụ và giá cả
• Theo dõi chu kỳ kinh nguyệt
• Xem kết quả xét nghiệm
• Tìm hiểu về đội ngũ bác sĩ
• Hướng dẫn sử dụng website

Bạn cần hỗ trợ gì cụ thể?`;
    }
    
    if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment')) {
      return 'Chúng tôi hỗ trợ thanh toán qua VNPay, thẻ ATM, và thanh toán trực tiếp tại phòng khám. Bạn có thể xem lịch sử giao dịch trong tài khoản của mình.';
    }
    
    if (lowerMessage.includes('liên hệ') || lowerMessage.includes('contact')) {
      return `Thông tin liên hệ:
📞 Hotline: 1900-xxxx
📧 Email: info@phongkham.com
🏥 Địa chỉ: [Địa chỉ phòng khám]
⏰ Giờ làm việc: 8:00 - 17:00 (Thứ 2 - Thứ 7)

Bạn có thể liên hệ trực tiếp hoặc đặt lịch online!`;
    }
    
    return `Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp bạn:
• Đặt lịch hẹn tư vấn
• Xem thông tin dịch vụ
• Theo dõi chu kỳ kinh nguyệt  
• Xem kết quả xét nghiệm
• Tìm hiểu về bác sĩ

Bạn có câu hỏi gì cho tôi không?`;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Get bot response using local processing
      const botResponse = await processMessage(text);
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbot-widget-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-info">
              <div className="chatbot-avatar">
                <span>🤖</span>
              </div>
              <div>
                <h4>Trợ lý ảo</h4>
                <span className="status online">Đang hoạt động</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={handleToggleChat}
              aria-label="Đóng chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="suggestions">
                <p className="suggestions-title">Câu hỏi gợi ý:</p>
                <div className="suggestions-list">
                  {suggestedQuestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="message-input"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
                aria-label="Gửi tin nhắn"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={handleToggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.4 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
          </svg>
        )}
        
        {/* Notification badge */}
        {!isOpen && (
          <div className="notification-badge">
            <span>!</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
